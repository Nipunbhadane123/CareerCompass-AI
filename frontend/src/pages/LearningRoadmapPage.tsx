import React, { useState, useEffect } from 'react';
import {
  Map, CheckCircle2, Circle, Clock, ExternalLink,
  BookOpen, Sparkles, Trash2, ArrowRight, Layers
} from 'lucide-react';
import { api } from '../api/client';
import { LearningRoadmap, RoadmapStep } from '../types';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const LearningRoadmapPage: React.FC = () => {
  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<LearningRoadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // New roadmap prompt
  const [targetRoleInput, setTargetRoleInput] = useState('Full-Stack Software Engineer');
  const [paceInput, setPaceInput] = useState('moderate');

  const loadRoadmaps = async () => {
    try {
      setIsLoading(true);
      const data = await api.listRoadmaps();
      setRoadmaps(data);
      if (data.length > 0) {
        setActiveRoadmap(data[0]);
      }
    } catch (err) {
      console.error('Error fetching roadmaps:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const handleToggleStep = async (stepId: number) => {
    if (!activeRoadmap) return;
    try {
      const res = await api.toggleStep(stepId);
      // Update local step state
      const updatedSteps = activeRoadmap.steps.map((step) =>
        step.id === stepId ? { ...step, is_completed: res.is_completed } : step
      );
      setActiveRoadmap({
        ...activeRoadmap,
        progress_percentage: res.roadmap_progress_percentage,
        steps: updatedSteps,
      });
      // Sync list
      setRoadmaps(prev => prev.map(r => r.id === activeRoadmap.id ? { ...r, progress_percentage: res.roadmap_progress_percentage } : r));
    } catch (err: any) {
      alert(`Toggle failed: ${err.message}`);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const newRm = await api.generateRoadmap({
        target_role: targetRoleInput,
        pace: paceInput,
      });
      setRoadmaps(prev => [newRm, ...prev]);
      setActiveRoadmap(newRm);
    } catch (err: any) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (roadmapId: number) => {
    if (!window.confirm('Delete this learning roadmap?')) return;
    try {
      await api.deleteRoadmap(roadmapId);
      const remaining = roadmaps.filter(r => r.id !== roadmapId);
      setRoadmaps(remaining);
      setActiveRoadmap(remaining[0] || null);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Mapping technical milestone sequences..." size="lg" />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Personalized Learning Roadmaps
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Ordered, prerequisite-aware milestones designed to bridge verified skill gaps with vetted learning resources.
          </p>
        </div>

        {activeRoadmap && (
          <button
            onClick={() => handleDelete(activeRoadmap.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Roadmap
          </button>
        )}
      </div>

      {/* Generator Card if no roadmaps */}
      {roadmaps.length === 0 || isGenerating ? (
        <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-canvas-card border border-canvas-border shadow-xl space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-3">
              <Map className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Generate Your Personalized Roadmap</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Our sequencing engine analyzes your target role, isolates missing prerequisite skills, and builds an ordered roadmap.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Role
              </label>
              <select
                value={targetRoleInput}
                onChange={(e) => setTargetRoleInput(e.target.value)}
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
                Weekly Study Commitment
              </label>
              <select
                value={paceInput}
                onChange={(e) => setPaceInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-canvas-surface border border-canvas-border rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="steady">Steady (5-8 hours/week • 20 weeks)</option>
                <option value="moderate">Moderate (10-15 hours/week • 14 weeks)</option>
                <option value="intensive">Intensive (20+ hours/week • 8 weeks)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? 'Sequencing Technical Milestones...' : 'Generate Roadmap'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : activeRoadmap && (
        <div className="space-y-6">
          {/* Active Roadmap Banner */}
          <div className="p-6 rounded-2xl bg-canvas-card border border-canvas-border shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="cyan">{activeRoadmap.target_role}</Badge>
                  <Badge variant="primary">{activeRoadmap.pace.toUpperCase()} PACE</Badge>
                  <Badge variant="neutral">Est: {activeRoadmap.estimated_weeks} Weeks</Badge>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">{activeRoadmap.title}</h2>
                <p className="text-xs text-slate-400 mt-1">{activeRoadmap.description}</p>
              </div>

              {/* Progress gauge */}
              <div className="flex items-center gap-4 bg-canvas-surface/60 p-4 rounded-xl border border-canvas-border shrink-0">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-medium block">Total Progress</span>
                  <span className="text-2xl font-black text-indigo-400">{activeRoadmap.progress_percentage}%</span>
                </div>
                <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${activeRoadmap.progress_percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stepped Milestones */}
          <div className="space-y-4">
            {activeRoadmap.steps.map((step, idx) => (
              <div
                key={step.id}
                className={`p-6 rounded-2xl border transition-all ${
                  step.is_completed
                    ? 'bg-canvas-card/50 border-emerald-500/30 shadow-sm'
                    : 'bg-canvas-card border-canvas-border hover:border-indigo-500/40 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Toggle button */}
                    <button
                      type="button"
                      onClick={() => handleToggleStep(step.id)}
                      className={`mt-0.5 p-1 rounded-full transition-colors ${
                        step.is_completed
                          ? 'text-emerald-400 hover:text-emerald-300'
                          : 'text-slate-600 hover:text-indigo-400'
                      }`}
                      title={step.is_completed ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {step.is_completed ? (
                        <CheckCircle2 className="w-6 h-6 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-indigo-400 font-bold">
                          Step {step.step_order}
                        </span>
                        <Badge variant="neutral">{step.phase}</Badge>
                        <Badge variant="cyan">{step.skill_name}</Badge>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {step.estimated_hours} hours
                        </span>
                      </div>

                      <h3 className={`text-base font-bold ${step.is_completed ? 'text-slate-300 line-through' : 'text-white'}`}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                        {step.description}
                      </p>

                      {/* Capstone challenge */}
                      {step.practical_project && (
                        <div className="p-3 rounded-xl bg-canvas-surface/40 border border-canvas-border/80 text-xs text-slate-300">
                          <strong className="text-indigo-400 block mb-0.5">Practical Milestone Project:</strong>
                          {step.practical_project}
                        </div>
                      )}

                      {/* Verified Resources Links */}
                      {step.resources && step.resources.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                            Curated Learning Materials:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {step.resources.map((res, rIdx) => (
                              <a
                                key={rIdx}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-canvas-surface hover:bg-slate-700 border border-slate-700/80 text-slate-300 text-xs font-medium transition-colors"
                              >
                                <BookOpen className="w-3 h-3 text-indigo-400" />
                                <span>{res.title}</span>
                                <ExternalLink className="w-3 h-3 text-slate-500 ml-0.5" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
