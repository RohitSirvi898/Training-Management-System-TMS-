import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import batchService from '../services/batchService';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineViewGrid, HiOutlinePencilAlt, HiOutlineCalendar, HiOutlineUserGroup, HiOutlineTag } from 'react-icons/hi';
import { format } from 'date-fns'; // We'll assume date-fns is installed or we use standard JS dates. Let's strictly use standard JS dates here if date-fns isn't available.

// Small JS DateFormatter to avoid external lib requirements just for basic display
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));
};

const BatchManagement = () => {
  const { user: currentUser } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    technology: '',
    startDate: '',
    endDate: '',
    maxStudents: 60,
  });

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const { data } = await batchService.getBatches(statusFilter);
      setBatches(data.data.batches);
    } catch (error) {
      toast.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [statusFilter]);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await batchService.createBatch(formData);
      toast.success('Batch created successfully');
      setIsModalOpen(false);
      setFormData({ name: '', description: '', technology: '', startDate: '', endDate: '', maxStudents: 60 });
      fetchBatches();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create batch');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await batchService.updateBatchStatus(id, newStatus);
      toast.success(`Batch marked as ${newStatus}`);
      fetchBatches();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    const config = {
      active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      upcoming: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    const style = config[status] || 'bg-surface-800 text-surface-400 border-surface-700';
    return <span className={`px-2.5 py-1 rounded-md text-xs font-medium border uppercase tracking-wider ${style}`}>{status}</span>;
  };

  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  return (
    <div className="p-6 max-w-7xl mx-auto text-surface-200">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <HiOutlineViewGrid className="text-primary-400" /> Batch Management
          </h1>
          <p className="text-surface-400 text-sm mt-1">Organize and monitor training cohorts</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 outline-none flex-1 sm:flex-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>

          {canManage && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-primary-500/20 whitespace-nowrap"
            >
              <HiOutlinePlus /> Create Batch
            </button>
          )}
        </div>
      </div>

      {/* Batches Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <svg className="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : batches.length === 0 ? (
        <div className="text-center p-12 bg-surface-900 border border-surface-700/50 rounded-xl">
          <div className="text-surface-400 text-lg mb-2">No batches found</div>
          <p className="text-surface-500 text-sm">Adjust filters or create a new batch to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map(batch => (
            <div key={batch._id} className="bg-surface-900 border border-surface-700/50 rounded-xl p-5 hover:border-surface-600/50 transition-all flex flex-col h-full shadow-lg">
              
              <div className="flex justify-between items-start mb-4">
                <div className="pr-2">
                  <h3 className="text-lg font-bold text-white leading-tight mb-1">{batch.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-primary-300 bg-primary-900/30 w-fit px-2 py-0.5 rounded border border-primary-500/20">
                    <HiOutlineTag /> {batch.technology}
                  </div>
                </div>
                {getStatusBadge(batch.status)}
              </div>

              <p className="text-sm text-surface-400 mb-5 flex-1 line-clamp-2">
                {batch.description || 'No description provided.'}
              </p>

              <div className="space-y-3 mb-5 border-t border-surface-800 pt-4">
                <div className="flex items-center gap-2 text-sm text-surface-300">
                  <HiOutlineCalendar className="text-surface-500" /> 
                  <span className="font-mono text-xs">{formatDate(batch.startDate)}</span>
                  <span className="text-surface-600 px-1">→</span>
                  <span className="font-mono text-xs">{formatDate(batch.endDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-surface-300">
                  <HiOutlineUserGroup className="text-surface-500" /> 
                  Capacity: {batch.maxStudents} Students
                </div>
              </div>

              {/* Card Footer actions */}
              <div className="mt-auto flex items-center justify-between pt-4 border-t border-surface-800">
                <div className="text-xs text-surface-500">
                  Created by <span className="text-surface-400 font-medium">{batch.createdBy?.name || 'Unknown'}</span>
                </div>
                
                {canManage && (
                  <div className="flex items-center gap-2">
                    {batch.status === 'upcoming' && (
                      <button onClick={() => updateStatus(batch._id, 'active')} className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">Start</button>
                    )}
                    {batch.status === 'active' && (
                      <button onClick={() => updateStatus(batch._id, 'completed')} className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">Complete</button>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Create Batch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-surface-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2"><HiOutlinePlus className="text-primary-400" /> Create New Batch</h2>
            <form onSubmit={handleCreateBatch} className="space-y-4 text-left">
              
              <div>
                <label className="block text-sm text-surface-300 mb-1">Batch Name *</label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                  placeholder="e.g. Full Stack Alpha 2026"
                />
              </div>

              <div>
                <label className="block text-sm text-surface-300 mb-1">Technology / Course *</label>
                <input 
                  required 
                  type="text" 
                  value={formData.technology} 
                  onChange={e => setFormData({...formData, technology: e.target.value})}
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                  placeholder="e.g. React & Node.js"
                />
              </div>

              <div>
                <label className="block text-sm text-surface-300 mb-1">Description (Optional)</label>
                <textarea 
                  rows={2}
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all resize-none"
                  placeholder="Brief details about the cohort"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-surface-300 mb-1">Start Date *</label>
                  <input 
                    required
                    type="date" 
                    value={formData.startDate} 
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-surface-300 mb-1">End Date *</label>
                  <input 
                    required
                    type="date" 
                    value={formData.endDate} 
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-surface-300 mb-1">Max Capacity (Students) *</label>
                <input 
                  required
                  type="number" 
                  min="1"
                  value={formData.maxStudents} 
                  onChange={e => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-800">
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
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Batch'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchManagement;
