import { useState, useEffect } from 'react';
import resourceService from '../../services/resourceService';
import toast from 'react-hot-toast';
import { HiOutlineTrash, HiOutlineUsers } from 'react-icons/hi';

const StudentsTab = ({ batchId, canManage }) => {
  const [students, setStudents] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', collegeName: '', enrollmentNo: '', labId: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, labsRes] = await Promise.all([
        resourceService.getStudents(batchId),
        resourceService.getLabs(batchId)
      ]);
      setStudents(studentsRes.data.data.students);
      setLabs(labsRes.data.data.labs);
    } catch (error) {
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [batchId]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.labId) delete payload.labId; // Don't send empty labId string

      await resourceService.addStudent(batchId, payload);
      toast.success('Student enrolled successfully');
      setFormData({ name: '', email: '', phone: '', collegeName: '', enrollmentNo: '', labId: '' });
      setShowForm(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student?')) return;
    try {
      await resourceService.removeStudent(batchId, studentId);
      toast.success('Student removed successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove student');
    }
  };

  if (loading) return <div className="text-surface-400 p-8 text-center animate-pulse">Loading students...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <HiOutlineUsers className="text-primary-400" /> Enrolled Students <span className="text-sm font-normal text-surface-400">({students.length})</span>
        </h3>
        {canManage && !showForm && (
          <button onClick={() => setShowForm(true)} className="px-3 py-1.5 text-sm bg-surface-800 hover:bg-surface-700 text-white rounded-lg transition-colors border border-surface-700">
            + Add Student
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-surface-800/50 border border-surface-700/50 p-5 rounded-xl">
          <h4 className="text-sm font-medium text-white mb-4">Enroll New Student</h4>
          <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-surface-400 mb-1">Full Name *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs text-surface-400 mb-1">Email *</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs text-surface-400 mb-1">Phone</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs text-surface-400 mb-1">College/Org</label>
              <input type="text" value={formData.collegeName} onChange={e => setFormData({...formData, collegeName: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs text-surface-400 mb-1">Enrollment/ID No</label>
              <input type="text" value={formData.enrollmentNo} onChange={e => setFormData({...formData, enrollmentNo: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs text-surface-400 mb-1">Assign to Lab</label>
              <select value={formData.labId} onChange={e => setFormData({...formData, labId: e.target.value})} className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white">
                <option value="">-- No Lab yet --</option>
                {labs.map(lab => (
                  <option key={lab._id} value={lab._id}>{lab.name} (Cap: {lab.capacity})</option>
                ))}
              </select>
            </div>
            
            <div className="lg:col-span-3 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-surface-400 hover:text-white">Cancel</button>
              <button type="submit" disabled={submitting} className="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-500 text-white rounded-lg">Add Student</button>
            </div>
          </form>
        </div>
      )}

      {students.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-surface-700 rounded-xl text-surface-500 text-sm">
          No students enrolled in this batch yet.
        </div>
      ) : (
        <div className="bg-surface-800/30 border border-surface-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-800/50 text-surface-400 border-b border-surface-700/50">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">College</th>
                <th className="px-4 py-3 font-medium">Lab</th>
                {canManage && <th className="px-4 py-3 text-right font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/50">
              {students.map(student => (
                <tr key={student._id} className="hover:bg-surface-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{student.name}</td>
                  <td className="px-4 py-3 text-surface-300">{student.email}</td>
                  <td className="px-4 py-3 text-surface-400">{student.collegeName || '-'}</td>
                  <td className="px-4 py-3">
                    {student.labId ? (
                      <span className="text-xs bg-surface-700 text-surface-300 px-2 py-0.5 rounded">{student.labId.name}</span>
                    ) : (
                      <span className="text-xs text-surface-500 italic">Unassigned</span>
                    )}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleRemoveStudent(student._id)} className="text-red-400 hover:bg-red-500/10 p-1.5 rounded transition-colors" title="Remove">
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

export default StudentsTab;
