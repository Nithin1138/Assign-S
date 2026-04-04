import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Calculator,
  Coins,
  FileDown
} from 'lucide-react';
import { AppLayout as Layout } from '../app/layout/AppLayout';
import Aurora from '../features/editor/components/Aurora';
import clsx from 'clsx';
import { useAuth } from '../features/auth/context/AuthContext';

const PriceCard = ({
  title,
  price,
  period,
  features,
  buttonText,
  isPopular,
  isBestValue,
  delay
}: any) => {
  const { profile } = useAuth();
  const isGlass = profile?.preferences?.glassmorphism ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={clsx(
        "relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-500 group",
        isPopular
          ? "border-[var(--accent-main)] bg-stone-900 text-white shadow-[0_40px_80px_rgba(0,0,0,0.3)] scale-105 z-10"
          : "border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-main)] shadow-xl hover:shadow-2xl hover:-translate-y-2",
        isGlass && !isPopular && "glass-card border-none"
      )}
    >
      {isPopular && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[var(--accent-main)] text-stone-900 text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg">
          Most Popular
        </div>
      )}

      {isBestValue && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg">
          Best Value
        </div>
      )}

      <div className="mb-8">
        <h3 className={clsx("text-lg font-bold mb-2 uppercase tracking-widest", isPopular ? "text-amber-400" : "text-[var(--text-muted)]")}>
          {title}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-black tracking-tighter">{price}</span>
          {period && <span className={clsx("text-sm font-medium", isPopular ? "text-stone-400" : "text-[var(--text-muted)]")}>{period}</span>}
        </div>
      </div>

      <div className="flex-1 space-y-4 mb-10">
        {features.map((feature: string, i: number) => (
          <div key={i} className="flex items-start gap-3">
            <div className={clsx(
              "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
              isPopular ? "bg-amber-400/20 text-amber-400" : "bg-stone-100 text-stone-600"
            )}>
              <Check size={12} strokeWidth={3} />
            </div>
            <span className={clsx("text-sm font-medium leading-relaxed", isPopular ? "text-stone-300" : "text-[var(--text-muted)]")}>
              {feature}
            </span>
          </div>
        ))}
      </div>

      <button className={clsx(
        "w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 shadow-xl",
        isPopular
          ? "bg-white text-stone-900 hover:bg-amber-400"
          : "bg-[var(--text-main)] text-[var(--bg-card)] hover:opacity-90"
      )}>
        {buttonText}
      </button>

      {isPopular && (
        <div className="absolute inset-0 pointer-events-none rounded-[2.5rem] overflow-hidden">
          <div className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] bg-amber-400/10 blur-[100px]" />
        </div>
      )}
    </motion.div>
  );
};

