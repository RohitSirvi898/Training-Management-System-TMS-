import { useState, useEffect } from 'react';
import resourceService from '../../services/resourceService';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { HiOutlineTrash, HiOutlineUserGroup } from 'react-icons/hi';

const TrainersTab = ({ batchId, canManage }) => {
  const [trainers, setTrainers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ userId: '', assignedLabs: [], specialization: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Trainers in batch, all Master users (Trainers), and Labs in batch
      const [trainersRes, usersRes, labsRes] = await Promise.all([
        resourceService.getTrainers(batchId),
        authService.getAllUsers('?role=trainer'),
        resourceService.getLabs(batchId)
      ]);
      setTrainers(trainersRes.data.data.trainers);
      setAvailableUsers(usersRes.data.data.users.filter(u => u.isActive));
      setLabs(labsRes.data.data.labs);
    } catch (error) {
      toast.error('Failed to load trainer data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [batchId]);

  const handleAssignTrainer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await resourceService.assignTrainer(batchId, formData);
      toast.success('Trainer assigned successfully');
      setFormData({ userId: '', assignedLabs: [], specialization: '' });
      setShowForm(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign trainer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveTrainer = async (trainerId) => {
    if (!window.confirm('Are you sure you want to remove this trainer from the batch?')) return;
    try {
      await resourceService.removeTrainer(batchId, trainerId);
      toast.success('Trainer unassigned successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove trainer');
    }
  };

  // Filter out users who are already assigned
  const assignedUserIds = trainers.map(t => t.userId?._id?.toString());
  const assignableDropdown = availableUsers.filter(u => !assignedUserIds.includes(u._id.toString()));

  if (loading) return <div className="text-surface-400 p-8 text-center animate-pulse">Loading trainers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <HiOutlineUserGroup className="text-primary-400" /> Batch Trainers
        </h3>
        {canManage && !showForm && assignableDropdown.length > 0 && (
          <button onClick={() => setShowForm(true)} className="px-3 py-1.5 text-sm bg-surface-800 hover:bg-surface-700 text-white rounded-lg transition-colors border border-surface-700">
            + Assign Trainer
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-surface-800/50 border border-surface-700/50 p-5 rounded-xl">
          <h4 className="text-sm font-medium text-white mb-4">Assign Trainer to Batch</h4>
          <form onSubmit={handleAssignTrainer} className="space-y-4">
            <div>
              <label className="block text-xs text-surface-400 mb-1">Select Trainer *</label>
              <select required value={formData.userId} onChange={e => setFormData({...formData, userId: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white outline-none">
                <option value="">-- Choose a trainer --</option>
                {assignableDropdown.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-surface-400 mb-1">Specialization (Optional)</label>
                <input type="text" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="e.g. Frontend, DB" />
              </div>
              <div>
                <label className="block text-xs text-surface-400 mb-1">Assign to Labs</label>
                <div className="bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 max-h-32 overflow-y-auto">
                  {labs.length === 0 ? <span className="text-xs text-surface-500">No labs available</span> : labs.map(lab => (
                    <label key={lab._id} className="flex items-center gap-2 mb-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.assignedLabs.includes(lab._id)}
                        onChange={(e) => {
                          if (e.target.checked) setFormData({...formData, assignedLabs: [...formData.assignedLabs, lab._id]});
                          else setFormData({...formData, assignedLabs: formData.assignedLabs.filter(id => id !== lab._id)});
                        }}
                        className="rounded border-surface-600 bg-surface-800 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-sm text-surface-300">{lab.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-surface-700/50">
              <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-surface-400 hover:text-white">Cancel</button>
              <button type="submit" disabled={submitting} className="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-500 text-white rounded-lg">Assign Trainer</button>
            </div>
          </form>
        </div>
      )}

      {trainers.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-surface-700 rounded-xl text-surface-500 text-sm">
          No trainers assigned to this batch.
        </div>
      ) : (
        <div className="bg-surface-800/30 border border-surface-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-800/50 text-surface-400 border-b border-surface-700/50">
              <tr>
                <th className="px-4 py-3 font-medium">Trainer Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Specialization</th>
                <th className="px-4 py-3 font-medium">Assigned Labs</th>
                {canManage && <th className="px-4 py-3 text-right font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/50">
              {trainers.map(trainer => (
                <tr key={trainer._id} className="hover:bg-surface-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{trainer.userId?.name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-surface-300">{trainer.userId?.email || 'N/A'}</td>
                  <td className="px-4 py-3 text-surface-400">{trainer.specialization || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {trainer.assignedLabs?.length > 0 
                        ? trainer.assignedLabs.map(l => <span key={l._id} className="text-xs bg-surface-700 text-surface-300 px-2 py-0.5 rounded">{l.name}</span>)
                        : <span className="text-xs text-surface-500">None</span>
                      }
                    </div>
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleRemoveTrainer(trainer._id)} className="text-red-400 hover:bg-red-500/10 p-1.5 rounded transition-colors" title="Unassign">
                        <HiOutlineTrash />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TrainersTab;
