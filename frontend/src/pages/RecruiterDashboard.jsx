import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Briefcase, 
  Users, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  ExternalLink, 
  Video, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  MapPin, 
  ChevronRight,
  X,
  Send,
  AlertTriangle,
  Edit,
  Save,
  Check
} from 'lucide-react';
import Navbar from '../components/Navbar';
import apiClient from '../api/apiClient';

export default function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState('applicants');
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedJobFilter, setSelectedJobFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [newJobModalOpen, setNewJobModalOpen] = useState(false);
  const [scheduleInterviewModalOpen, setScheduleInterviewModalOpen] = useState(false);
  const [issueOfferModalOpen, setIssueOfferModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  // Forms
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    roleType: 'FULL_TIME',
    location: 'Hyderabad / Bangalore',
    salaryOrStipend: '',
    minCgpa: 7.0,
    maxBacklogs: 0,
    eligibleDepartments: ['Computer Science', 'Information Technology', 'Electronics & Comm'],
    skillsRequired: '',
    deadline: '',
  });

  const [interviewForm, setInterviewForm] = useState({
    roundName: 'Technical Architecture & Coding Round',
    scheduledAt: '',
    mode: 'ONLINE',
    meetingLinkOrVenue: 'https://meet.google.com/xyz-placement',
    instructions: 'Please be in a quiet room with webcam enabled.',
  });

  const [offerForm, setOfferForm] = useState({
    designation: '',
    ctc: '',
    joiningDate: '',
    offerLetterUrl: '',
  });

  const [companyForm, setCompanyForm] = useState({
    name: '',
    industry: '',
    location: '',
    website: '',
    description: '',
  });

  const [toast, setToast] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecruiterData();
  }, []);

  const fetchRecruiterData = async () => {
    setLoading(true);
    try {
      const [compRes, jobsRes, appsRes, intRes] = await Promise.all([
        apiClient.get('/recruiter/company'),
        apiClient.get('/recruiter/jobs'),
        apiClient.get('/recruiter/jobs/all/applicants'),
        apiClient.get('/recruiter/interviews'),
      ]);

      setCompany(compRes.data);
      setJobs(jobsRes.data);
      setApplicants(appsRes.data);
      setInterviews(intRes.data);

      if (compRes.data) {
        setCompanyForm({
          name: compRes.data.name || '',
          industry: compRes.data.industry || '',
          location: compRes.data.location || '',
          website: compRes.data.website || '',
          description: compRes.data.description || '',
        });
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load recruiter portal data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 4000);
  };

  // Create Job Handler
  const handleCreateJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/recruiter/jobs', {
        ...jobForm,
        skillsRequired: jobForm.skillsRequired.split(',').map(s => s.trim()).filter(Boolean),
      });
      showToast('Job opening posted successfully! 🚀');
      setNewJobModalOpen(false);
      fetchRecruiterData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to post job', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Update Status
  const handleUpdateStatus = async (applicationId, status) => {
    try {
      await apiClient.patch(`/recruiter/applications/${applicationId}/status`, { status });
      showToast(`Applicant status changed to ${status}`);
      fetchRecruiterData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update status', 'error');
    }
  };

  // Schedule Interview
  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedApplicant) return;
    setSubmitting(true);
    try {
      await apiClient.post('/recruiter/interviews', {
        applicationId: selectedApplicant._id,
        ...interviewForm,
      });
      showToast('Interview scheduled & student notified! 📅');
      setScheduleInterviewModalOpen(false);
      fetchRecruiterData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to schedule interview', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Issue Offer
  const handleIssueOffer = async (e) => {
    e.preventDefault();
    if (!selectedApplicant) return;
    setSubmitting(true);
    try {
      await apiClient.post('/recruiter/offers', {
        applicationId: selectedApplicant._id,
        ...offerForm,
      });
      showToast('Placement offer issued to candidate! 🌟');
      setIssueOfferModalOpen(false);
      fetchRecruiterData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to issue offer', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Save Company Profile
  const handleSaveCompany = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiClient.put('/recruiter/company', companyForm);
      setCompany(res.data.company);
      showToast('Company profile updated successfully!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update company', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Department checkbox toggle
  const toggleDept = (dept) => {
    const current = [...jobForm.eligibleDepartments];
    if (current.includes(dept)) {
      setJobForm({ ...jobForm, eligibleDepartments: current.filter(d => d !== dept) });
    } else {
      setJobForm({ ...jobForm, eligibleDepartments: [...current, dept] });
    }
  };

  // Filtered applicants
  const filteredApplicants = applicants.filter((app) => {
    const matchesJob = selectedJobFilter === 'all' || app.jobId?._id === selectedJobFilter;
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch =
      app.studentId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.studentId?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.studentId?.department?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesJob && matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar activeRole="RECRUITER" user={{ fullName: company?.name || 'Recruiter' }} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar activeRole="RECRUITER" user={{ fullName: company?.name || 'Recruiter' }} />

      {/* Toast */}
      {toast.text && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all ${
          toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          <span>{toast.text}</span>
        </div>
      )}

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Recruiter Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-amber-100 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
              Campus Recruitment Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
              {company?.name || 'Recruiter Organization'}
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm mt-1">
              Industry: {company?.industry} • Location: {company?.location}
            </p>
          </div>

          <button
            onClick={() => setNewJobModalOpen(true)}
            className="px-6 py-3.5 bg-white text-amber-800 hover:bg-amber-50 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-5 h-5 text-amber-700" />
            Post New Opportunity
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 mb-8 no-scrollbar">
          {[
            { id: 'applicants', label: `Applicant Tracking (${applicants.length})`, icon: Users },
            { id: 'jobs', label: `My Posted Jobs (${jobs.length})`, icon: Briefcase },
            { id: 'interviews', label: `Interviews (${interviews.length})`, icon: Calendar },
            { id: 'company', label: 'Company Profile', icon: Building },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: APPLICANT TRACKING SYSTEM (ATS) */}
        {activeTab === 'applicants' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Filters */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-12 text-slate-600" />
                <input
                  type="text"
                  placeholder="Search student by name, roll, branch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <select
                  value={selectedJobFilter}
                  onChange={(e) => setSelectedJobFilter(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All Jobs</option>
                  {jobs.map((j) => (
                    <option key={j._id} value={j._id}>{j.title}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="APPLIED">Applied</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                  <option value="OFFERED">Offered</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            {/* Applicants Table / List */}
            {filteredApplicants.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-700 font-bold">No candidates found</p>
                <p className="text-xs text-slate-600 mt-1">Candidates matching your criteria will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplicants.map((app) => (
                  <div key={app._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-amber-200 transition-colors">
                    {/* Candidate Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-slate-900">{app.studentId?.fullName || 'Student'}</h3>
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                          Roll: {app.studentId?.rollNumber}
                        </span>
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                          app.status === 'OFFERED' ? 'bg-emerald-100 text-emerald-800' :
                          app.status === 'INTERVIEW_SCHEDULED' ? 'bg-amber-100 text-amber-800' :
                          app.status === 'SHORTLISTED' ? 'bg-indigo-100 text-indigo-800' :
                          app.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                        <span>Job: <strong className="text-slate-900">{app.jobId?.title}</strong></span>
                        <span>Branch: <strong className="text-slate-900">{app.studentId?.department}</strong></span>
                        <span>CGPA: <strong className="text-indigo-600">{app.studentId?.cgpa}</strong></span>
                        <span>Backlogs: <strong className={app.studentId?.backlogCount > 0 ? 'text-amber-600' : 'text-emerald-600'}>{app.studentId?.backlogCount}</strong></span>
                      </div>

                      {/* Resume Link */}
                      {app.resumeUrl && (
                        <div className="pt-1">
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            View Candidate Resume <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto justify-end">
                      {/* Shortlist button */}
                      {app.status !== 'SHORTLISTED' && app.status !== 'OFFERED' && (
                        <button
                          onClick={() => handleUpdateStatus(app._id, 'SHORTLISTED')}
                          className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Shortlist
                        </button>
                      )}

                      {/* Schedule Interview */}
                      <button
                        onClick={() => { setSelectedApplicant(app); setScheduleInterviewModalOpen(true); }}
                        className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5 text-amber-600" />
                        {app.interview ? 'Reschedule Interview' : 'Schedule Interview'}
                      </button>

                      {/* Issue Offer */}
                      <button
                        onClick={() => { setSelectedApplicant(app); setIssueOfferModalOpen(true); }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        Issue Offer Letter
                      </button>

                      {/* Reject */}
                      {app.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleUpdateStatus(app._id, 'REJECTED')}
                          className="px-3 py-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY POSTED JOBS */}
        {activeTab === 'jobs' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Active Recruitment Openings</h2>
              <button
                onClick={() => setNewJobModalOpen(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Opening
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div key={job._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-extrabold uppercase text-amber-700">{job.roleType}</span>
                        <h3 className="text-lg font-bold text-slate-900 mt-0.5">{job.title}</h3>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                        {job.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">Compensation: {job.salaryOrStipend}</p>
                      <p>Location: {job.location}</p>
                      <p>Eligibility: Min CGPA {job.minCgpa} • Max Backlogs: {job.maxBacklogs}</p>
                      <p>Eligible Branches: {job.eligibleDepartments?.join(', ')}</p>
                      <p>Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                    </div>

                    {/* Applicant Count Badges */}
                    <div className="mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-around text-center text-xs">
                      <div>
                        <div className="font-extrabold text-slate-900 text-base">{job.stats?.totalApplicants ?? 0}</div>
                        <div className="text-[10px] text-slate-600 uppercase font-semibold">Total Applied</div>
                      </div>
                      <div>
                        <div className="font-extrabold text-indigo-600 text-base">{job.stats?.shortlisted ?? 0}</div>
                        <div className="text-[10px] text-slate-600 uppercase font-semibold">Shortlisted</div>
                      </div>
                      <div>
                        <div className="font-extrabold text-amber-600 text-base">{job.stats?.interviews ?? 0}</div>
                        <div className="text-[10px] text-slate-600 uppercase font-semibold">Interviews</div>
                      </div>
                      <div>
                        <div className="font-extrabold text-emerald-600 text-base">{job.stats?.offered ?? 0}</div>
                        <div className="text-[10px] text-slate-600 uppercase font-semibold">Offered</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => { setSelectedJobFilter(job._id); setActiveTab('applicants'); }}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                    >
                      View All Candidates <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SCHEDULED INTERVIEWS */}
        {activeTab === 'interviews' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Scheduled Candidate Interviews</h2>
            {interviews.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-700 font-bold">No interviews scheduled yet</p>
                <p className="text-xs text-slate-600 mt-1">Schedule rounds with applicants directly from the Applicant Tracking tab.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {interviews.map((item) => (
                  <div key={item._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[11px] font-bold">
                        {item.roundName}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5">{item.studentId?.fullName}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Job: {item.jobId?.title} • Candidate Branch: {item.studentId?.department} (CGPA: {item.studentId?.cgpa})
                      </p>
                      <p className="text-xs text-amber-900 font-semibold mt-1">
                        Scheduled for: {new Date(item.scheduledAt).toLocaleString()} ({item.mode})
                      </p>
                    </div>

                    <a
                      href={item.meetingLinkOrVenue}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                    >
                      <Video className="w-4 h-4" /> Start Interview Meet
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: COMPANY PROFILE */}
        {activeTab === 'company' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl mx-auto shadow-xs animate-in fade-in duration-200">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-6">Company Profile & Info</h2>
            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Industry Sector</label>
                <input
                  type="text"
                  value={companyForm.industry}
                  onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">HQ / Office Location</label>
                <input
                  type="text"
                  value={companyForm.location}
                  onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Website URL</label>
                <input
                  type="url"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">About Company</label>
                <textarea
                  rows="3"
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Profile
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* MODAL: POST NEW JOB */}
      {newJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Post New Campus Recruitment Opening</h3>
              <button onClick={() => setNewJobModalOpen(false)} className="p-1 rounded-xl text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Job / Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Engineer, Cloud Intern"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role Type</label>
                  <select
                    value={jobForm.roleType}
                    onChange={(e) => setJobForm({ ...jobForm, roleType: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Salary / Stipend *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹14,00,000 PA or ₹40,000/mo"
                    value={jobForm.salaryOrStipend}
                    onChange={(e) => setJobForm({ ...jobForm, salaryOrStipend: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Minimum CGPA Required</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={jobForm.minCgpa}
                    onChange={(e) => setJobForm({ ...jobForm, minCgpa: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Allowed Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    value={jobForm.maxBacklogs}
                    onChange={(e) => setJobForm({ ...jobForm, maxBacklogs: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Eligible Branches Checkboxes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Eligible Branches / Departments</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Computer Science', 'Information Technology', 'Electronics & Comm', 'Mechanical', 'Civil', 'Electrical'].map((dept) => (
                    <button
                      type="button"
                      key={dept}
                      onClick={() => toggleDept(dept)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border ${
                        jobForm.eligibleDepartments.includes(dept)
                          ? 'bg-amber-100 border-amber-300 text-amber-900'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Application Deadline *</label>
                  <input
                    type="date"
                    required
                    value={jobForm.deadline}
                    onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Job Description *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Outline responsibilities, qualifications, and role summary..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Skills Required (comma separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, Python, System Design"
                  value={jobForm.skillsRequired}
                  onChange={(e) => setJobForm({ ...jobForm, skillsRequired: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewJobModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Publish Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE INTERVIEW */}
      {scheduleInterviewModalOpen && selectedApplicant && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Schedule Interview</h3>
                <p className="text-xs text-slate-600">Candidate: {selectedApplicant.studentId?.fullName}</p>
              </div>
              <button onClick={() => setScheduleInterviewModalOpen(false)} className="p-1 rounded-xl text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Interview Round Name</label>
                <input
                  type="text"
                  required
                  value={interviewForm.roundName}
                  onChange={(e) => setInterviewForm({ ...interviewForm, roundName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Interview Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={interviewForm.scheduledAt}
                  onChange={(e) => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Video Call Link (Google Meet / Zoom)</label>
                <input
                  type="url"
                  required
                  value={interviewForm.meetingLinkOrVenue}
                  onChange={(e) => setInterviewForm({ ...interviewForm, meetingLinkOrVenue: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Candidate Instructions</label>
                <textarea
                  rows="2"
                  value={interviewForm.instructions}
                  onChange={(e) => setInterviewForm({ ...interviewForm, instructions: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setScheduleInterviewModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Send Interview Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE OFFER */}
      {issueOfferModalOpen && selectedApplicant && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Issue Placement Offer Letter</h3>
                <p className="text-xs text-slate-600">Candidate: {selectedApplicant.studentId?.fullName}</p>
              </div>
              <button onClick={() => setIssueOfferModalOpen(false)} className="p-1 rounded-xl text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueOffer} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Designation Offered *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Associate Software Engineer"
                  value={offerForm.designation}
                  onChange={(e) => setOfferForm({ ...offerForm, designation: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">CTC Compensation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ₹18,50,000 PA"
                  value={offerForm.ctc}
                  onChange={(e) => setOfferForm({ ...offerForm, ctc: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Proposed Joining Date *</label>
                <input
                  type="date"
                  required
                  value={offerForm.joiningDate}
                  onChange={(e) => setOfferForm({ ...offerForm, joiningDate: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Offer Document URL (PDF Link)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/sample-offer-letter"
                  value={offerForm.offerLetterUrl}
                  onChange={(e) => setOfferForm({ ...offerForm, offerLetterUrl: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIssueOfferModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Release Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
