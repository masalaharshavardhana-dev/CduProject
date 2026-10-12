import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  Briefcase, 
  GraduationCap, 
  Building2, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  Shield, 
  Award, 
  CheckCircle2, 
  Users, 
  ArrowRight, 
  Sparkles 
} from 'lucide-react';

function Home() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token && role) {
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'RECRUITER') return <Navigate to="/recruiter/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 px-6 sm:px-10 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-100">
            C
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">Campus<span className="text-indigo-600">Connect</span></span>
            <span className="text-[10px] block font-semibold text-slate-500 tracking-wider uppercase -mt-1">CDU Placement Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <Link to="/login/student" className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
            Student Portal
          </Link>
          <Link to="/login/recruiter" className="px-4 py-2 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors">
            Recruiter Portal
          </Link>
          <Link to="/login/student" className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
            Placement Cell
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 sm:py-24 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-6 border border-indigo-100 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          Next-Gen Internship & Placement Management System
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6 tracking-tight max-w-4xl leading-tight">
          Empowering Campus Careers with <span className="text-indigo-600">Precision</span> & <span className="text-indigo-600">Intelligence</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 mb-10 max-w-2xl leading-relaxed">
          Complete end-to-end recruitment lifecycle: Smart automated eligibility matching, candidate pipeline ATS, interview coordination, offer rollouts, and institutional placement analytics.
        </p>
        
        {/* Portal Entry Buttons */}
        <div className="flex gap-3 sm:gap-4 justify-center flex-wrap max-w-2xl w-full">
          <Link to="/login/student" className="flex-1 min-w-[200px] px-6 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2.5 text-sm">
            <GraduationCap size={20} />
            Student Candidate Login
          </Link>
          <Link to="/login/recruiter" className="flex-1 min-w-[200px] px-6 py-4 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 transition-all shadow-md shadow-amber-200 flex items-center justify-center gap-2.5 text-sm">
            <Building2 size={20} />
            Corporate Recruiter Login
          </Link>
        </div>

        {/* Demo Credentials Quick Callout */}
        <div className="mt-8 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-xl w-full text-xs text-slate-600">
          <p className="font-bold text-slate-800 mb-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Pre-Configured Live Demo Accounts:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px] text-slate-700">
            <div className="p-2 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <span className="font-bold block text-indigo-900">Student (CSE)</span>
              student@cdu.edu<br />Student@123
            </div>
            <div className="p-2 bg-amber-50/60 rounded-xl border border-amber-100">
              <span className="font-bold block text-amber-900">Recruiter (Google)</span>
              recruiter@google.com<br />Recruiter@123
            </div>
            <div className="p-2 bg-purple-50/60 rounded-xl border border-purple-100">
              <span className="font-bold block text-purple-900">Placement Admin</span>
              admin@cdu.edu<br />Admin@123
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">Enterprise-Grade Features</h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Everything students, recruiters, and placement officers need to execute recruitment drives without friction.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ShieldCheck className="text-indigo-600" size={26} />}
              title="Smart Eligibility Engine"
              description="Real-time multi-variable validation checking candidate CGPA, active backlog ceilings, and departmental branches before allowing applications."
            />
            <FeatureCard 
              icon={<Briefcase className="text-indigo-600" size={26} />}
              title="Full Applicant Tracking (ATS)"
              description="Recruiters filter talent by branch and CGPA, review resumes, advance candidate pipelines, schedule video interviews, and release offer letters."
            />
            <FeatureCard 
              icon={<TrendingUp className="text-indigo-600" size={26} />}
              title="Institutional Analytics & Approvals"
              description="Placement officers monitor branch-wise placement percentages, evaluate salary package distributions, and authorize registered companies."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8 text-center border-t border-slate-800 text-xs">
        <p>© 2026 CampusConnect Placement Portal • Chaitanya Deemed to be University</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-8 rounded-3xl border border-slate-100 bg-slate-50/70 hover:shadow-xl hover:border-indigo-100 hover:bg-white transition-all duration-300">
      <div className="w-12 h-12 bg-white rounded-2xl shadow-xs flex items-center justify-center mb-5 border border-slate-100">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

export default Home;
