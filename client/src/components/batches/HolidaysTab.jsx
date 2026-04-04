import { useState, useEffect } from 'react';
import attendanceService from '../../services/attendanceService';
import toast from 'react-hot-toast';
import { HiOutlineCalendar, HiOutlineTrash } from 'react-icons/hi';
import { format } from 'date-fns';

const HolidaysTab = ({ batchId, canManage }) => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ date: '', reason: '' });

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const { data } = await attendanceService.getHolidays(batchId);
      setHolidays(data.data.holidays);
    } catch (error) {
      toast.error('Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [batchId]);

  const handleCreateHoliday = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await attendanceService.addHoliday(batchId, formData);
      toast.success('Holiday declared successfully');
      setFormData({ date: '', reason: '' });
      setShowForm(false);
      fetchHolidays();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to declare holiday');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveHoliday = async (holidayId) => {
    if (!window.confirm('Are you sure you want to remove this holiday?')) return;
    try {
      await attendanceService.removeHoliday(batchId, holidayId);
      toast.success('Holiday removed successfully');
      fetchHolidays();
    } catch (error) {
      toast.error('Failed to remove holiday');
    }
  };

  if (loading) return <div className="text-surface-400 p-8 text-center animate-pulse">Loading holidays...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <HiOutlineCalendar className="text-red-400" /> Declared Holidays
        </h3>
        {canManage && !showForm && (
          <button onClick={() => setShowForm(true)} className="px-3 py-1.5 text-sm bg-surface-800 hover:bg-surface-700 text-white rounded-lg transition-colors border border-surface-700">
            + Declare Holiday
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-surface-800/50 border border-surface-700/50 p-5 rounded-xl">
          <h4 className="text-sm font-medium text-white mb-4">Declare New Holiday</h4>
          <form onSubmit={handleCreateHoliday} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-surface-400 mb-1">Date *</label>
              <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-xs text-surface-400 mb-1">Reason (e.g. Public Holiday, Tech Issue) *</label>
              <input required type="text" maxLength={200} value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-surface-400 hover:text-white">Cancel</button>
              <button type="submit" disabled={submitting} className="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-500 text-white rounded-lg">Save Holiday</button>
            </div>
          </form>
        </div>
      )}

      {holidays.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-surface-700 rounded-xl text-surface-500 text-sm">
          No holidays declared for this batch.
        </div>
      ) : (
        <div className="bg-surface-800/30 border border-surface-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-800/50 text-surface-400 border-b border-surface-700/50">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Declared By</th>
                {canManage && <th className="px-4 py-3 text-right font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/50">
              {holidays.map(holiday => (
                <tr key={holiday._id} className="hover:bg-surface-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-red-300">
                    {format(new Date(holiday.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-surface-300">{holiday.reason}</td>
                  <td className="px-4 py-3 text-surface-400 text-xs">{holiday.declaredBy?.name || 'Unknown'}</td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleRemoveHoliday(holiday._id)} className="text-red-400 hover:bg-red-500/10 p-1.5 rounded transition-colors" title="Remove">
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

export default HolidaysTab;
