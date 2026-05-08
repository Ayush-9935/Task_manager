import useSWR from 'swr';
import api, { fetcher } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Clock, AlertTriangle, ListTodo, Loader2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: stats, isLoading: loading } = useSWR('/tasks/stats/dashboard', fetcher);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  // Modern Indigo/Emerald/Rose Palette
  const COLORS = ['#a78bfa', '#8b5cf6', '#10b981'];
  
  const pieData = stats ? [
    { name: 'Pending', value: stats.pendingTasks },
    { name: 'In Progress', value: stats.inProgressTasks },
    { name: 'Completed', value: stats.completedTasks },
  ] : [];

  const barData = stats ? [
    { name: 'Total', tasks: stats.totalTasks },
    { name: 'Pending', tasks: stats.pendingTasks },
    { name: 'In Progress', tasks: stats.inProgressTasks },
    { name: 'Completed', tasks: stats.completedTasks },
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, <span className="font-semibold text-primary-600">{user?.name}</span>. Here's what's happening.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-2xl p-6 flex items-center hover:-translate-y-1 transition-transform duration-300">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-lg shadow-primary-500/30">
            <ListTodo className="w-6 h-6" />
          </div>
          <div className="ml-5">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</p>
            <p className="text-3xl font-extrabold text-slate-800">{stats?.totalTasks || 0}</p>
          </div>
        </div>
        
        <div className="glass rounded-2xl p-6 flex items-center hover:-translate-y-1 transition-transform duration-300">
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30">
            <Clock className="w-6 h-6" />
          </div>
          <div className="ml-5">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending</p>
            <p className="text-3xl font-extrabold text-slate-800">{stats?.pendingTasks || 0}</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 flex items-center hover:-translate-y-1 transition-transform duration-300">
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="ml-5">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Completed</p>
            <p className="text-3xl font-extrabold text-slate-800">{stats?.completedTasks || 0}</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 flex items-center hover:-translate-y-1 transition-transform duration-300">
          <div className="p-4 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 text-white shadow-lg shadow-red-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="ml-5">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Overdue</p>
            <p className="text-3xl font-extrabold text-slate-800">{stats?.overdueTasks || 0}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass rounded-3xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <div className="w-2 h-6 bg-primary-500 rounded-full mr-3"></div>
            Status Distribution
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="drop-shadow-sm" />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-3xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <div className="w-2 h-6 bg-indigo-500 rounded-full mr-3"></div>
            Task Overview
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="tasks" fill="url(#colorTasks)" radius={[6, 6, 0, 0]} barSize={40}>
                  {barData.map((entry, index) => {
                    const colors = ['#3b82f6', '#a78bfa', '#8b5cf6', '#10b981'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#6d28d9" stopOpacity={1}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
