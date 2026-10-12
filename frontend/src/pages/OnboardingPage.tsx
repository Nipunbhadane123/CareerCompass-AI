import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Award, Compass, Upload, CheckCircle2,
  ArrowRight, ArrowLeft, Clock, Sparkles
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const AVAILABLE_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'FastAPI', 'Node.js',
  'SQL', 'PostgreSQL', 'Docker', 'AWS', 'Git', 'Linux', 'Tailwind CSS',
  'PyTorch', 'MongoDB', 'REST API', 'Kubernetes', 'CI/CD'
];

export const OnboardingPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [headline, setHeadline] = useState('Computer Science Student & Aspiring Software Engineer');
  const [educationLevel, setEducationLevel] = useState("Bachelor's Degree in Computer Science");
  const [institution, setInstitution] = useState('');
  const [graduationYear, setGraduationYear] = useState('2025');
  const [yearsOfExp, setYearsOfExp] = useState(0.5);

  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Python', 'JavaScript', 'React', 'Git']);
  const [targetRole, setTargetRole] = useState('Full-Stack Software Engineer');
  const [learningPace, setLearningPace] = useState('moderate');
  const [careerGoals, setCareerGoals] = useState('Build scalable web applications and land an entry-level software engineering role.');

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      // 1. Submit Profile Onboarding
      await api.submitOnboarding({
        headline,
        education_level: educationLevel,
        institution: institution || 'University',
        graduation_year: parseInt(graduationYear) || 2025,
        years_of_experience: yearsOfExp,
        skills: selectedSkills,
        target_role: targetRole,
        learning_pace: learningPace,
        career_goals: careerGoals,
      });

      // 2. Upload resume if provided
      if (resumeFile) {
        await api.uploadResume(resumeFile);
      }

      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding submission failed:', err);
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-dark flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl bg-canvas-card border border-canvas-border rounded-2xl shadow-2xl p-8">
        {/* Progress tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Step {step} of 4</span>
            <span>
              {step === 1 && 'Education & Background'}
              {step === 2 && 'Verified Skills'}
              {step === 3 && 'Target Roles & Pace'}
              {step === 4 && 'Resume Document'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Background */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Academic & Experience Background</h2>
              <p className="text-sm text-slate-400 mt-1">Tell us about your education and work background to benchmark requirements.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Professional Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Computer Science Junior & Full-Stack Developer"
                className="w-full px-4 py-2.5 bg-canvas-surface border border-canvas-border rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Education Level
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-canvas-surface border border-canvas-border rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="Bachelor's Degree in Computer Science">Bachelor's in CS / Tech</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="Bootcamp Graduate">Bootcamp Graduate</option>
                  <option value="Self-Taught Developer">Self-Taught Developer</option>
                  <option value="High School / Associate">High School / Associate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Graduation Year
                </label>
                <input
                  type="number"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full px-4 py-2.5 bg-canvas-surface border border-canvas-border rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Years of Professional Experience
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={yearsOfExp}
                onChange={(e) => setYearsOfExp(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-canvas-surface border border-canvas-border rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Include relevant internships, freelance work, or open source contributions.</span>
            </div>
          </div>
        )}

        {/* STEP 2: Skills */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Select Your Current Skills</h2>
              <p className="text-sm text-slate-400 mt-1">Select the tools and languages you have built projects with or used in courses.</p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {AVAILABLE_SKILLS.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm'
                        : 'bg-canvas-surface text-slate-400 border-slate-700/60 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {skill} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 pt-2">
              Selected: <span className="text-white font-semibold">{selectedSkills.length} skills</span>. Don't worry, you can always add more skills or extract them automatically from your resume.
            </p>
          </div>
        )}

        {/* STEP 3: Target Role & Pace */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Target Role & Learning Pace</h2>
              <p className="text-sm text-slate-400 mt-1">Specify your target engineering trajectory and weekly study capacity.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Career Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-canvas-surface border border-canvas-border rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
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
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Preferred Learning Pace
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'steady', title: 'Steady', hours: '5-8 hrs / week' },
                  { id: 'moderate', title: 'Moderate', hours: '10-15 hrs / week' },
                  { id: 'intensive', title: 'Intensive', hours: '20+ hrs / week' },
                ].map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setLearningPace(p.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      learningPace === p.id
                        ? 'bg-indigo-600/15 border-indigo-500/50 text-white'
                        : 'bg-canvas-surface border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-sm font-semibold text-white">{p.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{p.hours}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Primary Career Goal
              </label>
              <textarea
                rows={2}
                value={careerGoals}
                onChange={(e) => setCareerGoals(e.target.value)}
                className="w-full px-4 py-2 bg-canvas-surface border border-canvas-border rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Resume Upload */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Upload Your Resume (Optional)</h2>
              <p className="text-sm text-slate-400 mt-1">Upload a PDF or DOCX file to instantly extract projects, experience, and receive an ATS readability audit.</p>
            </div>

            <div className="border-2 border-dashed border-canvas-border hover:border-indigo-500/50 rounded-2xl p-8 text-center transition-colors">
              <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
              <label className="cursor-pointer">
                <span className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">Choose a file</span>
                <span className="text-sm text-slate-400"> or drag and drop</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setResumeFile(e.target.files[0]);
                    }
                  }}
                />
              </label>
              <p className="text-xs text-slate-500 mt-1.5">PDF or DOCX up to 10MB</p>

              {resumeFile && (
                <div className="mt-4 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {resumeFile.name} ({(resumeFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 text-center">
              You can also skip this step and upload your resume later from the dashboard.
            </p>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-canvas-border">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/20 transition-all"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinish}
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Finalizing Profile...' : 'Enter Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
