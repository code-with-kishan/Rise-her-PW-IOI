import React, { useMemo, useState } from 'react';
import { GlassCard, Button } from '@/components/UI';
import { Sparkles, ShieldCheck, Gauge, Rocket, BrainCircuit, Lock, ArrowRight } from 'lucide-react';

const StrategyVault = () => {
  const [budget, setBudget] = useState(12000);
  const [teamSize, setTeamSize] = useState(8);
  const [confidence, setConfidence] = useState(72);
  const [notice, setNotice] = useState('');
  const [summaryStamp, setSummaryStamp] = useState('');

  const projections = useMemo(() => {
    const readiness = Math.min(99, Math.round(0.002 * budget + teamSize * 4 + confidence * 0.45));
    const revenueLift = Math.round((budget * 0.013 + teamSize * 85) * (confidence / 100));
    const riskIndex = Math.max(6, 100 - readiness);

    return {
      readiness,
      revenueLift,
      riskIndex,
      launchWindow: readiness > 80 ? '2-3 weeks' : readiness > 65 ? '4-6 weeks' : '6-8 weeks',
    };
  }, [budget, teamSize, confidence]);

  const generateSummary = () => {
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setSummaryStamp(now);
    setNotice(`Strategy summary generated at ${now}.`);
  };

  const summaryPoints = useMemo(() => {
    const topFocus = projections.riskIndex > 30
      ? 'Reduce risk first by tightening budget focus and prioritizing 1-2 channels.'
      : 'You can accelerate growth because risk is under control.';

    const budgetAdvice = budget > 30000
      ? 'Current budget is strong. Use phased spending with weekly checkpoints.'
      : 'Increase budget gradually only after conversion metrics stay stable.';

    const teamAdvice = teamSize >= 12
      ? 'Team capacity is good. Assign clear owners for delivery and partnerships.'
      : 'Team is lean. Keep priorities narrow and automate repetitive tasks.';

    return [topFocus, budgetAdvice, teamAdvice];
  }, [budget, teamSize, projections.riskIndex]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/15 via-white to-primary/5 px-5 py-7 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              <Lock size={13} /> Owner-Only Intelligence
            </p>
            <h1 className="mt-3 text-2xl sm:text-4xl font-black text-slate-900">Strategy Vault</h1>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-600">
              Plan your next move with simple controls for budget, team size, and market confidence.
            </p>
          </div>
          <Button
            onClick={generateSummary}
          >
            Generate Strategy Summary <ArrowRight size={16} />
          </Button>
        </div>
      </div>

      {notice && <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">{notice}</div>}

      {summaryStamp && (
        <GlassCard className="border border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Generated Strategy Summary</h2>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary">Updated {summaryStamp}</span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-primary/20 bg-white p-4">
              <p className="text-xs text-slate-500">Readiness</p>
              <p className="mt-1 text-2xl font-black text-primary">{projections.readiness}%</p>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-white p-4">
              <p className="text-xs text-slate-500">Expected Extra Revenue</p>
              <p className="mt-1 text-2xl font-black text-slate-900">${projections.revenueLift.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-white p-4">
              <p className="text-xs text-slate-500">Launch Window</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{projections.launchWindow}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            {summaryPoints.map((point) => (
              <p key={point} className="rounded-xl bg-white px-3 py-2 border border-primary/10">{point}</p>
            ))}
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Business Planning Simulator</h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Live Preview</span>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-600">
                <span>Monthly Growth Budget</span>
                <span>${budget.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={2000}
                max={50000}
                step={500}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-600">
                <span>Execution Team Size</span>
                <span>{teamSize} people</span>
              </div>
              <input
                type="range"
                min={3}
                max={35}
                step={1}
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-600">
                <span>Market Confidence</span>
                <span>{confidence}%</span>
              </div>
              <input
                type="range"
                min={40}
                max={98}
                step={1}
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-xl font-bold">Quick Outcome View</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Business Readiness</p>
              <p className="mt-1 text-3xl font-black text-primary">{projections.readiness}%</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Expected Extra Revenue</p>
              <p className="mt-1 text-3xl font-black text-slate-900">${projections.revenueLift.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Risk Level (lower is better)</p>
              <p className="mt-1 text-3xl font-black text-slate-900">{projections.riskIndex}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <GlassCard>
          <p className="text-xs uppercase tracking-widest text-slate-500">Expected Launch Window</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{projections.launchWindow}</p>
          <p className="mt-2 text-sm text-slate-500"><Rocket size={14} className="inline mr-1" /> Based on your current budget, team size, and confidence.</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs uppercase tracking-widest text-slate-500">Risk Protection</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">Enabled</p>
          <p className="mt-2 text-sm text-slate-500"><ShieldCheck size={14} className="inline mr-1" /> Your plan is checked against high-risk conditions.</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs uppercase tracking-widest text-slate-500">Recommendation Engine</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">Adaptive</p>
          <p className="mt-2 text-sm text-slate-500"><BrainCircuit size={14} className="inline mr-1" /> Suggestions update as you change your planning sliders.</p>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold">Top Priority Suggestions</h3>
            <p className="mt-1 text-sm text-slate-500">Recommended actions from your current plan inputs.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Gauge size={14} /> Live Intelligence
          </span>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-sm font-semibold text-slate-800">Scale high-margin categories first</p>
            <p className="mt-1 text-xs text-slate-500">Expected impact: +12% margin in 60 days.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-sm font-semibold text-slate-800">Increase partner-led campaigns</p>
            <p className="mt-1 text-xs text-slate-500">Expected impact: +18% new lead generation.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-sm font-semibold text-slate-800">Reallocate budget to faster channels</p>
            <p className="mt-1 text-xs text-slate-500">Expected impact: shorter launch cycle by 9 days.</p>
          </div>
        </div>
      </GlassCard>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-primary">
        <Sparkles size={14} className="inline mr-1" /> Simple planning, strong decisions: tune your inputs and use these suggestions to run your business with clarity.
      </div>
    </div>
  );
};

export default StrategyVault;
