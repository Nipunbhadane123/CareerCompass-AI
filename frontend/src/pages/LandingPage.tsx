import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass, FileCheck, ArrowRight, Target, BrainCircuit,
  BarChart3, CheckCircle2, Sparkles, GraduationCap,
  Layers, Lock, ShieldCheck, ChevronDown
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { Badge } from '../components/common/Badge';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-canvas-dark text-slate-100 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 border-b border-canvas-border">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-[400px] h-[300px] bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Next-Generation Employability SaaS
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
            Turn Your Skills Into Your <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Next Opportunity.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Understand your true professional strengths, discover tailored career paths, isolate critical missing skills, and execute structured learning roadmaps with mathematical explainability.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              Start Free Assessment
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-canvas-card hover:bg-slate-800 text-slate-200 border border-canvas-border font-medium text-base transition-colors"
            >
              Demo Preview
            </Link>
          </div>

          {/* Interactive Mock Dashboard Preview */}
          <div className="max-w-5xl mx-auto rounded-2xl p-2 bg-gradient-to-b from-slate-700/50 via-slate-800/20 to-transparent border border-slate-700/60 shadow-2xl shadow-indigo-950/50">
            <div className="bg-canvas-card rounded-xl border border-canvas-border overflow-hidden text-left">
              {/* Fake window title bar */}
              <div className="px-4 py-3 bg-canvas/80 border-b border-canvas-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-slate-400 ml-2 font-mono">careercompass.ai/dashboard</span>
                </div>
                <div className="text-xs text-slate-500">Live Workspace Preview</div>
              </div>

              {/* Preview Content Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-canvas-dark/60">
                <div className="p-5 rounded-xl bg-canvas-surface/60 border border-canvas-border/80 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">ATS Audit Score</span>
                    <div className="text-3xl font-extrabold text-white mt-1">88<span className="text-sm text-slate-400">/100</span></div>
                    <p className="text-xs text-emerald-400 mt-2 font-medium">Top 15% readability benchmark</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-700/50 text-xs text-slate-400">
                    Strong quantification in technical projects
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-canvas-surface/60 border border-canvas-border/80 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Top Recommended Role</span>
                    <div className="text-lg font-bold text-white mt-1">Full-Stack Software Engineer</div>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <Badge variant="success">86% Fit</Badge>
                      <Badge variant="cyan">High Demand</Badge>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-700/50 text-xs text-slate-400">
                    Matches React, Python, SQL, REST APIs
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-canvas-surface/60 border border-canvas-border/80 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Active Skill Gap</span>
                    <div className="text-lg font-bold text-white mt-1">1 Critical Skill Gap</div>
                    <p className="text-xs text-amber-400 mt-2 font-medium">Docker / Containerization</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-700/50 text-xs text-slate-400">
                    3-week personalized roadmap generated
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Capabilities */}
      <section id="features" className="py-24 border-b border-canvas-border relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">Core Capabilities</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              An End-to-End Employability Intelligence Suite
            </p>
            <p className="text-slate-400 mt-3 text-base">
              Engineered with transparent algorithms, explainable math, and practical tools designed for real job outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-7 rounded-2xl bg-canvas-card border border-canvas-border hover:border-indigo-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Resume Intelligence</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Upload PDF or DOCX documents to extract structured profiles, measure ATS parsing scores, and receive evidence-backed feedback with Google X-Y-Z bullet optimization.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-canvas-card border border-canvas-border hover:border-violet-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Explainable Career Explorer</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Explore curated industry roles with transparent scoring formulas. View exact required vs. preferred competencies and see mathematical fit rationale.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-canvas-card border border-canvas-border hover:border-cyan-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Job Description Matcher</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Benchmark your profile against curated demo vacancies or paste any custom external JD from LinkedIn/Indeed to receive tailored resume alignment tips.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 border-b border-canvas-border bg-canvas/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">The Career Journey</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              From Raw Resume to Ready to Apply
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Upload & Extract', desc: 'Securely upload your resume or enter your coursework background in our fast wizard.' },
              { step: '02', title: 'Diagnose Gaps', desc: 'Isolate critical required skills you are missing from your target engineering roles.' },
              { step: '03', title: 'Follow Roadmap', desc: 'Progress through prioritized learning milestones backed by verified free documentation.' },
              { step: '04', title: 'Target Vacancies', desc: 'Match your verified profile with specific job descriptions and track applications.' },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-xl bg-canvas-card border border-canvas-border relative">
                <div className="text-3xl font-extrabold text-indigo-500/30 mb-3">{item.step}</div>
                <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-b border-canvas-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">FAQ</h2>
            <p className="text-3xl font-extrabold text-white">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How does CareerCompass AI score career recommendations?',
                a: 'We use an explainable weighted formula: 50% required skills overlap, 25% preferred skills overlap, 15% experience alignment, and 10% educational background. No mysterious percentages.'
              },
              {
                q: 'Can I use CareerCompass AI without an external LLM API key?',
                a: 'Yes! CareerCompass AI includes a dual-engine architecture with a 100% offline, deterministic rule-based NLP provider. Every feature operates reliably even without external cloud credentials.'
              },
              {
                q: 'Are the jobs on CareerCompass AI live vacancies?',
                a: 'To guarantee transparency, demo vacancies in the system are clearly labeled as "Sample Listing". You can also paste any real-world external job description into our Custom Matcher.'
              },
              {
                q: 'How is user data and resume privacy handled?',
                a: 'Uploaded files are stored in user-isolated directories. We never sell data, and provide complete account deletion and data purging compliant with GDPR principles.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="p-6 rounded-xl bg-canvas-card border border-canvas-border">
                <h4 className="text-base font-semibold text-white mb-2">{faq.q}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-canvas-dark border-t border-canvas-border text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-slate-300">CareerCompass AI</span>
            <span>— AI-Powered Career Intelligence Platform</span>
          </div>
          <p>© {new Date().getFullYear()} CareerCompass AI. Turn Your Skills Into Your Next Opportunity.</p>
        </div>
      </footer>
    </div>
  );
};
