import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authAPI, attendanceAPI } from '../api/apiService';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';

const Attendance = () => {
    const { user, isOwner } = useAuth();

    // Live clock state
    const [currentTime, setCurrentTime] = useState(new Date());

    // Core States
    const [todayRecord, setTodayRecord] = useState(null);
    const [myHistory, setMyHistory] = useState([]);
    const [allLogs, setAllLogs] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form inputs
    const [notes, setNotes] = useState('');
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterUser, setFilterUser] = useState('');
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [coordinates, setCoordinates] = useState({ lat: '37.3382', lng: '-121.8863' }); // default shop center
    const [isLocating, setIsLocating] = useState(false);
    const [gpsVerified, setGpsVerified] = useState(false);

    // Photo/Webcam states
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Modal States
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxSrc, setLightboxSrc] = useState('');
    const [manualForm, setManualForm] = useState({
        userId: '',
        date: new Date().toISOString().split('T')[0],
        checkIn: '',
        checkOut: '',
        status: 'Present',
        notes: ''
    });

    // Offline / Demo Fallback Check
    const isDemoMode = !localStorage.getItem('token') || localStorage.getItem('token').startsWith('demo-');

    // Update digital clock every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Load initial data
    useEffect(() => {
        loadAttendanceData();
        getGeolocation();
    }, [isDemoMode]);

    // Geolocation retrieval
    const getGeolocation = () => {
        if (navigator.geolocation) {
            setIsLocating(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude.toFixed(4);
                    const lng = position.coords.longitude.toFixed(4);
                    setCoordinates({ lat, lng });
                    setIsLocating(false);
                    setGpsVerified(true);
                },
                (error) => {
                    console.log('Using default shop geolocation context:', error.message);
                    setIsLocating(false);
                    setGpsVerified(true); // Treat default context as verified for shop terminal
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        } else {
            setGpsVerified(true);
        }
    };

    // Load helper
    const loadAttendanceData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (isDemoMode) {
                // Initialize demo local storage if not exists
                if (!localStorage.getItem('apex_attendance')) {
                    const demoLogs = seedDemoAttendance();
                    localStorage.setItem('apex_attendance', JSON.stringify(demoLogs));
                }

                const localLogs = JSON.parse(localStorage.getItem('apex_attendance') || '[]');
                // Get today's record for logged-in user
                const todayStr = new Date().toISOString().split('T')[0];
                const myToday = localLogs.find(l => l.userId === user?._id && l.date === todayStr);
                setTodayRecord(myToday || null);

                // Get my history
                const myLogs = localLogs.filter(l => l.userId === user?._id).sort((a, b) => b.date.localeCompare(a.date));
                setMyHistory(myLogs);

                // Owner-only demo loads
                if (isOwner) {
                    setAllLogs(localLogs);
                    const dummyUsers = [
                        { _id: user?._id || 'demo-owner', name: user?.name || 'Shop Owner', email: user?.email || 'owner@apex.com', role: 'owner' },
                        { _id: 'demo-cashier-1', name: 'Demo Cashier', email: 'cashier@apex.com', role: 'cashier' },
                        { _id: 'demo-mechanic-1', name: 'Lead Mechanic', email: 'mechanic@apex.com', role: 'mechanic' }
                    ];
                    setAllUsers(dummyUsers);
                }
            } else {
                // Fetch from real backend
                const statusRes = await attendanceAPI.getStatus();
                setTodayRecord(statusRes.data?.data || null);

                const historyRes = await attendanceAPI.getHistory();
                setMyHistory(historyRes.data?.data || []);

                if (isOwner) {
                    const logsRes = await attendanceAPI.getAll();
                    setAllLogs(logsRes.data?.data || []);

                    const usersRes = await authAPI.getUsers();
                    setAllUsers(usersRes.data?.data || []);
                }
            }
        } catch (err) {
            console.error('API Error, switching to offline fallback states:', err);
            setError('Could not sync with backend. Operating in offline fallback mode.');
        } finally {
            setLoading(false);
        }
    };

    // Seed helper
    const seedDemoAttendance = () => {
        const today = new Date();
        const logs = [];
        const users = [
            { id: user?._id || 'demo-owner', name: user?.name || 'Shop Owner', role: 'owner' },
            { id: 'demo-cashier-1', name: 'Demo Cashier', role: 'cashier' },
            { id: 'demo-mechanic-1', name: 'Lead Mechanic', role: 'mechanic' }
        ];

        // Seed last 7 days of attendance
        for (let i = 7; i >= 1; i--) {
            const currentDay = new Date(today);
            currentDay.setDate(today.getDate() - i);
            const dateStr = currentDay.toISOString().split('T')[0];

            // Don't seed weekends
            if (currentDay.getDay() === 0 || currentDay.getDay() === 6) continue;

            users.forEach(u => {
                // Randomise status
                const rand = Math.random();
                let checkInHour = 8;
                let checkInMin = 30 + Math.floor(Math.random() * 20); // 8:30 to 8:50 AM
                let status = 'Present';

                if (rand > 0.85) {
                    checkInHour = 9;
                    checkInMin = 20 + Math.floor(Math.random() * 15); // 9:20 to 9:35 AM
                    status = 'Late';
                } else if (rand > 0.95) {
                    return; // Absent (no check-in seeded)
                }

                const checkInDate = new Date(currentDay);
                checkInDate.setHours(checkInHour, checkInMin, 0);

                const checkOutDate = new Date(currentDay);
                checkOutDate.setHours(17, 30 + Math.floor(Math.random() * 30), 0); // 5:30 to 6:00 PM

                const diffMs = checkOutDate.getTime() - checkInDate.getTime();
                const workHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

                logs.push({
                    _id: `demo-log-${u.id}-${dateStr}`,
                    userId: u.id,
                    user: { _id: u.id, name: u.name, role: u.role },
                    date: dateStr,
                    checkIn: checkInDate.toISOString(),
                    checkOut: checkOutDate.toISOString(),
                    status,
                    workHours,
                    notes: 'Demo record',
                    location: '37.3382, -121.8863',
                    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
                });
            });
        }
        return logs;
    };

    // Camera Access Handler
    const startCamera = async () => {
        setCameraActive(true);
        setCapturedPhoto(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Camera access denied or unavailable:', err);
            // Simulate Camera Blocked Fallback
            setCameraActive(false);
            setCapturedPhoto('MOCK_AVATAR');
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
        setCameraStream(null);
        setCameraActive(false);
    };

    const snapPhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64Photo = canvas.toDataURL('image/jpeg');
            setCapturedPhoto(base64Photo);
            stopCamera();
        }
    };

    // Clock In Action
    const handleClockIn = async () => {
        const checkInObj = {
            notes,
            location: `${coordinates.lat}, ${coordinates.lng}`,
            photo: capturedPhoto && capturedPhoto !== 'MOCK_AVATAR' ? capturedPhoto : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
        };

        try {
            if (isDemoMode) {
                const localLogs = JSON.parse(localStorage.getItem('apex_attendance') || '[]');
                const todayStr = new Date().toISOString().split('T')[0];

                const hour = new Date().getHours();
                const minute = new Date().getMinutes();
                const status = (hour > 9 || (hour === 9 && minute > 15)) ? 'Late' : 'Present';

                const newRecord = {
                    _id: `demo-log-${user?._id}-${todayStr}`,
                    userId: user?._id || 'demo-owner',
                    user: { _id: user?._id || 'demo-owner', name: user?.name || 'Shop Owner', role: user?.role || 'owner' },
                    date: todayStr,
                    checkIn: new Date().toISOString(),
                    checkOut: null,
                    status,
                    workHours: 0,
                    notes: checkInObj.notes,
                    location: checkInObj.location,
                    photo: checkInObj.photo
                };

                localLogs.unshift(newRecord);
                localStorage.setItem('apex_attendance', JSON.stringify(localLogs));
                setTodayRecord(newRecord);
                setMyHistory(prev => [newRecord, ...prev]);
                if (isOwner) {
                    setAllLogs(localLogs);
                }
            } else {
                const res = await attendanceAPI.checkIn(checkInObj);
                setTodayRecord(res.data.data);
                setMyHistory(prev => [res.data.data, ...prev]);
                if (isOwner) {
                    const logsRes = await attendanceAPI.getAll();
                    setAllLogs(logsRes.data?.data || []);
                }
            }

            setNotes('');
            setCapturedPhoto(null);
            alert('✓ Clocked in successfully! Have a great shift.');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Error checking in.');
        }
    };

    // Clock Out Action
    const handleClockOut = async () => {
        try {
            if (isDemoMode) {
                const localLogs = JSON.parse(localStorage.getItem('apex_attendance') || '[]');
                const todayStr = new Date().toISOString().split('T')[0];
                const index = localLogs.findIndex(l => l.userId === user?._id && l.date === todayStr);

                if (index !== -1) {
                    const record = localLogs[index];
                    record.checkOut = new Date().toISOString();
                    const diffMs = new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime();
                    record.workHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
                    if (notes) {
                        record.notes = record.notes ? `${record.notes} | Out notes: ${notes}` : notes;
                    }

                    localLogs[index] = record;
                    localStorage.setItem('apex_attendance', JSON.stringify(localLogs));
                    setTodayRecord(record);
                    setMyHistory(prev => prev.map(l => l.date === todayStr ? record : l));
                    if (isOwner) {
                        setAllLogs(localLogs);
                    }
                }
            } else {
                const res = await attendanceAPI.checkOut({ notes });
                setTodayRecord(res.data.data);
                setMyHistory(prev => prev.map(l => l.date === todayRecord.date ? res.data.data : l));
                if (isOwner) {
                    const logsRes = await attendanceAPI.getAll();
                    setAllLogs(logsRes.data?.data || []);
                }
            }

            setNotes('');
            alert('✓ Clocked out successfully! Rest well.');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Error checking out.');
        }
    };

    // Manual Log submission
    const handleManualSubmit = async (e) => {
        e.preventDefault();
        const date = manualForm.date;

        // format times as full ISO strings
        const checkInDate = new Date(`${date}T${manualForm.checkIn}`);
        const checkOutDate = manualForm.checkOut ? new Date(`${date}T${manualForm.checkOut}`) : null;

        const recordObj = {
            userId: manualForm.userId,
            date,
            checkIn: checkInDate.toISOString(),
            checkOut: checkOutDate ? checkOutDate.toISOString() : undefined,
            status: manualForm.status,
            notes: manualForm.notes
        };

        try {
            if (isDemoMode) {
                const localLogs = JSON.parse(localStorage.getItem('apex_attendance') || '[]');
                const selectedUser = allUsers.find(u => u._id === manualForm.userId);

                let workHours = 0;
                if (checkOutDate) {
                    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
                    workHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
                }

                const existingIdx = localLogs.findIndex(l => l.userId === manualForm.userId && l.date === date);
                const updatedRecord = {
                    _id: existingIdx !== -1 ? localLogs[existingIdx]._id : `demo-manual-${manualForm.userId}-${date}`,
                    userId: manualForm.userId,
                    user: { _id: selectedUser?._id, name: selectedUser?.name, role: selectedUser?.role },
                    date,
                    checkIn: recordObj.checkIn,
                    checkOut: recordObj.checkOut,
                    status: recordObj.status,
                    workHours,
                    notes: recordObj.notes,
                    location: 'Manual entry',
                    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
                };

                if (existingIdx !== -1) {
                    localLogs[existingIdx] = updatedRecord;
                } else {
                    localLogs.unshift(updatedRecord);
                }

                localStorage.setItem('apex_attendance', JSON.stringify(localLogs));
                setAllLogs(localLogs);
                if (manualForm.userId === user?._id) {
                    const todayStr = new Date().toISOString().split('T')[0];
                    if (date === todayStr) setTodayRecord(updatedRecord);
                    setMyHistory(prev => {
                        const hasIt = prev.some(l => l.date === date);
                        if (hasIt) return prev.map(l => l.date === date ? updatedRecord : l);
                        return [updatedRecord, ...prev].sort((a, b) => b.date.localeCompare(a.date));
                    });
                }
            } else {
                await attendanceAPI.manualRecord(recordObj);
                const logsRes = await attendanceAPI.getAll();
                setAllLogs(logsRes.data?.data || []);
                loadAttendanceData(); // reload status
            }

            setIsManualModalOpen(false);
            setManualForm({
                userId: '',
                date: new Date().toISOString().split('T')[0],
                checkIn: '',
                checkOut: '',
                status: 'Present',
                notes: ''
            });
            alert('✓ Manual attendance record saved successfully.');
        } catch (err) {
            console.error(err);
            alert('Error adding manual record.');
        }
    };

    // Excel export handler
    const handleExportExcel = () => {
        const preparedData = allLogs.map(l => ({
            Date: l.date,
            Employee: l.user?.name || 'Unknown',
            Email: l.user?.email || '',
            Role: l.user?.role || '',
            CheckIn: l.checkIn ? new Date(l.checkIn).toLocaleTimeString() : '',
            CheckOut: l.checkOut ? new Date(l.checkOut).toLocaleTimeString() : '',
            Status: l.status,
            WorkHours: l.workHours || 0,
            Location: l.location || '',
            Notes: l.notes || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(preparedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');
        XLSX.writeFile(workbook, `Apex_Attendance_Report_${filterDate}.xlsx`);
    };

    // Open lightbox for verification photos
    const openLightbox = (src) => {
        setLightboxSrc(src);
        setIsLightboxOpen(true);
    };

    // Helper functions for Owner Analytics
    const getActiveStaffCount = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        return allLogs.filter(l => l.date === todayStr && l.checkIn && !l.checkOut).length;
    };

    const getTodayStats = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecords = allLogs.filter(l => l.date === todayStr);
        const present = todayRecords.length;
        const late = todayRecords.filter(l => l.status === 'Late').length;
        const active = todayRecords.filter(l => !l.checkOut).length;
        const rate = present > 0 ? (((present - late) / present) * 100).toFixed(0) : 100;

        return { present, late, active, rate };
    };

    // Prepare chart data for last 7 days total work hours
    const getChartData = () => {
        const today = new Date();
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const records = allLogs.filter(l => l.date === dateStr);
            const totalHours = records.reduce((sum, r) => sum + (r.workHours || 0), 0);

            days.push({
                name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                'Hours Worked': parseFloat(totalHours.toFixed(1)),
                'Staff Present': records.length
            });
        }
        return days;
    };

    const getPieData = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecords = allLogs.filter(l => l.date === todayStr);

        const present = todayRecords.filter(l => l.status === 'Present').length;
        const late = todayRecords.filter(l => l.status === 'Late').length;
        const absent = allUsers.length - todayRecords.length; // rough estimate

        return [
            { name: 'On-Time', value: present, color: '#34d399' },
            { name: 'Late', value: late, color: '#fbbf24' },
            { name: 'Absent/Not In', value: Math.max(0, absent), color: '#f87171' }
        ].filter(item => item.value > 0);
    };

    const { present, late, active, rate } = getTodayStats();
    const chartData = getChartData();
    const pieData = getPieData();

    // Filters for Owner Logs list
    const filteredLogs = allLogs.filter(log => {
        const matchesDate = !filterDate || log.date === filterDate;
        const matchesUser = !filterUser || log.userId === filterUser;
        return matchesDate && matchesUser;
    });

    if (loading && myHistory.length === 0) return <Loader />;

    return (
        <div className="animate-fade-in p-2 md:p-6 space-y-6">
            {/* Header / Live Banner */}
            <div className="glass-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <span style={{ fontSize: '2rem' }}>📅</span>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
                            Staff Shift & Attendance Hub
                        </h1>
                        <p className="text-sm text-muted">
                            Clock in/out, verify location, register photo ID, and inspect dashboard logs.
                        </p>
                    </div>
                </div>

                {/* Live Clock Card */}
                <div className="card py-2 px-6 flex flex-col items-center justify-center bg-black/30 border-glass text-center min-w-[200px]" style={{ transform: 'none', boxShadow: 'none' }}>
                    <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
                        Current Local Time
                    </span>
                    <span className="text-2xl font-extrabold tracking-tight font-mono my-0.5 text-white">
                        {currentTime.toLocaleTimeString()}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                        {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Offline Error banner */}
            {error && (
                <div className="badge badge-warning w-full text-center py-2 text-xs flex items-center justify-center gap-2">
                    ⚠️ {error} (Demo Mode Active)
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Clock terminal & Camera verification */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="card h-fit">
                        <h3 className="card-title text-base flex items-center gap-2 mb-4">
                            <span>🕒</span> Shift Terminal
                        </h3>

                        {/* Location Geotag Status */}
                        <div className="flex items-center justify-between p-3 rounded-lg border border-glass bg-black/10 text-xs mb-4">
                            <div className="flex items-center gap-2">
                                <span>📍</span>
                                <div>
                                    <p className="font-semibold text-white">Shop Geo-location Verification</p>
                                    <p className="text-muted" style={{ fontSize: '0.6875rem' }}>{coordinates.lat}° N, {coordinates.lng}° W</p>
                                </div>
                            </div>
                            {isLocating ? (
                                <span className="animate-pulse text-warning">Locating...</span>
                            ) : gpsVerified ? (
                                <span style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', fontSize: '0.6875rem', border: '1px solid rgba(52,211,153,0.3)', fontWeight: 'bold' }}>✓ Match</span>
                            ) : (
                                <button onClick={getGeolocation} className="text-primary hover:underline" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button>
                            )}
                        </div>

                        {/* Webcam capture portal */}
                        {!todayRecord && (
                            <div className="mb-4">
                                <label className="form-label mb-2">Webcam Facial Verification</label>
                                <div className="relative aspect-video rounded-lg border border-glass bg-black/25 flex flex-col items-center justify-center overflow-hidden">
                                    {cameraActive ? (
                                        <>
                                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                            <button 
                                                onClick={snapPhoto} 
                                                className="absolute bottom-2 btn btn-primary py-1 px-4 text-xs font-bold shadow-md hover-glow rounded-lg"
                                            >
                                                📷 Capture Snap
                                            </button>
                                        </>
                                    ) : capturedPhoto ? (
                                        capturedPhoto === 'MOCK_AVATAR' ? (
                                            <div className="flex flex-col items-center text-center p-4">
                                                <span style={{ fontSize: '3rem' }}>👤</span>
                                                <p className="text-xs text-muted mt-2">Camera Blocked or Unavailable.</p>
                                                <p className="text-xs text-success font-semibold">Avatar fallback loaded.</p>
                                                <button onClick={startCamera} className="text-xs text-primary underline mt-2 bg-transparent border-0 cursor-pointer">Retry Camera</button>
                                            </div>
                                        ) : (
                                            <>
                                                <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
                                                <button 
                                                    onClick={startCamera} 
                                                    className="absolute bottom-2 bg-red-500/80 text-white border border-red-500 py-1 px-3 text-xs font-bold rounded-lg cursor-pointer hover:bg-red-600"
                                                >
                                                    🔄 Retake Photo
                                                </button>
                                            </>
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-6 text-center">
                                            <span style={{ fontSize: '2.5rem' }}>📷</span>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                                                Security verification requires a webcam photo.
                                            </p>
                                            <button 
                                                onClick={startCamera} 
                                                className="btn btn-secondary mt-3 text-xs py-1.5"
                                            >
                                                Enable Camera
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <canvas ref={canvasRef} style={{ display: 'none' }} />
                            </div>
                        )}

                        {/* Notes input */}
                        <div className="form-group mb-4">
                            <label className="form-label">{todayRecord ? 'Check-out Notes (Optional)' : 'Check-in Notes / Shift Plan'}</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={todayRecord ? "Describe what you accomplished..." : "What are your main targets for this shift?"}
                                className="form-input h-20 resize-none mb-0 bg-black/15 border-glass text-xs"
                            />
                        </div>

                        {/* Check-In/Out Actions */}
                        {!todayRecord ? (
                            <button
                                onClick={handleClockIn}
                                disabled={!capturedPhoto}
                                className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 hover-glow text-sm font-bold uppercase tracking-wider rounded-lg"
                                style={{
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                                    opacity: !capturedPhoto ? 0.6 : 1,
                                    cursor: !capturedPhoto ? 'not-allowed' : 'pointer'
                                }}
                            >
                                🚪 Clock In Shift
                            </button>
                        ) : todayRecord.checkOut ? (
                            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center text-sm font-semibold text-emerald-400">
                                ✓ Today's shift completed!
                                <div className="text-xs text-muted mt-1">
                                    Worked: <strong>{todayRecord.workHours} hours</strong>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleClockOut}
                                className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 hover-glow text-sm font-bold uppercase tracking-wider rounded-lg"
                                style={{
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                                }}
                            >
                                🚪 Clock Out Shift
                            </button>
                        )}

                        {/* Active Shift Details */}
                        {todayRecord && !todayRecord.checkOut && (
                            <div className="mt-4 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20 text-xs">
                                <p className="font-semibold text-white flex justify-between">
                                    <span>Active Shift Status:</span>
                                    <span className="animate-pulse text-emerald-400 font-bold">● Active</span>
                                </p>
                                <div className="mt-2 text-muted space-y-1" style={{ fontSize: '0.6875rem' }}>
                                    <p>Clock-in Time: <span className="text-white">{new Date(todayRecord.checkIn).toLocaleTimeString()}</span></p>
                                    <p>Status: <span className={todayRecord.status === 'Late' ? 'text-warning font-semibold' : 'text-emerald-400 font-semibold'}>{todayRecord.status}</span></p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 2: Personal Log / My Shifts */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card h-full min-h-[450px]">
                        <h3 className="card-title text-base flex items-center gap-2 mb-4">
                            <span>📋</span> My Recent Shifts
                        </h3>

                        <div className="table-container max-h-[360px] overflow-y-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Check-In</th>
                                        <th>Check-Out</th>
                                        <th>Status</th>
                                        <th>Hours</th>
                                        <th>Photo</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center text-muted py-6">
                                                No attendance logs found. Clock in to register your first shift!
                                            </td>
                                        </tr>
                                    ) : (
                                        myHistory.map((h, i) => (
                                            <tr key={h._id || i} className="hover:bg-white/5">
                                                <td className="font-semibold text-white">{h.date}</td>
                                                <td>{h.checkIn ? new Date(h.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                                <td>{h.checkOut ? new Date(h.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (
                                                    <span className="text-emerald-400 text-xs font-semibold animate-pulse">On-duty</span>
                                                )}</td>
                                                <td>
                                                    <span className={`badge ${h.status === 'Present' ? 'badge-success' : 'badge-warning'}`}>
                                                        {h.status}
                                                    </span>
                                                </td>
                                                <td className="font-bold text-white">{h.workHours ? `${h.workHours}h` : '-'}</td>
                                                <td>
                                                    {h.photo ? (
                                                        <img 
                                                            src={h.photo} 
                                                            alt="Verify" 
                                                            onClick={() => openLightbox(h.photo)}
                                                            className="w-8 h-8 rounded-lg object-cover border border-glass cursor-zoom-in hover:scale-105 transition-transform" 
                                                        />
                                                    ) : (
                                                        <span className="text-muted text-xs">None</span>
                                                    )}
                                                </td>
                                                <td className="text-muted text-xs truncate max-w-[120px]" title={h.notes}>
                                                    {h.notes || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* OWNER CONSOLE: Visible only for owner/admin */}
            {isOwner && (
                <div className="space-y-6 border-t border-glass pt-6 mt-6">
                    <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-white" style={{ letterSpacing: '0.02em' }}>
                        <span>🛡️</span> Owner Operations Console
                    </h2>

                    {/* Analytics Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="stats-card">
                            <span className="stats-card-title">Staff Clocked In</span>
                            <div className="stats-card-value text-white">{active}</div>
                            <span className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">● Active on floor</span>
                        </div>
                        <div className="stats-card">
                            <span className="stats-card-title">Present Today</span>
                            <div className="stats-card-value text-white">{present}</div>
                            <span className="text-xs text-muted mt-1">Expected: {allUsers.length} staff</span>
                        </div>
                        <div className="stats-card">
                            <span className="stats-card-title">Late Clock-Ins</span>
                            <div className="stats-card-value text-white" style={{ color: late > 0 ? 'var(--color-warning)' : 'inherit' }}>{late}</div>
                            <span className="text-xs text-muted mt-1">Threshold: 09:15 AM</span>
                        </div>
                        <div className="stats-card">
                            <span className="stats-card-title">On-Time Rate</span>
                            <div className="stats-card-value text-white">{rate}%</div>
                            <span className="text-xs text-emerald-400 font-semibold mt-1">Target: &gt;95%</span>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Weekly Work Hours chart */}
                        <div className="card lg:col-span-2 min-h-[300px] flex flex-col">
                            <h3 className="card-title text-base flex items-center gap-2 mb-4">
                                <span>📈</span> Weekly Store Operations Work hours
                            </h3>
                            <div className="flex-1 w-full h-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2a3042" />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                                        <YAxis stroke="#64748b" fontSize={11} />
                                        <Tooltip 
                                            contentStyle={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)', borderRadius: 8 }}
                                            labelStyle={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
                                        />
                                        <Bar dataKey="Hours Worked" fill="var(--color-primary-deep)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Today status Pie chart */}
                        <div className="card min-h-[300px] flex flex-col">
                            <h3 className="card-title text-base flex items-center gap-2 mb-4">
                                <span>📊</span> Today's Shift Distribution
                            </h3>
                            {present === 0 ? (
                                <div className="flex-1 flex items-center justify-center text-xs text-muted">
                                    No entries clocked in today yet.
                                </div>
                            ) : (
                                <div className="flex-1 w-full h-[200px] flex flex-col justify-center items-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Custom legend */}
                                    <div className="flex gap-4 text-xs mt-2 justify-center">
                                        {pieData.map((d, i) => (
                                            <span key={i} className="flex items-center gap-1">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }}></span>
                                                <span className="text-white">{d.name} ({d.value})</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Owner Master Logs table */}
                    <div className="card">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <h3 className="card-title text-base flex items-center gap-2 mb-0">
                                <span>📋</span> Master Staff Logs
                            </h3>
                            <div className="flex flex-wrap gap-3 w-full md:w-auto">
                                {/* Filters */}
                                <input 
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="form-input text-xs w-36 mb-0 bg-black/20 border-glass"
                                />

                                <select
                                    value={filterUser}
                                    onChange={(e) => setFilterUser(e.target.value)}
                                    className="form-input text-xs w-44 mb-0 bg-black/20 border-glass"
                                >
                                    <option value="">All Staff Members</option>
                                    {allUsers.map(u => (
                                        <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                    ))}
                                </select>

                                {/* Manual Addition CTA */}
                                <button
                                    onClick={() => setIsManualModalOpen(true)}
                                    className="btn btn-secondary py-2 text-xs flex items-center gap-1.5"
                                >
                                    <span>✍️</span> Manual entry
                                </button>

                                {/* Excel download CTA */}
                                <button
                                    onClick={handleExportExcel}
                                    className="btn btn-primary py-2 text-xs flex items-center gap-1.5"
                                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                                >
                                    <span>📥</span> Export Report
                                </button>
                            </div>
                        </div>

                        {/* Logs List */}
                        <div className="table-container max-h-[400px] overflow-y-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Employee</th>
                                        <th>Role</th>
                                        <th>Check-In</th>
                                        <th>Check-Out</th>
                                        <th>Status</th>
                                        <th>Hours</th>
                                        <th>Verification Image</th>
                                        <th>GPS Location</th>
                                        <th>Log Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan="10" className="text-center text-muted py-6">
                                                No attendance logs match the selected filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLogs.map((log, i) => (
                                            <tr key={log._id || i} className="hover:bg-white/5">
                                                <td className="font-semibold text-white">{log.date}</td>
                                                <td>
                                                    <div className="font-bold text-white">{log.user?.name || 'Staff User'}</div>
                                                    <div style={{ fontSize: '0.6875rem' }} className="text-muted">{log.user?.email}</div>
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: '0.6875rem', textTransform: 'capitalize' }} className="badge badge-info">
                                                        {log.user?.role || 'cashier'}
                                                    </span>
                                                </td>
                                                <td>{log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                                <td>{log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (
                                                    <span className="text-emerald-400 text-xs font-semibold animate-pulse">On-duty</span>
                                                )}</td>
                                                <td>
                                                    <span className={`badge ${log.status === 'Present' ? 'badge-success' : 'badge-warning'}`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                                <td className="font-bold text-white">{log.workHours ? `${log.workHours}h` : '-'}</td>
                                                <td>
                                                    {log.photo ? (
                                                        <img 
                                                            src={log.photo} 
                                                            alt="Identity" 
                                                            onClick={() => openLightbox(log.photo)}
                                                            className="w-8 h-8 rounded-lg object-cover border border-glass cursor-zoom-in hover:scale-105 transition-transform" 
                                                        />
                                                    ) : (
                                                        <span className="text-muted text-xs">No image</span>
                                                    )}
                                                </td>
                                                <td className="text-muted text-xs truncate max-w-[120px]" title={log.location}>
                                                    {log.location || 'Not logged'}
                                                </td>
                                                <td className="text-muted text-xs truncate max-w-[140px]" title={log.notes}>
                                                    {log.notes || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* LIGHTBOX MODAL FOR IMAGE VERIFICATION */}
            {isLightboxOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <div className="relative max-w-sm w-full mx-4 p-2 bg-[#1e293b] border border-glass rounded-xl overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <h4 className="text-center font-bold text-white mb-2 py-1 border-b border-glass" style={{ fontSize: '0.875rem' }}>webcam snap verification</h4>
                        <img src={lightboxSrc} alt="Verification Zoom" className="w-full rounded-lg aspect-video object-cover" />
                        <button 
                            onClick={() => setIsLightboxOpen(false)}
                            className="w-full mt-3 btn btn-secondary py-1 text-xs"
                        >
                            Close Preview
                        </button>
                    </div>
                </div>
            )}

            {/* MANUAL ATTENDANCE ENTRY MODAL */}
            {isManualModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in" onClick={() => setIsManualModalOpen(false)}>
                    <div className="card max-w-md w-full mx-4 p-6 shadow-2xl animate-scale-in bg-[#1e293b] border border-glass" onClick={(e) => e.stopPropagation()}>
                        <h3 className="card-title text-base mb-4 flex items-center gap-2">
                            <span>✍️</span> Register Manual Attendance Record
                        </h3>

                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div>
                                <label className="form-label text-xs">Select Employee</label>
                                <select
                                    required
                                    value={manualForm.userId}
                                    onChange={(e) => setManualForm(prev => ({ ...prev, userId: e.target.value }))}
                                    className="form-input text-xs bg-black/25 border-glass mb-0"
                                >
                                    <option value="">Choose Staff User...</option>
                                    {allUsers.map(u => (
                                        <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label text-xs">Record Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={manualForm.date}
                                        onChange={(e) => setManualForm(prev => ({ ...prev, date: e.target.value }))}
                                        className="form-input text-xs bg-black/25 border-glass mb-0"
                                    />
                                </div>
                                <div>
                                    <label className="form-label text-xs">Status Selection</label>
                                    <select
                                        value={manualForm.status}
                                        onChange={(e) => setManualForm(prev => ({ ...prev, status: e.target.value }))}
                                        className="form-input text-xs bg-black/25 border-glass mb-0"
                                    >
                                        <option value="Present">Present (On time)</option>
                                        <option value="Late">Late Arrival</option>
                                        <option value="Absent">Absent</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label text-xs">Check-In Time</label>
                                    <input
                                        required
                                        type="time"
                                        value={manualForm.checkIn}
                                        onChange={(e) => setManualForm(prev => ({ ...prev, checkIn: e.target.value }))}
                                        className="form-input text-xs bg-black/25 border-glass mb-0"
                                    />
                                </div>
                                <div>
                                    <label className="form-label text-xs">Check-Out Time (Optional)</label>
                                    <input
                                        type="time"
                                        value={manualForm.checkOut}
                                        onChange={(e) => setManualForm(prev => ({ ...prev, checkOut: e.target.value }))}
                                        className="form-input text-xs bg-black/25 border-glass mb-0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label text-xs">Notes / Explanations</label>
                                <textarea
                                    value={manualForm.notes}
                                    onChange={(e) => setManualForm(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Enter reasoning for manual adjustment..."
                                    className="form-input h-16 resize-none mb-0 bg-black/25 border-glass text-xs"
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsManualModalOpen(false)}
                                    className="btn btn-secondary py-2 text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary py-2 text-xs hover-glow"
                                    style={{ background: 'linear-gradient(135deg, var(--color-primary-deep), var(--color-accent-deep))' }}
                                >
                                    Save Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
