import { useState, useEffect } from 'react';
import examService from '../../services/examService';
import resourceService from '../../services/resourceService';
import toast from 'react-hot-toast';
import { HiOutlineAcademicCap, HiOutlineTrash } from 'react-icons/hi';
import { format } from 'date-fns';

const ExamsTab = ({ batchId, canManage }) => {
  const [exams, setExams] = useState([]);
  const [labs, setLabs] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'mid_test',
    date: '',
    startTime: '',
    endTime: '',
    totalMarks: 100,
    passingMarks: 40,
    instructions: '',
    assignedLabs: [],
    assignedStudents: [],
  });
  
  // Selection modes
  const [assignmentMode, setAssignmentMode] = useState('all'); // 'all', 'labs', 'students'

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examsRes, labsRes, studentsRes] = await Promise.all([
        examService.getExams(batchId),
        canManage ? resourceService.getLabs(batchId) : Promise.resolve({ data: { data: { labs: [] } } }),
        canManage ? resourceService.getStudents(batchId) : Promise.resolve({ data: { data: { students: [] } } })
      ]);
      setExams(examsRes.data.data.exams);
      if (canManage) {
        setLabs(labsRes.data.data.labs);
        setStudents(studentsRes.data.data.students);
      }
    } catch (error) {
      toast.error('Failed to load exams data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [batchId]);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let finalData = { ...formData };
      
      // Auto-assign based on selected mode
      if (assignmentMode === 'all') {
        finalData.assignedStudents = students.map(s => s._id);
        finalData.assignedLabs = labs.map(l => l._id);
      } else if (assignmentMode === 'labs') {
        // If assigned by lab, we deduce the students in those labs
        const labStudents = students
          .filter(s => s.labId && finalData.assignedLabs.includes(s.labId._id))
          .map(s => s._id);
        finalData.assignedStudents = labStudents;
      }
      // If assignmentMode === 'students', we keep the manual selections in assignedStudents array

      await examService.createExam(batchId, finalData);
      toast.success('Exam scheduled successfully');
      setShowForm(false);
      setFormData({
        title: '', type: 'mid_test', date: '', startTime: '', endTime: '', 
        totalMarks: 100, passingMarks: 40, instructions: '', assignedLabs: [], assignedStudents: []
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule exam');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam? Note: Exams with results cannot be deleted.')) return;
    try {
      await examService.deleteExam(batchId, examId);
      toast.success('Exam deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete exam');
    }
  };

  // Multiple select helper
  const handleSelectMulti = (e, field) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading && exams.length === 0) return <div className="text-center p-8 animate-pulse text-surface-400">Loading exams...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-surface-700/50 pb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <HiOutlineAcademicCap className="text-primary-400" /> Exam Schedule
        </h3>
        {canManage && !showForm && (
          <button onClick={() => setShowForm(true)} className="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors shadow-lg shadow-primary-500/20">
            + Schedule Exam
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-surface-800/80 border border-surface-700/50 p-6 rounded-xl">
          <h4 className="text-base font-semibold text-white mb-4">Schedule New Exam</h4>
          <form onSubmit={handleCreateExam} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-surface-400 mb-1">Exam Title *</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="e.g. JavaScript Mid Term" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-surface-400 mb-1">Type *</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white">
                    <option value="mid_test">Mid Test</option>
                    <option value="final_mock">Final Mock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-surface-400 mb-1">Date *</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white [color-scheme:dark]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-surface-400 mb-1">Start Time *</label>
                  <input required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-xs text-surface-400 mb-1">End Time *</label>
                  <input required type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white [color-scheme:dark]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-surface-400 mb-1">Total Marks *</label>
                  <input required type="number" min="1" value={formData.totalMarks} onChange={e => setFormData({...formData, totalMarks: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-surface-400 mb-1">Passing Marks *</label>
                  <input required type="number" min="0" value={formData.passingMarks} onChange={e => setFormData({...formData, passingMarks: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-surface-400 mb-1">Target Audience *</label>
                <select value={assignmentMode} onChange={e => setAssignmentMode(e.target.value)} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="all">Entire Batch (All Students & Labs)</option>
                  <option value="labs">Specific Labs</option>
                  <option value="students">Specific Students</option>
                </select>
              </div>

              {assignmentMode === 'labs' && (
                <div>
                  <label className="block text-xs text-surface-400 mb-1">Select Labs (Hold Ctrl/Cmd to multi-select)</label>
                  <select multiple required size="4" value={formData.assignedLabs} onChange={e => handleSelectMulti(e, 'assignedLabs')} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white">
                    {labs.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                  </select>
                </div>
              )}

              {assignmentMode === 'students' && (
                <div>
                  <label className="block text-xs text-surface-400 mb-1">Select Students (Hold Ctrl/Cmd to multi-select)</label>
                  <select multiple required size="4" value={formData.assignedStudents} onChange={e => handleSelectMulti(e, 'assignedStudents')} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white">
                    {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.enrollmentNo})</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs text-surface-400 mb-1">Instructions (Optional)</label>
                <textarea rows="3" maxLength="1000" value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white resize-none" placeholder="Requirements, software to use, etc..."></textarea>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-4 border-t border-surface-700/50 pt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-surface-400 hover:text-white">Cancel</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-500 text-white rounded-lg disabled:opacity-50">Schedule Exam</button>
            </div>
          </form>
        </div>
      )}

      {/* List of Exams */}
      {exams.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-surface-700 rounded-xl text-surface-500 text-sm">
          No exams scheduled for this batch.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {exams.map(exam => (
            <div key={exam._id} className="bg-surface-800 border border-surface-700 rounded-xl p-5 hover:border-surface-600 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-base font-bold text-white">{exam.title}</h4>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${exam.type === 'mid_test' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {exam.type.replace('_', ' ')}
                  </span>
                </div>
                {canManage && (
                  <button onClick={() => handleDeleteExam(exam._id)} className="text-surface-500 hover:text-red-400 p-1 transition-colors">
                    <HiOutlineTrash size={18} />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-y-2 text-sm mt-4">
                <div className="text-surface-400">Date: <span className="text-surface-200">{format(new Date(exam.date), 'MMM dd, yyyy')}</span></div>
                <div className="text-surface-400">Time: <span className="text-surface-200">{exam.startTime} - {exam.endTime}</span></div>
                <div className="text-surface-400">Marks: <span className="text-surface-200">{exam.totalMarks}</span></div>
                <div className="text-surface-400">Passing: <span className="text-emerald-400">{exam.passingMarks}</span></div>
                <div className="col-span-2 text-surface-400">Target: <span className="text-surface-200">{exam.assignedStudents?.length} Students</span></div>
                {exam.instructions && (
                  <div className="col-span-2 mt-2 pt-2 border-t border-surface-700/50">
                    <span className="text-surface-400 block text-xs mb-1">Instructions:</span>
                    <p className="text-surface-300 text-xs italic">{exam.instructions}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamsTab;
