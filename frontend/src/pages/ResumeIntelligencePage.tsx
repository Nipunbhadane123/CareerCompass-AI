import React, { useState, useEffect } from 'react';
import {
  Upload, FileText, CheckCircle2, AlertTriangle, Sparkles,
  Download, Trash2, Edit3, Save, RefreshCw, Layers
} from 'lucide-react';
import { api } from '../api/client';
import { Resume, ResumeAnalysis } from '../types';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ResumeIntelligencePage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [activeTab, setActiveTab] = useState<'audit' | 'profile' | 'edit'>('audit');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editSummary, setEditSummary] = useState('');

  const loadResumes = async () => {
    try {
      setIsLoading(true);
      const data = await api.listResumes();
      setResumes(data);
      if (data.length > 0) {
        setSelectedResume(data[0]);
        if (data[0].latest_analysis) {
          setEditSummary(data[0].latest_analysis.summary || '');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load resumes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const newResume = await api.uploadResume(file);
      setResumes(prev => [newResume, ...prev]);
      setSelectedResume(newResume);
      if (newResume.latest_analysis) {
        setEditSummary(newResume.latest_analysis.summary || '');
      }
    } catch (err: any) {
      setError(err.message || 'Resume upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedResume || !selectedResume.latest_analysis) return;
    try {
      const updated = await api.updateResumeAnalysis(selectedResume.id, {
        summary: editSummary,
      });
      setSelectedResume({
        ...selectedResume,
        latest_analysis: updated,
      });
      alert('Resume analysis updated successfully!');
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleDelete = async (resumeId: number) => {
    if (!window.confirm('Are you sure you want to delete this resume and its analysis?')) return;
    try {
      await api.deleteResume(resumeId);
      const remaining = resumes.filter(r => r.id !== resumeId);
      setResumes(remaining);
      setSelectedResume(remaining[0] || null);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Retrieving resume intelligence records..." size="lg" />;
  }

  const analysis = selectedResume?.latest_analysis;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Resume Intelligence & ATS Audit
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Deep structured document parsing, ATS compatibility benchmarking, and actionable revision guidance.
          </p>
        </div>

        {selectedResume && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-canvas-card border border-canvas-border hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export Report
            </button>
            <button
              onClick={() => handleDelete(selectedResume.id)}
              className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs transition-colors"
              title="Delete resume"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="border-2 border-dashed border-canvas-border hover:border-indigo-500/50 rounded-2xl p-7 bg-canvas-card/40 transition-colors text-center">
        <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
        <label className="cursor-pointer">
          <span className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
            {isUploading ? 'Extracting document...' : 'Upload new resume'}
          </span>
          <span className="text-sm text-slate-400"> (PDF, DOCX, or TXT)</span>
          <input
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            disabled={isUploading}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
        </label>
        <p className="text-xs text-slate-500 mt-1">Supports files up to 10MB with instant parsing</p>
      </div>

      {selectedResume && analysis ? (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-canvas-card border border-canvas-border shadow-lg">
            {/* ATS Score Dial */}
            <div className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-canvas-surface/40 border border-canvas-border">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                ATS Readability
              </span>
              <div className="relative flex items-center justify-center w-24 h-24">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={analysis.ats_score >= 70 ? 'text-emerald-500' : 'text-amber-500'}
                    strokeDasharray={`${analysis.ats_score}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-2xl font-extrabold text-white">
                  {analysis.ats_score}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-2 font-medium">
                {analysis.ats_score >= 75 ? 'Excellent ATS Structure' : 'Optimization Recommended'}
              </span>
            </div>

            {/* Document metadata */}
            <div className="md:col-span-3 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-base font-bold text-white">{selectedResume.filename}</span>
                  <Badge variant="cyan">{selectedResume.file_type.toUpperCase()}</Badge>
                  <Badge variant="neutral">{(selectedResume.file_size_bytes / 1024).toFixed(1)} KB</Badge>
                  <Badge variant="secondary">Engine: {analysis.ai_provider}</Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mt-2 bg-canvas-surface/50 p-3.5 rounded-xl border border-canvas-border">
                  <strong className="text-indigo-400 block mb-0.5">Executive Summary:</strong>
                  {analysis.summary}
                </p>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-canvas-border pb-1">
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'audit'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Actionable Audit & Suggestions
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Extracted Structured Details
                </button>
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'edit'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Review & Manual Edits
                </button>
              </div>
            </div>
          </div>

          {/* TAB 1: AUDIT & RECOMMENDATIONS */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              {/* Strengths & Weaknesses Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-canvas-card border border-canvas-border shadow-md">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Verified Strengths ({analysis.strengths.length})
                  </h3>
                  <ul className="space-y-2.5">
                    {analysis.strengths.map((str: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-canvas-surface/40 p-3 rounded-xl border border-canvas-border">
                        <span className="text-emerald-400 font-bold mt-0.5">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-canvas-card border border-canvas-border shadow-md">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Weaknesses & Gaps ({analysis.weaknesses.length})
                  </h3>
                  <ul className="space-y-2.5">
                    {analysis.weaknesses.map((w: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-canvas-surface/40 p-3 rounded-xl border border-canvas-border">
                        <span className="text-amber-400 font-bold mt-0.5">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Recommendations with Google X-Y-Z formula */}
              <div className="p-6 rounded-2xl bg-canvas-card border border-canvas-border shadow-md">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Prioritized Recommendations & Rationale
                </h3>
                <div className="space-y-4">
                  {analysis.recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-canvas-surface/60 border border-canvas-border">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="primary">{rec.category}</Badge>
                        <span className="text-[11px] text-slate-500 font-mono">Priority #{idx + 1}</span>
                      </div>
                      <p className="text-xs text-slate-300 mb-1.5"><strong className="text-white">Issue Identified:</strong> {rec.issue}</p>
                      <p className="text-xs text-indigo-300 mb-2 font-medium"><strong className="text-white">Action:</strong> {rec.suggestion}</p>
                      <p className="text-[11px] text-slate-400 bg-canvas/60 p-2.5 rounded-lg border border-slate-700/60 leading-relaxed">
                        <strong className="text-slate-300">ATS / Hiring Rationale:</strong> {rec.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXTRACTED STRUCTURED DATA */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Skills breakdown */}
              <div className="p-6 rounded-2xl bg-canvas-card border border-canvas-border shadow-md space-y-4">
                <h3 className="text-sm font-bold text-white">Extracted Skills Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1.5 font-medium">Programming & Languages</span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.extracted_skills?.languages?.map((s: string) => (
                        <Badge key={s} variant="primary">{s}</Badge>
                      )) || <span className="text-xs text-slate-500">None detected</span>}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-1.5 font-medium">Frameworks & Libraries</span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.extracted_skills?.frameworks?.map((s: string) => (
                        <Badge key={s} variant="secondary">{s}</Badge>
                      )) || <span className="text-xs text-slate-500">None detected</span>}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-1.5 font-medium">Databases & Storage</span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.extracted_skills?.databases?.map((s: string) => (
                        <Badge key={s} variant="cyan">{s}</Badge>
                      )) || <span className="text-xs text-slate-500">None detected</span>}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-1.5 font-medium">Cloud & DevOps Tools</span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.extracted_skills?.tools_and_platforms?.map((s: string) => (
                        <Badge key={s} variant="neutral">{s}</Badge>
                      )) || <span className="text-xs text-slate-500">None detected</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Experience and Education */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-canvas-card border border-canvas-border shadow-md">
                  <h3 className="text-sm font-bold text-white mb-3">Work Experience Timeline</h3>
                  <div className="space-y-4">
                    {analysis.extracted_experience?.map((exp: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-canvas-surface/40 border border-canvas-border">
                        <div className="text-xs font-bold text-white">{exp.title}</div>
                        <div className="text-[11px] text-indigo-400">{exp.company} • {exp.duration}</div>
                        {exp.highlights && exp.highlights.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {exp.highlights.map((h: string, hIdx: number) => (
                              <li key={hIdx} className="text-[11px] text-slate-400">• {h}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-canvas-card border border-canvas-border shadow-md">
                  <h3 className="text-sm font-bold text-white mb-3">Education History</h3>
                  <div className="space-y-4">
                    {analysis.extracted_education?.map((edu: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-canvas-surface/40 border border-canvas-border">
                        <div className="text-xs font-bold text-white">{edu.degree}</div>
                        <div className="text-[11px] text-slate-400">{edu.institution} {edu.graduation_year && `• Class of ${edu.graduation_year}`}</div>
                        {edu.gpa && <div className="text-[11px] text-emerald-400 mt-1">GPA: {edu.gpa}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EDIT SUMMARY */}
          {activeTab === 'edit' && (
            <div className="p-6 rounded-2xl bg-canvas-card border border-canvas-border shadow-md space-y-4">
              <h3 className="text-sm font-bold text-white">Manual Review & Profile Correction</h3>
              <p className="text-xs text-slate-400">
                You can adjust the executive candidate summary or correct extracted facts to ensure high accuracy.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Executive Candidate Summary
                </label>
                <textarea
                  rows={4}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full p-4 bg-canvas-surface border border-canvas-border rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveEdit}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Save Adjustments
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-canvas-card border border-canvas-border rounded-2xl">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Resume Uploaded Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Upload a PDF or DOCX file using the upload box above to view your instant ATS audit and extracted skills breakdown.
          </p>
        </div>
      )}
    </div>
  );
};
