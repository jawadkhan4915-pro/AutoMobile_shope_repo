import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';

const Reports = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [activeTab, setActiveTab] = useState('sales');

  // Sample data for reports
  const salesData = [
    { name: 'Jan', revenue: 14500, profit: 4800, orders: 120 },
    { name: 'Feb', revenue: 18200, profit: 6100, orders: 145 },
    { name: 'Mar', revenue: 22400, profit: 7900, orders: 180 },
    { name: 'Apr', revenue: 19800, profit: 6800, orders: 160 },
    { name: 'May', revenue: 26500, profit: 9200, orders: 210 },
    { name: 'Jun', revenue: 31200, profit: 11400, orders: 245 },
    { name: 'Jul', revenue: 28900, profit: 10100, orders: 225 },
  ];

  const categoryData = [
    { name: 'Brake Systems', value: 35, color: '#00F0FF' },
    { name: 'Engine Parts', value: 25, color: '#7000FF' },
    { name: 'Oils & Fluids', value: 20, color: '#00FF9D' },
    { name: 'Tires & Wheels', value: 12, color: '#FFB800' },
    { name: 'Electrical & Batteries', value: 8, color: '#FF0055' },
  ];

  const topProducts = [
    { name: 'Brembo Ceramic Brake Pads', category: 'Brake Systems', sold: 142, revenue: '$12,070', stock: 18 },
    { name: 'Castrol Edge 5W-30 Synthetic Oil (5L)', category: 'Oils & Fluids', sold: 230, revenue: '$10,350', stock: 45 },
    { name: 'Bosch Platinum Spark Plugs (4-Pack)', category: 'Engine Parts', sold: 98, revenue: '$4,410', stock: 32 },
    { name: 'Michelin Pilot Sport 4S 245/40R18', category: 'Tires & Wheels', sold: 64, revenue: '$15,360', stock: 12 },
    { name: 'Optima RedTop AGM Battery', category: 'Electrical', sold: 41, revenue: '$9,020', stock: 8 },
  ];

  return (
    <div className="animate-fade-in p-2 md:p-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6">
        <div>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '2rem' }}>📈</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
                Analytics & Business Intelligence
              </h1>
              <p className="text-sm text-muted">
                Track revenue, sales velocity, profit margins, and inventory performance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex rounded-lg p-1" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-glass)' }}>
            {['weekly', 'monthly', 'quarterly', 'yearly'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${
                  timeRange === range ? 'bg-primary text-black font-bold shadow-lg' : 'text-muted hover:text-white'
                }`}
                style={timeRange === range ? { background: 'var(--color-primary)' } : {}}
              >
                {range}
              </button>
            ))}
          </div>

          <button 
            onClick={() => alert('Exporting PDF & CSV Report...')}
            className="btn btn-outline flex items-center gap-2 text-xs py-2"
          >
            <span>📥</span> Export Report
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stats-card hover-lift">
          <p className="stats-card-title">Gross Revenue</p>
          <p className="stats-card-value">$162,900</p>
          <div className="stats-card-change" style={{ color: 'var(--color-success)' }}>
            <span>▲ +18.4%</span>
            <span className="text-muted">vs previous period</span>
          </div>
        </div>

        <div className="stats-card hover-lift">
          <p className="stats-card-title">Net Profit</p>
          <p className="stats-card-value">$56,500</p>
          <div className="stats-card-change" style={{ color: 'var(--color-success)' }}>
            <span>▲ +14.2%</span>
            <span className="text-muted">34.6% profit margin</span>
          </div>
        </div>

        <div className="stats-card hover-lift">
          <p className="stats-card-title">Total Orders</p>
          <p className="stats-card-value">1,240</p>
          <div className="stats-card-change" style={{ color: 'var(--color-primary)' }}>
            <span>▲ +8.1%</span>
            <span className="text-muted">Avg $131.37 / order</span>
          </div>
        </div>

        <div className="stats-card hover-lift">
          <p className="stats-card-title">Active Customers</p>
          <p className="stats-card-value">384</p>
          <div className="stats-card-change" style={{ color: 'var(--color-accent)' }}>
            <span>▲ +24 new</span>
            <span className="text-muted">this month</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Profit Area Chart */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <div>
              <h3 className="card-title text-lg flex items-center gap-2">
                <span>💰</span> Financial Velocity Trends
              </h3>
              <p className="text-xs text-muted">Comparison of revenue vs net profit over time</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('sales')}
                className={`px-3 py-1 text-xs rounded-md border transition-all ${
                  activeTab === 'sales' ? 'border-primary text-primary bg-primary/10' : 'border-glass text-muted'
                }`}
              >
                Revenue
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-1 text-xs rounded-md border transition-all ${
                  activeTab === 'orders' ? 'border-primary text-primary bg-primary/10' : 'border-glass text-muted'
                }`}
              >
                Orders
              </button>
            </div>
          </div>

          <div className="card-body h-80">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'sales' ? (
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7000FF" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#7000FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0B0D17', 
                      borderColor: 'rgba(0, 240, 255, 0.3)', 
                      borderRadius: '8px',
                      boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)' 
                    }} 
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#00F0FF" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="profit" name="Profit ($)" stroke="#7000FF" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              ) : (
                <BarChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0B0D17', 
                      borderColor: 'rgba(0, 240, 255, 0.3)', 
                      borderRadius: '8px' 
                    }} 
                  />
                  <Bar dataKey="orders" name="Order Count" fill="#00FF9D" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title text-lg flex items-center gap-2">
              <span>🚗</span> Sales by Category
            </h3>
          </div>
          <div className="card-body h-80 flex flex-col justify-center items-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0D17', borderColor: 'rgba(0, 240, 255, 0.3)', borderRadius: '8px' }} 
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-2 w-full text-xs mt-2">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-muted truncate">{item.name}</span>
                  <span className="font-bold ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Auto Parts Table */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <div>
            <h3 className="card-title text-lg flex items-center gap-2">
              <span>🏆</span> Top Selling Products & Auto Parts
            </h3>
            <p className="text-xs text-muted">Best performing items by quantity sold and total revenue generated</p>
          </div>
          <span className="badge badge-success">Live Sync</span>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Quantity Sold</th>
                <th>Revenue Generated</th>
                <th>Remaining Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((item, index) => (
                <tr key={index}>
                  <td className="font-bold flex items-center gap-2">
                    <span className="text-xs w-6 h-6 rounded-full flex items-center justify-center bg-primary/20 text-primary">
                      #{index + 1}
                    </span>
                    {item.name}
                  </td>
                  <td>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-panel border border-glass text-muted">
                      {item.category}
                    </span>
                  </td>
                  <td className="font-bold">{item.sold} units</td>
                  <td className="text-primary font-bold">{item.revenue}</td>
                  <td>{item.stock} in stock</td>
                  <td>
                    {item.stock < 15 ? (
                      <span className="badge badge-warning">Low Stock</span>
                    ) : (
                      <span className="badge badge-success">Healthy</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
