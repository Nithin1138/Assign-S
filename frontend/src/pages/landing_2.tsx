import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Menu,
  X,
  ChevronRight,
  Quote,
  BookOpen,
  ShieldCheck,
  FileSearch,
  FileText,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../features/auth/context/AuthContext';
import clsx from 'clsx';
import Aurora from '../features/editor/components/Aurora';
import DotField from '../shared/components/DotField';
import BorderGlow from '../shared/components/BorderGlow/BorderGlow';

const Landing2 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070810] text-stone-100 font-sans selection:bg-violet-500/30">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-950/80 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center">
              <Sparkles className="text-stone-900" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">AssignMate</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-400 uppercase tracking-widest">
            <a href="#features" className="hover:text-stone-100 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-stone-100 transition-colors">Process</a>
            <a href="#testimonials" className="hover:text-stone-100 transition-colors">Reviews</a>
            <a href="#pricing" className="hover:text-stone-100 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4">
              {user ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2.5 bg-stone-100 text-stone-900 rounded-full text-sm font-bold hover:bg-white transition-all shadow-lg shadow-stone-900/30"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-sm font-bold text-stone-300 hover:text-stone-100 transition-colors"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-6 py-2.5 bg-stone-100 text-stone-900 rounded-full text-sm font-bold hover:bg-white transition-all shadow-lg shadow-stone-900/30"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-stone-400 hover:text-stone-100 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-0 right-0 bg-stone-950 border-b border-stone-800 p-6 md:hidden shadow-xl"
            >
              <div className="flex flex-col gap-6 text-sm font-bold text-stone-400 uppercase tracking-widest">
                <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-stone-100 transition-colors">Features</a>
                <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-stone-100 transition-colors">Process</a>
                <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-stone-100 transition-colors">Reviews</a>
                <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-stone-100 transition-colors">Pricing</a>
                <div className="pt-6 border-t border-stone-800 flex flex-col gap-4">
                  {user ? (
                    <button
                      onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}
                      className="w-full py-4 bg-stone-100 text-stone-900 rounded-2xl font-bold"
                    >
                      Dashboard
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                        className="w-full py-4 text-stone-100 font-bold border border-stone-700 rounded-2xl"
                      >
                        Log in
                      </button>
                      <button
                        onClick={() => { navigate('/signup'); setIsMobileMenuOpen(false); }}
                        className="w-full py-4 bg-stone-100 text-stone-900 rounded-2xl font-bold"
                      >
                        Get Started
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <section className="relative pt-40 pb-32 overflow-hidden flex items-center">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-62">
          <DotField
            dotRadius={1.7}
            dotSpacing={11}
            bulgeOnly={true}
            bulgeStrength={70}
            glowRadius={180}
            sparkle={true}
            waveAmplitude={0.4}
            gradientFrom="rgba(167, 139, 250, 0.42)"
            gradientTo="rgba(34, 211, 238, 0.28)"
            glowColor="#22153A"
          />
        </div>
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:60px_60px]" />
          <div className="absolute -top-24 left-1/4 w-80 h-80 rounded-full bg-violet-500/20 blur-[120px]" />
          <div className="absolute top-1/3 right-0 w-[26rem] h-[26rem] rounded-full bg-cyan-400/15 blur-[140px]" />
        </div>
        <div className="absolute inset-0 z-[2] opacity-40">
          <Aurora colorStops={['#14121F', '#2A2345', '#112534']} amplitude={1.0} blend={0.5} speed={0.4} />
        </div>
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-violet-400/10 to-transparent pointer-events-none z-[3]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <span className="inline-block px-4 py-1.5 mb-8 bg-stone-900/80 text-violet-200 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase border border-violet-400/30 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                Academic Excellence Powered by AI
              </span>
              <h1 className="text-5xl sm:text-7xl md:text-9xl font-bold tracking-tighter text-stone-100 mb-10 leading-[0.9] md:leading-[0.85]">
                Write with <span className="italic font-serif bg-gradient-to-r from-violet-200 via-indigo-200 to-cyan-200 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(139,92,246,0.45)]">precision.</span><br />Deliver with <span className="italic font-serif bg-gradient-to-r from-cyan-200 via-indigo-200 to-violet-200 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(56,189,248,0.4)]">confidence.</span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-stone-400 mb-14 leading-relaxed font-medium">
                The professional writing suite designed specifically for students. Transform complex research into polished assignments with academic-grade AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="w-full sm:w-auto">
                  <BorderGlow
                    className="inline-block w-full"
                    glowColor="280 80 80"
                    borderRadius={24}
                    glowRadius={30}
                    glowIntensity={1.2}
                    colors={['#8b5cf6', '#6366f1', '#22d3ee']}
                  >
                    <button
                      onClick={() => navigate('/signup')}
                      className="relative z-10 w-full sm:w-auto px-12 py-6 bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-200 text-stone-900 rounded-2xl text-lg font-bold hover:brightness-110 transition-all flex items-center justify-center gap-3 group"
                    >
                      Start Writing Free <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </BorderGlow>
                </div>
                <button className="w-full sm:w-auto px-12 py-6 bg-stone-900 text-stone-100 border border-stone-700 rounded-2xl text-lg font-bold hover:bg-stone-800 transition-all">
                  Watch Demo
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 border-y border-stone-800 bg-stone-900/40">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-bold text-stone-500 uppercase tracking-[0.3em] mb-16">Trusted by students from global institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 opacity-60">
            <span className="text-3xl font-serif italic font-bold">Oxford</span>
            <span className="text-3xl font-serif italic font-bold">Harvard</span>
            <span className="text-3xl font-serif italic font-bold">Stanford</span>
            <span className="text-3xl font-serif italic font-bold">MIT</span>
            <span className="text-3xl font-serif italic font-bold">Cambridge</span>
          </div>
        </div>
      </section>

      <section className="py-40 bg-stone-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-[4rem] bg-stone-900 overflow-hidden relative shadow-2xl border border-stone-800">
                <img
                  src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000"
                  alt="Focused student"
                  className="w-full h-full object-cover brightness-75"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-stone-100 rounded-[3rem] p-12 text-stone-900 hidden xl:flex flex-col justify-end shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                <Quote className="text-stone-400 mb-6" size={48} />
                <p className="text-2xl font-serif italic leading-tight">"It's not just an AI; it's a mentor that understands academic rigor."</p>
                <div className="mt-8 pt-8 border-t border-stone-300">
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-widest">James L., Graduate Student</p>
                </div>
              </div>
            </div>
            <div className="space-y-12">
              <div className="space-y-6">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em]">The Mission</span>
                <h2 className="text-6xl font-bold tracking-tight leading-[0.95]">Bridging the gap between AI and Academia.</h2>
                <p className="text-xl text-stone-400 leading-relaxed font-medium">
                  Generic AI tools often fail the test of academic integrity and depth. AssignMate was built by researchers to ensure your work remains original, cited, and rigorous.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-stone-900 rounded-2xl border border-stone-700 flex items-center justify-center text-stone-100">
                    <BookOpen size={24} />
                  </div>
                  <h4 className="text-xl font-bold">Context Aware</h4>
                  <p className="text-stone-400 leading-relaxed">Our models are trained on academic papers, not just web content, ensuring appropriate tone and depth.</p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-stone-900 rounded-2xl border border-stone-700 flex items-center justify-center text-stone-100">
                    <ShieldCheck size={24} />
                  </div>
                  <h4 className="text-xl font-bold">Integrity First</h4>
                  <p className="text-stone-400 leading-relaxed">Built-in plagiarism detection and citation management keep your work safe and professional.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-40 bg-stone-900/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-32">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em] mb-6 block">Capabilities</span>
            <h2 className="text-6xl font-bold tracking-tight mb-8">A complete suite for the modern scholar.</h2>
            <p className="text-2xl text-stone-400 font-medium">From initial research to final formatting, we've automated the tedious parts so you can focus on the ideas.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-800 border border-stone-800 rounded-[3rem] overflow-hidden shadow-2xl">
            {[
              { title: 'Template Parsing', desc: 'Upload your assignment brief or a sample document. Our AI extracts the structure and requirements automatically.', icon: FileSearch },
              { title: 'Deep Generation', desc: 'Generate comprehensive drafts section by section. Maintain logical flow and consistent academic tone throughout.', icon: Sparkles },
              { title: 'Citation Engine', desc: 'Automatic APA, MLA, and Chicago formatting. Never lose marks for a missing comma in your bibliography again.', icon: BookOpen },
              { title: 'Plagiarism Shield', desc: 'Real-time scanning against billions of sources. Ensure your work is 100% original before you submit.', icon: ShieldCheck },
              { title: 'Smart Editor', desc: 'A distraction-free writing environment with AI-powered expansion, summarization, and rephrasing tools.', icon: FileText },
              { title: 'One-Click Export', desc: 'Download your work as a perfectly formatted DOCX or PDF. Ready for submission in seconds.', icon: Download },
            ].map((feature, i) => (
              <div key={i} className="p-16 bg-stone-950 hover:bg-stone-900 transition-colors group">
                <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mb-10 text-stone-900 group-hover:scale-110 transition-transform">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-6">{feature.title}</h3>
                <p className="text-stone-400 leading-relaxed text-lg">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-40 bg-stone-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-32">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em] mb-6 block">Investment</span>
            <h2 className="text-6xl font-bold tracking-tight mb-8">Simple, transparent pricing.</h2>
            <p className="text-xl text-stone-400 font-medium">Choose the plan that fits your academic journey.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Free', price: '$0', desc: 'Perfect for trying out AssignMate.', features: ['3 Assignments / month', 'Standard AI Generation', 'PDF Export', 'Basic Templates'], cta: 'Start Free', popular: false },
              { name: 'Pro', price: '$12', period: '/mo', desc: 'For serious students who want the best.', features: ['Unlimited Assignments', 'Academic-Grade AI', 'DOCX & PDF Export', 'Advanced Template Parsing', 'Plagiarism Detection'], cta: 'Get Pro', popular: true },
              { name: 'Team', price: '$29', period: '/mo', desc: 'For study groups and research labs.', features: ['Everything in Pro', 'Collaborative Editing', 'Shared Templates', 'Priority Support', 'Team Analytics'], cta: 'Contact Sales', popular: false },
            ].map((plan, i) => (
              <div
                key={i}
                className={clsx(
                  'relative overflow-hidden p-12 rounded-[3rem] border transition-all duration-300 flex flex-col',
                  plan.popular
                    ? 'bg-gradient-to-b from-stone-100 to-stone-200 text-stone-900 border-stone-100 shadow-2xl shadow-black/40 scale-105 z-10'
                    : 'bg-gradient-to-b from-stone-900 to-stone-950 text-stone-100 border-stone-800 hover:border-violet-400/40'
                )}
              >
                <div
                  className={clsx(
                    'pointer-events-none absolute left-0 right-0 bottom-0 h-24',
                    // Opposite directional hotspot per card (towards center).
                    i === 0 && 'bg-[radial-gradient(72%_130%_at_86%_100%,rgba(34,211,238,0.45),rgba(34,211,238,0.20)_32%,transparent_74%)]',
                    i === 1 && 'bg-[radial-gradient(70%_130%_at_50%_100%,rgba(167,139,250,0.52),rgba(167,139,250,0.24)_34%,transparent_74%)]',
                    i === 2 && 'bg-[radial-gradient(72%_130%_at_14%_100%,rgba(34,211,238,0.45),rgba(34,211,238,0.20)_32%,transparent_74%)]'
                  )}
                />
                <div
                  className={clsx(
                    'pointer-events-none absolute bottom-0 h-px',
                    i === 0 && 'left-5 right-12 bg-gradient-to-r from-transparent via-cyan-300 to-cyan-400/80',
                    i === 1 && 'left-8 right-8 bg-gradient-to-r from-transparent via-violet-400 to-transparent',
                    i === 2 && 'left-12 right-5 bg-gradient-to-r from-cyan-400/80 via-cyan-300 to-transparent'
                  )}
                />
                <div className="mb-10">
                  <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-5xl font-bold tracking-tighter">{plan.price}</span>
                    {plan.period && <span className={clsx('text-lg font-medium', plan.popular ? 'text-stone-600' : 'text-stone-400')}>{plan.period}</span>}
                  </div>
                  <p className={clsx('text-sm font-medium', plan.popular ? 'text-stone-600' : 'text-stone-400')}>{plan.desc}</p>
                </div>
                <ul className="space-y-4 mb-12 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm font-medium">
                      <CheckCircle2 size={18} className={plan.popular ? 'text-stone-900' : 'text-stone-100'} />
                      <span className={plan.popular ? 'text-stone-700' : 'text-stone-300'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/signup')}
                  className={clsx(
                    'w-full py-5 rounded-2xl font-bold text-lg transition-all active:scale-[0.98]',
                    plan.popular ? 'bg-stone-900 text-stone-100 hover:bg-black' : 'bg-stone-100 text-stone-900 hover:bg-white'
                  )}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-40 bg-stone-900/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-32">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em] mb-6 block">The Workflow</span>
            <h2 className="text-6xl font-bold tracking-tight">From brief to submission.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { step: '01', title: 'Upload Template', desc: 'Drop your assignment brief or a sample document to set the structure.' },
              { step: '02', title: 'AI Generation', desc: 'Our models draft the content section by section based on your requirements.' },
              { step: '03', title: 'Refine & Edit', desc: 'Polish the draft in our smart editor with built-in AI writing assistance.' },
              { step: '04', title: 'Export & Submit', desc: 'Download a professional DOCX or PDF file ready for your professor.' },
            ].map((item, i) => (
              <div key={i} className="relative space-y-8">
                <div className="text-8xl font-serif italic font-bold text-stone-800 absolute -top-12 -left-4 z-0">{item.step}</div>
                <div className="relative z-10 pt-8">
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-stone-400 leading-relaxed">{item.desc}</p>
                </div>
                {i < 3 && <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-px bg-stone-700"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-40 bg-stone-100 text-stone-900 overflow-hidden relative">
        <div className="absolute inset-0 z-0 opacity-30">
          <Aurora colorStops={['#D5D7E6', '#B6B8C8', '#D5D7E6']} speed={0.2} />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-1 space-y-8">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em]">Testimonials</span>
              <h2 className="text-6xl font-bold tracking-tight leading-[0.95]">What the community says.</h2>
              <p className="text-xl text-stone-600 leading-relaxed">Join 10,000+ students who have upgraded their academic workflow.</p>
              <div className="flex items-center gap-4 pt-8">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-stone-100 bg-stone-200 overflow-hidden">
                      <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-bold text-stone-700 uppercase tracking-widest">4.9/5 Rating</p>
              </div>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { name: 'Sarah K.', role: 'PhD Candidate', quote: "The structure extraction tool saved me hours of planning. It perfectly understood my professor's complex brief." },
                { name: 'David M.', role: 'Undergrad Student', quote: "I was skeptical about AI for writing, but AssignMate's focus on academic tone is unmatched. It's my daily driver now." },
                { name: 'Elena R.', role: 'Law Student', quote: "The citation manager alone is worth the price. It handles legal citations better than any other tool I've tried." },
                { name: 'Marcus T.', role: 'History Major', quote: 'Clean, fast, and reliable. The export to DOCX is seamless and looks professional every time.' },
              ].map((t, i) => (
                <div key={i} className="p-12 rounded-[3rem] bg-white/70 border border-stone-300 backdrop-blur-sm space-y-8">
                  <p className="text-xl font-serif italic text-stone-700">"{t.quote}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-stone-300 rounded-full overflow-hidden">
                      <img src={`https://picsum.photos/seed/test${i}/100/100`} alt={t.name} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-xs text-stone-500 uppercase tracking-widest">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-40 bg-stone-950">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-stone-900 rounded-[4rem] p-20 md:p-32 text-center text-stone-100 relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] border border-stone-800">
            <div className="absolute inset-0 opacity-25 pointer-events-none">
              <Aurora colorStops={['#FFFFFF', '#777777', '#FFFFFF']} />
            </div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-10 leading-[0.9]">Ready to write your best work?</h2>
              <p className="text-2xl text-stone-400 mb-16 font-medium">Join the next generation of academic writers and scholars.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="w-full sm:w-auto">
                  <BorderGlow
                    className="inline-block w-full"
                    glowColor="260 90 85"
                    borderRadius={24}
                    glowRadius={35}
                    glowIntensity={1.4}
                    colors={['#8b5cf6', '#ec4899', '#22d3ee']}
                  >
                    <button
                      onClick={() => navigate('/signup')}
                      className="relative z-10 w-full sm:w-auto px-12 py-6 bg-stone-100 text-stone-900 rounded-2xl text-xl font-bold hover:bg-white transition-all flex items-center justify-center gap-3 group"
                    >
                      Get Started Free <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </BorderGlow>
                </div>
                <button className="w-full sm:w-auto px-12 py-6 bg-transparent text-stone-100 border border-stone-600 rounded-2xl text-xl font-bold hover:bg-stone-800 transition-all">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-32 bg-stone-950 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="text-stone-900" size={20} />
                </div>
                <span className="text-2xl font-bold tracking-tight">AssignMate</span>
              </div>
              <p className="text-xl text-stone-400 max-w-sm leading-relaxed">Empowering the next generation of scholars with ethical, academic-grade artificial intelligence.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em] mb-10">Product</h4>
              <ul className="space-y-6 text-lg font-medium text-stone-400">
                <li><a href="#features" className="hover:text-stone-100 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-stone-100 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-stone-100 transition-colors">AI Assistant</a></li>
                <li><a href="#" className="hover:text-stone-100 transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em] mb-10">Company</h4>
              <ul className="space-y-6 text-lg font-medium text-stone-400">
                <li><a href="#" className="hover:text-stone-100 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-stone-100 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-stone-100 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-stone-100 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-16 border-t border-stone-800 text-xs font-bold text-stone-500 uppercase tracking-[0.3em]">
            <p>© 2026 AssignMate AI. Crafted for excellence.</p>
            <div className="flex gap-12 mt-8 md:mt-0">
              <a href="#" className="hover:text-stone-100 transition-colors">Twitter</a>
              <a href="#" className="hover:text-stone-100 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-stone-100 transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing2;
