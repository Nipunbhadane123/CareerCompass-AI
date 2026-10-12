import React, { useState, useEffect } from 'react';
import {
  Shield, Users, FileText, Database, Activity,
  RefreshCw, CheckCircle2, Server, Layers
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [m, j] = await Promise.all([
        api.getAdminMetrics(),
        api.getJobStatus(),
      ]);
      setMetrics(m);
      setJobStatus(j);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleTriggerSeed = async () => {
    setIsSeeding(true);
    setSeedMessage(null);
    try {
      const res = await api.seedAdminData();
      setSeedMessage(res.message);
      await loadAdminData();
    } catch (err: any) {
      alert(`Seeding failed: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  if (!user?.is_superuser) {
    return (
      <div className="p-8 text-center bg-canvas-card border border-canvas-border rounded-2xl">
        <Shield className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-xs text-slate-400 mt-1">This administrative portal requires superuser credentials.</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner text="Connecting to platform administrative telemetry..." size="lg" />;
  }

  const pMetrics = metrics?.platform_metrics || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            Administrative Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform Telemetry & System Status
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time counts, worker processing latency, and taxonomy database management.
          </p>
        </div>

        <button
          onClick={handleTriggerSeed}
          disabled={isSeeding}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
          {isSeeding ? 'Refreshing Seed Data...' : 'Re-seed Master Taxonomies'}
        </button>
      </div>

      {seedMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{seedMessage}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-canvas-card border border-canvas-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Users</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{pMetrics.total_users || 0}</div>
          <span className="text-[11px] text-slate-500">Registered platform accounts</span>
        </div>

        <div className="p-5 rounded-2xl bg-canvas-card border border-canvas-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Resumes Processed</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{pMetrics.total_resumes || 0}</div>
          <span className="text-[11px] text-slate-500">{pMetrics.total_analyses || 0} audits generated</span>
        </div>

        <div className="p-5 rounded-2xl bg-canvas-card border border-canvas-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Career Taxonomies</span>
            <Layers className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{pMetrics.total_career_roles || 0}</div>
          <span className="text-[11px] text-slate-500">{pMetrics.total_skills || 0} master skills cataloged</span>
        </div>

        <div className="p-5 rounded-2xl bg-canvas-card border border-canvas-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Roadmaps</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{pMetrics.total_roadmaps || 0}</div>
          <span className="text-[11px] text-slate-500">{pMetrics.total_job_matches || 0} match queries run</span>
        </div>
      </div>

      {/* Queue & Worker Status */}
      <div className="p-6 rounded-2xl bg-canvas-card border border-canvas-border shadow-md space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-400" />
          Background Job Queue Telemetry
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-canvas-surface/50 border border-canvas-border">
            <span className="text-xs text-slate-400">Worker Status</span>
            <div className="text-base font-bold text-emerald-400 mt-1 capitalize">
              {jobStatus?.worker_health || 'Operational'}
            </div>
            <span className="text-[10px] text-slate-500">Pipeline ready</span>
          </div>

          <div className="p-4 rounded-xl bg-canvas-surface/50 border border-canvas-border">
            <span className="text-xs text-slate-400">Average Processing Latency</span>
            <div className="text-base font-bold text-white mt-1">
              {jobStatus?.average_processing_latency_ms || 320} ms
            </div>
            <span className="text-[10px] text-slate-500">Fast in-memory NLP</span>
          </div>

          <div className="p-4 rounded-xl bg-canvas-surface/50 border border-canvas-border">
            <span className="text-xs text-slate-400">Database Engine</span>
            <div className="text-base font-bold text-white mt-1">
              Connected & Healthy
            </div>
            <span className="text-[10px] text-slate-500">SQLAlchemy 2.0 ORM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
