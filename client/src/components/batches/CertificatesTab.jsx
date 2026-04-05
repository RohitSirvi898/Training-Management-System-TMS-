import { useState, useEffect } from 'react';
import examService from '../../services/examService';
import resourceService from '../../services/resourceService';
import toast from 'react-hot-toast';
import { HiOutlineBadgeCheck, HiOutlineExternalLink } from 'react-icons/hi';
import { format } from 'date-fns';

const CertificatesTab = ({ batchId, canManage }) => {
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  
  const [formData, setFormData] = useState({ studentId: '', voucherCode: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [certRes, studentsRes] = await Promise.all([
        examService.getCertificates(batchId),
        canManage ? resourceService.getStudents(batchId) : Promise.resolve({ data: { data: { students: [] } } })
      ]);
      setCertificates(certRes.data.data.certificates);
      if (canManage) {
        setStudents(studentsRes.data.data.students);
      }
    } catch (error) {
      toast.error('Failed to load certificates data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [batchId]);

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssigning(true);
    try {
      await examService.assignCertificate(batchId, formData);
      toast.success('Certificate voucher assigned');
      setFormData({ studentId: '', voucherCode: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign voucher');
    } finally {
      setAssigning(false);
    }
  };

  const handleRedeem = async (certId) => {
    if (!window.confirm('Mark this voucher as redeemed/used by the student?')) return;
    try {
      await examService.redeemCertificate(batchId, certId);
      toast.success('Voucher marked as redeemed');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Compute eligible students (those who haven't received a voucher yet)
  const eligibleStudents = students.filter(s => 
    !certificates.some(c => c.studentId?._id === s._id)
  );

  if (loading) return <div className="text-center p-8 animate-pulse text-surface-400">Loading certificate records...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-surface-700/50 pb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <HiOutlineBadgeCheck className="text-amber-400" /> Certificate Vouchers
        </h3>
      </div>

      {canManage && (
        <div className="bg-surface-800/80 border border-surface-700/50 p-5 rounded-xl">
          <h4 className="text-sm font-semibold text-white mb-4">Assign New Voucher</h4>
          <form onSubmit={handleAssign} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs text-surface-400 mb-1">Select Student *</label>
              <select 
                required 
                value={formData.studentId} 
                onChange={e => setFormData({...formData, studentId: e.target.value})} 
                className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white outline-none"
              >
                <option value="">-- Choose Student --</option>
                {eligibleStudents.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.enrollmentNo})</option>
                ))}
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs text-surface-400 mb-1">Voucher Code *</label>
              <input 
                required 
                type="text" 
                placeholder="e.g. AZ-900-XXXX"
                value={formData.voucherCode} 
                onChange={e => setFormData({...formData, voucherCode: e.target.value})} 
                className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white outline-none uppercase" 
              />
            </div>
            <button 
              type="submit" 
              disabled={assigning || !formData.studentId || !formData.voucherCode} 
              className="px-6 py-2 text-sm bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
            >
              Issue Voucher
            </button>
          </form>
          {eligibleStudents.length === 0 && students.length > 0 && (
            <p className="text-xs text-emerald-400 mt-3">All students in this batch have been assigned vouchers!</p>
          )}
        </div>
      )}

      {certificates.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-surface-700 rounded-xl text-surface-500 text-sm">
          No vouchers have been issued yet.
        </div>
      ) : (
        <div className="bg-surface-800/30 border border-surface-700/50 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-800/50 text-surface-400 border-b border-surface-700/50">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Voucher Code</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Issue Date</th>
                <th className="px-4 py-3 font-medium">Assigned By</th>
                {canManage && <th className="px-4 py-3 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/50">
              {certificates.map(cert => (
                <tr key={cert._id} className="hover:bg-surface-800/30 transition-colors">
                  <td className="px-4 py-3 text-white">
                    <div className="font-medium">{cert.studentId?.name}</div>
                    <div className="text-xs text-surface-400">{cert.studentId?.email}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-amber-400 tracking-wide">
                    {cert.voucherCode}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block ${
                      cert.status === 'redeemed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {cert.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-surface-300">
                    {format(new Date(cert.assignedDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-surface-400 text-xs">
                    {cert.assignedBy?.name || 'Admin'}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      {cert.status !== 'redeemed' && (
                        <button 
                          onClick={() => handleRedeem(cert._id)} 
                          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 justify-end w-full"
                        >
                          Mark Redeemed <HiOutlineExternalLink />
                        </button>
                      )}
                      {cert.status === 'redeemed' && (
                        <span className="text-xs text-surface-500">
                          {cert.redeemedDate ? format(new Date(cert.redeemedDate), 'MMM dd, yyyy') : 'Redeemed'}
                        </span>
                      )}
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

export default CertificatesTab;
