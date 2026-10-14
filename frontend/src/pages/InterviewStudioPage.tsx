import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageSquare, Sparkles, CheckCircle2, ChevronDown, ChevronUp,
  Star, Trash2, Award, Briefcase, BookOpen, AlertCircle, PlayCircle
} from 'lucide-react';
import { api } from '../api/client';
import { InterviewSession, InterviewQuestion } from '../types';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const InterviewStudioPage: React.FC = () => {
  const location = useLocation();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter & Accordion State
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});
  const [editingNotes, setEditingNotes] = useState<Record<number, string>>({});
  const [savingNoteId, setSavingNoteId] = useState<number | null>(null);

  // New Generation Form
  const [roleTitle, setRoleTitle] = useState('Full-Stack Software Engineer');
  const [company, setCompany] = useState('Target Employer');
  const [difficulty, setDifficulty] = useState('Mid-Level');
  const [focusSkillsInput, setFocusSkillsInput] = useState('');

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const data = await api.listInterviews();
      setSessions(data);
      if (data.length > 0) {
        // If navigating with state from Career or Jobs page
        const navState = location.state as { targetRole?: string; company?: string; skills?: string[] } | null;
        if (navState?.targetRole) {
          setRoleTitle(navState.targetRole);
          if (navState.company) setCompany(navState.company);
          if (navState.skills) setFocusSkillsInput(navState.skills.join(', '));
        }
        setActiveSession(data[0]);
      }
    } catch (err) {
      console.error('Failed to load interview sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleTitle.trim()) return;
    setIsGenerating(true);
    try {
      const skills = focusSkillsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const newSession = await api.generateInterview({
        role_title: roleTitle,
        company: company || 'Target Employer',
        difficulty,
        focus_skills: skills.length > 0 ? skills : undefined,
        question_count: 5
      });

      setSessions(prev => [newSession, ...prev]);
      setActiveSession(newSession);
      // Auto-expand first question
      if (newSession.questions.length > 0) {
        setExpandedQuestions({ [newSession.questions[0].id]: true });
      }
    } catch (err: any) {
      alert(`Failed to generate interview prep: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePracticed = async (question: InterviewQuestion) => {
    if (!activeSession) return;
    const nextState = !question.is_practiced;
    try {
      const updated = await api.updateQuestionPractice(question.id, {
        is_practiced: nextState,
      });

      setActiveSession(prev => {
        if (!prev) return null;
        const updatedQuestions = prev.questions.map(q => q.id === question.id ? updated : q);
        const practicedCount = updatedQuestions.filter(q => q.is_practiced).length;
        const readiness = Math.round((practicedCount / Math.max(1, updatedQuestions.length)) * 100);
        return {
          ...prev,
          questions: updatedQuestions,
          practiced_count: practicedCount,
          readiness_percentage: readiness
        };
      });

      setSessions(prev => prev.map(s => s.id === activeSession.id ? {
        ...s,
        practiced_count: s.questions.map(q => q.id === question.id ? updated : q).filter(q => q.is_practiced).length,
        readiness_percentage: Math.round((s.questions.map(q => q.id === question.id ? updated : q).filter(q => q.is_practiced).length / Math.max(1, s.questions.length)) * 100)
      } : s));
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleUpdateRating = async (questionId: number, rating: number) => {
    try {
      const updated = await api.updateQuestionPractice(questionId, {
        mastery_rating: rating,
      });
      setActiveSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          questions: prev.questions.map(q => q.id === questionId ? updated : q)
        };
      });
    } catch (err: any) {
      alert(`Rating failed: ${err.message}`);
    }
  };

  const handleSaveNotes = async (questionId: number) => {
    const notes = editingNotes[questionId];
    if (notes === undefined) return;
    setSavingNoteId(questionId);
    try {
      const updated = await api.updateQuestionPractice(questionId, {
        user_notes: notes,
      });
      setActiveSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          questions: prev.questions.map(q => q.id === questionId ? updated : q)
        };
      });
    } catch (err: any) {
      alert(`Save notes failed: ${err.message}`);
    } finally {
      setSavingNoteId(null);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!window.confirm('Delete this interview practice session?')) return;
    try {
      await api.deleteInterviewSession(sessionId);
      const remaining = sessions.filter(s => s.id !== sessionId);
      setSessions(remaining);
      setActiveSession(remaining.length > 0 ? remaining[0] : null);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedQuestions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredQuestions = activeSession?.questions.filter(q => {
    if (categoryFilter === 'all') return true;
    return q.category.toLowerCase().includes(categoryFilter.toLowerCase());
  }) || [];

  if (isLoading) {
    return <LoadingSpinner text="Loading AI Interview Readiness Studio..." size="lg" />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Interview Readiness Studio
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1.5">
            Prepare for real-world technical deep dives, STAR-method behavioral scenarios, and system design rounds tailored to your target roles.
          </p>
        </div>
      </div>

      {/* Generator Card */}
      <div className="p-6 rounded-2xl bg-canvas-card border border-canvas-border shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Generate New Interview Practice Session</h3>
          </div>
          <Badge variant="cyan">AI Powered • STAR Guidance</Badge>
        </div>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Target Role
            </label>
            <input
              type="text"
              required
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Backend Platform Engineer"
              className="w-full px-3.5 py-2 bg-canvas-surface border border-canvas-border rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Target Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe, OpenAI, or Target"
              className="w-full px-3.5 py-2 bg-canvas-surface border border-canvas-border rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Seniority Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3.5 py-2 bg-canvas-surface border border-canvas-border rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="Entry-Level">Entry-Level / Graduate</option>
              <option value="Mid-Level">Mid-Level (1-4 yrs)</option>
              <option value="Senior">Senior / Tech Lead</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Focus Competencies (Optional)
            </label>
            <input
              type="text"
              value={focusSkillsInput}
              onChange={(e) => setFocusSkillsInput(e.target.value)}
              placeholder="e.g. Python, Docker, SQL"
              className="w-full px-3.5 py-2 bg-canvas-surface border border-canvas-border rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Synthesizing Tailored Interview Questions...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>Launch Tailored Interview Session</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Main Studio Content */}
      {sessions.length > 0 && activeSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sessions Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Practice Sessions ({sessions.length})
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setActiveSession(s)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                    activeSession.id === s.id
                      ? 'bg-indigo-600/15 border-indigo-500/50 text-white shadow-md'
                      : 'bg-canvas-card border-canvas-border hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold truncate">{s.role_title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{s.company} • {s.difficulty}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-semibold text-emerald-400">
                        {s.readiness_percentage || 0}% Prepared
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {s.practiced_count || 0}/{s.questions?.length || 0}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(s.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Session Questions & Practice Canvas */}
          <div className="lg:col-span-3 space-y-6">
            {/* Session Summary Card */}
            <div className="p-6 rounded-2xl bg-canvas-card border border-canvas-border shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs text-slate-400">{activeSession.company}</span>
                    <Badge variant="neutral">{activeSession.difficulty}</Badge>
                  </div>
                  <h2 className="text-xl font-extrabold text-white mt-1">
                    {activeSession.role_title}
                  </h2>
                </div>

                <div className="sm:text-right">
                  <div className="text-2xl font-black text-indigo-400">
                    {activeSession.readiness_percentage || 0}%
                  </div>
                  <span className="text-xs text-slate-400">Interview Readiness Score</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${activeSession.readiness_percentage || 0}%` }}
                />
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-2 border-t border-canvas-border pt-4">
                {['all', 'technical', 'behavioral', 'system design'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      categoryFilter === cat
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {filteredQuestions.map((q) => {
                const isExpanded = !!expandedQuestions[q.id];
                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      q.is_practiced
                        ? 'bg-canvas-card border-emerald-500/30'
                        : 'bg-canvas-card border-canvas-border hover:border-indigo-500/40'
                    }`}
                  >
                    {/* Question Header */}
                    <div
                      onClick={() => toggleExpand(q.id)}
                      className="p-5 cursor-pointer flex items-start justify-between gap-4 select-none"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">#{q.order_num}</span>
                          <Badge variant={q.category.includes('Behavioral') ? 'secondary' : q.category.includes('Design') ? 'warning' : 'cyan'}>
                            {q.category}
                          </Badge>
                          <Badge variant="neutral">{q.target_skill}</Badge>

                          {q.is_practiced && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Practiced
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                          {q.question_text}
                        </h3>

                        {/* Mastery Stars */}
                        <div className="flex items-center gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[11px] text-slate-400 mr-1.5 font-medium">Mastery:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleUpdateRating(q.id, star)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-3.5 h-3.5 transition-colors ${
                                  star <= q.mastery_rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-600 hover:text-amber-400/50'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePracticed(q);
                          }}
                          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            q.is_practiced
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-canvas-surface border border-canvas-border text-slate-400 hover:text-white hover:border-slate-600'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="hidden sm:inline">{q.is_practiced ? 'Done' : 'Mark Done'}</span>
                        </button>

                        <button className="text-slate-400 hover:text-white">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Model Answer & Guidance */}
                    {isExpanded && (
                      <div className="border-t border-canvas-border/80 p-5 bg-canvas-surface/40 space-y-5 animate-in fade-in duration-150">
                        {/* Suggested Answer Points */}
                        {q.suggested_answer_points && q.suggested_answer_points.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5" /> High-Impact Answer Points
                            </h4>
                            <ul className="space-y-1.5 text-xs text-slate-300">
                              {q.suggested_answer_points.map((pt, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-indigo-400 font-bold">•</span>
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* STAR Framework Guidance */}
                        {q.star_guidance && Object.keys(q.star_guidance).length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" /> STAR Response Model (Situation • Task • Action • Result)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              {q.star_guidance.situation && (
                                <div className="p-3 rounded-xl bg-canvas-card border border-canvas-border space-y-1">
                                  <span className="font-bold text-amber-400 uppercase text-[10px]">Situation</span>
                                  <p className="text-slate-300">{q.star_guidance.situation}</p>
                                </div>
                              )}
                              {q.star_guidance.task && (
                                <div className="p-3 rounded-xl bg-canvas-card border border-canvas-border space-y-1">
                                  <span className="font-bold text-cyan-400 uppercase text-[10px]">Task</span>
                                  <p className="text-slate-300">{q.star_guidance.task}</p>
                                </div>
                              )}
                              {q.star_guidance.action && (
                                <div className="p-3 rounded-xl bg-canvas-card border border-canvas-border space-y-1">
                                  <span className="font-bold text-indigo-400 uppercase text-[10px]">Action</span>
                                  <p className="text-slate-300">{q.star_guidance.action}</p>
                                </div>
                              )}
                              {q.star_guidance.result && (
                                <div className="p-3 rounded-xl bg-canvas-card border border-canvas-border space-y-1">
                                  <span className="font-bold text-emerald-400 uppercase text-[10px]">Result</span>
                                  <p className="text-slate-300">{q.star_guidance.result}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Common Pitfalls */}
                        {q.pitfalls_to_avoid && q.pitfalls_to_avoid.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                              <AlertCircle className="w-3.5 h-3.5" /> Critical Pitfalls to Avoid
                            </div>
                            <ul className="space-y-1 text-xs text-rose-300/90 pl-5 list-disc">
                              {q.pitfalls_to_avoid.map((pf, idx) => (
                                <li key={idx}>{pf}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Practice Notes Canvas */}
                        <div className="space-y-2 pt-2 border-t border-canvas-border">
                          <label className="block text-xs font-semibold text-slate-300">
                            My Practice Outline & Talking Notes:
                          </label>
                          <textarea
                            rows={3}
                            value={editingNotes[q.id] !== undefined ? editingNotes[q.id] : (q.user_notes || '')}
                            onChange={(e) => setEditingNotes(prev => ({ ...prev, [q.id]: e.target.value }))}
                            placeholder="Draft your key stories, metric results, and specific technical choices for this question..."
                            className="w-full p-3 bg-canvas-card border border-canvas-border rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-indigo-500"
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleSaveNotes(q.id)}
                              disabled={savingNoteId === q.id}
                              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              {savingNoteId === q.id ? 'Saving...' : 'Save Notes'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 p-8 rounded-2xl bg-canvas-card border border-canvas-border shadow-md space-y-3">
          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Interview Practice Sessions Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Generate your first targeted session above to practice technical questions, behavioral STAR stories, and system design challenges.
          </p>
        </div>
      )}
    </div>
  );
};
