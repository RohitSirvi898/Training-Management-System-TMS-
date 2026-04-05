import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import batchService from '../services/batchService';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineLibrary, HiOutlineUsers, HiOutlineDesktopComputer } from 'react-icons/hi';

import LabsTab from '../components/batches/LabsTab';
import TrainersTab from '../components/batches/TrainersTab';
import StudentsTab from '../components/batches/StudentsTab';
import HolidaysTab from '../components/batches/HolidaysTab';
import TrainerAttendanceTab from '../components/batches/TrainerAttendanceTab';
import StudentAttendanceTab from '../components/batches/StudentAttendanceTab';
import ExamsTab from '../components/batches/ExamsTab';
import ResultsTab from '../components/batches/ResultsTab';
import CertificatesTab from '../components/batches/CertificatesTab';

const BatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('labs');

  useEffect(() => {
    const fetchBatchDetails = async () => {
      try {
        const { data } = await batchService.getBatchById(id);
        setBatch(data.data.batch);
      } catch (error) {
        toast.error('Failed to load batch details');
        navigate('/batches');
      } finally {
        setLoading(false);
      }
    };
    fetchBatchDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <svg className="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!batch) return null;

  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const isTrainer = currentUser?.role === 'trainer';

  const tabs = [
    { id: 'labs', label: 'Labs', icon: HiOutlineDesktopComputer },
    { id: 'trainers', label: 'Trainers', icon: HiOutlineLibrary },
    { id: 'students', label: 'Students', icon: HiOutlineUsers },
    { id: 'student-attd', label: 'Student Attd.', icon: HiOutlineUsers },
    { id: 'trainer-attd', label: 'Trainer Attd.', icon: HiOutlineLibrary },
    { id: 'holidays', label: 'Holidays', icon: HiOutlineDesktopComputer },
    { id: 'exams', label: 'Exams', icon: HiOutlineDesktopComputer },
    { id: 'results', label: 'Results', icon: HiOutlineDesktopComputer },
    { id: 'certificates', label: 'Certificates', icon: HiOutlineDesktopComputer },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto text-surface-200">
      {/* Header */}
      <button 
        onClick={() => navigate('/batches')}
        className="flex items-center gap-2 text-sm text-surface-400 hover:text-white mb-6 transition-colors"
      >
        <HiOutlineArrowLeft /> Back to Batches
      </button>

      <div className="bg-surface-900 border border-surface-700/50 rounded-xl p-6 mb-8 shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{batch.name}</h1>
            <p className="text-surface-400 text-sm mb-4">{batch.description || 'No description provided'}</p>
            <div className="flex gap-4 text-sm">
              <span className="text-surface-300"><strong className="text-white">Tech:</strong> {batch.technology}</span>
              <span className="text-surface-300"><strong className="text-white">Capacity:</strong> {batch.maxStudents} Students</span>
              <span className="text-surface-300 uppercase"><strong className="text-white">Status:</strong> <span className="text-primary-400 font-medium">{batch.status}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-surface-700 mb-6 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => {
          // Hide Trainer attendance and Holidays from non-managers
          if ((tab.id === 'trainer-attd' || tab.id === 'holidays') && !canManage) return null;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id 
                  ? 'text-primary-400 border-primary-400 bg-primary-500/5' 
                  : 'text-surface-400 border-transparent hover:text-white hover:border-surface-600'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-surface-900/40 border border-surface-700/50 rounded-xl p-6 shadow-xl min-h-[400px]">
        {activeTab === 'labs' && <LabsTab batchId={batch._id} canManage={canManage} />}
        {activeTab === 'trainers' && <TrainersTab batchId={batch._id} canManage={canManage} />}
        {activeTab === 'students' && <StudentsTab batchId={batch._id} canManage={canManage} />}
        {activeTab === 'holidays' && <HolidaysTab batchId={batch._id} canManage={canManage} />}
        {activeTab === 'trainer-attd' && <TrainerAttendanceTab batchId={batch._id} canManage={canManage} />}
        {activeTab === 'student-attd' && <StudentAttendanceTab batchId={batch._id} canManage={canManage} isTrainer={isTrainer} />}
        {activeTab === 'exams' && <ExamsTab batchId={batch._id} canManage={canManage} />}
        {activeTab === 'results' && <ResultsTab batchId={batch._id} canManage={canManage} isTrainer={isTrainer} />}
        {activeTab === 'certificates' && <CertificatesTab batchId={batch._id} canManage={canManage} />}
      </div>
    </div>
  );
};

export default BatchDetails;
