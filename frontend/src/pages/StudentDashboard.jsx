import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  Building, 
  MapPin, 
  DollarSign, 
  Clock, 
  FileText, 
  Search, 
  Filter, 
  Award, 
  UserCheck, 
  ExternalLink, 
  Sparkles, 
  Video, 
  Send,
  Check,
  X,
  ChevronRight,
  TrendingUp,
  BookmarkCheck,
  Edit3,
  Save
} from 'lucide-react';
import Navbar from '../components/Navbar';
import apiClient from '../api/apiClient';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEligibleOnly, setFilterEligibleOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyResumeUrl, setApplyResumeUrl] = useState('');
  const [applying, setApplying] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });

  // Profile Edit State
  const [editProfileForm, setEditProfileForm] = useState({
    fullName: '',
    phone: '',
    rollNumber: '',
    department: 'Computer Science',
    graduationYear: 2026,
    cgpa: 8.0,
    backlogCount: 0,
    skills: '',
    resumeUrl: '',
    githubUrl: '',
    linkedinUrl: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [profileRes, jobsRes, appsRes] = await Promise.all([
        apiClient.get('/student/profile'),
        apiClient.get('/student/jobs'),
        apiClient.get('/student/applications'),
      ]);

      setProfile(profileRes.data);
      setJobs(jobsRes.data);
      setApplications(appsRes.data);

      if (profileRes.data) {
        setEditProfileForm({
          fullName: profileRes.data.fullName || '',
          phone: profileRes.data.phone || '',
          rollNumber: profileRes.data.rollNumber || '',
          department: profileRes.data.department || 'Computer Science',
          graduationYear: profileRes.data.graduationYear || 2026,
          cgpa: profileRes.data.cgpa || 0,
          backlogCount: profileRes.data.backlogCount || 0,
          skills: (profileRes.data.skills || []).join(', '),
          resumeUrl: profileRes.data.resumeUrl || '',
          githubUrl: profileRes.data.githubUrl || '',
          linkedinUrl: profileRes.data.linkedinUrl || '',
        });
        setApplyResumeUrl(profileRes.data.resumeUrl || '');
      }
    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
      showToast('Failed to load portal data. Check connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text, type = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg({ text: '', type: '' }), 4000);
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    setApplying(true);
    try {
      const res = await apiClient.post(`/student/jobs/${selectedJob._id}/apply`, {
        resumeUrl: applyResumeUrl || profile?.resumeUrl || 'https://drive.google.com/sample-resume',
      });
      showToast('Application submitted successfully! 🚀', 'success');
      setApplyModalOpen(false);
      setSelectedJob(null);
      // Refresh jobs and applications
      fetchInitialData();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to submit application', 'error');
    } finally {
      setApplying(false);
    }
  };

  const handleRespondOffer = async (offerId, action) => {
    try {
      await apiClient.post(`/student/offers/${offerId}/respond`, { action });
      showToast(`Offer ${action.toLowerCase()} successfully! 🎓`, 'success');
      fetchInitialData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update offer', 'error');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await apiClient.put('/student/profile', editProfileForm);
      setProfile(res.data.student);
      showToast('Profile updated successfully! Real-time eligibility recalculated.', 'success');
      // Refetch jobs to update eligibility based on new CGPA/backlogs
      const jobsRes = await apiClient.get('/student/jobs');
      setJobs(jobsRes.data);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Filter jobs by search and eligibility
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEligible = filterEligibleOnly ? job.isEligible : true;
    return matchesSearch && matchesEligible;
  });

  // Calculate metrics
  const eligibleCount = jobs.filter((j) => j.isEligible).length;
  const activeApplications = applications.filter((a) => !['REJECTED'].includes(a.status));
  const scheduledInterviews = applications.filter((a) => a.interview && a.interview.status === 'SCHEDULED');
  const offersList = applications.filter((a) => a.offer);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar activeRole="STUDENT" user={profile} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading your Placement Portal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar activeRole="STUDENT" user={profile} />

      {/* Toast Alert */}
      {feedbackMsg.text && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all transform animate-in slide-in-from-bottom-5 ${
          feedbackMsg.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {feedbackMsg.type === 'error' ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <Check className="w-5 h-5 shrink-0" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Student Profile Quick Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-100 mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase">
                  Class of {profile?.graduationYear || 2026}
                </span>
                {profile?.isPlaced && (
                  <span className="px-3 py-1 bg-emerald-400 text-emerald-950 rounded-full text-xs font-bold tracking-wide flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> PLACED
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
                Welcome back, {profile?.fullName || 'Student'}! 👋
              </h1>
              <p className="text-indigo-100 text-sm mt-1 max-w-xl">
                Roll No: <span className="font-semibold text-white">{profile?.rollNumber}</span> • Branch: <span className="font-semibold text-white">{profile?.department}</span>
              </p>
            </div>

            {/* Quick Profile Stats Badges */}
            <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <div className="px-4 py-2 text-center border-r border-white/20">
                <div className="text-2xl font-black">{profile?.cgpa?.toFixed(2) || '0.00'}</div>
                <div className="text-[11px] text-indigo-100 uppercase tracking-wider font-semibold">Current CGPA</div>
              </div>
              <div className="px-4 py-2 text-center border-r border-white/20">
                <div className={`text-2xl font-black ${profile?.backlogCount > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                  {profile?.backlogCount ?? 0}
                </div>
                <div className="text-[11px] text-indigo-100 uppercase tracking-wider font-semibold">Active Backlogs</div>
              </div>
              <div className="px-4 py-2 text-center">
                <div className="text-2xl font-black text-white">{eligibleCount}</div>
                <div className="text-[11px] text-indigo-100 uppercase tracking-wider font-semibold">Eligible Openings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 mb-8 no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'jobs', label: `Browse Jobs (${jobs.length})`, icon: Briefcase },
            { id: 'applications', label: `My Applications (${applications.length})`, icon: BookmarkCheck },
            { id: 'offers', label: `Offers & Placements (${offersList.length})`, icon: Award },
            { id: 'profile', label: 'My Profile & Resume', icon: Edit3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Eligible Jobs</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">{eligibleCount}</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">Ready for application</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Applied</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">{applications.length}</p>
                  <p className="text-xs text-indigo-600 font-medium mt-1">Submissions active</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookmarkCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Interviews</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">{scheduledInterviews.length}</p>
                  <p className="text-xs text-amber-600 font-medium mt-1">Upcoming rounds</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Offers Received</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">{offersList.length}</p>
                  <p className="text-xs text-violet-600 font-medium mt-1">Official offers extended</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Upcoming Interview Spotlight Card */}
            {scheduledInterviews.length > 0 && (
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border-2 border-amber-300 rounded-3xl p-6 sm:p-7 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-200">
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full">
                          ACTION REQUIRED
                        </span>
                        <span className="text-xs text-slate-600 font-medium">
                          {new Date(scheduledInterviews[0].interview.scheduledAt).toLocaleDateString()} at{' '}
                          {new Date(scheduledInterviews[0].interview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">
                        Upcoming Interview: {scheduledInterviews[0].jobId?.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {scheduledInterviews[0].jobId?.companyId?.name} • Round: {scheduledInterviews[0].interview.roundName}
                      </p>
                    </div>
                  </div>

                  <a
                    href={scheduledInterviews[0].interview.meetingLinkOrVenue}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-sm shadow-md transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    Join Video Interview
                  </a>
                </div>
              </div>
            )}

            {/* Offers Spotlight if available */}
            {offersList.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-white border-2 border-emerald-300 rounded-3xl p-6 sm:p-7 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-200">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                          OFFER EXTENDED
                        </span>
                        <span className="text-xs text-slate-600 font-medium">Package: {offersList[0].offer.ctc}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">
                        {offersList[0].offer.designation} at {offersList[0].jobId?.companyId?.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Joining Date: {new Date(offersList[0].offer.joiningDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('offers')}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md transition-colors"
                  >
                    Review Offer & Letter <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick Action Hub */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200">
                <h3 className="font-extrabold text-slate-900 text-base mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" /> Recommended Job Openings
                </h3>
                <div className="space-y-3">
                  {jobs.slice(0, 3).map((job) => (
                    <div
                      key={job._id}
                      onClick={() => { setSelectedJob(job); setActiveTab('jobs'); }}
                      className="p-3.5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-sm text-slate-900">{job.title}</p>
                        <p className="text-xs text-slate-600">{job.companyId?.name} • {job.salaryOrStipend}</p>
                      </div>
                      {job.isEligible ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                          Eligible
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg border border-rose-200">
                          Ineligible
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200">
                <h3 className="font-extrabold text-slate-900 text-base mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" /> Recent Application Updates
                </h3>
                {applications.length === 0 ? (
                  <p className="text-xs text-slate-600 py-4 text-center">No applications submitted yet.</p>
                ) : (
                  <div className="space-y-3">
                    {applications.slice(0, 3).map((app) => (
                      <div key={app._id} className="p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm text-slate-900">{app.jobId?.title}</p>
                          <p className="text-xs text-slate-600">{app.jobId?.companyId?.name}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          app.status === 'OFFERED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          app.status === 'INTERVIEW_SCHEDULED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          app.status === 'SHORTLISTED' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          app.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BROWSE JOBS (WITH SMART ELIGIBILITY) */}
        {activeTab === 'jobs' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Search and Filters bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-12 text-slate-600" />
                <input
                  type="text"
                  placeholder="Search by job title, company, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Eligibility Filter Toggle */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => setFilterEligibleOnly(!filterEligibleOnly)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors cursor-pointer ${
                    filterEligibleOnly
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  {filterEligibleOnly ? 'Showing Eligible Only' : 'Filter: Eligible Only'}
                </button>
                <span className="text-xs text-slate-600 font-medium">
                  Showing {filteredJobs.length} of {jobs.length} jobs
                </span>
              </div>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-700 font-bold">No job openings found</p>
                  <p className="text-xs text-slate-600 mt-1">Try adjusting your search criteria or eligibility toggle.</p>
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-lg hover:border-indigo-200 transition-all duration-200"
                  >
                    <div>
                      {/* Company Header & Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                            {job.companyId?.name || 'Company'}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 mt-1 line-clamp-1">{job.title}</h3>
                        </div>
                        <span className={`px-2.5 py-1 text-[11px] font-extrabold rounded-full shrink-0 ${
                          job.roleType === 'INTERNSHIP' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {job.roleType}
                        </span>
                      </div>

                      {/* Package & Location */}
                      <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{job.salaryOrStipend}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-600" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-600" />
                          <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Eligibility Requirements Box */}
                      <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between text-slate-600">
                          <span>Min CGPA:</span>
                          <span className="font-bold text-slate-800">{job.minCgpa} (You: {profile?.cgpa})</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Max Backlogs:</span>
                          <span className="font-bold text-slate-800">{job.maxBacklogs} (You: {profile?.backlogCount})</span>
                        </div>
                      </div>

                      {/* Skills Tags */}
                      {job.skillsRequired && job.skillsRequired.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {job.skillsRequired.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Eligibility Status & Actions */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      {job.hasApplied ? (
                        <div className="w-full py-2.5 px-4 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                          Applied ({job.application?.status})
                        </div>
                      ) : job.isEligible ? (
                        <button
                          onClick={() => { setSelectedJob(job); setApplyModalOpen(true); }}
                          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Apply Now (Eligible)
                        </button>
                      ) : (
                        <div className="group relative">
                          <button
                            disabled
                            className="w-full py-2.5 px-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                            Ineligible to Apply
                          </button>
                          {/* Ineligibility Reason Tooltip */}
                          <div className="mt-2 text-[11px] text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-100 leading-tight">
                            {job.ineligibilityReasons[0] || 'Criteria mismatch'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MY APPLICATIONS (ATS TRACKER) */}
        {activeTab === 'applications' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Active Applications & Progress</h2>
            {applications.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
                <BookmarkCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-700 font-bold">No applications submitted yet</p>
                <p className="text-xs text-slate-600 mt-1">Explore available openings in the Browse Jobs tab and apply!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-extrabold uppercase text-indigo-600">
                          {app.jobId?.companyId?.name}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900">{app.jobId?.title}</h3>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Package: {app.jobId?.salaryOrStipend} • Applied on {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold self-start sm:self-auto ${
                        app.status === 'OFFERED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        app.status === 'INTERVIEW_SCHEDULED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        app.status === 'SHORTLISTED' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        app.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        Current Status: {app.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Stage Pipeline Indicator */}
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      {['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED'].map((stage, idx) => {
                        const stagesOrder = ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED'];
                        const currentIdx = stagesOrder.indexOf(app.status);
                        const isReached = currentIdx >= idx;
                        const isCurrent = app.status === stage;

                        return (
                          <div key={stage} className="text-center">
                            <div className={`h-2 rounded-full mb-1.5 transition-colors ${
                              isReached ? 'bg-indigo-600' : 'bg-slate-200'
                            }`} />
                            <span className={`text-[10px] font-bold block truncate ${
                              isCurrent ? 'text-indigo-600' : isReached ? 'text-slate-700' : 'text-slate-600'
                            }`}>
                              {stage.replace('_', ' ')}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Interview Details if Scheduled */}
                    {app.interview && (
                      <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-extrabold text-amber-900 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-amber-600" />
                            Interview Scheduled: {app.interview.roundName}
                          </p>
                          <p className="text-amber-800 mt-1">
                            Date: {new Date(app.interview.scheduledAt).toLocaleString()} ({app.interview.mode})
                          </p>
                          <p className="text-amber-700 mt-0.5">{app.interview.instructions}</p>
                        </div>
                        <a
                          href={app.interview.meetingLinkOrVenue}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 shrink-0"
                        >
                          <Video className="w-3.5 h-3.5" /> Meeting Link
                        </a>
                      </div>
                    )}

                    {/* Resume Used */}
                    {app.resumeUrl && (
                      <div className="text-xs text-slate-600 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-600" />
                        <span>Submitted Resume: </span>
                        <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold hover:underline flex items-center gap-1">
                          View Document <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: OFFERS & PLACEMENTS */}
        {activeTab === 'offers' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Official Placement Offers</h2>
            {offersList.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-700 font-bold">No offers extended yet</p>
                <p className="text-xs text-slate-600 mt-1">Once you clear interviews, recruiter offer letters will show up here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {offersList.map((app) => {
                  const offer = app.offer;
                  return (
                    <div key={offer._id} className="bg-white rounded-3xl border-2 border-emerald-300 p-6 sm:p-8 shadow-md">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold">
                            PLACEMENT OFFER LETTER
                          </span>
                          <h3 className="text-2xl font-black text-slate-900 mt-2">{offer.designation}</h3>
                          <p className="text-sm font-semibold text-indigo-600">{app.jobId?.companyId?.name}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-slate-600 font-semibold">Compensation (CTC)</p>
                          <p className="text-2xl font-black text-emerald-600">{offer.ctc}</p>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-600 block">Proposed Joining Date:</span>
                          <span className="font-bold text-slate-900">{new Date(offer.joiningDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-600 block">Official Offer Letter:</span>
                          <a href={offer.offerLetterUrl} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline flex items-center gap-1 mt-0.5">
                            Download / View PDF <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {/* Accept / Decline Actions */}
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                        <div className="text-xs">
                          Status:{' '}
                          <span className={`font-extrabold ${
                            offer.status === 'ACCEPTED' ? 'text-emerald-600' :
                            offer.status === 'DECLINED' ? 'text-rose-600' :
                            'text-amber-600'
                          }`}>
                            {offer.status}
                          </span>
                        </div>

                        {offer.status === 'OFFERED' ? (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleRespondOffer(offer._id, 'DECLINED')}
                              className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              Decline Offer
                            </button>
                            <button
                              onClick={() => handleRespondOffer(offer._id, 'ACCEPTED')}
                              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <Check className="w-4 h-4" /> Accept Offer
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600 font-medium">
                            Decision recorded: {offer.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PROFILE & RESUME */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-3xl mx-auto shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Student Academic Profile</h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Your CGPA and department determine your real-time eligibility for campus recruitments.
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editProfileForm.fullName}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Roll / Hall Ticket No</label>
                  <input
                    type="text"
                    required
                    value={editProfileForm.rollNumber}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, rollNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department / Branch</label>
                  <select
                    value={editProfileForm.department}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Comm">Electronics & Comm</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Electrical">Electrical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={editProfileForm.graduationYear}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, graduationYear: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Cumulative CGPA (0.0 - 10.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={editProfileForm.cgpa}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, cgpa: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Active Backlogs Count</label>
                  <input
                    type="number"
                    min="0"
                    value={editProfileForm.backlogCount}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, backlogCount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, Python, SQL, Docker..."
                  value={editProfileForm.skills}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, skills: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resume Document URL (Google Drive / Cloud)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/your-resume/view"
                  value={editProfileForm.resumeUrl}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, resumeUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Profile</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={editProfileForm.githubUrl}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, githubUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={editProfileForm.linkedinUrl}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, linkedinUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {savingProfile ? 'Saving Changes...' : 'Save Profile & Recalculate'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* 1-Click Application Modal */}
      {applyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-extrabold uppercase text-indigo-600">
                  {selectedJob.companyId?.name}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedJob.title}</h3>
              </div>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="p-1 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Eligibility Passed!
                </p>
                <p>Your CGPA ({profile?.cgpa}) meets the required {selectedJob.minCgpa}.</p>
                <p>Your Department ({profile?.department}) is eligible for this opportunity.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Resume Link for this Application
                </label>
                <input
                  type="url"
                  value={applyResumeUrl}
                  onChange={(e) => setApplyResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/your-resume-link"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-600 mt-1">Pre-filled with your saved profile resume.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setApplyModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {applying ? 'Submitting Application...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
