import { useState, useEffect } from 'react';
import resourceService from '../../services/resourceService';
import toast from 'react-hot-toast';
import { HiOutlineTrash, HiOutlineDesktopComputer } from 'react-icons/hi';

const LabsTab = ({ batchId, canManage }) => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', capacity: 30, location: '', facilities: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const { data } = await resourceService.getLabs(batchId);
      setLabs(data.data.labs);
    } catch (error) {
      toast.error('Failed to load labs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, [batchId]);

  const handleCreateLab = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        facilities: formData.facilities.split(',').map(f => f.trim()).filter(Boolean)
      };
      await resourceService.addLab(batchId, payload);
      toast.success('Lab added successfully');
      setFormData({ name: '', capacity: 30, location: '', facilities: '' });
      setShowForm(false);
      fetchLabs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add lab');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveLab = async (labId) => {
    if (!window.confirm('Are you sure you want to remove this lab?')) return;
    try {
      await resourceService.removeLab(batchId, labId);
      toast.success('Lab removed successfully');
      fetchLabs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove lab');
    }
  };

  if (loading) return <div className="text-surface-400 p-8 text-center animate-pulse">Loading labs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <HiOutlineDesktopComputer className="text-primary-400" /> Batch Labs
        </h3>
        {canManage && !showForm && (
          <button onClick={() => setShowForm(true)} className="px-3 py-1.5 text-sm bg-surface-800 hover:bg-surface-700 text-white rounded-lg transition-colors border border-surface-700">
            + Add Lab
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-surface-800/50 border border-surface-700/50 p-5 rounded-xl">
          <h4 className="text-sm font-medium text-white mb-4">Register New Lab</h4>
          <form onSubmit={handleCreateLab} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-surface-400 mb-1">Lab Name *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="e.g. Lab 101" />
            </div>
            <div>
              <label className="block text-xs text-surface-400 mb-1">Capacity *</label>
              <input required type="number" min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs text-surface-400 mb-1">Location / Room (Optional)</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="e.g. 2nd Floor, Block A" />
            </div>
            <div>
              <label className="block text-xs text-surface-400 mb-1">Facilities (Comma separated)</label>
              <input type="text" value={formData.facilities} onChange={e => setFormData({...formData, facilities: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="Projector, Whiteboard" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-surface-400 hover:text-white">Cancel</button>
              <button type="submit" disabled={submitting} className="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-500 text-white rounded-lg">Save Lab</button>
            </div>
          </form>
        </div>
      )}

      {labs.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-surface-700 rounded-xl text-surface-500 text-sm">
          No labs allocated to this batch yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {labs.map(lab => (
            <div key={lab._id} className="bg-surface-800/30 border border-surface-700/50 p-4 rounded-xl flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-white font-medium">{lab.name}</h4>
                  <p className="text-xs text-surface-400">{lab.location || 'No location specified'}</p>
                </div>
                {canManage && (
                  <button onClick={() => handleRemoveLab(lab._id)} className="text-red-400 hover:bg-red-500/10 p-1.5 rounded transition-colors" title="Remove Lab">
                    <HiOutlineTrash />
                  </button>
                )}
              </div>
              <div className="mt-auto pt-3 flex justify-between items-center text-sm border-t border-surface-700/50">
                <span className="text-surface-300">
                  <span className="text-white font-medium">{lab.currentStudents || 0}</span> / {lab.capacity} Students
                </span>
                {lab.facilities?.length > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-surface-700 rounded-full text-surface-300">
                    {lab.facilities.length} Facilities
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LabsTab;
