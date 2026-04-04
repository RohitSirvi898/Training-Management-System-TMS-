import { useState, useEffect } from 'react';
import attendanceService from '../../services/attendanceService';
import resourceService from '../../services/resourceService';
import toast from 'react-hot-toast';
import { HiOutlineClipboardCheck } from 'react-icons/hi';
import { format } from 'date-fns';

const TrainerAttendanceTab = ({ batchId, canManage }) => {
  const [trainers, setTrainers] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // By default, pick today
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // State for attendance marks keyed by trainerId
  // schema: { [trainerId]: { status, remarks } }
  const [attendanceRecords, setAttendanceRecords] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Trainer List and existing attendance for selected date
      const [trainersRes, attendanceRes, holidaysRes] = await Promise.all([
        resourceService.getTrainers(batchId),
        attendanceService.getTrainerAttendance(batchId, selectedDate),
        attendanceService.getHolidays(batchId)
      ]);

      const trainerList = trainersRes.data.data.trainers;
      const existingAttd = attendanceRes.data.data.attendance;
      
      setTrainers(trainerList);
      setHolidays(holidaysRes.data.data.holidays);

      // Pre-fill the state
      const initialAttd = {};
      trainerList.forEach(t => {
        // Find if they already have a record today
        const record = existingAttd.find(a => a.trainerId === t._id);
        if (record) {
          initialAttd[t._id] = { status: record.status, remarks: record.remarks || '' };
        } else {
          // Default to present for rapid marking
          initialAttd[t._id] = { status: 'present', remarks: '' };
        }
      });
      setAttendanceRecords(initialAttd);
    } catch (error) {
      toast.error('Failed to load trainer attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [batchId, selectedDate]);

  const handleStatusChange = (trainerId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [trainerId]: { ...prev[trainerId], status }
    }));
  };

  const handleRemarksChange = (trainerId, remarks) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [trainerId]: { ...prev[trainerId], remarks }
    }));
  };

  const handleSaveAttendance = async () => {
    setSubmitting(true);
    try {
      // Map state dict to array format expected by API
      const records = Object.keys(attendanceRecords).map(trainerId => ({
        trainerId,
        status: attendanceRecords[trainerId].status,
        remarks: attendanceRecords[trainerId].remarks
      }));

      await attendanceService.saveTrainerAttendance(batchId, {
        date: selectedDate,
        records
      });

      toast.success('Attendance saved successfully');
      fetchData(); // Refresh to catch any API normalizations
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if selected date is a holiday
  const isHoliday = holidays.some(h => format(new Date(h.date), 'yyyy-MM-dd') === selectedDate);

  if (loading && trainers.length === 0) {
    return <div className="text-surface-400 p-8 text-center animate-pulse">Loading attendance records...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-700/50 pb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <HiOutlineClipboardCheck className="text-primary-400" /> Trainer Attendance
        </h3>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-surface-400">Target Date:</span>
          <input 
            type="date" 
            value={selectedDate} 
            max={format(new Date(), 'yyyy-MM-dd')} // Can't mark future attendance
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-1.5 text-sm text-white [color-scheme:dark] outline-none"
          />
        </div>
      </div>

      {isHoliday ? (
        <div className="text-center p-12 border border-dashed border-red-500/30 bg-red-500/5 rounded-xl">
          <span className="text-red-400 text-lg mb-2 block">Rest Day</span>
          <p className="text-surface-400 text-sm">The selected date is marked as a declared holiday. Attendance is not required.</p>
        </div>
      ) : trainers.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-surface-700 rounded-xl text-surface-500 text-sm">
          No trainers assigned to this batch.
        </div>
      ) : (
        <>
          <div className="bg-surface-800/30 border border-surface-700/50 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-800/50 text-surface-400 border-b border-surface-700/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Trainer Name</th>
                  <th className="px-4 py-3 font-medium">Specialization</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Remarks (Optional)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {trainers.map(trainer => (
                  <tr key={trainer._id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{trainer.userId?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-surface-400 text-xs">{trainer.specialization || '-'}</td>
                    <td className="px-4 py-3">
                      <select 
                        disabled={!canManage}
                        value={attendanceRecords[trainer._id]?.status || 'present'}
                        onChange={(e) => handleStatusChange(trainer._id, e.target.value)}
                        className={`bg-surface-900 border rounded-lg px-2 py-1 outline-none text-xs font-medium w-28 disabled:opacity-50 ${
                          attendanceRecords[trainer._id]?.status === 'absent' ? 'border-red-500/50 text-red-400' :
                          attendanceRecords[trainer._id]?.status === 'late' ? 'border-amber-500/50 text-amber-400' :
                          attendanceRecords[trainer._id]?.status === 'excused' ? 'border-blue-500/50 text-blue-400' :
                          'border-emerald-500/50 text-emerald-400'
                        }`}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 w-1/3 min-w-[200px]">
                      <input 
                        disabled={!canManage}
                        type="text" 
                        maxLength={250}
                        placeholder="Add note..."
                        value={attendanceRecords[trainer._id]?.remarks || ''}
                        onChange={(e) => handleRemarksChange(trainer._id, e.target.value)}
                        className="w-full bg-transparent border-none text-surface-300 text-xs placeholder-surface-600 focus:ring-0 px-2 disabled:opacity-50"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {canManage && (
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSaveAttendance}
                disabled={submitting}
                className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-lg text-sm transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Trainer Attendance'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrainerAttendanceTab;
