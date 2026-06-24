import React, { useEffect } from 'react';
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle, Lightbulb, Target, Briefcase, Zap, Star, Compass, ArrowLeft } from 'lucide-react';

export default function Dashboard({ result, onReset }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onReset]);

  if (!result) return null;

  const scoreColor = (score) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-[#3B82F6]'; // Gold for good
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 85) return 'bg-green-400';
    if (score >= 70) return 'bg-[#3B82F6]';
    if (score >= 50) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const ScoreRing = ({ label, score, icon: Icon, isMain = false }) => (
    <div className={`flex flex-col items-center justify-center p-6 bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl ${isMain ? 'col-span-2 md:col-span-1 shadow-[0_0_30px_rgba(230,200,117,0.15)]' : ''}`}>
      <div className="flex items-center gap-2 mb-4 text-gray-400 uppercase tracking-widest text-xs font-bold">
        {Icon && <Icon size={14} className={scoreColor(score)} />}
        {label}
      </div>
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-700/50" />
          <circle 
            cx="48" cy="48" r="40" 
            stroke="currentColor" strokeWidth="6" fill="none" 
            strokeDasharray="251.2" 
            strokeDashoffset={251.2 - (251.2 * score) / 100}
            strokeLinecap="round"
            className={`${scoreColor(score)} transition-all duration-1000 ease-out`} 
          />
        </svg>
        <div className={`text-3xl font-black ${scoreColor(score)}`}>{score}</div>
      </div>
    </div>
  );

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header */}
      <div className="flex flex-col mb-10 gap-6">
        <button 
          onClick={onReset}
          className="self-start flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-2">Analysis Complete</h1>
            <p className="text-gray-600 dark:text-gray-400">Deep AI insights into your career trajectory.</p>
          </div>
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-6 py-3 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30 rounded-full font-bold transition-all shadow-[0_0_15px_rgba(230,200,117,0.2)]"
          >
            <RefreshCw size={18} /> Analyze Another
          </button>
        </div>
      </div>

      {/* Primary Scores Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <ScoreRing label="Employability" score={result.employability_score} icon={Star} isMain={true} />
        <ScoreRing label="ATS Match" score={result.ats_score} icon={Target} />
        <ScoreRing label="Skills" score={result.skill_score} icon={Zap} />
        <ScoreRing label="Projects" score={result.project_score} icon={Briefcase} />
        <ScoreRing label="Interview" score={result.interview_score} icon={CheckCircle2} />
      </div>

      {/* Alternative Pathways Banner */}
      {result.alternative_roles_suggested?.length > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <h3 className="flex items-center gap-2 text-xl font-bold text-blue-400 mb-3">
            <Compass size={24} /> Consider Alternative Pathways
          </h3>
          <p className="text-gray-300 mb-4 text-sm md:text-base">Based on your deep technical skill stack, our AI strongly suggests you would also be highly competitive for:</p>
          <div className="flex flex-wrap gap-3">
            {result.alternative_roles_suggested.map((role, i) => (
              <span key={i} className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full text-sm font-bold shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strengths */}
        <div className="p-8 bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-green-500/20 rounded-3xl">
          <h3 className="flex items-center gap-2 text-xl font-bold text-green-400 mb-6">
            <CheckCircle2 /> Key Strengths
          </h3>
          <ul className="space-y-4">
            {result.strengths?.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-300">
                <span className="mt-1 w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <span className="leading-relaxed text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="p-8 bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-red-500/20 rounded-3xl">
          <h3 className="flex items-center gap-2 text-xl font-bold text-red-400 mb-6">
            <XCircle /> Critical Weaknesses
          </h3>
          <ul className="space-y-4">
            {[...(result.weaknesses || []), ...(result.missing_skills || [])].slice(0, 7).map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-300">
                <span className="mt-1 w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                <span className="leading-relaxed text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Skill Acquisition Guide */}
        {result.skill_acquisition_guide?.length > 0 && (
          <div className="p-8 bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-[#3B82F6]/20 rounded-3xl md:col-span-2 shadow-[0_0_30px_rgba(230,200,117,0.05)]">
            <h3 className="flex items-center gap-2 text-xl font-bold text-[#3B82F6] mb-6">
              <Lightbulb /> Actionable Skill Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.skill_acquisition_guide.map((item, i) => (
                <div key={i} className="p-5 bg-[#3B82F6]/5 border border-[#3B82F6]/10 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 w-2 h-2 rounded-full bg-[#3B82F6] flex-shrink-0 shadow-[0_0_8px_#3B82F6]" />
                    <span className="text-gray-300 text-sm leading-relaxed">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvement Plan */}
        <div className="p-8 bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl md:col-span-2">
          <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-6">
            <AlertTriangle className="text-orange-400" /> Strategic Improvement Plan
          </h3>
          <div className="space-y-4">
            {result.improvement_plan?.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-orange-400/20 text-orange-400 flex items-center justify-center font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-gray-300 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
