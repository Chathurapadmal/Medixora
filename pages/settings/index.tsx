import React, { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';

// ─── Types ────────────────────────────────────────────────────────────────────
type UserRole = 'Admin' | 'Doctor' | 'Nurse' | string;

interface UserProfile {
  username: string;
  role: UserRole;
  userId: string;
  avatarUrl?: string;
}

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  license_no: string;
  ward: string;
  shift: string;
  nurse_station: string;
  avatar_url: string;
  username: string;
}

interface ClinicData {
  clinic_name: string;
  registration_id: string;
  phone: string;
  email: string;
  timezone: string;
  language: string;
  address: string;
  general_supplies_threshold: string;
  critical_med_threshold: string;
  surgical_equip_threshold: string;
}

interface StaffMember {
  user_id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  joined_date: string;
}

// ─── Role style config ────────────────────────────────────────────────────────
const ROLE_STYLES: Record<string, { bg: string; text: string; border: string; dot: string; icon: React.ReactNode }> = {
  Admin: {
    bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  },
  Doctor: {
    bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  },
  Nurse: {
    bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  },
};

// ─── Shared Components ────────────────────────────────────────────────────────
function SectionCard({ icon, iconBg, title, subtitle, children }: {
  icon: React.ReactNode; iconBg: string; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="settings-card">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
        <div>
          <h2 className="text-[15px] font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-[13px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>;
}

function TextField({ value, onChange, placeholder, readOnly, type = 'text' }: {
  value: string; onChange?: (v: string) => void; placeholder?: string; readOnly?: boolean; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full px-4 py-2.5 border rounded-xl text-[14px] text-slate-800 outline-none transition-all
        ${readOnly ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
          : 'bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400'}`}
    />
  );
}

function SelectField({ value, onChange, options }: {
  value: string; onChange?: (v: string) => void; options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange?.(e.target.value)}
        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 appearance-none"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 20 20">
        <path d="m5.5 7.8 4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Toggle({ id, checked, onChange, label, description }: {
  id: string; checked: boolean; onChange: (v: boolean) => void; label: string; description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-slate-100 last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-slate-800">{label}</div>
        {description && <div className="text-[12.5px] text-slate-500 mt-0.5">{description}</div>}
      </div>
      <button type="button" onClick={() => onChange(!checked)} role="switch" aria-checked={checked}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}>
        <span style={{ width: 18, height: 18, transform: checked ? 'translateX(20px)' : 'translateX(2px)' }}
          className="inline-block rounded-full bg-white shadow transition-transform" />
      </button>
    </div>
  );
}

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

function ActionBar({ status, onSave, errorMsg }: { status: SaveStatus; onSave: () => void; errorMsg?: string }) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-5">
      <div className="text-[13px]">
        {status === 'success' && <span className="text-emerald-600 font-medium flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Saved!
        </span>}
        {status === 'error' && <span className="text-red-500 font-medium">{errorMsg || 'Save failed.'}</span>}
      </div>
      <button type="button" onClick={onSave} disabled={status === 'saving'}
        className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-[13.5px] font-semibold hover:bg-blue-700 transition-all disabled:opacity-60 shadow-[0_4px_14px_rgba(37,99,235,0.25)]">
        {status === 'saving' ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</> : 'Save Changes'}
      </button>
    </div>
  );
}

// ─── Profile Photo Uploader ───────────────────────────────────────────────────
function ProfilePhotoUploader({ userId, currentAvatarUrl, accentColor = 'violet', label = 'Profile Photo', onUploadSuccess }: {
  userId: string; currentAvatarUrl?: string; accentColor?: 'violet' | 'blue' | 'emerald'; label?: string; onUploadSuccess?: (url: string) => void;
}) {
  const [preview, setPreview] = useState(currentAvatarUrl || '');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (currentAvatarUrl && !preview) setPreview(currentAvatarUrl); }, [currentAvatarUrl]);

  const colors = {
    violet: { border: 'border-violet-200 hover:border-violet-400', ring: 'ring-violet-400', badge: 'bg-violet-600' },
    blue:   { border: 'border-blue-200 hover:border-blue-400',   ring: 'ring-blue-400',   badge: 'bg-blue-600' },
    emerald:{ border: 'border-emerald-200 hover:border-emerald-400', ring: 'ring-emerald-400', badge: 'bg-emerald-600' },
  }[accentColor];

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setErrorMsg('Please select a valid image file.'); setStatus('error'); return; }
    if (file.size > 6 * 1024 * 1024) { setErrorMsg('Image must be smaller than 6 MB.'); setStatus('error'); return; }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64); setUploading(true); setStatus('idle'); setErrorMsg('');
      try {
        const res = await fetch('/api/user/avatar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, imageBase64: base64 }) });
        const data = await res.json();
        if (res.ok && data.success) {
          setPreview(data.avatarUrl); setStatus('success');
          localStorage.setItem('userAvatar', data.avatarUrl);
          window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: data.avatarUrl }));
          onUploadSuccess?.(data.avatarUrl);
          setTimeout(() => setStatus('idle'), 3000);
        } else { setErrorMsg(data.message || 'Upload failed.'); setStatus('error'); }
      } catch { setErrorMsg('Network error.'); setStatus('error'); }
      finally { setUploading(false); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <input ref={fileInputRef} id={`avatar-${userId}`} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
      <div className={`relative w-24 h-24 rounded-2xl cursor-pointer ${isDragging ? `ring-2 ${colors.ring} ring-offset-2` : ''}`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f); }}
        onClick={() => fileInputRef.current?.click()} title="Click or drag image here">
        <div className={`w-24 h-24 rounded-2xl overflow-hidden border-2 ${colors.border} shadow-sm bg-slate-100 transition-all`}>
          {preview ? <img src={preview} alt="Profile" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="text-[10px] text-slate-400">No photo</span>
              </div>}
          {preview && <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>}
        </div>
        <div className={`absolute -bottom-1 -right-1 w-7 h-7 ${colors.badge} rounded-lg flex items-center justify-center shadow-md pointer-events-none`}>
          {uploading ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>}
        </div>
      </div>
      <span className="text-[12px] text-slate-500 font-medium">{label}</span>
      <div className="flex flex-col items-center gap-1.5">
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
          className="text-[12px] font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50">
          {uploading ? 'Uploading…' : preview ? 'Change Photo' : 'Upload Photo'}
        </button>
        {preview && !uploading && <button type="button" onClick={() => { setPreview(''); setStatus('idle'); }} className="text-[11px] text-slate-400 hover:text-red-500">Remove</button>}
      </div>
      {status === 'success' && <div className="text-[12px] text-emerald-600 font-medium flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Photo saved!</div>}
      {status === 'error' && <div className="text-[11.5px] text-red-500 text-center max-w-[110px]">{errorMsg}</div>}
      {!preview && <p className="text-[11px] text-slate-400 text-center max-w-[110px] leading-tight">JPG, PNG, GIF · max 6 MB</p>}
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-slate-100 animate-pulse rounded-xl ${className}`} />;
}

// ─── Password Change Form (reused by all roles) ───────────────────────────────
function PasswordForm({ userId, accentColor = 'blue' }: { userId: string; accentColor?: string }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [msg, setMsg] = useState('');

  const bgMap: Record<string, string> = { blue: 'bg-blue-50', violet: 'bg-violet-50', emerald: 'bg-emerald-50' };
  const iconMap: Record<string, string> = { blue: 'text-blue-600', violet: 'text-violet-600', emerald: 'text-emerald-600' };

  const handleSave = async () => {
    if (!form.current || !form.next || !form.confirm) { setMsg('All fields are required.'); setStatus('error'); return; }
    if (form.next !== form.confirm) { setMsg('New passwords do not match.'); setStatus('error'); return; }
    if (form.next.length < 8) { setMsg('New password must be at least 8 characters.'); setStatus('error'); return; }
    setStatus('saving');
    try {
      const res = await fetch('/api/settings/password', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, currentPassword: form.current, newPassword: form.next }) });
      const data = await res.json();
      if (res.ok) { setStatus('success'); setForm({ current: '', next: '', confirm: '' }); setMsg(''); setTimeout(() => setStatus('idle'), 3000); }
      else { setStatus('error'); setMsg(data.message || 'Update failed.'); }
    } catch { setStatus('error'); setMsg('Network error.'); }
  };

  return (
    <SectionCard iconBg={bgMap[accentColor] || 'bg-blue-50'}
      icon={<svg className={`w-5 h-5 ${iconMap[accentColor] || 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
      title="Change Password" subtitle="Update your account password.">
      <div className="space-y-4">
        <div><FieldLabel label="Current Password" /><TextField type="password" value={form.current} onChange={v => setForm(p => ({ ...p, current: v }))} placeholder="Enter current password" /></div>
        <div><FieldLabel label="New Password" /><TextField type="password" value={form.next} onChange={v => setForm(p => ({ ...p, next: v }))} placeholder="Min. 8 characters" /></div>
        <div><FieldLabel label="Confirm New Password" /><TextField type="password" value={form.confirm} onChange={v => setForm(p => ({ ...p, confirm: v }))} placeholder="Repeat new password" /></div>
        <ActionBar status={status} onSave={handleSave} errorMsg={msg} />
      </div>
    </SectionCard>
  );
}

// ─── ADMIN SECTIONS ───────────────────────────────────────────────────────────
function AdminClinicForm({ initial, onSaved }: { initial: ClinicData; onSaved: (d: ClinicData) => void }) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [msg, setMsg] = useState('');

  useEffect(() => { setForm(initial); }, [initial]);

  const f = (key: keyof ClinicData) => (v: string) => setForm(p => ({ ...p, [key]: v }));

  const handleSave = async () => {
    setStatus('saving');
    try {
      const res = await fetch('/api/settings/clinic', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) { setStatus('success'); onSaved(form); setTimeout(() => setStatus('idle'), 3000); }
      else { setStatus('error'); setMsg(data.message || 'Save failed.'); }
    } catch { setStatus('error'); setMsg('Network error.'); }
  };

  return (
    <SectionCard iconBg="bg-blue-50"
      icon={<svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
      title="Clinic Information" subtitle="Update the public details of your medical facility.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div><FieldLabel label="Clinic Name" /><TextField value={form.clinic_name} onChange={f('clinic_name')} /></div>
        <div><FieldLabel label="Registration ID" /><TextField value={form.registration_id} onChange={f('registration_id')} /></div>
        <div><FieldLabel label="Primary Phone" /><TextField value={form.phone} onChange={f('phone')} /></div>
        <div><FieldLabel label="Support Email" /><TextField type="email" value={form.email} onChange={f('email')} /></div>
        <div><FieldLabel label="Time Zone" />
          <SelectField value={form.timezone} onChange={f('timezone')} options={['(UTC-05:00) Eastern Time', '(UTC-06:00) Central Time', '(UTC-07:00) Mountain Time', '(UTC-08:00) Pacific Time', '(UTC+05:30) IST', '(UTC+05:30) Sri Lanka Standard Time', '(UTC+00:00) UTC']} />
        </div>
        <div><FieldLabel label="Language" />
          <SelectField value={form.language} onChange={f('language')} options={['English (US)', 'English (UK)', 'Spanish', 'French', 'German', 'Sinhala', 'Tamil']} />
        </div>
      </div>
      <div className="mb-4"><FieldLabel label="Facility Address" /><TextField value={form.address} onChange={f('address')} /></div>
      <ActionBar status={status} onSave={handleSave} errorMsg={msg} />
    </SectionCard>
  );
}

function AdminProfileForm({ user, initial, onSaved }: { user: UserProfile; initial: ProfileData; onSaved: (d: ProfileData) => void }) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [msg, setMsg] = useState('');

  useEffect(() => { setForm(initial); }, [initial]);
  const f = (key: keyof ProfileData) => (v: string) => setForm(p => ({ ...p, [key]: v }));

  const handleSave = async () => {
    setStatus('saving');
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, firstName: form.first_name, lastName: form.last_name, email: form.email, phone: form.phone, username: form.username }),
      });
      const data = await res.json();
      if (res.ok) { setStatus('success'); onSaved(form); setTimeout(() => setStatus('idle'), 3000); }
      else { setStatus('error'); setMsg(data.message || 'Save failed.'); }
    } catch { setStatus('error'); setMsg('Network error.'); }
  };

  return (
    <SectionCard iconBg="bg-violet-50"
      icon={<svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      title="Administrator Profile" subtitle="Your personal account information.">
      <div className="flex flex-col sm:flex-row gap-8">
        <ProfilePhotoUploader userId={user.userId} currentAvatarUrl={user.avatarUrl} accentColor="violet" label="Admin Photo" />
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><FieldLabel label="First Name" /><TextField value={form.first_name} onChange={f('first_name')} placeholder="First name" /></div>
            <div><FieldLabel label="Last Name" /><TextField value={form.last_name} onChange={f('last_name')} placeholder="Last name" /></div>
          </div>
          <div><FieldLabel label="Display Name" /><TextField value={form.username} onChange={f('username')} placeholder="Username" /></div>
          <div><FieldLabel label="Email Address" /><TextField type="email" value={form.email} onChange={f('email')} /></div>
          <div><FieldLabel label="Admin ID" /><TextField value={`ADM-${user.userId}`} readOnly /></div>
        </div>
      </div>
      <ActionBar status={status} onSave={handleSave} errorMsg={msg} />
    </SectionCard>
  );
}

function StaffList({ staff, loading }: { staff: StaffMember[]; loading: boolean }) {
  if (loading) return (
    <SectionCard iconBg="bg-orange-50"
      icon={<svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
      title="Staff & Role Management" subtitle="All registered staff members.">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 mb-2" />)}
    </SectionCard>
  );

  return (
    <SectionCard iconBg="bg-orange-50"
      icon={<svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
      title="Staff & Role Management" subtitle={`${staff.length} registered staff member${staff.length !== 1 ? 's' : ''}`}>
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {staff.map(member => {
          const s = ROLE_STYLES[member.role] || ROLE_STYLES.Admin;
          const displayName = [member.first_name, member.last_name].filter(Boolean).join(' ') || member.username;
          return (
            <div key={member.user_id} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 hover:bg-white transition-all group">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 bg-gradient-to-br from-slate-200 to-slate-300 flex-shrink-0">
                {member.avatar_url ? <img src={member.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-[13px] font-bold text-slate-500">{displayName[0]?.toUpperCase()}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold text-slate-800 truncate">{displayName}</div>
                <div className="text-[12px] text-slate-500 truncate">{member.email}</div>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${s.bg} ${s.text} ${s.border}`}>{member.role}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${member.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{member.status}</span>
            </div>
          );
        })}
      </div>
      {staff.length === 0 && <p className="text-[13px] text-slate-400 text-center py-6">No staff members found.</p>}
    </SectionCard>
  );
}

