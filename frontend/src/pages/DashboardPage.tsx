import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Compass, Briefcase, Map, ArrowRight,
  Sparkles, CheckCircle2, AlertTriangle, TrendingUp,
  Award, Clock, ExternalLink
} from 'lucide-react';
import { api } from '../api/client';
import { DashboardSummary } from '../types';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const summary = await api.getDashboardSummary();
        setData(summary);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard summary');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Aggregating career intelligence..." size="lg" />;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-rose-400 mb-4">{error || 'Failed to load data'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 rounded-lg text-white text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const { user, resume, career_recommendations, active_roadmap, job_tracker } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/40 via-violet-900/20 to-canvas-card border border-indigo-500/30 p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Targeting: {user.target_role}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user.full_name}
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              {user.headline || 'Complete your career intelligence profile to unlock personalized recommendations.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/resumes"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              <FileText className="w-4 h-4" />
              Audit Resume
            </Link>
            <Link
              to="/careers"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-canvas-surface hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <Compass className="w-4 h-4" />
              Explore Roles
            </Link>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Completeness */}
        <div className="p-5 rounded-2xl bg-canvas-card border border-canvas-border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Profile Completeness</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white">{user.completeness_score}%</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${user.completeness_score}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-500 mt-2">Verified profile benchmark</span>
        </div>

        {/* Metric 2: ATS Score */}
        <div className="p-5 rounded-2xl bg-canvas-card border border-canvas-border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Latest ATS Audit</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white">
              {resume.analysis ? `${resume.analysis.ats_score}/100` : 'Not uploaded'}
            </div>
            <div className="text-xs text-emerald-400 mt-1 font-medium">
              {resume.analysis ? (resume.analysis.ats_score >= 70 ? 'Strong ATS Format' : 'Optimization Recommended') : 'Upload resume to audit'}
            </div>
          </div>
          <span className="text-[11px] text-slate-500 mt-2">Based on section structure & metrics</span>
        </div>

        {/* Metric 3: Top Role Fit */}
        <div className="p-5 rounded-2xl bg-canvas-card border border-canvas-border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Top Role Fit</span>
            <TrendingUp className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white">
              {career_recommendations[0] ? `${career_recommendations[0].match_score}%` : 'N/A'}
            </div>
            <div className="text-xs text-violet-400 mt-1 truncate font-medium">
              {career_recommendations[0]?.role.title || 'Browse catalog'}
            </div>
          </div>
          <span className="text-[11px] text-slate-500 mt-2">Weighted skill-match formula</span>
        </div>

        {/* Metric 4: Active Roadmap */}
        <div className="p-5 rounded-2xl bg-canvas-card border border-canvas-border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Roadmap Progress</span>
            <Map className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white">
              {active_roadmap ? `${active_roadmap.progress_percentage}%` : '0%'}
            </div>
            <div className="text-xs text-cyan-400 mt-1 font-medium">
              {active_roadmap ? `${active_roadmap.completed_steps}/${active_roadmap.total_steps} milestones complete` : 'No active roadmap'}
            </div>
          </div>
          <span className="text-[11px] text-slate-500 mt-2">Prioritized learning milestones</span>
        </div>
      </div>

      {/* Main Content Split: Recommendations & Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 spans): Career Recommendations & Resume Analysis */}
        <div className="lg:col-span-2 space-y-8">
          {/* Top Career Recommendations */}
          <div className="rounded-2xl bg-canvas-card border border-canvas-border p-6 shadow-md">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Top Recommended Roles</h3>
                <p className="text-xs text-slate-400 mt-0.5">Calculated using our transparent 4-part compatibility engine.</p>
              </div>
              <Link to="/careers" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                View All Catalog <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {career_recommendations.length > 0 ? (
                career_recommendations.map((rec) => (
                  <div
                    key={rec.role.id}
                    className="p-4 rounded-xl bg-canvas-surface/50 border border-canvas-border/80 hover:border-indigo-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{rec.role.title}</span>
                        <Badge variant="cyan">{rec.role.domain}</Badge>
                        <Badge variant={rec.match_score >= 70 ? 'success' : 'warning'}>
                          {rec.match_score}% Match
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{rec.role.description}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>Salary: <strong className="text-slate-300">{rec.role.average_salary}</strong></span>
                        <span>•</span>
                        <span>{rec.readiness_level}</span>
                      </div>
                    </div>

                    <Link
                      to={`/careers`}
                      className="px-3 py-1.5 rounded-lg bg-canvas-card hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 shrink-0 text-center"
                    >
                      Diagnose Gaps
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  No roles evaluated yet. Browse the career catalog to view positions.
                </div>
              )}
            </div>
          </div>

          {/* Resume Intelligence Snapshot */}
          <div className="rounded-2xl bg-canvas-card border border-canvas-border p-6 shadow-md">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Resume Intelligence Diagnostics</h3>
                <p className="text-xs text-slate-400 mt-0.5">Automated ATS parsing feedback and actionable suggestions.</p>
              </div>
              <Link to="/resumes" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                Full Audit Report <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {resume.analysis ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-canvas-surface/40 border border-canvas-border text-xs text-slate-300 leading-relaxed">
                  <strong className="text-indigo-400 block mb-1">Executive Assessment:</strong>
                  {resume.analysis.summary}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-canvas-surface/40 border border-canvas-border">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {resume.analysis.strengths.slice(0, 2).map((s: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-canvas-surface/40 border border-canvas-border">
                    <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5" /> Improvement Areas
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {resume.analysis.recommendations.slice(0, 2).map((r: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 mt-0.5">•</span>
                          <span>{r.suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-canvas-border rounded-xl">
                <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-3">No resume has been uploaded for analysis yet.</p>
                <Link
                  to="/resumes"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Upload Resume (PDF/DOCX)
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 span): Active Roadmap & Application Tracker */}
        <div className="space-y-8">
          {/* Active Learning Roadmap */}
          <div className="rounded-2xl bg-canvas-card border border-canvas-border p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white tracking-tight">Active Roadmap</h3>
              <Link to="/roadmap" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                View Roadmap
              </Link>
            </div>

            {active_roadmap ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">{active_roadmap.title}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2 mb-1">
                    <span>Progress</span>
                    <span className="font-semibold text-indigo-400">{active_roadmap.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full transition-all"
                      style={{ width: `${active_roadmap.progress_percentage}%` }}
                    />
                  </div>
                </div>

                {active_roadmap.next_step && (
                  <div className="p-3.5 rounded-xl bg-canvas-surface/60 border border-canvas-border">
                    <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block">
                      Next Priority Milestone
                    </span>
                    <p className="text-xs font-bold text-white mt-1">{active_roadmap.next_step.title}</p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Est: {active_roadmap.next_step.estimated_hours} hrs</span>
                      <span>•</span>
                      <Badge variant="cyan">{active_roadmap.next_step.skill_name}</Badge>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-canvas-border rounded-xl">
                <Map className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-3">No active learning plan yet.</p>
                <Link
                  to="/roadmap"
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                >
                  Generate Roadmap
                </Link>
              </div>
            )}
          </div>

          {/* Application Tracker Pipeline */}
          <div className="rounded-2xl bg-canvas-card border border-canvas-border p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white tracking-tight">Job Application Pipeline</h3>
              <Link to="/jobs" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                Jobs Tracker
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-canvas-surface/50 border border-canvas-border text-center">
                <span className="text-xs text-slate-400">Saved</span>
                <div className="text-xl font-bold text-white mt-1">{job_tracker.saved}</div>
              </div>
              <div className="p-3 rounded-xl bg-canvas-surface/50 border border-canvas-border text-center">
                <span className="text-xs text-slate-400">Applied</span>
                <div className="text-xl font-bold text-indigo-400 mt-1">{job_tracker.applied}</div>
              </div>
              <div className="p-3 rounded-xl bg-canvas-surface/50 border border-canvas-border text-center">
                <span className="text-xs text-slate-400">Interviewing</span>
                <div className="text-xl font-bold text-amber-400 mt-1">{job_tracker.interviewing}</div>
              </div>
              <div className="p-3 rounded-xl bg-canvas-surface/50 border border-canvas-border text-center">
                <span className="text-xs text-slate-400">Offers</span>
                <div className="text-xl font-bold text-emerald-400 mt-1">{job_tracker.offered}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
