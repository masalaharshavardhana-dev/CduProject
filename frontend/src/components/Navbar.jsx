import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, LogOut, User, Building, Shield, CheckCircle, ExternalLink, Briefcase, GraduationCap } from 'lucide-react';
import apiClient from '../api/apiClient';

export default function Navbar({ activeRole, user }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Poll every 20s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      // ignore if not logged in
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/', { replace: true });
  };

  const getRoleBadge = () => {
    switch (activeRole) {
      case 'ADMIN':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            Placement Cell Admin
          </span>
        );
      case 'RECRUITER':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
            <Building className="w-3.5 h-3.5 text-amber-600" />
            Corporate Recruiter
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-200">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            Student Candidate
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
                C
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">Campus<span className="text-indigo-600">Connect</span></span>
                <span className="text-[10px] block font-semibold text-slate-600 tracking-wider uppercase -mt-1">CDU Placement Portal</span>
              </div>
            </Link>
            <div className="hidden sm:block ml-2">{getRoleBadge()}</div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                id="notification-bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-600 text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => markAsRead(item._id)}
                          className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                            !item.isRead ? 'bg-indigo-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 leading-snug">
                              {item.title}
                            </span>
                            {!item.isRead && (
                              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {item.message}
                          </p>
                          <span className="text-[10px] text-slate-600 mt-1.5 block">
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User display */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                {user?.fullName ? user.fullName[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left text-xs leading-tight">
                <p className="font-semibold text-slate-900 truncate max-w-[130px]">{user?.fullName || user?.email || 'User'}</p>
                <p className="text-[11px] text-slate-600 capitalize">{activeRole?.toLowerCase()}</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
