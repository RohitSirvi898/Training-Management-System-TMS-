import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineStatusOnline, HiOutlineBan } from 'react-icons/hi';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'trainer',
    phone: '',
    permissions: [],
  });

  const fetchUsers = async () => {
    try {
      const { data } = await authService.getAllUsers();
      setUsers(data.data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await authService.toggleUserStatus(userId);
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
      toast.success(currentStatus ? 'User deactivated' : 'User activated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authService.register(formData);
      toast.success('User created successfully');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'trainer', phone: '', permissions: [] });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  // Role permissions UI helpers
  const availableRoles = currentUser?.role === 'admin' 
    ? ['manager', 'trainer', 'college_staff'] 
    : ['trainer', 'college_staff'];

  const getRoleBadge = (role) => {
    const rolesConfig = {
      admin: { color: 'text-red-400 bg-red-400/10 border-red-400/20', label: 'Admin' },
      manager: { color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', label: 'Manager' },
      trainer: { color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', label: 'Trainer' },
      college_staff: { color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', label: 'College Staff' },
    };
    const config = rolesConfig[role] || { color: 'text-gray-400 bg-gray-400/10 border-gray-400/20', label: role };
    return <span className={`px-2 py-1 rounded-md text-xs border ${config.color}`}>{config.label}</span>;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-surface-200">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-surface-400 text-sm mt-1">Manage system access across roles</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-primary-500/20"
        >
          <HiOutlinePlus /> Add New User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-surface-900 border border-surface-700/50 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-800/50 text-surface-400 border-b border-surface-700/50">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-surface-400">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-surface-400">No users found.</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u._id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                    <td className="px-6 py-4 text-surface-300">{u.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                    <td className="px-6 py-4 text-surface-400">{u.phone || '-'}</td>
                    <td className="px-6 py-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-red-400 text-xs font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(u._id, u.isActive)}
                          className={`p-2 rounded-lg transition-colors border ${
                            u.isActive 
                              ? 'text-red-400 border-red-500/30 hover:bg-red-500/10' 
                              : 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
                          }`}
                          title={u.isActive ? 'Deactivate User' : 'Activate User'}
                        >
                          {u.isActive ? <HiOutlineBan /> : <HiOutlineStatusOnline />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-surface-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Add New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              
              <div>
                <label className="block text-sm text-surface-300 mb-1">Full Name</label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm text-surface-300 mb-1">Email Address</label>
                <input 
                  required 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                  placeholder="john@tms.com"
                />
              </div>

              <div>
                <label className="block text-sm text-surface-300 mb-1">Temporary Password</label>
                <input 
                  required 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-surface-300 mb-1">Role</label>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                  >
                    {availableRoles.map(role => (
                      <option key={role} value={role}>{role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-surface-300 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                    placeholder="Optional"
                  />
                </div>
              </div>

              {formData.role === 'college_staff' && (
                <div className="p-3 bg-primary-900/20 border border-primary-500/20 rounded-lg">
                  <p className="text-xs text-primary-300 mb-2">College Staff Permissions (Optional)</p>
                  <input
                    type="text"
                    placeholder="e.g. view_students, view_attendance"
                    className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-1.5 text-white text-sm focus:border-primary-500 outline-none"
                    value={formData.permissions.join(',')}
                    onChange={e => setFormData({...formData, permissions: e.target.value.split(',').map(p => p.trim()).filter(p => p)})}
                  />
                  <p className="text-[10px] text-surface-400 mt-1">Comma separated standard permissions</p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-surface-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
