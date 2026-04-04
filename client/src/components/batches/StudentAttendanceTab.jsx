import { useState, useEffect } from 'react';
import attendanceService from '../../services/attendanceService';
import resourceService from '../../services/resourceService';
import toast from 'react-hot-toast';
import { HiOutlineClipboardList } from 'react-icons/hi';
import { format } from 'date-fns';

const StudentAttendanceTab = ({ batchId, canManage, isTrainer }) => {
  const [students, setStudents] = useState([]);
  const [labs, setLabs] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedLab, setSelectedLab] = useState(''); // Allow filtering by Lab
  const [attendanceRecords, setAttendanceRecords] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, attendanceRes, holidaysRes, labsRes] = await Promise.all([
        resourceService.getStudents(batchId),
        attendanceService.getStudentAttendance(batchId, selectedDate),
        attendanceService.getHolidays(batchId),
        resourceService.getLabs(batchId)
      ]);

      const studentList = studentsRes.data.data.students;
      const existingAttd = attendanceRes.data.data.attendance;
      
      setStudents(studentList);
      setHolidays(holidaysRes.data.data.holidays);
      setLabs(labsRes.data.data.labs);

      // Pre-fill
      const initialAttd = {};
      studentList.forEach(s => {
        const record = existingAttd.find(a => a.studentId === s._id);
        if (record) {
          initialAttd[s._id] = { status: record.status, remarks: record.remarks || '' };
        } else {
          initialAttd[s._id] = { status: 'present', remarks: '' };
        }
      });
      setAttendanceRecords(initialAttd);
    } catch (error) {
      toast.error('Failed to load student attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [batchId, selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks }
    }));
  };

  // Quick fill everything visible to absent/present
  const bulkSetVisible = (status) => {
    const visibleStudentIds = students
      .filter(s => (selectedLab ? s.labId?._id === selectedLab : true))
      .map(s => s._id);

    setAttendanceRecords(prev => {
      const updated = { ...prev };
      visibleStudentIds.forEach(id => {
        updated[id].status = status;
      });
      return updated;
    });
  };

  const handleSaveAttendance = async () => {
    setSubmitting(true);
    try {
      // Only extract what's on the screen (filtered by lab) to avoid overwriting unrelated labs accidentally with defaults
      // Actually, saving all is safer if they adjusted someone then changed filter, 
      // but typical UI flow implies saving what you see.
      // Let's save all modified records we have tracked in state.
      const records = Object.keys(attendanceRecords).map(studentId => ({
        studentId,
        status: attendanceRecords[studentId].status,
        remarks: attendanceRecords[studentId].remarks
      }));

      await attendanceService.saveStudentAttendance(batchId, {
        date: selectedDate,
        records
      });

      toast.success('Student attendance saved globally');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const isHoliday = holidays.some(h => format(new Date(h.date), 'yyyy-MM-dd') === selectedDate);
  const allowEdit = canManage || isTrainer;

  // Filter rendering
  const displayedStudents = students.filter(s => selectedLab ? s.labId?._id === selectedLab : true);

  if (loading && students.length === 0) {
    return <div className="text-surface-400 p-8 text-center animate-pulse">Loading attendance records...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-surface-700/50 pb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 shrink-0">
          <HiOutlineClipboardList className="text-primary-400" /> Student Attendance
        </h3>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={selectedLab} 
            onChange={e => setSelectedLab(e.target.value)}
            className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-1.5 text-sm text-white outline-none"
          >
            <option value="">All Labs</option>
            {labs.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>

          <input 
            type="date" 
            value={selectedDate} 
            max={format(new Date(), 'yyyy-MM-dd')}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-1.5 text-sm text-white [color-scheme:dark] outline-none"
          />
        </div>
      </div>

      {isHoliday ? (
        <div className="text-center p-12 border border-dashed border-red-500/30 bg-red-500/5 rounded-xl">
          <span className="text-red-400 text-lg mb-2 block">Rest Day</span>
          <p className="text-surface-400 text-sm">The selected date is a holiday. No student attendance required.</p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-surface-700 rounded-xl text-surface-500 text-sm">
          No students enrolled in this batch.
        </div>
      ) : (
        <>
          {allowEdit && displayedStudents.length > 0 && (
             <div className="flex justify-end gap-2 text-xs">
               <button onClick={() => bulkSetVisible('present')} className="px-2 py-1 text-emerald-400 hover:bg-surface-800 rounded">Mark All Present</button>
               <button onClick={() => bulkSetVisible('absent')} className="px-2 py-1 text-red-400 hover:bg-surface-800 rounded">Mark All Absent</button>
             </div>
          )}

          <div className="bg-surface-800/30 border border-surface-700/50 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-800/50 text-surface-400 border-b border-surface-700/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Student Name</th>
                  <th className="px-4 py-3 font-medium">Lab</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Remarks (Optional)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {displayedStudents.map(student => (
                  <tr key={student._id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{student.name}</td>
                    <td className="px-4 py-3 text-surface-400 text-xs">{student.labId?.name || 'Unassigned'}</td>
                    <td className="px-4 py-3">
                      <select 
                        disabled={!allowEdit}
                        value={attendanceRecords[student._id]?.status || 'present'}
                        onChange={(e) => handleStatusChange(student._id, e.target.value)}
                        className={`bg-surface-900 border rounded-lg px-2 py-1 outline-none text-xs font-medium w-28 disabled:opacity-50 ${
                          attendanceRecords[student._id]?.status === 'absent' ? 'border-red-500/50 text-red-400' :
                          attendanceRecords[student._id]?.status === 'late' ? 'border-amber-500/50 text-amber-400' :
                          attendanceRecords[student._id]?.status === 'excused' ? 'border-blue-500/50 text-blue-400' :
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
                        disabled={!allowEdit}
                        type="text" 
                        maxLength={250}
                        placeholder="Issue..."
                        value={attendanceRecords[student._id]?.remarks || ''}
                        onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                        className="w-full bg-transparent border-none text-surface-300 text-xs placeholder-surface-600 focus:ring-0 px-2 disabled:opacity-50"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {allowEdit && (
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSaveAttendance}
                disabled={submitting}
                className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-lg text-sm transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Student Attendance'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentAttendanceTab;
