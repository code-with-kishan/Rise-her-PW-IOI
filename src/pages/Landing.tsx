import React from 'react';
import { ArrowRight, Download, Shield, Zap, Heart, MessageSquare, ShoppingBag, Coins, Bot, Mic } from 'lucide-react';
import { Button, GlassCard } from '@/components/UI';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';

const featureCards = [
  {
    icon: Zap,
    title: 'Energy Hub',
    desc: 'Track energy, savings, and clean business growth with lightweight tools.',
  },
  {
    icon: Shield,
    title: 'Safety Tools',
    desc: 'Panic support, safer routes, and emergency access in one place.',
  },
  {
    icon: Heart,
    title: 'Health Support',
    desc: 'Mood tracking and health learning modules for daily wellbeing.',
  },
  {
    icon: MessageSquare,
    title: 'AI Assistant',
    desc: 'Get business and wellness guidance with multilingual AI support.',
  },
  {
    icon: ShoppingBag,
    title: 'Marketplace',
    desc: 'Explore products and 3D model-enabled listings from trusted sellers.',
  },
  {
    icon: Coins,
    title: 'Funding Access',
    desc: 'Find grants, opportunities, and practical resources to scale faster.',
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const { setIsVoicePanelOpen } = useStore();

  return (
    <div className="min-h-screen px-4 sm:px-6 pb-24 relative">
      <section className="mx-auto max-w-6xl text-center pt-10 sm:pt-16 md:pt-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/45 backdrop-blur-md px-4 py-2 text-xs font-bold uppercase tracking-widest text-sky-800 shadow-[0_2px_12px_rgba(56,189,248,0.12)]">
          <Zap size={14} className="text-amber-500 animate-pulse" /> Women-led clean energy ecosystem
        </div>

        <h1 className="mt-8 text-3xl font-black leading-[1.1] sm:text-5xl md:text-7xl tracking-tight text-slate-900">
          Build safer, smarter,
          <span className="gradient-text block sm:inline"> faster businesses</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
          RISEher gives women entrepreneurs a unified, high-performance platform for AI support, marketplace, safety, and business growth.
        </p>

        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-2xl mx-auto">
          <Button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-4 text-base font-bold shadow-lg">
            Start Now <ArrowRight size={18} />
          </Button>
          <Button variant="secondary" onClick={() => navigate('/ai')} className="w-full sm:w-auto px-8 py-4 text-base font-semibold">
            Open Chatbot <Bot size={18} />
          </Button>
          <a
            href="/RISEher.apk"
            download
            className="btn-secondary w-full sm:w-auto px-8 py-4 text-base flex justify-center items-center gap-2"
          >
            Download App <Download size={18} />
          </a>
        </div>
      </section>

      <section className="mx-auto mt-16 sm:mt-24 max-w-6xl">
        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((item) => (
            <GlassCard key={item.title} hoverable className="p-6 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400/20 to-emerald-400/10 border border-sky-200/30 text-sky-600 shadow-inner">
                  <item.icon size={22} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600/90">{item.desc}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 sm:mt-24 max-w-6xl">
        <GlassCard className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-r from-sky-500/10 via-emerald-500/5 to-white/30 p-6 sm:p-12 md:p-14 shadow-xl">
          <div className="absolute top-0 right-0 -z-10 w-[300px] h-[300px] bg-primary/20 blur-[85px] rounded-full pointer-events-none" />
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
            <div className="max-w-xl">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Ready to launch with RISEher?</h2>
              <p className="mt-3 text-base text-slate-600">Sign in, open your dashboard, and start building today.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => navigate('/login')} className="px-8 py-3.5 text-sm font-bold shadow-md">Open Login</Button>
              <Button variant="secondary" onClick={() => navigate('/ai')} className="px-8 py-3.5 text-sm font-semibold">
                Chat with AI <Bot size={16} />
              </Button>
              <Link to="/marketplace" className="btn-secondary px-8 py-3.5 text-sm font-semibold flex items-center justify-center gap-1.5">
                Explore Marketplace
              </Link>
            </div>
          </div>
        </GlassCard>
      </section>

      <footer className="mx-auto mt-20 max-w-6xl border-t border-slate-200/60 pt-8 text-center text-xs text-slate-400">
        © 2026 RISEher. Premium visual dashboard mode enabled.
      </footer>
    </div>
  );
};

export default Landing;
 
