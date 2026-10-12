import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Building, 
  Briefcase, 
  Award, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  BarChart3, 
  Search, 
  Clock, 
  Filter, 
  Check, 
  X,
  FileText,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Navbar from '../components/Navbar';
import apiClient from '../api/apiClient';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, compRes, jobsRes, studRes, appsRes] = await Promise.all([
        apiClient.get('/admin/dashboard-stats'),
        apiClient.get('/admin/companies'),
        apiClient.get('/admin/jobs'),
        apiClient.get('/admin/students'),
        apiClient.get('/admin/applications'),
      ]);

      setStats(statsRes.data);
      setCompanies(compRes.data);
      setJobs(jobsRes.data);
      setStudents(studRes.data);
      setApplications(appsRes.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load admin placement analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 4000);
  };

  const handleUpdateCompanyStatus = async (companyId, status) => {
    try {
      await apiClient.patch(`/admin/companies/${companyId}/status`, { status });
      showToast(`Company status updated to ${status}`);
      fetchAdminData();
    } catch (err) {
      showToast('Failed to update company status', 'error');
    }
  };

  const handleUpdateJobStatus = async (jobId, status) => {
    try {
      await apiClient.patch(`/admin/jobs/${jobId}/status`, { status });
      showToast(`Job opening status updated to ${status}`);
      fetchAdminData();
    } catch (err) {
      showToast('Failed to update job status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar activeRole="ADMIN" user={{ fullName: 'Placement Director' }} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const metrics = stats?.metrics || {};

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar activeRole="ADMIN" user={{ fullName: 'Placement Cell Officer' }} />

      {/* Toast */}
      {toast.text && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all ${
          toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          <span>{toast.text}</span>
        </div>
      )}

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Admin Header Banner */}
        <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-100 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
              Administration & Analytics
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
              University Placement Cell & Operations
            </h1>
            <p className="text-purple-200 text-xs sm:text-sm mt-1">
              Real-time monitoring, company authorizations, and campus drive reports.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
            <div>
              <p className="text-[11px] text-purple-200 uppercase font-semibold">Overall Placement Rate</p>
              <p className="text-3xl font-black text-emerald-400">{metrics.placementPercentage || 0}%</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 mb-8 no-scrollbar">
          {[
            { id: 'analytics', label: 'Placement Analytics', icon: BarChart3 },
            { id: 'companies', label: `Company Approvals (${companies.length})`, icon: Building },
            { id: 'jobs', label: `Job Approvals (${jobs.length})`, icon: Briefcase },
            { id: 'students', label: `Student Directory (${students.length})`, icon: Users },
            { id: 'ledger', label: `Placement Ledger (${applications.length})`, icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-purple-700 text-white shadow-md shadow-purple-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: PLACEMENT ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <p className="text-xs font-semibold text-slate-600 uppercase">Registered Students</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{metrics.totalStudents || 0}</p>
                <p className="text-xs text-purple-600 font-semibold mt-1">Across all departments</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <p className="text-xs font-semibold text-slate-600 uppercase">Students Placed</p>
                <p className="text-3xl font-black text-emerald-600 mt-1">{metrics.placedStudents || 0}</p>
                <p className="text-xs text-emerald-600 font-semibold mt-1">{metrics.placementPercentage || 0}% Placement Rate</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <p className="text-xs font-semibold text-slate-600 uppercase">Recruiting Companies</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{metrics.totalCompanies || 0}</p>
                <p className="text-xs text-amber-600 font-semibold mt-1">{metrics.pendingCompanies || 0} Pending Approvals</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <p className="text-xs font-semibold text-slate-600 uppercase">Total Offers Issued</p>
                <p className="text-3xl font-black text-indigo-600 mt-1">{metrics.totalOffers || 0}</p>
                <p className="text-xs text-indigo-600 font-semibold mt-1">From active recruitment drives</p>
              </div>
            </div>

            {/* Department Placements Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  Branch-wise Placement Performance
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.departmentStats || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="department" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" name="Total Candidates" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="placed" name="Placed" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recruitment Pipeline Distribution */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  Candidate Pipeline Distribution
                </h3>
                <div className="space-y-4 pt-2">
                  {(stats?.funnelData || []).map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>{item.name}</span>
                        <span>{item.value} Candidates</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${metrics.totalApplications > 0 ? (item.value / metrics.totalApplications) * 100 : 0}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPANY APPROVALS */}
        {activeTab === 'companies' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Registered Companies & Approvals</h2>
            <div className="space-y-4">
              {companies.map((comp) => (
                <div key={comp._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{comp.name}</h3>
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        comp.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        comp.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {comp.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Industry: {comp.industry} • Location: {comp.location} • Recruiter: {comp.recruiterId?.email}
                    </p>
                    {comp.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{comp.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {comp.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateCompanyStatus(comp._id, 'APPROVED')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                    )}
                    {comp.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleUpdateCompanyStatus(comp._id, 'REJECTED')}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: JOB APPROVALS */}
        {activeTab === 'jobs' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Recruitment Drives & Openings</h2>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                      <span className="text-xs font-bold text-purple-700">{job.companyId?.name}</span>
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        job.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        job.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Role: {job.roleType} • CTC: {job.salaryOrStipend} • Min CGPA: {job.minCgpa} • Max Backlogs: {job.maxBacklogs}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {job.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateJobStatus(job._id, 'APPROVED')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> Approve Drive
                      </button>
                    )}
                    {job.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleUpdateJobStatus(job._id, 'REJECTED')}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-4 h-4" /> Reject Drive
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: STUDENT MASTER DIRECTORY */}
        {activeTab === 'students' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Student Candidate Directory</h2>
              <div className="relative w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-12 text-slate-600" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold">
                  <tr>
                    <th className="px-6 py-3.5">Candidate</th>
                    <th className="px-6 py-3.5">Roll No</th>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">CGPA</th>
                    <th className="px-6 py-3.5">Backlogs</th>
                    <th className="px-6 py-3.5">Placement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students
                    .filter(s => s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-bold text-slate-900">{s.fullName}</td>
                        <td className="px-6 py-4 text-slate-600 font-semibold">{s.rollNumber}</td>
                        <td className="px-6 py-4 text-slate-600">{s.department}</td>
                        <td className="px-6 py-4 font-bold text-indigo-700">{s.cgpa}</td>
                        <td className="px-6 py-4">
                          <span className={s.backlogCount > 0 ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                            {s.backlogCount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {s.isPlaced ? (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                              PLACED
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-semibold rounded-full">
                              In Process
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: PLACEMENT LEDGER */}
        {activeTab === 'ledger' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">University Placement Ledger</h2>
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app._id} className="bg-white rounded-2xl border border-slate-200 p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{app.studentId?.fullName}</span>{' '}
                    <span className="text-slate-600">({app.studentId?.department}, CGPA: {app.studentId?.cgpa})</span>{' '}
                    <span className="text-slate-600">applied to</span>{' '}
                    <strong className="text-purple-700">{app.jobId?.title}</strong>{' '}
                    <span className="text-slate-600">at {app.jobId?.companyId?.name}</span>
                  </div>
                  <span className={`px-2.5 py-1 font-bold rounded-lg shrink-0 ${
                    app.status === 'OFFERED' ? 'bg-emerald-100 text-emerald-800' :
                    app.status === 'INTERVIEW_SCHEDULED' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
