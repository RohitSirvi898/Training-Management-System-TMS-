import { useAuth } from '../context/AuthContext';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineLogout, HiOutlineUserCircle, HiOutlineHome, HiOutlineUsers } from 'react-icons/hi';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    const labels = { admin: 'Administrator', manager: 'Manager', trainer: 'Trainer', college_staff: 'College Staff' };
    return labels[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-red-500/15 text-red-400 border-red-500/30',
      manager: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      trainer: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      college_staff: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    };
    return colors[role] || 'bg-surface-700 text-surface-300';
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-surface-900/80 backdrop-blur-xl border-b border-surface-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand & Left Nav */}
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <span className="text-sm font-bold text-white">T</span>
                </div>
                <span className="text-lg font-semibold text-white tracking-tight hidden sm:block">TMS</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-1">
                <Link 
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                    location.pathname === '/dashboard' ? 'bg-surface-800 text-white' : 'text-surface-400 hover:text-white hover:bg-surface-800/50'
                  }`}
                >
                  <HiOutlineHome /> Dashboard
                </Link>

                {/* Only Admin & Manager can manage users */}
                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <Link 
                    to="/users"
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                      location.pathname.includes('/users') ? 'bg-surface-800 text-white' : 'text-surface-400 hover:text-white hover:bg-surface-800/50'
                    }`}
                  >
                    <HiOutlineUsers /> Users
                  </Link>
                )}
              </div>
            </div>

            {/* Right User section */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <HiOutlineUserCircle className="text-2xl text-surface-400" />
                <div className="text-right">
                  <p className="text-sm font-medium text-white leading-tight">{user?.name}</p>
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border ${getRoleBadgeColor(user?.role)} mt-0.5`}>
                    {getRoleLabel(user?.role)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-surface-400 hover:text-white bg-surface-800/60 hover:bg-surface-700/60 border border-surface-700/50 rounded-lg transition-all cursor-pointer"
              >
                <HiOutlineLogout className="text-lg" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