function AdminGeneralInfo({ user, profileData, clinicData, staffData, staffLoading, onSaveProfile, onSaveClinic }: {
  user: UserProfile; profileData: ProfileData | null; clinicData: ClinicData | null; staffData: StaffMember[]; staffLoading: boolean;
  onSaveProfile: (d: ProfileData) => void; onSaveClinic: (d: ClinicData) => void;
}) {
  const empty = (s: string) => s === '' || s === undefined;
  return (
    <div className="space-y-5">
      {clinicData ? <AdminClinicForm initial={clinicData} onSaved={onSaveClinic} />
        : <div className="settings-card"><Skeleton className="h-8 mb-4 w-48" />{[1,2,3,4].map(i=><Skeleton key={i} className="h-11 mb-3" />)}</div>}
      {profileData ? <AdminProfileForm user={user} initial={profileData} onSaved={onSaveProfile} />
        : <div className="settings-card"><Skeleton className="h-8 mb-4 w-48" />{[1,2,3].map(i=><Skeleton key={i} className="h-11 mb-3" />)}</div>}
      <StaffList staff={staffData} loading={staffLoading} />
    </div>
  );
}

function AdminSecurity({ user }: { user: UserProfile }) {
  return (
    <div className="space-y-5">
      <PasswordForm userId={user.userId} accentColor="blue" />
      <SectionCard iconBg="bg-violet-50"
        icon={<svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
        title="Two-Factor Authentication" subtitle="Add an extra layer of security to your admin account.">
        <div className="flex items-center justify-between p-4 rounded-xl bg-violet-50 border border-violet-100">
          <div>
            <div className="text-[14px] font-semibold text-violet-900">2FA is currently disabled</div>
            <div className="text-[12.5px] text-violet-600 mt-0.5">Enable 2FA to protect admin access.</div>
          </div>
          <button className="px-4 py-2 bg-violet-600 text-white rounded-xl text-[13px] font-semibold hover:bg-violet-700 transition-colors">Enable 2FA</button>
        </div>
      </SectionCard>
    </div>
  );
}

function AdminNotifications() {
  const [s, setS] = useState({ criticalStock: true, newStaff: true, billing: true, reports: false, audit: true });
  const [email, setEmail] = useState('admin@medistock.com');
  const [freq, setFreq] = useState('Real-time');
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-5">
      <SectionCard iconBg="bg-orange-50"
        icon={<svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
        title="System & Alert Notifications" subtitle="Configure what admin notifications you receive.">
        <Toggle id="n-critical" checked={s.criticalStock} onChange={v => setS(p=>({...p, criticalStock: v}))} label="Critical Stock Alerts" description="Get notified when medication stock falls below threshold." />
        <Toggle id="n-staff" checked={s.newStaff} onChange={v => setS(p=>({...p, newStaff: v}))} label="New Staff Registrations" description="Alert when a new account requires admin approval." />
        <Toggle id="n-billing" checked={s.billing} onChange={v => setS(p=>({...p, billing: v}))} label="Billing & Payment Events" description="Invoice payments, overdue alerts, and plan changes." />
        <Toggle id="n-reports" checked={s.reports} onChange={v => setS(p=>({...p, reports: v}))} label="Weekly System Reports" description="Automatic weekly summary emailed every Monday." />
        <Toggle id="n-audit" checked={s.audit} onChange={v => setS(p=>({...p, audit: v}))} label="Audit Log Events" description="Notify on critical system changes or security events." />
        <div className="flex justify-end pt-4">
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-[13.5px] font-semibold hover:bg-blue-700 transition-all shadow-[0_4px_14px_rgba(37,99,235,0.25)]">
            {saved ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Saved!</> : 'Save Preferences'}
          </button>
        </div>
      </SectionCard>
      <SectionCard iconBg="bg-blue-50"
        icon={<svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
        title="Notification Delivery" subtitle="Choose how you want to receive alerts.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><FieldLabel label="Notification Email" /><TextField type="email" value={email} onChange={setEmail} /></div>
          <div><FieldLabel label="Digest Frequency" /><SelectField value={freq} onChange={setFreq} options={['Real-time','Hourly Digest','Daily Digest','Weekly Digest']} /></div>
        </div>
        <div className="flex justify-end pt-4 mt-2">
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-[13.5px] font-semibold hover:bg-blue-700 transition-all shadow-[0_4px_14px_rgba(37,99,235,0.25)]">Save Changes</button>
        </div>
      </SectionCard>
    </div>
  );
}

function AdminBilling({ clinicData }: { clinicData: ClinicData | null }) {
  return (
    <div className="space-y-5">
      <SectionCard iconBg="bg-emerald-50"
        icon={<svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
        title="Subscription Plan" subtitle="Manage your current plan and payment details.">
        <div className="p-4 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 mb-5">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Current Plan</div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">● ACTIVE</span>
          </div>
          <div className="text-[22px] font-bold text-slate-900">Enterprise</div>
          <div className="text-[13px] text-slate-500 mt-0.5">Unlimited staff · Priority support · Advanced analytics</div>
          <div className="text-[13px] text-slate-600 mt-3 font-medium">Next billing: <strong>July 17, 2026</strong></div>
        </div>
        <button className="flex items-center gap-1.5 text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
          Manage Payment Methods
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </SectionCard>

      {/* Stock Thresholds from DB */}
      {clinicData && (
        <SectionCard iconBg="bg-orange-50"
          icon={<svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          title="Stock Alert Thresholds" subtitle="Minimum stock levels before reorder alerts trigger.">
          {[
            { label: 'General Supplies', value: `${clinicData.general_supplies_threshold} Units`, color: 'text-slate-700' },
            { label: 'Critical Medications', value: `${clinicData.critical_med_threshold} Units`, color: 'text-orange-600' },
            { label: 'Surgical Equipment', value: `${clinicData.surgical_equip_threshold} Units`, color: 'text-red-600' },
          ].map(item => (
            <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
              <span className={`font-bold text-[13.5px] ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </SectionCard>
      )}
    </div>
  );
}

// ─── DOCTOR SECTIONS ──────────────────────────────────────────────────────────
function DoctorProfileForm({ user, initial, onSaved }: { user: UserProfile; initial: ProfileData; onSaved: (d: ProfileData) => void }) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [msg, setMsg] = useState('');

  useEffect(() => { setForm(initial); }, [initial]);
  const f = (key: keyof ProfileData) => (v: string) => setForm(p => ({ ...p, [key]: v }));

  const handleSave = async () => {
    setStatus('saving');
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, firstName: form.first_name, lastName: form.last_name, email: form.email, phone: form.phone, username: form.username, department: form.department, specialization: form.specialization, licenseNo: form.license_no }),
      });
      const data = await res.json();
      if (res.ok) { setStatus('success'); onSaved(form); setTimeout(() => setStatus('idle'), 3000); }
      else { setStatus('error'); setMsg(data.message || 'Save failed.'); }
    } catch { setStatus('error'); setMsg('Network error.'); }
  };

  return (
    <div className="space-y-5">
      <SectionCard iconBg="bg-blue-50"
        icon={<svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        title="Doctor Profile" subtitle="Your personal and professional account details.">
        <div className="flex flex-col sm:flex-row gap-8">
          <ProfilePhotoUploader userId={user.userId} currentAvatarUrl={user.avatarUrl} accentColor="blue" label="Doctor Photo" />
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><FieldLabel label="First Name" /><TextField value={form.first_name} onChange={f('first_name')} placeholder="First name" /></div>
              <div><FieldLabel label="Last Name" /><TextField value={form.last_name} onChange={f('last_name')} placeholder="Last name" /></div>
            </div>
            <div><FieldLabel label="Display Name" /><TextField value={form.username} onChange={f('username')} /></div>
            <div><FieldLabel label="Email Address" /><TextField type="email" value={form.email} onChange={f('email')} /></div>
            <div><FieldLabel label="Doctor ID (Read-only)" /><TextField value={`DOC-${user.userId}`} readOnly /></div>
          </div>
        </div>
        <ActionBar status={status} onSave={handleSave} errorMsg={msg} />
      </SectionCard>

      <SectionCard iconBg="bg-sky-50"
        icon={<svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
        title="Professional Details" subtitle="Your medical credentials and specialization.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><FieldLabel label="Specialization" />
            <SelectField value={form.specialization || 'General Practice'} onChange={f('specialization')} options={['Cardiology','Neurology','Orthopedics','Pediatrics','General Practice','Oncology','Radiology','Dermatology','Psychiatry','Emergency Medicine']} />
          </div>
          <div><FieldLabel label="Medical License No." /><TextField value={form.license_no} onChange={f('license_no')} placeholder="e.g. ML-2024-NY-001" /></div>
          <div><FieldLabel label="Department" /><TextField value={form.department} onChange={f('department')} placeholder="e.g. Cardiac Care Unit" /></div>
          <div><FieldLabel label="Phone" /><TextField value={form.phone} onChange={f('phone')} placeholder="+1 (555) 000-0000" /></div>
        </div>
        <ActionBar status={status} onSave={handleSave} errorMsg={msg} />
      </SectionCard>
    </div>
  );
}

function DoctorGeneralInfo({ user, profileData, onSaved }: { user: UserProfile; profileData: ProfileData | null; onSaved: (d: ProfileData) => void }) {
  if (!profileData) return (
    <div className="space-y-5">
      {[1,2].map(i=><div key={i} className="settings-card"><Skeleton className="h-8 mb-4 w-48" />{[1,2,3].map(j=><Skeleton key={j} className="h-11 mb-3" />)}</div>)}
    </div>
  );
  return <DoctorProfileForm user={user} initial={profileData} onSaved={onSaved} />;
}

function DoctorSecurity({ user }: { user: UserProfile }) {
  return <PasswordForm userId={user.userId} accentColor="blue" />;
}

function DoctorNotifications() {
  const [s, setS] = useState({ appt: true, labs: true, msg: true, reminder: false, emergency: true });
  const [saved, setSaved] = useState(false);
  return (
    <SectionCard iconBg="bg-blue-50"
      icon={<svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
      title="My Notification Preferences" subtitle="Configure alerts relevant to your practice.">
      <Toggle id="d-appt" checked={s.appt} onChange={v=>setS(p=>({...p,appt:v}))} label="New Appointment Bookings" description="Receive alerts when patients book or cancel appointments." />
      <Toggle id="d-labs" checked={s.labs} onChange={v=>setS(p=>({...p,labs:v}))} label="Lab Result Alerts" description="Notify when patient lab results are ready for review." />
      <Toggle id="d-msg" checked={s.msg} onChange={v=>setS(p=>({...p,msg:v}))} label="Patient Messages" description="Alerts for new messages in the patient portal." />
      <Toggle id="d-reminder" checked={s.reminder} onChange={v=>setS(p=>({...p,reminder:v}))} label="Daily Schedule Reminder" description="Morning summary of the day's appointments." />
      <Toggle id="d-emergency" checked={s.emergency} onChange={v=>setS(p=>({...p,emergency:v}))} label="Emergency Escalations" description="Critical patient status changes requiring immediate action." />
      <div className="flex justify-end pt-4">
        <button onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000)}} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-[13.5px] font-semibold hover:bg-blue-700 transition-all shadow-[0_4px_14px_rgba(37,99,235,0.25)]">
          {saved ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Saved!</> : 'Save Preferences'}
        </button>
      </div>
    </SectionCard>
  );
}

// ─── NURSE SECTIONS ───────────────────────────────────────────────────────────
function NurseProfileForm({ user, initial, onSaved }: { user: UserProfile; initial: ProfileData; onSaved: (d: ProfileData) => void }) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [msg, setMsg] = useState('');

  useEffect(() => { setForm(initial); }, [initial]);
  const f = (key: keyof ProfileData) => (v: string) => setForm(p => ({ ...p, [key]: v }));

  const handleSaveProfile = async () => {
    setStatus('saving');
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, firstName: form.first_name, lastName: form.last_name, email: form.email, phone: form.phone, username: form.username }),
      });
      const data = await res.json();
      if (res.ok) { setStatus('success'); onSaved(form); setTimeout(() => setStatus('idle'), 3000); }
      else { setStatus('error'); setMsg(data.message || 'Save failed.'); }
    } catch { setStatus('error'); setMsg('Network error.'); }
  };

  const handleSaveWard = async () => {
    setStatus('saving');
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, ward: form.ward, shift: form.shift, nurseStation: form.nurse_station }),
      });
      const data = await res.json();
      if (res.ok) { setStatus('success'); onSaved(form); setTimeout(() => setStatus('idle'), 3000); }
      else { setStatus('error'); setMsg(data.message || 'Save failed.'); }
    } catch { setStatus('error'); setMsg('Network error.'); }
  };

  return (
    <div className="space-y-5">
      <SectionCard iconBg="bg-emerald-50"
        icon={<svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        title="Nurse Profile" subtitle="Your personal account and ward assignment details.">
        <div className="flex flex-col sm:flex-row gap-8">
          <ProfilePhotoUploader userId={user.userId} currentAvatarUrl={user.avatarUrl} accentColor="emerald" label="Nurse Photo" />
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><FieldLabel label="First Name" /><TextField value={form.first_name} onChange={f('first_name')} placeholder="First name" /></div>
              <div><FieldLabel label="Last Name" /><TextField value={form.last_name} onChange={f('last_name')} placeholder="Last name" /></div>
            </div>
            <div><FieldLabel label="Display Name" /><TextField value={form.username} onChange={f('username')} /></div>
            <div><FieldLabel label="Email Address" /><TextField type="email" value={form.email} onChange={f('email')} /></div>
            <div><FieldLabel label="Nurse ID (Read-only)" /><TextField value={`NRS-${user.userId}`} readOnly /></div>
          </div>
        </div>
        <ActionBar status={status} onSave={handleSaveProfile} errorMsg={msg} />
      </SectionCard>

      <SectionCard iconBg="bg-teal-50"
        icon={<svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        title="Ward & Shift Assignment" subtitle="Your current ward and shift preferences.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><FieldLabel label="Assigned Ward" />
            <SelectField value={form.ward || 'General Ward A'} onChange={f('ward')} options={['ICU','General Ward A','General Ward B','Pediatrics Ward','Cardiac Care Unit','Emergency']} />
          </div>
          <div><FieldLabel label="Current Shift" />
            <SelectField value={form.shift || 'Morning (6 AM – 2 PM)'} onChange={f('shift')} options={['Morning (6 AM – 2 PM)','Afternoon (2 PM – 10 PM)','Night (10 PM – 6 AM)']} />
          </div>
          <div><FieldLabel label="Nurse Station" /><TextField value={form.nurse_station} onChange={f('nurse_station')} placeholder="e.g. Station 3 – North Wing" /></div>
          <div><FieldLabel label="Phone" /><TextField value={form.phone} onChange={f('phone')} placeholder="+1 (555) 000-0000" /></div>
        </div>
        <ActionBar status={status} onSave={handleSaveWard} errorMsg={msg} />
      </SectionCard>
    </div>
  );
}

function NurseGeneralInfo({ user, profileData, onSaved }: { user: UserProfile; profileData: ProfileData | null; onSaved: (d: ProfileData) => void }) {
  if (!profileData) return (
    <div className="space-y-5">
      {[1,2].map(i=><div key={i} className="settings-card"><Skeleton className="h-8 mb-4 w-48" />{[1,2,3].map(j=><Skeleton key={j} className="h-11 mb-3" />)}</div>)}
    </div>
  );
  return <NurseProfileForm user={user} initial={profileData} onSaved={onSaved} />;
}

function NurseSecurity({ user }: { user: UserProfile }) {
  return <PasswordForm userId={user.userId} accentColor="emerald" />;
}

function NurseNotifications() {
  const [s, setS] = useState({ vitals: true, med: true, emergency: true, handoff: true, lab: false });
  const [saved, setSaved] = useState(false);
  return (
    <SectionCard iconBg="bg-emerald-50"
      icon={<svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
      title="My Notification Preferences" subtitle="Configure alerts relevant to your nursing duties.">
      <Toggle id="n-vitals" checked={s.vitals} onChange={v=>setS(p=>({...p,vitals:v}))} label="Vitals Due Alerts" description="Remind me when patient vitals checks are due." />
      <Toggle id="n-med" checked={s.med} onChange={v=>setS(p=>({...p,med:v}))} label="Medication Round Alerts" description="Alerts for scheduled medication administration rounds." />
      <Toggle id="n-emergency" checked={s.emergency} onChange={v=>setS(p=>({...p,emergency:v}))} label="Emergency Call Alerts" description="Immediate alert for emergency call requests from assigned patients." />
      <Toggle id="n-handoff" checked={s.handoff} onChange={v=>setS(p=>({...p,handoff:v}))} label="Shift Handoff Reminders" description="30-minute warning before shift end for handoff report." />
      <Toggle id="n-lab" checked={s.lab} onChange={v=>setS(p=>({...p,lab:v}))} label="Lab Result Notifications" description="Notify when lab results arrive for assigned patients." />
      <div className="flex justify-end pt-4">
        <button onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000)}} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-[13.5px] font-semibold hover:bg-blue-700 transition-all shadow-[0_4px_14px_rgba(37,99,235,0.25)]">
          {saved ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Saved!</> : 'Save Preferences'}
        </button>
      </div>
    </SectionCard>
  );
}

// ─── Right Sidebar ────────────────────────────────────────────────────────────
function RightPanel({ role, clinicData, staffData }: { role: UserRole; clinicData: ClinicData | null; staffData: StaffMember[] }) {
  if (role === 'Admin') return (
    <div className="space-y-5">
      <div className="settings-card">
        <div className="flex items-start gap-3 mb-4">
          <div className="text-orange-500 mt-0.5"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
          <div>
            <h3 className="text-[14px] font-bold text-slate-900">Stock Alert Thresholds</h3>
            <p className="text-[12.5px] text-slate-500 mt-0.5">Global limits before reorder notifications trigger.</p>
          </div>
        </div>
        {clinicData ? (
          <div className="space-y-0">
            {[{ label: 'General Supplies', value: `${clinicData.general_supplies_threshold} Units`, color: 'text-slate-700' }, { label: 'Critical Medications', value: `${clinicData.critical_med_threshold} Units`, color: 'text-orange-600' }, { label: 'Surgical Equipment', value: `${clinicData.surgical_equip_threshold} Units`, color: 'text-red-600' }].map(item => (
              <div key={item.label} className="flex justify-between items-center text-[13px] py-2.5 border-b border-slate-100 last:border-0">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                <span className={`font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        ) : <Skeleton className="h-20" />}
      </div>
      <div className="settings-card">
        <h3 className="text-[14px] font-bold text-slate-900 mb-3">System Health</h3>
        {[{ label: 'Total Staff', value: staffData.length.toString(), color: 'text-blue-600' }, { label: 'Active Accounts', value: staffData.filter(s=>s.status==='active').length.toString(), color: 'text-emerald-600' }, { label: 'Server Uptime', value: '99.97%', color: 'text-slate-700' }].map(s => (
          <div key={s.label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
            <span className="text-[12.5px] text-slate-600">{s.label}</span>
            <span className={`text-[13px] font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (role === 'Doctor') return (
    <div className="space-y-5">
      <div className="settings-card">
        <h3 className="text-[14px] font-bold text-slate-900 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          {[{ label: 'Patients Today', value: '12' }, { label: 'Pending Labs', value: '4' }, { label: 'This Month', value: '248' }, { label: 'Avg. Duration', value: '28m' }].map(s => (
            <div key={s.label} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[16px] font-bold text-slate-900">{s.value}</div>
              <div className="text-[11px] text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (role === 'Nurse') return (
    <div className="space-y-5">
      <div className="settings-card">
        <h3 className="text-[14px] font-bold text-slate-900 mb-3">Shift Summary</h3>
        {[{ label: 'Patients Assigned', value: '8' }, { label: 'Vitals Recorded', value: '24' }, { label: 'Medications Given', value: '16' }, { label: 'Hours Remaining', value: '3h 20m' }].map(s => (
          <div key={s.label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
            <span className="text-[12.5px] text-slate-600">{s.label}</span>
            <span className="text-[13px] font-bold text-slate-900">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return null;
}

// ─── Tab routing ──────────────────────────────────────────────────────────────
const ROLE_TABS: Record<string, string[]> = {
  Admin:  ['General Info', 'Security', 'Notifications', 'Billing & Plans'],
  Doctor: ['General Info', 'Security', 'Notifications'],
  Nurse:  ['General Info', 'Security', 'Notifications'],
};

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function Settings() {
  const [user, setUser]         = useState<UserProfile>({ username: 'Staff User', role: 'Admin', userId: '' });
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [clinicData,  setClinicData]  = useState<ClinicData  | null>(null);
  const [staffData,   setStaffData]   = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('General Info');
  const [hydrated, setHydrated]   = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('userName') || 'Staff User';
    const storedRole     = (localStorage.getItem('userRole') || 'Admin') as UserRole;
    const storedId       = localStorage.getItem('userId') || '';
    const cachedAvatar   = localStorage.getItem('userAvatar') || '';

    const currentUser: UserProfile = { username: storedUsername, role: storedRole, userId: storedId, avatarUrl: cachedAvatar };
    setUser(currentUser);
    setHydrated(true);

    if (!storedId) return;

    // Fetch profile
    fetch(`/api/settings/profile?userId=${storedId}`)
      .then(r => r.json())
      .then(data => { if (data.success) setProfileData(data.profile); })
      .catch(console.error);

    // Fetch avatar
    fetch(`/api/user/avatar?userId=${storedId}`)
      .then(r => r.json())
      .then(data => {
        if (data.avatarUrl) {
          localStorage.setItem('userAvatar', data.avatarUrl);
          setUser(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
        }
      }).catch(() => {});

    // Admin-only data
    if (storedRole === 'Admin') {
      fetch('/api/settings/clinic')
        .then(r => r.json())
        .then(data => { if (data.success) setClinicData(data.clinic); })
        .catch(console.error);

      setStaffLoading(true);
      fetch('/api/settings/staff')
        .then(r => r.json())
        .then(data => { if (data.success) setStaffData(data.staff); })
        .catch(console.error)
        .finally(() => setStaffLoading(false));
    }
  }, []);

  const role = user.role as UserRole;
  const tabs = ROLE_TABS[role] || ROLE_TABS['Admin'];
  const validTab = tabs.includes(activeTab) ? activeTab : tabs[0];
  const roleStyle = ROLE_STYLES[role] || ROLE_STYLES['Admin'];

  const handleSaveProfile = useCallback((d: ProfileData) => {
    setProfileData(d);
    setUser(prev => ({ ...prev, username: d.username }));
    localStorage.setItem('userName', d.username);
  }, []);

  const handleSaveClinic = useCallback((d: ClinicData) => {
    setClinicData(d);
  }, []);

  const renderContent = () => {
    if (role === 'Admin') {
      if (validTab === 'General Info')    return <AdminGeneralInfo user={user} profileData={profileData} clinicData={clinicData} staffData={staffData} staffLoading={staffLoading} onSaveProfile={handleSaveProfile} onSaveClinic={handleSaveClinic} />;
      if (validTab === 'Security')        return <AdminSecurity user={user} />;
      if (validTab === 'Notifications')   return <AdminNotifications />;
      if (validTab === 'Billing & Plans') return <AdminBilling clinicData={clinicData} />;
    }
    if (role === 'Doctor') {
      if (validTab === 'General Info')  return <DoctorGeneralInfo user={user} profileData={profileData} onSaved={handleSaveProfile} />;
      if (validTab === 'Security')      return <DoctorSecurity user={user} />;
      if (validTab === 'Notifications') return <DoctorNotifications />;
    }
    if (role === 'Nurse') {
      if (validTab === 'General Info')  return <NurseGeneralInfo user={user} profileData={profileData} onSaved={handleSaveProfile} />;
      if (validTab === 'Security')      return <NurseSecurity user={user} />;
      if (validTab === 'Notifications') return <NurseNotifications />;
    }
    return null;
  };

  if (!hydrated) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <Head>
        <title>Settings | Medixora</title>
        <meta name="description" content="Manage your Medixora account settings, preferences and security." />
      </Head>

      <style>{`
        .settings-card { background: white; border-radius: 16px; border: 1px solid #e8edf5; box-shadow: 0 1px 3px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.03); padding: 24px; }
        .tab-btn { position: relative; padding: 10px 4px; font-size: 13.5px; font-weight: 500; border-bottom: 2px solid transparent; transition: all 0.15s ease; white-space: nowrap; color: #64748b; }
        .tab-btn:hover { color: #1e293b; border-bottom-color: #cbd5e1; }
        .tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; font-weight: 600; }
      `}</style>

      <div className="mx-auto max-w-[1280px] space-y-6 pb-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-[13.5px] text-slate-500 mt-1">Manage your preferences and account details.</p>
          </div>
          <div className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl border ${roleStyle.border} ${roleStyle.bg} shadow-sm self-start sm:self-auto`}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${roleStyle.dot}`} />
              <span className={`text-[12px] font-bold uppercase tracking-widest ${roleStyle.text}`}>{role}</span>
            </div>
            <div className="w-px h-4 bg-current opacity-20" />
            <span className="text-[13px] font-semibold text-slate-700">{user.username}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex gap-6 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab} id={`settings-tab-${tab.toLowerCase().replace(/[\s&]/g, '-')}`}
                onClick={() => setActiveTab(tab)} className={`tab-btn ${validTab === tab ? 'active' : ''}`}>
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Role info banner (non-admin) */}
        {role !== 'Admin' && (
          <div className={`flex items-start gap-3 p-4 rounded-xl border ${roleStyle.border} ${roleStyle.bg}`}>
            <span className={roleStyle.text}>{roleStyle.icon}</span>
            <div>
              <span className={`text-[13px] font-semibold ${roleStyle.text}`}>{role} Account — Limited Settings</span>
              <p className="text-[12.5px] text-slate-600 mt-0.5">
                {role === 'Doctor' ? 'Some clinic-wide settings are managed by the Administrator.' : 'Billing and system-wide settings are managed by the Administrator.'}
              </p>
            </div>
          </div>
        )}

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">{renderContent()}</div>
          <div><RightPanel role={role} clinicData={clinicData} staffData={staffData} /></div>
        </div>

      </div>
    </>
  );
}
