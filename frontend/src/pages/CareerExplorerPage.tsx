import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass, Search, Filter, TrendingUp, CheckCircle2,
  AlertCircle, ArrowRight, DollarSign, Layers, Map, MessageSquare
} from 'lucide-react';

import { api } from '../api/client';
import { CareerRole, CareerRecommendation, RoleGapAnalysis } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const CareerExplorerPage: React.FC = () => {
  const navigate = useNavigate();

  const [roles, setRoles] = useState<CareerRole[]>([]);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');

  // Modal gap analysis
  const [selectedRole, setSelectedRole] = useState<CareerRole | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<RoleGapAnalysis | null>(null);
  const [isGapLoading, setIsGapLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [rolesData, recsData] = await Promise.all([
          api.listRoles(),
          api.getRecommendations(20).catch(() => []),
        ]);
        setRoles(rolesData);
        setRecommendations(recsData);
      } catch (err) {
        console.error('Error fetching career roles:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenGapAnalysis = async (role: CareerRole) => {
    setSelectedRole(role);
    setIsGapLoading(true);
    try {
      const data = await api.getGapAnalysis(role.id);
      setGapAnalysis(data);
    } catch (err) {
      console.error('Failed to get gap analysis:', err);
    } finally {
      setIsGapLoading(false);
    }
  };

  const handleGenerateRoadmap = async (roleId: number) => {
    try {
      await api.generateRoadmap({ role_id: roleId });
      navigate('/roadmap');
    } catch (err: any) {
      alert(`Roadmap generation failed: ${err.message}`);
    }
  };

  const domains = ['All', 'Software Engineering', 'AI & Data', 'Cloud & Infrastructure'];

  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.title.toLowerCase().includes(search.toLowerCase()) ||
      role.description.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = selectedDomain === 'All' || role.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  const getMatchScoreForRole = (roleId: number): number | null => {
    const rec = recommendations.find((r) => r.role.id === roleId);
    return rec ? rec.match_score : null;
  };

  if (isLoading) {
    return <LoadingSpinner text="Indexing career intelligence catalog..." size="lg" />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Career Role Catalog & Skill Gap Diagnostics
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore curated positions, compare required vs. preferred proficiencies, and isolate critical competency gaps.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-canvas-card border border-canvas-border shadow-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles by title, keyword, or domain..."
            className="w-full pl-10 pr-4 py-2 bg-canvas-surface border border-canvas-border rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDomain === dom
                  ? 'bg-indigo-600 text-white'
                  : 'bg-canvas-surface hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => {
          const matchScore = getMatchScoreForRole(role.id);
          const reqSkills = role.skills.filter(s => s.is_required).map(s => s.skill.name);
          const prefSkills = role.skills.filter(s => !s.is_required).map(s => s.skill.name);

          return (
            <div
              key={role.id}
              className="p-6 rounded-2xl bg-canvas-card border border-canvas-border hover:border-indigo-500/50 shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="cyan">{role.domain}</Badge>
                  {matchScore !== null && (
                    <Badge variant={matchScore >= 70 ? 'success' : (matchScore >= 50 ? 'warning' : 'neutral')}>
                      {matchScore}% Compatibility
                    </Badge>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {role.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {role.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-canvas-border/80">
                  <div className="text-xs text-slate-300 flex items-center justify-between">
                    <span className="text-slate-500">Benchmark Salary:</span>
                    <strong className="text-slate-200">{role.average_salary}</strong>
                  </div>
                  <div className="text-xs text-slate-300 flex items-center justify-between">
                    <span className="text-slate-500">Market Demand:</span>
                    <Badge variant="primary">{role.market_demand}</Badge>
                  </div>
                </div>

                {/* Skills tags preview */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                    Core Skills ({reqSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {reqSkills.slice(0, 4).map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 font-medium">
                        {s}
                      </span>
                    ))}
                    {reqSkills.length > 4 && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/60 text-slate-500">
                        +{reqSkills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-canvas-border grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenGapAnalysis(role)}
                  className="py-2 px-3 rounded-xl bg-canvas-surface hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-colors text-center"
                >
                  Skill Gap
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/interviews', {
                    state: {
                      targetRole: role.title,
                      skills: reqSkills
                    }
                  })}
                  className="py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-semibold text-indigo-300 transition-colors text-center flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Prep Interview
                </button>
              </div>
            </div>

          );
        })}
      </div>

      {/* Gap Analysis Modal */}
      <Modal
        isOpen={!!selectedRole}
        onClose={() => {
          setSelectedRole(null);
          setGapAnalysis(null);
        }}
        title={`Skill Gap Diagnostic: ${selectedRole?.title}`}
        maxWidth="2xl"
      >
        {isGapLoading ? (
          <LoadingSpinner text="Computing mathematical skill overlap..." />
        ) : gapAnalysis ? (
          <div className="space-y-6">
            {/* Score header */}
            <div className="p-4 rounded-xl bg-canvas-surface/60 border border-canvas-border flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Calculated Compatibility Index</span>
                <div className="text-2xl font-extrabold text-white mt-0.5">
                  {gapAnalysis.overall_match_score}%
                </div>
              </div>
              <div className="text-right text-xs text-slate-400">
                <div>Required Skills: <strong className="text-white">{gapAnalysis.matched_required}/{gapAnalysis.total_required}</strong></div>
                <div>Preferred Skills: <strong className="text-white">{gapAnalysis.matched_preferred}/{gapAnalysis.total_preferred}</strong></div>
              </div>
            </div>

            {/* Breakdown List */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Skill Competency Matrix
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                {gapAnalysis.skills_breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                      item.status === 'Acquired'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                        : item.severity === 'Critical'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {item.status === 'Acquired' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                      <span className="font-medium text-white">{item.name}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      {item.status === 'Acquired' ? 'Acquired' : item.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Recommendations */}
            <div className="p-4 rounded-xl bg-canvas/60 border border-slate-700/60">
              <span className="text-xs font-semibold text-indigo-400 block mb-1">Recommended Next Steps:</span>
              <ul className="space-y-1 text-xs text-slate-300">
                {gapAnalysis.next_steps.map((step, sIdx) => (
                  <li key={sIdx}>• {step}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedRole) {
                    const roleTitle = selectedRole.title;
                    const skills = (gapAnalysis.skills_breakdown || [])
                      .filter((b: any) => b.status === 'Missing')
                      .map((b: any) => b.name);
                    setSelectedRole(null);
                    setGapAnalysis(null);
                    navigate('/interviews', {
                      state: {
                        targetRole: roleTitle,
                        skills: skills
                      }
                    });

                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-canvas-card border border-canvas-border hover:border-indigo-500/50 text-white font-semibold text-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                Practice Interview on Missing Gaps
              </button>

              <button
                type="button"
                onClick={() => selectedRole && handleGenerateRoadmap(selectedRole.id)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all"
              >
                <Map className="w-4 h-4" />
                Generate Learning Roadmap
              </button>
            </div>

          </div>
        ) : null}
      </Modal>
    </div>
  );
};
