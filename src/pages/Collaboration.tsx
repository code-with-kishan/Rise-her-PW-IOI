import React, { useMemo, useState } from 'react';
import { GlassCard, Button } from '@/components/UI';
import { Handshake, Users, Building2, CalendarClock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const openProjects = [
  {
    title: 'Solar Streetlight Pilot',
    partner: 'GreenGrid Collective',
    stage: 'Proposal Review',
    location: 'Nairobi',
  },
  {
    title: 'Women Safety Ride Program',
    partner: 'SafeTransit Network',
    stage: 'Kickoff This Week',
    location: 'Lagos',
  },
  {
    title: 'Community Microgrid Training',
    partner: 'SunSkill Foundation',
    stage: 'Mentor Matching',
    location: 'Kampala',
  },
];

const partnerPool = [
  'Funding Partners',
  'NGOs',
  'Logistics Partners',
  'Mentors',
  'Technology Vendors',
  'Local Communities',
];

const Collaboration = () => {
  const [priority, setPriority] = useState<'speed' | 'impact' | 'cost'>('impact');
  const [selectedPartners, setSelectedPartners] = useState<string[]>(['Funding Partners', 'Mentors']);
  const [notice, setNotice] = useState('');

  const matchScore = useMemo(() => {
    const base = 56;
    const partnerBoost = selectedPartners.length * 7;
    const priorityBoost = priority === 'impact' ? 18 : priority === 'speed' ? 12 : 9;
    return Math.min(99, base + partnerBoost + priorityBoost);
  }, [priority, selectedPartners]);

  const togglePartner = (name: string) => {
    setSelectedPartners((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name]
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-white to-white px-5 py-6 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              <Handshake size={14} /> Collaboration Hub
            </p>
            <h1 className="mt-3 text-2xl sm:text-4xl font-black text-slate-900">Build high-trust partnerships faster</h1>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-600">
              Align partners, funding, and on-ground teams from one workspace to launch projects with lower risk.
            </p>
          </div>
          <Button onClick={() => setNotice('Collaboration request template created and shared with your team.')}>New Collaboration Request <ArrowRight size={16} /></Button>
        </div>
      </div>

      {notice && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <GlassCard className="lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">Live Initiatives</h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">3 Active</span>
          </div>
          <div className="space-y-3">
            {openProjects.map((project) => (
              <div key={project.title} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{project.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      <Building2 size={13} className="inline mr-1" /> {project.partner} • {project.location}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{project.stage}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-xl font-bold">Partner Match Engine</h2>
          <p className="mt-1 text-sm text-slate-500">Tune priorities to discover stronger partnerships.</p>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project Priority</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                { key: 'speed', label: 'Speed' },
                { key: 'impact', label: 'Impact' },
                { key: 'cost', label: 'Cost' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setPriority(item.key as 'speed' | 'impact' | 'cost')}
                  className={
                    priority === item.key
                      ? 'rounded-xl border border-primary/30 bg-primary text-white px-3 py-2 text-xs font-bold'
                      : 'rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50'
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preferred Partner Types</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {partnerPool.map((name) => {
                const active = selectedPartners.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => togglePartner(name)}
                    className={
                      active
                        ? 'rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary'
                        : 'rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50'
                    }
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Recommended Match Score</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{matchScore}%</p>
            <p className="mt-1 text-xs text-slate-500">Higher score indicates stronger alignment for successful collaboration delivery.</p>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="md:col-span-2">
          <h3 className="text-lg font-bold">Collaboration Timeline</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-sm font-semibold text-slate-800">Partner shortlist approved</p>
              <p className="mt-1 text-xs text-slate-500"><CalendarClock size={13} className="inline mr-1" /> Today, 10:30 AM</p>
            </div>
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-sm font-semibold text-slate-800">Risk checklist completed</p>
              <p className="mt-1 text-xs text-slate-500"><ShieldCheck size={13} className="inline mr-1" /> Yesterday, 6:20 PM</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-bold">Team Pulse</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p className="rounded-xl bg-primary/5 px-3 py-2"><Users size={14} className="inline mr-1" /> 12 contributors online</p>
            <p className="rounded-xl bg-primary/5 px-3 py-2"><Sparkles size={14} className="inline mr-1" /> 4 high-impact tasks detected</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Collaboration;