const BillingPage = () => {
  const { profile } = useAuth();

  const plans = [
    {
      title: "Scholarly Free",
      price: "₹0",
      features: [
        "1 Assignment per week",
        "Max 5 pages generation",
        "Fundamental formatting",
        "Standard templates",
        "Digital preview only"
      ],
      buttonText: "Join for free",
      delay: 0.1
    },
    {
      title: "Archive Pro",
      price: "₹99",
      period: "monthly",
      features: [
        "10 Assignments per month",
        "Unlimited PDF/DOCX downloads",
        "Complete Blueprint Library",
        "Advanced AI Synthesizer",
        "Priority processing stack",
        "Scholarly watermark removal"
      ],
      buttonText: "Elevate to pro",
      isPopular: true,
      delay: 0.2
    },
    {
      title: "Semester Pass",
      price: "₹399",
      period: "6 months",
      features: [
        "80 Assignments per term",
        "Highest priority queue",
        "Elite Blueprint access",
        "Full AI editing ecosystem",
        "Best value for researchers",
        "Platinum support guild"
      ],
      buttonText: "Secure Pass",
      isBestValue: true,
      delay: 0.3
    }
  ];

  const payPerUse = [
    { pages: '5 Research Pages', price: '₹10' },
    { pages: '10 Research Pages', price: '₹20' },
    { pages: '20 Research Pages', price: '₹30' },
  ];

  const creditOptions = [
    { amount: '₹50', credits: '25 AI Credits' },
    { amount: '₹100', credits: '60 AI Credits' },
  ];

  const comparisonFeatures = [
    { feature: 'Generation Volume', free: '1 / week', pro: '10 / month', semester: '80 / 6 mos' },
    { feature: 'Maximum Research Pages', free: '5 pages', pro: 'Unlimited', semester: 'Unlimited' },
    { feature: 'Template Repository', free: 'Standard', pro: 'Complete', semester: 'Premium' },
    { feature: 'AI Processing Queue', free: 'Standard', pro: 'High Priority', semester: 'Immediate' },
    { feature: 'Watermark Removal', free: 'No', pro: 'Yes', semester: 'Yes' },
    { feature: 'Blueprint Access', free: 'Basic', pro: 'Advanced', semester: 'Elite' },
    { feature: 'Export Formats', free: 'PDF Only', pro: 'All Formats', semester: 'All Formats' },
  ];

  return (
    <Layout>
      <div className="relative min-h-screen bg-[var(--bg-app)] selection:bg-amber-400 selection:text-stone-900">
        {/* Immersive Background */}
        <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
          <Aurora 
            colorStops={['#F5F5F0', '#E5E4E2', '#F5F5F0']} 
            speed={0.15} 
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto pt-12 pb-24 px-6 lg:px-10">
          {/* Header */}
          <header className="text-center mb-16 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-amber-400/10 border border-amber-400/20 text-[11px] font-black uppercase tracking-[0.4em] text-amber-600"
            >
              <Sparkles size={14} /> Subscription Ecosystem
            </motion.div>
            <div className="space-y-2">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-8xl font-black tracking-[-0.05em] text-[var(--text-main)]"
              >
                Choose your <span className="italic font-serif text-amber-500 underline decoration-stone-200/20 underline-offset-8">plan</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-[var(--text-muted)] max-w-3xl mx-auto font-medium leading-relaxed"
              >
                Generate submission-ready assignments in seconds. Join thousands of scholars on the path to academic excellence.
              </motion.p>
            </div>
          </header>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-40 items-stretch">
            {plans.map((plan, idx) => (
              <PriceCard key={idx} {...plan} />
            ))}
          </div>

          {/* Sub-Plans: Pay-per-use & Credits */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-40">
            {/* Pay-per-use */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group p-12 rounded-[3.5rem] bg-stone-900 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between"
            >
              <div className="relative z-10 space-y-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-black tracking-tight mb-2">Pay-per-use</h3>
                    <p className="text-stone-400 font-medium">Specific tools for occasional scholars</p>
                  </div>
                  <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10 group-hover:rotate-6 transition-transform">
                    <FileDown size={32} className="text-amber-400" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {payPerUse.map((opt, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-amber-400/30 transition-all cursor-pointer group/item">
                      <span className="font-black text-stone-300 group-hover/item:text-white transition-colors">{opt.pages}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-black">{opt.price}</span>
                        <ArrowRight size={18} className="text-stone-500 group-hover/item:text-amber-400 group-hover/item:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 text-center relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-500">Pay only when downloading</p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-amber-400/10 rounded-full blur-[80px]" />
            </motion.div>

            {/* Credits Ecosystem - Unified Dark theme */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group p-12 rounded-[3.5rem] bg-stone-900 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/5"
            >
              <div className="relative z-10 space-y-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-black tracking-tight mb-2">Credits</h3>
                    <p className="text-stone-400 font-medium tracking-wide">Universal tokens for scholarly AI</p>
                  </div>
                  <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10 group-hover:-rotate-6 transition-transform shadow-inner">
                    <Coins size={32} className="text-amber-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {creditOptions.map((opt, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-amber-400/30 transition-all cursor-pointer group/item">
                      <span className="font-black text-stone-300 group-hover/item:text-stone-100 transition-colors uppercase tracking-widest text-xs">{opt.credits}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-black text-white">{opt.amount}</span>
                        <ArrowRight size={18} className="text-stone-500 group-hover/item:text-amber-400 group-hover/item:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 text-center relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-500">Universal currency for AI Synthesizer</p>
              </div>
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-amber-400/10 rounded-full blur-[80px]" />
            </motion.div>
          </div>

          {/* Clean Glass Comparison Interface */}
          <section className="mb-40 max-w-5xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl font-black tracking-tight text-[var(--text-main)]"
              >
                Plan Comparison
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-stone-500 font-medium tracking-wide"
              >
                A unified breakdown of absolute scholarly synthesis capabilities.
              </motion.p>
            </div>

            <div className="overflow-hidden bg-[var(--bg-card)] backdrop-blur-3xl rounded-[3rem] border border-[var(--border-main)] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-main)]">
                    <th className="px-10 py-12 w-1/3"></th>
                    <th className="px-6 py-12 text-center text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)]">Scholarly Free</th>
                    <th className="px-6 py-12 text-center text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 bg-amber-500/[0.03] border-x border-[var(--border-main)]">Archive Pro</th>
                    <th className="px-6 py-12 text-center text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)]">Semester</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-main)]">
                  {comparisonFeatures.map((item, idx) => (
                    <tr key={idx} className="group transition-colors hover:bg-stone-500/[0.02]">
                      <td className="px-10 py-8 text-sm font-bold text-[var(--text-main)] tracking-tight group-hover:text-amber-500 transition-colors">{item.feature}</td>
                      <td className="px-6 py-8 text-center text-sm text-[var(--text-muted)] font-medium">{item.free}</td>
                      <td className="px-6 py-8 text-center text-sm text-[var(--text-main)] font-black bg-amber-500/[0.03] border-x border-[var(--border-main)]">{item.pro}</td>
                      <td className="px-6 py-8 text-center text-sm text-[var(--text-muted)] font-medium">{item.semester}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Final Scholarly CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center space-y-12 py-24 bg-stone-900 rounded-[5rem] text-white overflow-hidden relative shadow-[0_50px_100px_rgba(0,0,0,0.2)]"
          >
            <div className="relative z-10 space-y-8 px-10">
              <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 rotate-12 group hover:rotate-0 transition-all duration-700">
                <Sparkles size={48} className="text-amber-400" />
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9]">Ready to <span className="italic font-serif text-amber-400">excel?</span></h2>
              <p className="text-stone-400 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
                Join the elite guild of thousands of researchers using AssignMate to transform their productivity and achieve academic mastery.
              </p>
              <div className="pt-8">
                <button className="px-16 py-6 bg-white text-stone-900 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-amber-400 transition-all active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)]">
                  Start Synthesizing Now
                </button>
              </div>
            </div>
            
            {/* Background elements */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <Aurora colorStops={['#ffffff', '#888888', '#ffffff']} speed={0.05} />
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default BillingPage;
