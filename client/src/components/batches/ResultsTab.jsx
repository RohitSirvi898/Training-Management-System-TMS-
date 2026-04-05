import { useState, useEffect } from 'react';
import examService from '../../services/examService';
import toast from 'react-hot-toast';
import { HiOutlineChartBar } from 'react-icons/hi';

const ResultsTab = ({ batchId, canManage, isTrainer }) => {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [examResults, setExamResults] = useState([]); // from API
  const [marksState, setMarksState] = useState({}); // Input states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch only exams first
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data } = await examService.getExams(batchId);
        const fetchedExams = data.data.exams;
        setExams(fetchedExams);
        if (fetchedExams.length > 0) {
          setSelectedExamId(fetchedExams[0]._id);
        }
      } catch (error) {
        toast.error('Failed to load exams list');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [batchId]);

  // Fetch results when selectedExam changes
  useEffect(() => {
    if (!selectedExamId) return;

    const fetchResults = async () => {
      try {
        const { data } = await examService.getResults(batchId, selectedExamId);
        const results = data.data.results;
        setExamResults(results);

        const initialState = {};
        const exam = exams.find(e => e._id === selectedExamId);
        
        // Populate state using assignedStudents first (so we see everyone)
        if (exam && exam.assignedStudents) {
          exam.assignedStudents.forEach(studentObj => {
            const sId = studentObj._id;
            const existingResult = results.find(r => r.studentId._id === sId);
            
            initialState[sId] = {
              _studentData: studentObj, // We inject this for UI rendering if NO result exists
              marksObtained: existingResult ? existingResult.marksObtained : '',
              remarks: existingResult ? (existingResult.remarks || '') : '',
              status: existingResult ? existingResult.status : 'N/A'
            };
          });
        }
        
        setMarksState(initialState);
      } catch (error) {
        toast.error('Failed to load exam results');
      }
    };

    fetchResults();
  }, [selectedExamId, batchId, exams]);

  const handleSaveResults = async () => {
    // Collect all valid inputs
    const records = Object.keys(marksState)
      .filter(studentId => marksState[studentId].marksObtained !== '')
      .map(studentId => ({
        studentId,
        marksObtained: Number(marksState[studentId].marksObtained),
        remarks: marksState[studentId].remarks
      }));

    if (records.length === 0) {
      toast.error('No marks entered to save.');
      return;
    }

    setSubmitting(true);
    try {
      await examService.saveResults(batchId, selectedExamId, { records });
      toast.success('Results saved successfully. Pass/Fail calculated auto-magically.');
      
      // Refresh
      const { data } = await examService.getResults(batchId, selectedExamId);
      setExamResults(data.data.results);
    } catch (error) {
      toast.error('Failed to save results.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedExamObj = exams.find(e => e._id === selectedExamId);
  const allowEdit = canManage || isTrainer;

  if (loading) return <div className="text-center p-8 animate-pulse text-surface-400">Loading results...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-surface-700/50 pb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 shrink-0">
          <HiOutlineChartBar className="text-primary-400" /> Exam Results
        </h3>
        
        {exams.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-surface-400">Select Exam:</span>
            <select 
              value={selectedExamId} 
              onChange={e => setSelectedExamId(e.target.value)}
              className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-1.5 text-sm text-white outline-none"
            >
              {exams.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
            </select>
          </div>
        )}
      </div>

      {exams.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-surface-700 rounded-xl text-surface-500 text-sm">
          No exams available to grade.
        </div>
      ) : !selectedExamId ? null : (
        <>
          <div className="flex gap-6 mb-4">
            <div className="text-sm bg-surface-800/80 px-4 py-2 rounded-lg border border-surface-700">
              <span className="text-surface-400">Total Marks:</span> <span className="font-bold text-white ml-2">{selectedExamObj?.totalMarks}</span>
            </div>
            <div className="text-sm bg-surface-800/80 px-4 py-2 rounded-lg border border-surface-700">
              <span className="text-surface-400">Passing Marks:</span> <span className="font-bold text-emerald-400 ml-2">{selectedExamObj?.passingMarks}</span>
            </div>
          </div>

          <div className="bg-surface-800/30 border border-surface-700/50 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-800/50 text-surface-400 border-b border-surface-700/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Marks Obtained</th>
                  <th className="px-4 py-3 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {Object.keys(marksState).map((sId) => {
                  const stateRecord = marksState[sId];
                  const student = stateRecord._studentData;
                  if (!student) return null;

                  return (
                    <tr key={sId} className="hover:bg-surface-800/30 transition-colors">
                      <td className="px-4 py-3 text-white">
                        <div className="font-medium">{student.name}</div>
                        <div className="text-xs text-surface-400">{student.enrollmentNo}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block ${
                          stateRecord.status === 'pass' ? 'bg-emerald-500/20 text-emerald-400' : 
                          stateRecord.status === 'fail' ? 'bg-red-500/20 text-red-400' : 'bg-surface-600/20 text-surface-400'
                        }`}>
                          {stateRecord.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          disabled={!allowEdit}
                          type="number" 
                          min="0"
                          max={selectedExamObj?.totalMarks}
                          value={stateRecord.marksObtained ?? ''}
                          onChange={(e) => setMarksState(prev => ({
                            ...prev, [sId]: { ...prev[sId], marksObtained: e.target.value }
                          }))}
                          className="w-24 bg-surface-900 border border-surface-700 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-primary-500 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-4 py-3 w-1/3 min-w-[200px]">
                        <input 
                          disabled={!allowEdit}
                          type="text" 
                          maxLength={500}
                          placeholder="Add remarks..."
                          value={stateRecord.remarks || ''}
                          onChange={(e) => setMarksState(prev => ({
                            ...prev, [sId]: { ...prev[sId], remarks: e.target.value }
                          }))}
                          className="w-full bg-transparent border-none text-surface-300 text-xs placeholder-surface-600 focus:ring-0 px-2 disabled:opacity-50"
                        />
                      </td>
                    </tr>
                  )
                })}

                {/* If there are no students assigned to this exam */}
                {Object.keys(marksState).length === 0 && (
                   <tr>
                     <td colSpan="4" className="px-4 py-8 text-center text-surface-500">
                        No students were assigned to this exam.
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>

          {allowEdit && examResults.length > 0 && (
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSaveResults}
                disabled={submitting}
                className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-lg text-sm transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Updates'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResultsTab;
