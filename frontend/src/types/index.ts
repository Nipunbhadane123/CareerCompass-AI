export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  profile?: Profile;
}

export interface Profile {
  id?: number;
  user_id?: number;
  headline?: string;
  years_of_experience: number;
  education_level?: string;
  institution?: string;
  graduation_year?: number;
  target_role?: string;
  learning_pace: string;
  career_goals?: string;
  skills: string[] | any[];
  completeness_score: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface CategorizedSkills {
  languages: string[];
  frameworks: string[];
  databases: string[];
  tools_and_platforms: string[];
  soft_skills: string[];
}

export interface EducationItem {
  institution?: string;
  degree?: string;
  field_of_study?: string;
  graduation_year?: string;
  gpa?: string;
}

export interface ExperienceItem {
  company?: string;
  title?: string;
  duration?: string;
  location?: string;
  highlights: string[];
}

export interface ProjectItem {
  title: string;
  technologies: string[];
  description?: string;
  link?: string;
}

export interface ActionableRecommendation {
  category: string;
  issue: string;
  suggestion: string;
  rationale: string;
}

export interface ResumeAnalysis {
  id: number;
  resume_id: number;
  ats_score: number;
  summary?: string;
  extracted_skills: CategorizedSkills;
  extracted_experience: ExperienceItem[];
  extracted_education: EducationItem[];
  extracted_projects: ProjectItem[];
  extracted_certifications: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: ActionableRecommendation[];
  missing_elements: string[];
  ai_provider: string;
  created_at: string;
}

export interface Resume {
  id: number;
  user_id: number;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  uploaded_at: string;
  latest_analysis?: ResumeAnalysis;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  description?: string;
}

export interface RoleSkill {
  skill: Skill;
  is_required: boolean;
  weight: number;
}

export interface CareerRole {
  id: number;
  title: string;
  slug: string;
  domain: string;
  description: string;
  average_salary: string;
  experience_level: string;
  market_demand: string;
  is_active: boolean;
  skills: RoleSkill[];
}

export interface CareerRecommendation {
  role: CareerRole;
  match_score: number;
  required_match_pct: number;
  preferred_match_pct: number;
  matched_skills: string[];
  missing_required_skills: string[];
  missing_preferred_skills: string[];
  fit_reasons: string[];
  readiness_level: string;
}

export interface SkillGapItem {
  name: string;
  category: string;
  is_required: boolean;
  severity: string;
  status: string;
}

export interface RoleGapAnalysis {
  role: CareerRole;
  overall_match_score: number;
  total_required: number;
  matched_required: number;
  total_preferred: number;
  matched_preferred: number;
  skills_breakdown: SkillGapItem[];
  next_steps: string[];
}

export interface JobListing {
  id: number;
  title: string;
  company: string;
  location: string;
  job_type: string;
  experience_level: string;
  salary_range: string;
  domain: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  is_sample: boolean;
  created_at: string;
}

export interface JobMatch {
  id?: number;
  job_id?: number;
  job_title: string;
  company: string;
  compatibility_score: number;
  matched_skills: string[];
  missing_skills: string[];
  experience_alignment: string;
  tailoring_advice: string[];
  created_at?: string;
}

export interface SavedJob {
  id: number;
  user_id: number;
  job_id: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  job: JobListing;
}

export interface LearningResource {
  title: string;
  url: string;
  type: string;
  is_free: boolean;
  provider?: string;
}

export interface RoadmapStep {
  id: number;
  roadmap_id: number;
  step_order: number;
  title: string;
  skill_name: string;
  phase: string;
  description: string;
  estimated_hours: number;
  is_completed: boolean;
  resources: LearningResource[];
  practical_project?: string;
}

export interface LearningRoadmap {
  id: number;
  user_id: number;
  role_id?: number;
  target_role: string;
  title: string;
  description?: string;
  estimated_weeks: number;
  pace: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  steps: RoadmapStep[];
}

export interface DashboardSummary {
  user: {
    id: number;
    full_name: string;
    email: string;
    headline?: string;
    target_role: string;
    completeness_score: number;
    skills: string[];
  };
  resume: {
    latest_file?: {
      id: number;
      filename: string;
      uploaded_at: string;
    };
    analysis?: ResumeAnalysis;
  };
  career_recommendations: CareerRecommendation[];
  active_roadmap?: {
    id: number;
    title: string;
    target_role: string;
    progress_percentage: number;
    total_steps: number;
    completed_steps: number;
    next_step?: {
      id: number;
      title: string;
      phase: string;
      skill_name: string;
      estimated_hours: number;
    };
  };
  job_tracker: {
    total: number;
    saved: number;
    applied: number;
    interviewing: number;
    offered: number;
  };
}
