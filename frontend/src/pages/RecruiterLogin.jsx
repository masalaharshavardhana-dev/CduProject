import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, LogIn, UserPlus, ArrowLeft, Mail, Lock, Sparkles, Building, Globe } from 'lucide-react';

function RecruiterLogin() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginSuccess = (role, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    if (role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'RECRUITER') {
      navigate('/recruiter/dashboard', { replace: true });
    } else {
      navigate('/student/dashboard', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        const response = await axios.post('https://cdu-project.vercel.app/api/auth/register', {
          email,
          password,
          role: 'RECRUITER',
          companyName: companyName.trim() || undefined,
          industry: industry.trim() || undefined,
        });

        setSuccess('Recruiter account created successfully! Redirecting...');
        setTimeout(() => {
          handleLoginSuccess(response.data.role, response.data.token);
        }, 1000);
      } else {
        const response = await axios.post('https://cdu-project.vercel.app/api/auth/login', {
          email,
          password
        });

        handleLoginSuccess(response.data.role, response.data.token);
      }
    } catch (err) {
      console.error(err);
      if (err.message === 'Network Error') {
        setError('Backend server is not running on port 5000. Please verify your server.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(isSignUp ? 'Registration failed.' : 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Demo 1-Click Login Helper
  const handleQuickDemoLogin = async (demoEmail, demoPassword) => {
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('https://cdu-project.vercel.app/api/auth/login', {
        email: demoEmail,
        password: demoPassword,
      });
      handleLoginSuccess(response.data.role, response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/40 to-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100 transition-all">
        
        {/* Header Icon & Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
            <Building2 size={30} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isSignUp ? 'Recruiter Registration' : 'Recruiter & Partner Login'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 text-center">
            {isSignUp 
              ? 'Register your company to recruit from CDU graduating batches' 
              : 'Post job requirements, review applicants, and schedule interviews'}
          </p>
        </div>

        {/* Tab Switcher: Login vs Sign Up */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              !isSignUp 
                ? 'bg-white text-amber-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn size={15} />
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isSignUp 
                ? 'bg-white text-amber-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus size={15} />
            Sign Up
          </button>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Organization Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-12 text-slate-400" size={16} />
                  <input
                    type="text"
                    required={isSignUp}
                    placeholder="e.g. Acme Technologies"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry Sector
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-12 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="e.g. Information Technology, FinTech"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-12 text-slate-400" size={16} />
              <input
                type="email"
                required
                placeholder="recruiter@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-12 text-slate-400" size={16} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : isSignUp ? (
              <>
                <UserPlus size={16} /> Create Recruiter Account
              </>
            ) : (
              <>
                <LogIn size={16} /> Sign In to Recruiter Portal
              </>
            )}
          </button>
        </form>

        {/* 1-Click Quick Demo Logins */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Instant Demo Recruiter Access
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('recruiter@google.com', 'Recruiter@123')}
              className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold transition-colors cursor-pointer text-center"
            >
              🏢 Google India Recruiter
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('recruiter@microsoft.com', 'Recruiter@123')}
              className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold transition-colors cursor-pointer text-center"
            >
              🏢 Microsoft IDC Recruiter
            </button>
          </div>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('admin@cdu.edu', 'Admin@123')}
            className="w-full mt-2 p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-bold transition-colors cursor-pointer text-center text-[11px]"
          >
            🛡️ Login as Placement Cell Admin
          </button>
        </div>

        {/* Back Link */}
        <div className="mt-4 text-center">
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold">
            <ArrowLeft size={13} /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RecruiterLogin;
