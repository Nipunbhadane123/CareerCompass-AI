import React, { useState, useEffect } from 'react';
import {
  Briefcase, Search, Sparkles, CheckCircle2, AlertCircle,
  Bookmark, BookmarkCheck, ArrowRight, Layers, FileText, Send
} from 'lucide-react';
import { api } from '../api/client';
import { JobListing, JobMatch, SavedJob } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const JobMatchingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'listings' | 'custom' | 'saved'>('listings');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Match modal
  const [selectedMatch, setSelectedMatch] = useState<JobMatch | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  // Custom JD Form
  const [customTitle, setCustomTitle] = useState('Software Engineer');
  const [customCompany, setCustomCompany] = useState('Target Employer');
  const [customJD, setCustomJD] = useState('');
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [jobsData, savedData] = await Promise.all([
        api.listJobs(),
        api.getSavedJobs().catch(() => []),
      ]);
      setJobs(jobsData);
      setSavedJobs(savedData);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMatchJob = async (jobId: number) => {
    setIsMatching(true);
    try {
      const match = await api.matchJob(jobId);
      setSelectedMatch(match);
    } catch (err: any) {
      alert(`Match calculation failed: ${err.message}`);
    } finally {
      setIsMatching(false);
    }
  };

  const handleCustomMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customJD.trim()) return;
    setIsSubmittingCustom(true);
    try {
      const match = await api.matchCustomJD({
        job_title: customTitle,
        company_name: customCompany,
        job_description: customJD,
      });
      setSelectedMatch(match);
    } catch (err: any) {
      alert(`Custom match failed: ${err.message}`);
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  const handleSaveJob = async (jobId: number) => {
    try {
      const saved = await api.saveJob(jobId, 'saved');
      setSavedJobs(prev => [...prev.filter(j => j.job_id !== jobId), saved]);
      alert('Job added to your application tracker!');
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const handleUpdateStatus = async (savedId: number, status: string) => {
    try {
      const updated = await api.updateSavedJobStatus(savedId, status);
      setSavedJobs(prev => prev.map(j => (j.id === savedId ? updated : j)));
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleDeleteSaved = async (savedId: number) => {
    try {
      await api.deleteSavedJob(savedId);
      setSavedJobs(prev => prev.filter(j => j.id !== savedId));
    } catch (err: any) {
      alert(`Remove failed: ${err.message}`);
    }
  };

  const isJobSaved = (jobId: number) => savedJobs.some(s => s.job_id === jobId);

  const filteredJobs = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase()) ||
    j.description.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner text="Loading job matching intelligence..." size="lg" />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Job Matching & Application Tracker
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Evaluate resume-to-job compatibility, analyze custom job descriptions, and track your active application pipeline.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-canvas-border pb-1">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'listings'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Curated Vacancies ({filteredJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'custom'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Custom JD Analyzer
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'saved'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Application Tracker ({savedJobs.length})
        </button>
      </div>

      {/* TAB 1: CURATED VACANCIES */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="p-4 rounded-2xl bg-canvas-card border border-canvas-border shadow-md">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs by title, company, or tech stack..."
                className="w-full pl-10 pr-4 py-2 bg-canvas-surface border border-canvas-border rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="p-6 rounded-2xl bg-canvas-card border border-canvas-border hover:border-indigo-500/50 shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="cyan">{job.domain}</Badge>
                        {job.is_sample && (
                          <Badge variant="neutral">Curated Demo Vacancy</Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white mt-2">{job.title}</h3>
                      <p className="text-xs text-indigo-400 font-medium">{job.company} • {job.location}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSaveJob(job.id)}
                      className={`p-2 rounded-xl border transition-colors ${
                        isJobSaved(job.id)
                          ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/50'
                          : 'bg-canvas-surface text-slate-400 border-slate-700/60 hover:text-white'
                      }`}
                      title={isJobSaved(job.id) ? 'Saved' : 'Save job'}
                    >
                      {isJobSaved(job.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-canvas-border">
                    <span>Comp: <strong className="text-white">{job.salary_range}</strong></span>
                    <span>Level: <strong className="text-slate-300">{job.experience_level}</strong></span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {job.required_skills.map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-canvas-border">
                  <button
                    type="button"
                    onClick={() => handleMatchJob(job.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Calculate Compatibility Match
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOM JD ANALYZER */}
      {activeTab === 'custom' && (
        <div className="max-w-3xl mx-auto p-7 rounded-2xl bg-canvas-card border border-canvas-border shadow-xl space-y-5">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Paste Any External Job Description</h3>
            <p className="text-xs text-slate-400 mt-1">
              Found an opening on LinkedIn, Greenhouse, or Indeed? Paste the description below to compute match scores and resume optimization tips.
            </p>
          </div>

          <form onSubmit={handleCustomMatch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Job Title
                </label>
                <input
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-4 py-2 bg-canvas-surface border border-canvas-border rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  placeholder="e.g. Stripe, OpenAI, etc."
                  className="w-full px-4 py-2 bg-canvas-surface border border-canvas-border rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Job Description Text
              </label>
              <textarea
                rows={8}
                required
                value={customJD}
                onChange={(e) => setCustomJD(e.target.value)}
                placeholder="Paste the job description, required qualifications, and responsibilities here..."
                className="w-full p-4 bg-canvas-surface border border-canvas-border rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingCustom}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmittingCustom ? 'Analyzing Compatibility...' : 'Run Compatibility Audit'}
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: SAVED JOBS TRACKER */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedJobs.map((item) => (
                <div
                  key={item.id}
                  className="p-6 rounded-2xl bg-canvas-card border border-canvas-border shadow-md space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                        className="px-2.5 py-1 bg-canvas-surface border border-canvas-border rounded-lg text-xs font-semibold text-indigo-400 focus:outline-none"
                      >
                        <option value="saved">Saved</option>
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offered">Offered</option>
                        <option value="rejected">Archived</option>
                      </select>

                      <button
                        onClick={() => handleDeleteSaved(item.id)}
                        className="text-xs text-rose-400 hover:text-rose-300"
                      >
                        Remove
                      </button>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white">{item.job.title}</h4>
                      <p className="text-xs text-slate-400">{item.job.company} • {item.job.location}</p>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2">{item.job.description}</p>
                  </div>

                  <div className="pt-3 border-t border-canvas-border flex items-center justify-between text-[11px] text-slate-500">
                    <span>Saved: {new Date(item.created_at).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleMatchJob(item.job_id)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Match Score
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-canvas-card border border-canvas-border rounded-2xl">
              <Bookmark className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">No Jobs Tracked Yet</h3>
              <p className="text-xs text-slate-400 mt-1">Bookmark any job from the Curated Vacancies tab to track application status.</p>
            </div>
          )}
        </div>
      )}

      {/* Match Result Modal */}
      <Modal
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        title={`Job Compatibility: ${selectedMatch?.job_title}`}
        maxWidth="2xl"
      >
        {selectedMatch && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-canvas-surface/60 border border-canvas-border flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">{selectedMatch.company}</span>
                <div className="text-3xl font-extrabold text-white mt-0.5">
                  {selectedMatch.compatibility_score}% <span className="text-xs font-normal text-slate-400">Match Index</span>
                </div>
              </div>
              <Badge variant={selectedMatch.compatibility_score >= 70 ? 'success' : 'warning'}>
                {selectedMatch.experience_alignment} Alignment
              </Badge>
            </div>

            {/* Matched vs Missing Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-canvas-surface/40 border border-canvas-border">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Matched Skills ({selectedMatch.matched_skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMatch.matched_skills.map((s) => (
                    <Badge key={s} variant="success">{s}</Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-canvas-surface/40 border border-canvas-border">
                <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-3.5 h-3.5" /> Missing Requirements ({selectedMatch.missing_skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMatch.missing_skills.map((s) => (
                    <Badge key={s} variant="danger">{s}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Resume Tailoring Advice */}
            <div className="p-4 rounded-xl bg-canvas/60 border border-slate-700/60">
              <span className="text-xs font-semibold text-indigo-400 block mb-2">Resume Tailoring Guidance:</span>
              <ul className="space-y-2 text-xs text-slate-300">
                {selectedMatch.tailoring_advice.map((adv, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-400">•</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
