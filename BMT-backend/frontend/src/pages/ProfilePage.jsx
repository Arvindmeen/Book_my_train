import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';
import { useToast } from '../components/ui/Toast';
import PwaInstallModal from '../components/common/PwaInstallModal';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Delhi NCR','Goa','Gujarat','Haryana','Himachal Pradesh',
  'Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra',
  'Manipur','Meghalaya','Mizoram','Nagaland','Odisha',
  'Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal'
];

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const showToast = useToast();
  const photoInputRef = useRef(null);

  useEffect(() => {
    // Proactively fetch latest profile data from database on page load
    fetchProfile();
  }, [fetchProfile]);

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const displayName = useMemo(() => {
    if (user?.firstName) return `${user.firstName} ${user.lastName || ''}`.trim();
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Traveler';
  }, [user]);

  const userInitials = useMemo(() => {
    const words = displayName.split(/\s+/).filter(Boolean);
    if (words.length >= 2) return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    const single = words[0] || 'U';
    return single.length >= 2 ? single.slice(0, 2).toUpperCase() : single[0].toUpperCase();
  }, [displayName]);

  const isAdmin = user?.role === 'ADMIN' || user?.isAdmin === true;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : 'Recently joined';

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    gender: '', dateOfBirth: '', city: '', state: '', pincode: '', address: '',
    irctcUsername: '', berthPreference: 'No Preference', foodPreference: 'No Preference',
    emergencyContactName: '', emergencyContactPhone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        address: user.address || '',
        irctcUsername: user.irctcUsername || '',
        berthPreference: user.berthPreference || 'No Preference',
        foodPreference: user.foodPreference || 'No Preference',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactPhone: user.emergencyContactPhone || '',
      });
    }
  }, [user]);

  const completeness = useMemo(() => {
    const fields = [
      { label: 'First Name', filled: !!user?.firstName?.trim() },
      { label: 'Last Name', filled: !!user?.lastName?.trim() },
      { label: 'Mobile Number', filled: !!user?.phone?.trim() },
      { label: 'Gender', filled: !!user?.gender?.trim() },
      { label: 'Date of Birth', filled: !!user?.dateOfBirth },
      { label: 'City', filled: !!user?.city?.trim() },
      { label: 'State', filled: !!user?.state?.trim() },
      { label: 'Profile Photo', filled: !!user?.profilePicture },
      { label: 'Berth Preference', filled: !!user?.berthPreference && user?.berthPreference !== 'No Preference' },
      { label: 'Emergency Contact', filled: !!user?.emergencyContactPhone?.trim() },
    ];
    const filled = fields.filter(f => f.filled).length;
    return {
      percentage: Math.round((filled / fields.length) * 100),
      filled,
      total: fields.length,
      missing: fields.filter(f => !f.filled),
    };
  }, [user]);

  // Password states (Change with Current Password)
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Security Tab States (Dual mode: 'change' using current password vs 'otp' using email OTP)
  const [securityMode, setSecurityMode] = useState('change'); // 'change' | 'otp'
  const [otpStep, setOtpStep] = useState('request'); // 'request' | 'verify'
  const [secOtp, setSecOtp] = useState('');
  const [secNewPassword, setSecNewPassword] = useState('');
  const [secConfirmPassword, setSecConfirmPassword] = useState('');
  const [secOtpSessionId, setSecOtpSessionId] = useState('');
  const [secLoading, setSecLoading] = useState(false);
  const [secShowPass, setSecShowPass] = useState(false);
  const [secResendTimer, setSecResendTimer] = useState(0);

  // Countdown timer for Security OTP resend
  useEffect(() => {
    let interval;
    if (secResendTimer > 0) {
      interval = setInterval(() => {
        setSecResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [secResendTimer]);

  // Passengers
  const passengerKey = `bmt_master_passengers_${user?.id || user?.email || 'default'}`;
  const [passengers, setPassengers] = useState(() => {
    if (user?.savedPassengers) {
      try {
        const parsed = typeof user.savedPassengers === 'string'
          ? JSON.parse(user.savedPassengers)
          : user.savedPassengers;
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    try {
      const s = localStorage.getItem(passengerKey);
      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [{ id: 1, name: displayName !== 'Traveler' ? displayName : 'Primary Passenger', age: 25, gender: 'M', berth: 'Lower Berth' }];
  });
  const [newPass, setNewPass] = useState({ name: '', age: '', gender: 'M', berth: 'No Preference' });

  // Sync passengers whenever user.savedPassengers from database updates
  useEffect(() => {
    if (user?.savedPassengers) {
      try {
        const parsed = typeof user.savedPassengers === 'string'
          ? JSON.parse(user.savedPassengers)
          : user.savedPassengers;
        if (Array.isArray(parsed)) {
          setPassengers(parsed);
          try {
            localStorage.setItem(passengerKey, JSON.stringify(parsed));
          } catch {}
          return;
        }
      } catch (e) {
        console.warn('Failed to parse savedPassengers:', e);
      }
    }

    // Auto-sync migration: If database doesn't have savedPassengers yet, but this device's localStorage
    // already has saved passengers (e.g. from previous sessions), sync them to the database now!
    if (user && !user.savedPassengers) {
      try {
        const s = localStorage.getItem(passengerKey);
        if (s) {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPassengers(parsed);
            updateProfile({ savedPassengers: JSON.stringify(parsed) }).catch(() => {});
          }
        }
      } catch {}
    }
  }, [user?.savedPassengers, user?.id, user?.email, passengerKey, updateProfile]);

  const savePassengers = async (list) => {
    setPassengers(list);
    try { localStorage.setItem(passengerKey, JSON.stringify(list)); } catch {}
    try {
      await updateProfile({ savedPassengers: JSON.stringify(list) });
    } catch (e) {
      console.warn('Failed to save passengers to database:', e);
    }
  };

  const compressImage = (file, maxWidth = 360, maxHeight = 360, quality = 0.82) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handlePhotoChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file (JPG, PNG, WEBP)', 'warning');
      return;
    }
    setPhotoUploading(true);
    try {
      const compressedBase64 = await compressImage(file);
      await updateProfile({ profilePicture: compressedBase64 });
      showToast('Profile photo updated and saved to account! 📸', 'success');
    } catch (err) {
      console.error('Photo upload failed:', err);
      showToast('Failed to save photo. Please try again.', 'error');
    } finally {
      setPhotoUploading(false);
    }
  }, [updateProfile, showToast]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim()) { showToast('First name is required', 'warning'); return; }
    setSaving(true);
    try {
      await updateProfile(formData);
      showToast('Profile saved successfully! ✓', 'success');
      setIsEditing(false);
    } catch (err) {
      showToast(err.message || 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword) {
      showToast('Please enter your current password', 'warning');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'warning');
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await authApi.changePassword({ oldPassword, newPassword, confirmPassword });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast(res.message || 'Password updated successfully! 🔒', 'success');
    } catch (err) {
      console.error('Password change error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to update password';
      showToast(msg, 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendSecurityOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const targetEmail = user?.email;
    if (!targetEmail) {
      showToast('No registered email found for this account', 'error');
      return;
    }
    setSecLoading(true);
    try {
      const res = await authApi.forgotPassword(targetEmail);
      if (res?.otpSessionId) setSecOtpSessionId(res.otpSessionId);
      setSecResendTimer(60);
      setOtpStep('verify');
      showToast(`Verification OTP code sent to ${targetEmail}!`, 'success');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP code';
      showToast(msg, 'error');
    } finally {
      setSecLoading(false);
    }
  };

  const handleVerifySecurityOtp = async (e) => {
    e.preventDefault();
    if (!secOtp || secOtp.trim().length < 6) {
      showToast('Please enter the 6-digit OTP code', 'warning');
      return;
    }
    if (!secNewPassword || secNewPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'warning');
      return;
    }
    if (secNewPassword !== secConfirmPassword) {
      showToast('New passwords do not match', 'warning');
      return;
    }
    setSecLoading(true);
    try {
      await authApi.resetPassword({
        otp: secOtp.trim(),
        otpSessionId: secOtpSessionId,
        newPassword: secNewPassword,
        confirmPassword: secConfirmPassword,
      });
      showToast('Password reset successfully! Your new password is now active 🔒', 'success');
      setSecOtp('');
      setSecNewPassword('');
      setSecConfirmPassword('');
      setSecOtpSessionId('');
      setOtpStep('request');
      setSecurityMode('change');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to reset password. Please check the OTP code.';
      showToast(msg, 'error');
    } finally {
      setSecLoading(false);
    }
  };

  const Field = ({ label, value, icon, placeholder = 'Not set' }) => (
    <div className="group">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{icon} {label}</p>
      <p className={`text-sm font-semibold ${value ? 'text-slate-800' : 'text-slate-400 italic'}`}>
        {value || placeholder}
      </p>
    </div>
  );

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'travel', label: 'Travel Preferences', icon: '🚂' },
    { id: 'passengers', label: `Saved Passengers`, icon: '👥' },
    { id: 'security', label: 'Security', icon: '🔒' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulse-ring { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); } 50% { box-shadow: 0 0 0 8px rgba(16,185,129,0); } }
        .fade-up { animation: fadeUp 0.4s ease both; }
        .slide-in { animation: slideIn 0.35s ease both; }
        .pulse-ring { animation: pulse-ring 2.5s infinite; }
        .tab-content { animation: fadeUp 0.3s ease both; }
        .photo-hover:hover .photo-overlay { opacity: 1; }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">

        {/* ── Executive Profile Header Card ── */}
        <div className="relative bg-white rounded-3xl shadow-sm border border-slate-200/90 p-6 sm:p-8 fade-up">
          {/* Top Row: Avatar, Identity & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            {/* Left: Avatar + Details */}
            <div className="flex items-start sm:items-center gap-5">
              {/* Avatar Container */}
              <div className="relative shrink-0">
                <div
                  className="photo-hover relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ring-2 ring-slate-100 shadow-sm overflow-hidden cursor-pointer bg-slate-50 transition-all hover:ring-emerald-400 group"
                  onClick={() => photoInputRef.current?.click()}
                  title="Click to update photo"
                >
                  {photoUploading ? (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : user?.profilePicture ? (
                    <img src={user.profilePicture} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-800 flex items-center justify-center font-black text-2xl sm:text-3xl text-white select-none">
                      {userInitials}
                    </div>
                  )}
                  <div className="photo-overlay absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center gap-1 opacity-0 transition-opacity duration-200 backdrop-blur-[2px]">
                    <span className="text-lg">📷</span>
                    <span className="text-white text-[10px] font-bold">Update</span>
                  </div>
                </div>

                {/* Quick Camera Action Button */}
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95 ring-2 ring-white"
                  title="Upload Profile Photo"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />

                {/* Online Status Pill */}
                <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
              </div>

              {/* User Identity & Info */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
                    {displayName}
                  </h1>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isAdmin
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {isAdmin ? '🛡️ Administrator' : '✦ Verified Passenger'}
                  </span>
                  {completeness.percentage === 100 ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span>✓</span> 100% Complete
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      {completeness.percentage}% Complete
                    </span>
                  )}
                </div>

                {/* Contact & Meta Details */}
                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs sm:text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="text-slate-400">✉️</span>
                    <span>{user?.email || 'No email registered'}</span>
                  </span>
                  {user?.phone ? (
                    <>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="text-slate-400">📞</span>
                        <span>{user.phone}</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <button
                        type="button"
                        onClick={() => { setIsEditing(true); setActiveTab('personal'); }}
                        className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                      >
                        + Add Mobile
                      </button>
                    </>
                  )}
                  {(user?.city || user?.state) && (
                    <>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="text-slate-400">📍</span>
                        <span>{[user.city, user.state].filter(Boolean).join(', ')}</span>
                      </span>
                    </>
                  )}
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="text-slate-400 text-xs">
                    Member since {memberSince}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center shrink-0">
              <button
                type="button"
                onClick={() => { setIsEditing(!isEditing); setActiveTab('personal'); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 ${
                  isEditing
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                }`}
              >
                <span>{isEditing ? '✕' : '✏️'}</span>
                <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>

              <Link
                to="/bookings"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all"
              >
                <span>🎫</span>
                <span>My Bookings</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  logout();
                  if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                  } else {
                    navigate('/login', { replace: true });
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200/80 transition-all"
                title="Sign out of account"
              >
                <span>Sign Out</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

          {/* Profile Strength & Completion Progress */}
          {completeness.percentage < 100 && (
            <div className="mt-5 p-4 sm:p-5 bg-gradient-to-r from-amber-50/70 via-emerald-50/40 to-slate-50/70 border border-amber-200/80 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[11px]">
                    ★
                  </span>
                  <span className="font-extrabold text-slate-800">
                    Complete your profile for 1-tap Tatkal booking & verified IRCTC access
                  </span>
                </div>
                <span className="font-bold text-slate-500 self-end sm:self-auto">
                  {completeness.filled} of {completeness.total} completed ({completeness.percentage}%)
                </span>
              </div>

              <div className="h-2 bg-slate-200/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                  style={{ width: `${completeness.percentage}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-500 mr-1">Missing details:</span>
                {completeness.missing.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => { setIsEditing(true); setActiveTab('personal'); }}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/50 shadow-2xs transition-all active:scale-95"
                  >
                    + {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Edit Form ── */}
        {isEditing && (
          <div className="bg-white rounded-3xl border-2 border-emerald-400 shadow-2xl shadow-emerald-600/10 overflow-hidden slide-in">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 sm:px-8 py-4 border-b border-emerald-200 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Edit Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5">All changes are saved to your account securely</p>
              </div>
              <button onClick={() => setIsEditing(false)} className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold transition-colors">✕</button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-8">
              {/* Section: Personal */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                  <span className="w-5 h-px bg-slate-300" />Personal Information<span className="flex-1 h-px bg-slate-200" />
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'First Name', key: 'firstName', required: true, placeholder: 'e.g. Arvind' },
                    { label: 'Last Name', key: 'lastName', placeholder: 'e.g. Meena' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">{f.label} {f.required && <span className="text-rose-500">*</span>}</label>
                      <input type="text" value={formData[f.key]} onChange={e => setFormData({...formData, [f.key]: e.target.value})}
                        placeholder={f.placeholder} required={f.required}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Number</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="9876543210"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Gender</label>
                    <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all">
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other / Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Date of Birth</label>
                    <input type="date" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Book My Train Username</label>
                    <input type="text" value={formData.irctcUsername} onChange={e => setFormData({...formData, irctcUsername: e.target.value})}
                      placeholder="e.g. arvind_bmt"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Section: Address */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                  <span className="w-5 h-px bg-slate-300" />Address & Location<span className="flex-1 h-px bg-slate-200" />
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">City</label>
                    <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                      placeholder="e.g. Jaipur"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">State</label>
                    <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all">
                      <option value="">Select state</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">PIN Code</label>
                    <input type="text" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})}
                      placeholder="e.g. 302001"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Address</label>
                  <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                    placeholder="e.g. 12, MG Road, Civil Lines"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all" />
                </div>
              </div>

              {/* Section: Travel & Emergency */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                  <span className="w-5 h-px bg-slate-300" />Travel Preferences & Emergency<span className="flex-1 h-px bg-slate-200" />
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Berth Preference</label>
                    <select value={formData.berthPreference} onChange={e => setFormData({...formData, berthPreference: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all">
                      <option>No Preference</option>
                      <option>Lower Berth</option><option>Middle Berth</option><option>Upper Berth</option>
                      <option>Side Lower</option><option>Side Upper</option><option>Window Seat (CC/EC)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Food Preference</label>
                    <select value={formData.foodPreference} onChange={e => setFormData({...formData, foodPreference: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all">
                      <option>No Preference</option><option>Vegetarian Meal</option>
                      <option>Non-Vegetarian Meal</option><option>Jain Meal (No Onion/Garlic)</option>
                      <option>Do Not Include Food</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Emergency Contact Name</label>
                    <input type="text" value={formData.emergencyContactName} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})}
                      placeholder="e.g. Parent or Spouse"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Emergency Contact Number</label>
                    <input type="tel" value={formData.emergencyContactPhone} onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})}
                      placeholder="e.g. 9811223344"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-7 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-lg shadow-emerald-600/25 active:scale-95 transition-all disabled:opacity-60 flex items-center gap-2">
                  {saving ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Saving...</span></>) : <span>Save Changes ✓</span>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none fade-up" style={{animationDelay:'0.1s'}}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                activeTab === t.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
              }`}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.id === 'passengers' && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${activeTab === t.id ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>{passengers.length}</span>}
            </button>
          ))}
        </div>

        {/* ── Tab: Personal Info ── */}
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 tab-content">
            {/* Personal Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-base">Personal Details</h3>
                <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg transition-colors">✏️ Edit</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Full Name" value={displayName} icon="👤" />
                <Field label="Email Address" value={user?.email} icon="✉️" />
                <Field label="Mobile Number" value={user?.phone} icon="📞" placeholder="Not added" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Gender" value={user?.gender ? user.gender.charAt(0) + user.gender.slice(1).toLowerCase() : ''} icon="⚥" placeholder="Not set" />
                  <Field label="Date of Birth" value={user?.dateOfBirth} icon="🎂" placeholder="Not set" />
                </div>
                <Field label="Book My Train Username" value={user?.irctcUsername} icon="🚂" placeholder="Not linked" />
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-base">Address</h3>
                <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg transition-colors">✏️ Edit</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Full Address" value={user?.address} icon="🏠" placeholder="Not set" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="City" value={user?.city} icon="🏙️" placeholder="Not set" />
                  <Field label="State" value={user?.state} icon="📍" placeholder="Not set" />
                </div>
                <Field label="PIN Code" value={user?.pincode} icon="🔢" placeholder="Not set" />
                <Field label="Emergency Contact" value={user?.emergencyContactName ? `${user.emergencyContactName}${user.emergencyContactPhone ? ` · ${user.emergencyContactPhone}` : ''}` : ''} icon="🆘" placeholder="Not set" />
              </div>
            </div>

            {/* Account Status Card */}
            <div className="md:col-span-2 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-slate-50 border border-emerald-200/80 rounded-2xl p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {[
                  { label: 'Account Status', value: 'Active', color: 'text-emerald-700', icon: '✓' },
                  { label: 'Profile Complete', value: `${completeness.percentage}%`, color: completeness.percentage === 100 ? 'text-emerald-700' : 'text-amber-600', icon: '📊' },
                  { label: 'Saved Passengers', value: passengers.length, color: 'text-slate-800', icon: '👥' },
                  { label: 'Security Level', value: 'Protected', color: 'text-emerald-700', icon: '🛡️' },
                ].map(item => (
                  <div key={item.label} className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{item.icon} {item.label}</p>
                    <p className={`text-lg font-black ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Travel Preferences ── */}
        {activeTab === 'travel' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 tab-content">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-base">Travel Preferences</h3>
                <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg transition-colors">✏️ Edit</button>
              </div>

              {/* Berth Preference Visual */}
              <div className="space-y-3">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">🛏️ Berth Preference</p>
                <div className="flex flex-wrap gap-2">
                  {['Lower Berth', 'Middle Berth', 'Upper Berth', 'Side Lower', 'Side Upper', 'Window Seat (CC/EC)', 'No Preference'].map(b => (
                    <span key={b} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      (user?.berthPreference || 'No Preference') === b
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>{b}</span>
                  ))}
                </div>
              </div>

              {/* Food Preference Visual */}
              <div className="space-y-3">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">🍽️ Food Preference</p>
                <div className="flex flex-wrap gap-2">
                  {['Vegetarian Meal', 'Non-Vegetarian Meal', 'Jain Meal (No Onion/Garlic)', 'Do Not Include Food', 'No Preference'].map(f => (
                    <span key={f} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      (user?.foodPreference || 'No Preference') === f
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>{f}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <h3 className="font-black text-slate-900 text-base">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/search" className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🚂</span>
                    <div>
                      <p className="text-sm font-bold text-emerald-900">Book a Train Ticket</p>
                      <p className="text-xs text-emerald-700">Search trains, check availability</p>
                    </div>
                  </div>
                  <span className="text-emerald-600 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link to="/bookings" className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎫</span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">View All Bookings</p>
                      <p className="text-xs text-slate-500">Tickets, PNR status, refunds</p>
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link to="/pnr" className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🔍</span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Check PNR Status</p>
                      <p className="text-xs text-slate-500">Live train and seat status</p>
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link to="/services" className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🍴</span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Food & Lounge Services</p>
                      <p className="text-xs text-slate-500">Meals, premium waiting areas</p>
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Saved Passengers ── */}
        {activeTab === 'passengers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 tab-content">
            {/* Passenger List */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-base">Saved Passengers</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Auto-filled when booking tickets</p>
                </div>
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">{passengers.length} saved</span>
              </div>
              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {passengers.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-200 transition-all group" style={{animationDelay:`${i*0.05}s`}}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                      {p.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{p.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {p.age} yrs · {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'} · <span className="text-emerald-700 font-semibold">{p.berth}</span>
                      </p>
                    </div>
                    <button onClick={() => { savePassengers(passengers.filter(x => x.id !== p.id)); showToast(`${p.name} removed`, 'info'); }}
                      className="w-7 h-7 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 text-sm">✕</button>
                  </div>
                ))}
                {passengers.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-3xl mb-2">👥</p>
                    <p className="text-sm font-semibold">No saved passengers yet</p>
                    <p className="text-xs mt-1">Add family members or frequent travel companions</p>
                  </div>
                )}
              </div>
            </div>

            {/* Add Passenger */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div>
                <h3 className="font-black text-slate-900 text-base">Add a Passenger</h3>
                <p className="text-xs text-slate-500 mt-0.5">Add family members or travel companions</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name (as on ID)</label>
                  <input type="text" value={newPass.name} onChange={e => setNewPass({...newPass, name: e.target.value})}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Age</label>
                    <input type="number" value={newPass.age} onChange={e => setNewPass({...newPass, age: e.target.value})}
                      placeholder="Age" min="1" max="120"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Gender</label>
                    <select value={newPass.gender} onChange={e => setNewPass({...newPass, gender: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all">
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Berth Preference</label>
                  <select value={newPass.berth} onChange={e => setNewPass({...newPass, berth: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all">
                    <option>No Preference</option>
                    <option>Lower Berth</option><option>Middle Berth</option><option>Upper Berth</option>
                    <option>Side Lower</option><option>Side Upper</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    if (!newPass.name.trim()) { showToast('Please enter a name', 'warning'); return; }
                    const p = { id: Date.now(), name: newPass.name.trim(), age: parseInt(newPass.age) || 25, gender: newPass.gender, berth: newPass.berth };
                    savePassengers([...passengers, p]);
                    setNewPass({ name: '', age: '', gender: 'M', berth: 'No Preference' });
                    showToast(`${p.name} added!`, 'success');
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2">
                  <span>+</span><span>Add to List</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Security ── */}
        {activeTab === 'security' && (
          <div className="max-w-lg mx-auto tab-content">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">
                    {securityMode === 'change' ? 'Change Password' : 'Reset Password with OTP'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {securityMode === 'change'
                      ? 'Keep your account safe with a strong, unique password'
                      : 'Recover or reset your password using email OTP verification'}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xl shrink-0">
                  {securityMode === 'change' ? '🔑' : '📩'}
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setSecurityMode('change'); setOtpStep('request'); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    securityMode === 'change'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>🔑</span> I Know Current Password
                </button>
                <button
                  type="button"
                  onClick={() => setSecurityMode('otp')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    securityMode === 'otp'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>📩</span> Reset via Email OTP
                </button>
              </div>

              {/* Account Security Banner */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs">
                <span className="text-emerald-600 text-lg">🛡️</span>
                <div>
                  <p className="font-bold text-emerald-900">Account Security</p>
                  <p className="text-emerald-700 mt-0.5">Your credentials are protected with multi-layered encryption</p>
                </div>
              </div>

              {/* Flow 1: Change with Current Password */}
              {securityMode === 'change' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">Current Password</label>
                      <button
                        type="button"
                        onClick={() => { setSecurityMode('otp'); setOtpStep('request'); }}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                      >
                        Forgot current password?
                      </button>
                    </div>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={showPass}
                      onChange={e => setShowPass(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Show passwords
                  </label>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 active:scale-98 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {passwordLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
                    <p className="text-xs text-slate-500">
                      Don't remember your current password?{' '}
                      <button
                        type="button"
                        onClick={() => { setSecurityMode('otp'); setOtpStep('request'); }}
                        className="text-emerald-700 font-bold hover:underline"
                      >
                        Reset via Email OTP &rarr;
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* Flow 2: Reset with Email OTP */}
              {securityMode === 'otp' && (
                <div className="space-y-4">
                  {otpStep === 'request' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Forgot your password? We will send a secure 6-digit OTP code to your registered email:
                        </p>
                        <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 text-slate-800 font-bold text-xs">
                          <span className="text-base">✉️</span>
                          <span className="font-mono text-emerald-800 text-sm truncate">{user?.email || 'Your registered email'}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSendSecurityOtp}
                        disabled={secLoading}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 active:scale-98 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {secLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Sending OTP...</span>
                          </>
                        ) : (
                          <span>Send Verification Code &rarr;</span>
                        )}
                      </button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => setSecurityMode('change')}
                          className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                        >
                          &larr; I remember my current password
                        </button>
                      </div>
                    </div>
                  )}

                  {otpStep === 'verify' && (
                    <form onSubmit={handleVerifySecurityOtp} className="space-y-4">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
                        <span className="text-xl">📩</span>
                        <p className="text-xs font-semibold text-slate-700">Verification OTP sent to:</p>
                        <p className="text-xs font-bold text-emerald-900 font-mono truncate">{user?.email}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">6-Digit Verification Code</label>
                        <input
                          type="text"
                          value={secOtp}
                          onChange={e => setSecOtp(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          required
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 text-center tracking-widest font-mono text-lg focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                        <input
                          type={secShowPass ? 'text' : 'password'}
                          value={secNewPassword}
                          onChange={e => setSecNewPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          required
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
                        <input
                          type={secShowPass ? 'text' : 'password'}
                          value={secConfirmPassword}
                          onChange={e => setSecConfirmPassword(e.target.value)}
                          placeholder="Repeat new password"
                          required
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={secShowPass}
                            onChange={e => setSecShowPass(e.target.checked)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          Show passwords
                        </label>

                        {secResendTimer > 0 ? (
                          <span className="text-xs font-semibold text-slate-400">Resend in {secResendTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendSecurityOtp}
                            disabled={secLoading}
                            className="text-xs font-bold text-emerald-700 hover:underline disabled:opacity-50"
                          >
                            Resend Code
                          </button>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={secLoading}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 active:scale-98 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {secLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <span>Verify OTP &amp; Update Password</span>
                        )}
                      </button>

                      <div className="flex items-center justify-center gap-4 text-xs pt-1">
                        <button
                          type="button"
                          onClick={() => setOtpStep('request')}
                          className="text-slate-500 hover:text-slate-800 font-semibold"
                        >
                          Request New Code
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => setSecurityMode('change')}
                          className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                        >
                          &larr; Back to Current Password
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      <PwaInstallModal isOpen={installModalOpen} onClose={() => setInstallModalOpen(false)} />
    </div>
  );
}
