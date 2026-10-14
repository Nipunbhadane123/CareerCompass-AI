import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Settings as SettingsIcon, Shield, Download,
  Trash2, Save, CheckCircle2, AlertTriangle, Cpu
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Profile } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [headline, setHeadline] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [learningPace, setLearningPace] = useState('moderate');
  const [careerGoals, setCareerGoals] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await api.getProfile();
        setProfile(data);
        setHeadline(data.headline || '');
        setTargetRole(data.target_role || 'Full-Stack Software Engineer');
        setEducationLevel(data.education_level || "Bachelor's Degree");
        setLearningPace(data.learning_pace || 'moderate');
        setCareerGoals(data.career_goals || '');
      } catch (err) {
        console.error('Failed to load profile settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await api.updateProfile({
        headline,
        target_role: targetRole,
        education_level: educationLevel,
        learning_pace: learningPace,
        career_goals: careerGoals,
      });
      setProfile(updated);
      await refreshUser();
      setMessage('Settings updated successfully!');
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const fullArchive = await api.exportUserData();
      const blob = new Blob([JSON.stringify(fullArchive, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `careercompass-gdpr-archive-${user?.id || 'export'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };


  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete your account, uploaded resumes, and all associated career records? This action cannot be undone.')) {
      return;
    }
    try {
      await api.deleteAccount();
      logout();
      navigate('/');
    } catch (err: any) {
      alert(`Account deletion failed: ${err.message}`);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading preferences..." size="lg" />;
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          User Settings & Privacy Controls
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your career target preferences, data exports, and privacy permissions.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Profile Settings Form */}
      <div className="p-7 rounded-2xl bg-canvas-card border border-canvas-border shadow-md space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" />
          Career Profile & Target Preferences
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Professional Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-4 py-2.5 bg-canvas-surface border border-canvas-border rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Career Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-canvas-surface border border-canvas-border rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Full-Stack Software Engineer">Full-Stack Software Engineer</option>
                <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                <option value="Cloud & DevOps Engineer">Cloud & DevOps Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Backend Platform Engineer">Backend Platform Engineer</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Study Pace
              </label>
              <select
                value={learningPace}
                onChange={(e) => setLearningPace(e.target.value)}
                className="w-full px-4 py-2.5 bg-canvas-surface border border-canvas-border rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="steady">Steady (5-8 hrs/week)</option>
                <option value="moderate">Moderate (10-15 hrs/week)</option>
                <option value="intensive">Intensive (20+ hrs/week)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Long-Term Career Objective
            </label>
            <textarea
              rows={3}
              value={careerGoals}
              onChange={(e) => setCareerGoals(e.target.value)}
              className="w-full p-4 bg-canvas-surface border border-canvas-border rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* AI Intelligence Provider Status */}
      <div className="p-7 rounded-2xl bg-canvas-card border border-canvas-border shadow-md space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-violet-400" />
          AI & NLP Engine Configuration
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          CareerCompass AI features a hybrid architecture. The active engine automatically falls back to deterministic rule-based algorithms to guarantee 100% uptime when external API keys are unavailable.
        </p>
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-canvas-surface/50 border border-canvas-border text-xs text-slate-300">
          <span className="font-semibold text-white">Active Engine Mode:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono text-[11px]">
            Hybrid (Deterministic & Gemini Compatible)
          </span>
        </div>
      </div>

      {/* Data Export & GDPR Controls */}
      <div className="p-7 rounded-2xl bg-canvas-card border border-canvas-border shadow-md space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          Data Portability & Erasure (GDPR)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          You retain full ownership of your data. You can download an offline archive of your complete profile or permanently purge your account.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportData}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-canvas-surface hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export My Data (JSON)
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Permanently Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};
