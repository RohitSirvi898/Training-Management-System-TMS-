import { useAuth } from '../context/AuthContext';
import {
  HiOutlineAcademicCap,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineCalendar,
} from 'react-icons/hi';

const Dashboard = () => {
  const { user } = useAuth();

  // Quick stat cards (placeholder data for now)
  const stats = [
    { label: 'Active Batches', value: '—', icon: HiOutlineAcademicCap, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Students', value: '—', icon: HiOutlineUsers, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Exams Scheduled', value: '—', icon: HiOutlineClipboardList, color: 'from-purple-500 to-purple-600' },
    { label: 'Upcoming Holidays', value: '—', icon: HiOutlineCalendar, color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Welcome back, <span className="bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-surface-400 mt-1">
          Here's your training management overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-surface-900/60 backdrop-blur border border-surface-700/50 rounded-xl p-5 hover:border-surface-600/50 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-surface-400">{stat.label}</span>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
                <stat.icon className="text-xl text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Placeholder content area */}
      <div className="bg-surface-900/40 backdrop-blur border border-surface-700/50 rounded-xl p-8 text-center mt-6">
        <div className="text-surface-500 text-lg">
          🚧 Module panels will appear here as we build them
        </div>
        <p className="text-surface-600 text-sm mt-2">
          Next up: Batch Management, Attendance...
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
