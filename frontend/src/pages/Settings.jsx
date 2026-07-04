import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('shop');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings State
  const [shopSettings, setShopSettings] = useState({
    shopName: 'Apex MotorWorks & Auto Parts',
    tagline: 'Premium Auto Care & Parts Supply',
    phone: '+1 (555) 234-5678',
    email: 'contact@apexmotorworks.com',
    address: '450 Industrial Parkway, Suite 100, San Jose, CA',
    currency: '$',
    taxRate: '8.5',
    lowStockThreshold: '10',
    receiptHeader: 'Thank you for choosing Apex MotorWorks!',
    receiptFooter: 'Warranty: 30 days money back guarantee on non-electrical items.',
  });

  const [userProfile, setUserProfile] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@apex.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleShopChange = (e) => {
    const { name, value } = e.target;
    setShopSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUserProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="animate-fade-in p-2 md:p-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '2rem' }}>⚙️</span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
              System & Shop Configuration
            </h1>
            <p className="text-sm text-muted">
              Manage store details, currency options, invoice printing, and user security.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="badge badge-success animate-scale-in py-2 px-4 text-sm">
            ✓ Settings saved successfully!
          </div>
        )}
      </div>

      {/* Main Layout: Tabs + Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Tabs (Sidebar style) */}
        <div className="card h-fit space-y-2">
          {[
            { id: 'shop', label: 'Store Information', icon: '🏪' },
            { id: 'pos', label: 'POS & Tax Config', icon: '🛒' },
            { id: 'receipt', label: 'Receipt & Printing', icon: '🧾' },
            { id: 'inventory', label: 'Inventory Thresholds', icon: '📦' },
            { id: 'security', label: 'Security & Account', icon: '🔒' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left ${
                activeTab === tab.id
                  ? 'bg-primary/20 border border-primary text-primary shadow-lg'
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`}
              style={
                activeTab === tab.id
                  ? {
                      background: 'linear-gradient(135deg, rgba(112, 0, 255, 0.2), rgba(0, 240, 255, 0.2))',
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-primary)',
                    }
                  : {}
              }
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3 card">
          <form onSubmit={handleSubmit}>
            {/* Store Information */}
            {activeTab === 'shop' && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="card-title text-lg flex items-center gap-2 mb-4">
                  <span>🏪</span> Shop Profile & Contact Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Shop Name</label>
                    <input
                      type="text"
                      name="shopName"
                      value={shopSettings.shopName}
                      onChange={handleShopChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Tagline / Subtitle</label>
                    <input
                      type="text"
                      name="tagline"
                      value={shopSettings.tagline}
                      onChange={handleShopChange}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Contact Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={shopSettings.phone}
                      onChange={handleShopChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Contact Email</label>
                    <input
                      type="email"
                      name="email"
                      value={shopSettings.email}
                      onChange={handleShopChange}
                      className="form-input"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="form-label">Physical Shop Address</label>
                    <textarea
                      name="address"
                      value={shopSettings.address}
                      onChange={handleShopChange}
                      className="form-input h-24 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* POS & Tax Config */}
            {activeTab === 'pos' && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="card-title text-lg flex items-center gap-2 mb-4">
                  <span>🛒</span> Currency, Tax & Payment Options
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Currency Symbol</label>
                    <select
                      name="currency"
                      value={shopSettings.currency}
                      onChange={handleShopChange}
                      className="form-input"
                    >
                      <option value="$">US Dollar ($)</option>
                      <option value="€">Euro (€)</option>
                      <option value="£">British Pound (£)</option>
                      <option value="Rs">Pakistani / Indian Rupee (Rs)</option>
                      <option value="AED">AED (Dirham)</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Sales Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="taxRate"
                      value={shopSettings.taxRate}
                      onChange={handleShopChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Receipt & Printing */}
            {activeTab === 'receipt' && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="card-title text-lg flex items-center gap-2 mb-4">
                  <span>🧾</span> Receipt & Printable Invoice Format
                </h3>

                <div>
                  <label className="form-label">Receipt Header Message</label>
                  <input
                    type="text"
                    name="receiptHeader"
                    value={shopSettings.receiptHeader}
                    onChange={handleShopChange}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Receipt Footer Note / Warranty Disclaimer</label>
                  <textarea
                    name="receiptFooter"
                    value={shopSettings.receiptFooter}
                    onChange={handleShopChange}
                    className="form-input h-24 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Inventory Thresholds */}
            {activeTab === 'inventory' && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="card-title text-lg flex items-center gap-2 mb-4">
                  <span>📦</span> Inventory Alerts & Stock Thresholds
                </h3>

                <div>
                  <label className="form-label">Default Low Stock Warning Level (Units)</label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    value={shopSettings.lowStockThreshold}
                    onChange={handleShopChange}
                    className="form-input"
                  />
                  <p className="text-xs text-muted mt-1">
                    Products with stock equal to or below this amount will trigger a low stock alert badge.
                  </p>
                </div>
              </div>
            )}

            {/* Security & Account */}
            {activeTab === 'security' && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="card-title text-lg flex items-center gap-2 mb-4">
                  <span>🔒</span> Admin Account Security
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={userProfile.name}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={userProfile.email}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="••••••••"
                      value={userProfile.currentPassword}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="••••••••"
                      value={userProfile.newPassword}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 pt-4 border-t border-glass flex justify-end gap-3">
              <button type="submit" className="btn btn-primary px-8 hover-glow">
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
