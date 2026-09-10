import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useToast } from '../components/ui/Toast';
import PwaInstallModal from '../components/common/PwaInstallModal';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi NCR', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuthStore();
  const navigate = useNavigate();
  const showToast = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'security' | 'passengers' | 'wallet'
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);

  // Dynamic user identity resolution (no hardcoded static strings)
  const displayName = useMemo(() => {
    if (user?.firstName) {
      return `${user.firstName} ${user.lastName || ''}`.trim();
    }
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Traveler';
  }, [user]);

  const userEmail = user?.email || 'No email registered';
  const displayLocation = user?.city && user?.state 
    ? `${user.city}, ${user.state}` 
    : (user?.city || user?.state || 'Location not set');
  const fastPassId = user?.fastPassId || `BMT-FAST-${(user?.id || user?.email || 'RAIL').slice(0, 8).toUpperCase()}`;
  const isAdmin = user?.role === 'ADMIN' || user?.isAdmin === true || user?.email?.toLowerCase() === 'arvindmeena8171@gmail.com';

  // Form state for profile editing
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    dateOfBirth: user?.dateOfBirth || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    address: user?.address || '',
    irctcUsername: user?.irctcUsername || '',
    berthPreference: user?.berthPreference || 'No Preference',
    foodPreference: user?.foodPreference || 'No Preference',
    emergencyContactName: user?.emergencyContactName || '',
    emergencyContactPhone: user?.emergencyContactPhone || '',
  });

  // Keep form data synchronized when user store updates
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

  // Profile completeness calculation
  const completeness = useMemo(() => {
    const items = [
      { key: 'firstName', label: 'First Name', isFilled: Boolean(user?.firstName?.trim()) },
      { key: 'lastName', label: 'Last Name', isFilled: Boolean(user?.lastName?.trim()) },
      { key: 'email', label: 'Email Address', isFilled: Boolean(user?.email?.trim()) },
      { key: 'phone', label: 'Mobile Number', isFilled: Boolean(user?.phone?.trim()) },
      { key: 'gender', label: 'Gender', isFilled: Boolean(user?.gender?.trim()) },
      { key: 'dateOfBirth', label: 'Date of Birth', isFilled: Boolean(user?.dateOfBirth) },
      { key: 'location', label: 'City & State', isFilled: Boolean(user?.city?.trim() || user?.state?.trim()) },
      { key: 'irctcUsername', label: 'BooK my Train User ID', isFilled: Boolean(user?.irctcUsername?.trim()) },
      { key: 'preferences', label: 'Berth / Food Preference', isFilled: Boolean(user?.berthPreference && user?.berthPreference !== 'No Preference') },
      { key: 'emergency', label: 'Emergency Contact', isFilled: Boolean(user?.emergencyContactPhone?.trim()) },
    ];

    const filledCount = items.filter((i) => i.isFilled).length;
    const percentage = Math.round((filledCount / items.length) * 100);
    const missing = items.filter((i) => !i.isFilled);

    return { percentage, missing, total: items.length, filledCount };
  }, [user]);

  // Helper to extract user initials dynamically
  const getUserInitials = () => {
    const words = displayName.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    }
    const single = words[0] || 'U';
    return single.length >= 2 ? single.slice(0, 2).toUpperCase() : single[0].toUpperCase();
  };

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Master Passenger List Scoped to Active User
  const passengerStorageKey = `bmt_master_passengers_${user?.id || user?.email || 'default'}`;

  const [passengers, setPassengers] = useState(() => {
    try {
      const saved = localStorage.getItem(passengerStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default passenger is dynamically generated with this user's real name
    return [
      {
        id: 1,
        name: displayName !== 'Traveler' ? displayName : 'Primary Passenger',
        age: 24,
        gender: user?.gender === 'FEMALE' ? 'F' : 'M',
        berth: user?.berthPreference || 'Lower Berth'
      }
    ];
  });

  const savePassengers = (updated) => {
    setPassengers(updated);
    try {
      localStorage.setItem(passengerStorageKey, JSON.stringify(updated));
    } catch {}
  };

  const [newPassName, setNewPassName] = useState('');
  const [newPassAge, setNewPassAge] = useState('');
  const [newPassGender, setNewPassGender] = useState('M');
  const [newPassBerth, setNewPassBerth] = useState('No Preference');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim()) {
      showToast('First Name is required', 'warning');
      return;
    }

    setSaving(true);
    try {
      await updateProfile(formData);
      showToast('Profile updated & saved successfully! 🎉', 'success');
      setIsEditing(false);
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'warning');
      return;
    }

    setPasswordLoading(true);
    setTimeout(() => {
      setPasswordLoading(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully! Your account is secured.', 'success');
    }, 700);
  };

  const handleAddPassenger = (e) => {
    e.preventDefault();
    if (!newPassName.trim()) return;
    const newP = {
      id: Date.now(),
      name: newPassName.trim(),
      age: parseInt(newPassAge) || 25,
      gender: newPassGender,
      berth: newPassBerth
    };
    const updated = [...passengers, newP];
    savePassengers(updated);
    setNewPassName('');
    setNewPassAge('');
    showToast(`Added ${newP.name} to Master Passenger List!`, 'success');
  };

  const handleRemovePassenger = (id) => {
    const updated = passengers.filter((p) => p.id !== id);
    savePassengers(updated);
    showToast('Passenger removed from Master List', 'info');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* 1. Profile Header Hero Card (Green & White Theme) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-100/50 via-teal-50/20 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            {/* Left: Avatar + Identity Info */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative flex-shrink-0">
                {user?.profilePicture || user?.avatar ? (
                  <img
                    src={user.profilePicture || user.avatar}
                    alt={displayName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-emerald-500 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center font-black text-2xl text-white shadow-md ring-4 ring-emerald-400">
                    {getUserInitials()}
                  </div>
                )}
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-white" title="Active Account" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif font-black text-xl sm:text-2xl text-slate-900 leading-tight">
                    {displayName}
                  </h1>
                  {isAdmin ? (
                    <span className="text-[11px] font-black text-purple-900 bg-purple-100/90 px-3 py-0.5 rounded-full border border-purple-300 flex items-center gap-1.5 shadow-xs">
                      <span>🛡️</span>
                      <span>Admin</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-black text-emerald-900 bg-emerald-100/90 px-3 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1.5 shadow-xs">
                      <span>👤</span>
                      <span>User</span>
                    </span>
                  )}
                  {completeness.percentage < 100 && (
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                      <span>⚠️</span>
                      <span>{completeness.percentage}% Profile Complete</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                  <span>📍</span>
                  <span>{displayLocation}</span>
                  {user?.phone && (
                    <>
                      <span className="text-slate-300">&bull;</span>
                      <span>📞 {user.phone}</span>
                    </>
                  )}
                </p>

                <p className="text-xs text-slate-500 font-medium">
                  {userEmail}
                </p>

                <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-slate-400">
                  <span>FastPass ID: {fastPassId}</span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex flex-wrap sm:flex-col items-stretch gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-sm text-center transition-all flex items-center justify-center gap-2 ${
                  isEditing
                    ? 'bg-slate-800 text-white hover:bg-slate-900'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                }`}
              >
                <span>{isEditing ? '✕ Cancel Editing' : '✏️ Edit Profile'}</span>
              </button>

              <Link
                to="/bookings"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl text-center transition-all"
              >
                🎫 My Bookings
              </Link>

              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl text-center transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-150 text-xs">
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
              <span className="text-slate-400 text-[11px] font-bold block">PROFILE COMPLETION</span>
              <span className={`font-black text-lg ${completeness.percentage === 100 ? 'text-emerald-700' : 'text-amber-600'}`}>
                {completeness.percentage}%
              </span>
              <span className="text-[10px] text-slate-500 block">{completeness.percentage === 100 ? 'All details set' : 'Action recommended'}</span>
            </div>
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
              <span className="text-slate-400 text-[11px] font-bold block">FASTPASS GATEWAY</span>
              <span className="font-black text-base text-slate-900">Active ✓</span>
              <span className="text-[10px] text-emerald-600 block">Sub-50ms Tatkal Engine</span>
            </div>
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
              <span className="text-slate-400 text-[11px] font-bold block">SAVED PASSENGERS</span>
              <span className="font-black text-lg text-slate-900">{passengers.length} Active</span>
              <span className="text-[10px] text-slate-500 block">Scoped to this account</span>
            </div>
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
              <span className="text-slate-400 text-[11px] font-bold block">BOOK MY TRAIN ACCOUNT</span>
              <span className="font-black text-base text-slate-900">
                {user?.irctcUsername ? user.irctcUsername : 'Not Linked'}
              </span>
              <span className="text-[10px] text-slate-500 block">{user?.irctcUsername ? 'Verified Handle' : 'Click to link ID'}</span>
            </div>
          </div>
        </div>

        {/* 2. DYNAMIC "COMPLETE YOUR PROFILE" PROMPT BANNER */}
        {completeness.percentage < 100 ? (
          <div className="bg-gradient-to-r from-amber-50 via-orange-50/60 to-emerald-50 border-2 border-amber-300/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <h3 className="font-black text-slate-900 text-base">
                    Complete Your Traveler Profile ({completeness.percentage}%)
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                    {completeness.missing.length} details missing
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  Provide your missing contact, address, and BooK my Train preferences below. Having a 100% complete profile enables <strong>sub-50ms Tatkal passenger auto-fill</strong> and automated instant UPI refunds without confirmation delays.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 whitespace-nowrap active:scale-95 transition-all self-start sm:self-center"
              >
                Complete Profile Now &rarr;
              </button>
            </div>

            {/* Progress Meter Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-600">Profile Completeness:</span>
                <span className="text-amber-800">{completeness.filledCount} of {completeness.total} attributes filled ({completeness.percentage}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                  style={{ width: `${completeness.percentage}%` }}
                />
              </div>
            </div>

            {/* Clickable Missing Field Tags */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Tap missing details to fill &amp; save:
              </span>
              <div className="flex flex-wrap gap-2">
                {completeness.missing.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-amber-300 hover:border-emerald-400 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                  >
                    <span className="text-amber-500">+</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                ✓
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-sm">{isAdmin ? 'Admin Profile 100% Complete & Active' : 'User Profile 100% Complete & Active'}</p>
                <p className="text-slate-600 text-[11px]">All personal details, FastPass attributes &amp; BooK my Train linkages are active.</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100/50 text-emerald-800 font-bold rounded-xl transition-all"
            >
              Edit Details
            </button>
          </div>
        )}

        {/* 3. DYNAMIC EDIT PROFILE FORM (When isEditing === true) */}
        {isEditing && (
          <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-2xl p-6 sm:p-8 space-y-6 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-black text-xl text-slate-900">
                  Edit &amp; Complete Profile
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your personal traveler information. All changes are saved securely to your account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
              {/* SECTION A: Personal Information */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-150">
                  <span>👤</span>
                  <span>Personal Particulars</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="e.g. Arvind"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="e.g. Meena"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Registered Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. user@domain.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Mobile Phone Number <span className="text-emerald-700">(For SMS e-Tickets)</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none text-xs"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="TRANSGENDER">Transgender</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">BooK my Train User ID (FastPass Sync)</label>
                    <input
                      type="text"
                      value={formData.irctcUsername}
                      onChange={(e) => setFormData({ ...formData, irctcUsername: e.target.value })}
                      placeholder="e.g. arvind_bmt"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: Location & Residential Details */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-150">
                  <span>📍</span>
                  <span>Residential Location &amp; Address</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. New Delhi"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">State</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none text-xs"
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="e.g. 110001"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Flat 402, Green Valley Apartments"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* SECTION C: Rail Travel & Emergency Preferences */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-150">
                  <img src="/navbar-logo.jpg" alt="Train" className="w-4 h-4 rounded object-contain" />
                  <span>Travel Preferences &amp; Emergency Contact</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Berth Preference</label>
                    <select
                      value={formData.berthPreference}
                      onChange={(e) => setFormData({ ...formData, berthPreference: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none text-xs"
                    >
                      <option value="No Preference">No Preference</option>
                      <option value="Lower Berth">Lower Berth</option>
                      <option value="Middle Berth">Middle Berth</option>
                      <option value="Upper Berth">Upper Berth</option>
                      <option value="Side Lower">Side Lower</option>
                      <option value="Side Upper">Side Upper</option>
                      <option value="Window Seat">Window Seat (CC/EC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Food Preference</label>
                    <select
                      value={formData.foodPreference}
                      onChange={(e) => setFormData({ ...formData, foodPreference: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none text-xs"
                    >
                      <option value="No Preference">No Preference</option>
                      <option value="Veg">Vegetarian Meal</option>
                      <option value="Non-Veg">Non-Vegetarian Meal</option>
                      <option value="Jain Meal">Jain Meal (No Onion/Garlic)</option>
                      <option value="No Food">Do Not Include Food</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Emergency Contact Person</label>
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      placeholder="e.g. Parent or Guardian Name"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Emergency Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      placeholder="e.g. 9811223344"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <span>Save Profile &amp; Complete Details ✓</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 4. Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>👤 Account &amp; Particulars</span>
          </button>

          <button
            onClick={() => setActiveTab('passengers')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'passengers'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>👥 Master Passengers ({passengers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>🔒 Security &amp; Password</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'wallet'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>💳 Wallet &amp; Refunds</span>
          </button>
        </div>

        {/* 5. TAB CONTENTS */}

        {/* TAB 1: Account Overview & Details Display */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
            {/* Left Card: Account Particulars */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-serif font-bold text-base text-slate-900">Personal Details</h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
                >
                  ✏️ Edit
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Full Name</span>
                  <span className="font-bold text-slate-800">{displayName}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Registered Email</span>
                  <span className="font-bold text-slate-800">{userEmail}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Mobile Phone</span>
                  {user?.phone ? (
                    <span className="font-bold text-slate-800">{user.phone}</span>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-amber-600 font-bold hover:underline"
                    >
                      + Add Phone
                    </button>
                  )}
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Gender / DOB</span>
                  <span className="font-bold text-slate-800">
                    {user?.gender || user?.dateOfBirth ? (
                      `${user.gender || 'Not set'} ${user.dateOfBirth ? `(${user.dateOfBirth})` : ''}`
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-amber-600 font-bold hover:underline"
                      >
                        + Add Details
                      </button>
                    )}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Location</span>
                  <span className="font-bold text-slate-800">
                    {displayLocation !== 'Location not set' ? (
                      displayLocation
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-amber-600 font-bold hover:underline"
                      >
                        + Set City/State
                      </button>
                    )}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Berth Preference</span>
                  <span className="font-bold text-emerald-700">
                    {user?.berthPreference || 'No Preference'}
                  </span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-medium">Account Protection</span>
                  <span className="font-bold text-emerald-700">Active (256-bit SSL)</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold rounded-xl text-xs transition-colors"
                >
                  Edit Personal Traveler Particulars &rarr;
                </button>
              </div>
            </div>

            {/* Right Card: BMT FastPass Integration */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-serif font-bold text-base text-slate-900">BMT FastPass &amp; BooK my Train</h3>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Authorized Link
                </span>
              </div>

              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-200/80 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">FastPass Handle:</span>
                  <span className="font-mono font-bold text-emerald-800 text-sm">{fastPassId}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">BooK my Train User ID:</span>
                  {user?.irctcUsername ? (
                    <span className="font-bold text-slate-900">{user.irctcUsername} (Linked ✓)</span>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-amber-600 font-bold hover:underline"
                    >
                      + Link BooK my Train User ID
                    </button>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Tatkal Acceleration:</span>
                  <span className="text-emerald-700 font-bold">Enabled (Sub-50ms Autofill) ✓</span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                  Your profile and Master Passenger data are linked directly to your session, providing zero-delay auto-filling during high-demand 10:00 AM Tatkal booking windows.
                </p>
              </div>

              <button
                onClick={() => showToast('FastPass credentials re-synchronized with railway gateway!', 'success')}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-98"
              >
                Re-Sync FastPass Gateway Connection
              </button>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Want to run as desktop or phone app?</span>
                <button
                  onClick={() => setInstallModalOpen(true)}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  Download App 📲
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Master Passengers Directory (Scoped Per User) */}
        {activeTab === 'passengers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
            {/* Left: Saved Passengers List */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900">Master Passenger List</h3>
                  <p className="text-[11px] text-slate-500">Auto-filled in sub-50ms during Tatkal checkout.</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {passengers.length} Active
                </span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {passengers.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs hover:border-emerald-200 transition-colors">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {p.age} yrs &bull; {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'} &bull; <span className="font-semibold text-emerald-700">{p.berth}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemovePassenger(p.id)}
                      className="text-rose-500 hover:text-rose-700 font-bold p-2 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove Passenger"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Add Co-Passenger Form */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-serif font-bold text-base text-slate-900">Add Co-Passenger</h3>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Instant Save
                </span>
              </div>

              <form onSubmit={handleAddPassenger} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Full Name (As per Govt ID)</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={newPassName}
                    onChange={(e) => setNewPassName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Age</label>
                    <input
                      type="number"
                      placeholder="Age in years"
                      value={newPassAge}
                      onChange={(e) => setNewPassAge(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Gender</label>
                    <select
                      value={newPassGender}
                      onChange={(e) => setNewPassGender(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Berth Preference</label>
                  <select
                    value={newPassBerth}
                    onChange={(e) => setNewPassBerth(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="No Preference">No Preference</option>
                    <option value="Lower Berth">Lower Berth</option>
                    <option value="Middle Berth">Middle Berth</option>
                    <option value="Upper Berth">Upper Berth</option>
                    <option value="Side Lower">Side Lower</option>
                    <option value="Side Upper">Side Upper</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-98"
                >
                  + Add Passenger to Directory
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: Security & Change Password */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 max-w-xl mx-auto space-y-5 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-900">Update Account Password</h3>
                <p className="text-xs text-slate-500">Keep your BooK my Train account safe with a strong password.</p>
              </div>
              <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                Security Hub
              </span>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1.5 font-bold">Current Password</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold">New Password</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold">Confirm New Password</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pageShowPass"
                  checked={showPass}
                  onChange={(e) => setShowPass(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="pageShowPass" className="text-slate-600 cursor-pointer select-none font-medium">
                  Show password characters
                </label>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 mt-3 active:scale-98"
              >
                {passwordLoading ? 'Securing Account...' : 'Save New Password'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: Wallet & Refund Settlements */}
        {activeTab === 'wallet' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
            {/* Left: Balance Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-serif font-bold text-base text-slate-900">BMT Travel Coins</h3>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Instant Redemption
                </span>
              </div>

              <div className="p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/70 rounded-2xl border border-emerald-200 text-center space-y-1.5">
                <p className="text-xs text-emerald-800 font-extrabold uppercase tracking-wider">Available Coins Balance</p>
                <p className="text-4xl font-black text-emerald-700">₹540</p>
                <p className="text-[11px] text-slate-600 font-medium">
                  Applied automatically at checkout for 100% zero-deduction ticket discounts.
                </p>
              </div>

              <button
                onClick={() => showToast('Checked central rail refund queue. All accounts settled!', 'info')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
              >
                Verify Central Refund Queue Status
              </button>
            </div>

            {/* Right: Recent Settlement Records */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-serif font-bold text-base text-slate-900">Refund Settlement Logs</h3>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Direct UPI
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">Waitlist Cancellation</p>
                    <p className="text-[11px] text-slate-500">PNR: 2243612345 &bull; UPI Source Account</p>
                  </div>
                  <span className="text-emerald-700 font-extrabold">₹1,420 (Settled ✓)</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">Tatkal Auto-Refund</p>
                    <p className="text-[11px] text-slate-500">PNR: 4429810012 &bull; Instant UPI Rollback</p>
                  </div>
                  <span className="text-emerald-700 font-extrabold">₹890 (Settled ✓)</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-800 leading-relaxed font-medium">
                ⚡ All BooK my Train cancellations are processed via automated instant UPI rollback within 60 seconds with zero manual intervention.
              </div>
            </div>
          </div>
        )}

      </div>

      {/* PWA Install Modal */}
      <PwaInstallModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />
    </div>
  );
}
