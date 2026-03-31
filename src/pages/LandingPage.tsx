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
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../features/auth/context/AuthContext';
import clsx from 'clsx';
import Aurora from '../features/editor/components/Aurora';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans selection:bg-stone-200">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">AssignMate</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-500 uppercase tracking-widest">
            <a href="#features" className="hover:text-stone-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-stone-900 transition-colors">Process</a>
            <a href="#testimonials" className="hover:text-stone-900 transition-colors">Reviews</a>
            <a href="#pricing" className="hover:text-stone-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4">
              {user ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2.5 bg-stone-900 text-white rounded-full text-sm font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-200"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-sm font-bold hover:text-stone-600 transition-colors"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-6 py-2.5 bg-stone-900 text-white rounded-full text-sm font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-200"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-stone-600 hover:text-stone-900 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-0 right-0 bg-white border-b border-stone-100 p-6 md:hidden shadow-xl"
            >
              <div className="flex flex-col gap-6 text-sm font-bold text-stone-500 uppercase tracking-widest">
                <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-stone-900 transition-colors">Features</a>
                <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-stone-900 transition-colors">Process</a>
                <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-stone-900 transition-colors">Reviews</a>
                <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-stone-900 transition-colors">Pricing</a>
                <div className="pt-6 border-t border-stone-100 flex flex-col gap-4">
                  {user ? (
                    <button
                      onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}
                      className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold shadow-lg shadow-stone-200"
                    >
                      Dashboard
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                        className="w-full py-4 text-stone-900 font-bold border border-stone-200 rounded-2xl"
                      >
                        Log in
                      </button>
                      <button
                        onClick={() => { navigate('/signup'); setIsMobileMenuOpen(false); }}
                        className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold shadow-lg shadow-stone-200"
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

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0 opacity-30">
          <Aurora
            colorStops={['#E4E3E0', '#D1D1D1', '#E4E3E0']}
            amplitude={1.0}
            blend={0.5}
            speed={0.4}
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-1.5 mb-8 bg-stone-100 text-stone-600 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase">
                Academic Excellence Powered by AI
              </span>
              <h1 className="text-5xl sm:text-7xl md:text-9xl font-bold tracking-tighter text-stone-900 mb-10 leading-[0.9] md:leading-[0.85]">
                Write with <span className="italic font-serif">precision.</span><br />Deliver with <span className="italic font-serif">confidence.</span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-stone-500 mb-14 leading-relaxed font-medium">
                The professional writing suite designed specifically for students. Transform complex research into polished assignments with academic-grade AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full sm:w-auto px-12 py-6 bg-stone-900 text-white rounded-2xl text-lg font-bold hover:bg-stone-800 transition-all shadow-2xl shadow-stone-300 flex items-center justify-center gap-3 group btn-aurora"
                >
                  Start Writing Free <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full sm:w-auto px-12 py-6 bg-white text-stone-900 border border-stone-200 rounded-2xl text-lg font-bold hover:bg-stone-50 transition-all">
                  Watch Demo
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof / Logos */}
      <section className="py-24 border-y border-stone-100 bg-stone-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em] mb-16">Trusted by students from global institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 opacity-30 grayscale contrast-125">
            <span className="text-3xl font-serif italic font-bold">Oxford</span>
            <span className="text-3xl font-serif italic font-bold">Harvard</span>
            <span className="text-3xl font-serif italic font-bold">Stanford</span>
            <span className="text-3xl font-serif italic font-bold">MIT</span>
            <span className="text-3xl font-serif italic font-bold">Cambridge</span>
          </div>
        </div>
      </section>

      {/* Product Introduction - The Problem/Solution */}
      <section className="py-40 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-[4rem] bg-stone-100 overflow-hidden relative shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000"
                  alt="Focused student"
                  className="w-full h-full object-cover grayscale brightness-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent"></div>
              </div>
              <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-stone-900 rounded-[3rem] p-12 text-white hidden xl:flex flex-col justify-end shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
                <Quote className="text-stone-700 mb-6" size={48} />
                <p className="text-2xl font-serif italic leading-tight">"It's not just an AI; it's a mentor that understands academic rigor."</p>
                <div className="mt-8 pt-8 border-t border-stone-800">
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">James L., Graduate Student</p>
                </div>
              </div>
            </div>
            <div className="space-y-12">
              <div className="space-y-6">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em]">The Mission</span>
                <h2 className="text-6xl font-bold tracking-tight leading-[0.95]">Bridging the gap between AI and Academia.</h2>
                <p className="text-xl text-stone-500 leading-relaxed font-medium">
                  Generic AI tools often fail the test of academic integrity and depth. AssignMate was built by researchers to ensure your work remains original, cited, and rigorous.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-900">
                    <BookOpen size={24} />
                  </div>
                  <h4 className="text-xl font-bold">Context Aware</h4>
                  <p className="text-stone-500 leading-relaxed">Our models are trained on academic papers, not just web content, ensuring appropriate tone and depth.</p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-900">
                    <ShieldCheck size={24} />
                  </div>
                  <h4 className="text-xl font-bold">Integrity First</h4>
                  <p className="text-stone-500 leading-relaxed">Built-in plagiarism detection and citation management keep your work safe and professional.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-40 bg-stone-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-32">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-6 block">Capabilities</span>
            <h2 className="text-6xl font-bold tracking-tight mb-8">A complete suite for the modern scholar.</h2>
            <p className="text-2xl text-stone-500 font-medium">From initial research to final formatting, we've automated the tedious parts so you can focus on the ideas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-200 border border-stone-200 rounded-[3rem] overflow-hidden shadow-2xl">
            {[
              {
                title: "Template Parsing",
                desc: "Upload your assignment brief or a sample document. Our AI extracts the structure and requirements automatically.",
                icon: FileSearch
              },
              {
                title: "Deep Generation",
                desc: "Generate comprehensive drafts section by section. Maintain logical flow and consistent academic tone throughout.",
                icon: Sparkles
              },
              {
                title: "Citation Engine",
                desc: "Automatic APA, MLA, and Chicago formatting. Never lose marks for a missing comma in your bibliography again.",
                icon: BookOpen
              },
              {
                title: "Plagiarism Shield",
                desc: "Real-time scanning against billions of sources. Ensure your work is 100% original before you submit.",
                icon: ShieldCheck
              },
              {
                title: "Smart Editor",
                desc: "A distraction-free writing environment with AI-powered expansion, summarization, and rephrasing tools.",
                icon: FileText
              },
              {
                title: "One-Click Export",
                desc: "Download your work as a perfectly formatted DOCX or PDF. Ready for submission in seconds.",
                icon: Download
              }
            ].map((feature, i) => (
              <div key={i} className="p-16 bg-white hover:bg-stone-50 transition-colors group">
                <div className="w-12 h-12 bg-stone-900 rounded-xl flex items-center justify-center mb-10 text-white group-hover:scale-110 transition-transform">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-6">{feature.title}</h3>
                <p className="text-stone-500 leading-relaxed text-lg">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-32">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-6 block">Investment</span>
            <h2 className="text-6xl font-bold tracking-tight mb-8">Simple, transparent pricing.</h2>
            <p className="text-xl text-stone-500 font-medium">Choose the plan that fits your academic journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Free",
                price: "$0",
                desc: "Perfect for trying out AssignMate.",
                features: ["3 Assignments / month", "Standard AI Generation", "PDF Export", "Basic Templates"],
                cta: "Start Free",
                popular: false
              },
              {
                name: "Pro",
                price: "$12",
                period: "/mo",
                desc: "For serious students who want the best.",
                features: ["Unlimited Assignments", "Academic-Grade AI", "DOCX & PDF Export", "Advanced Template Parsing", "Plagiarism Detection"],
                cta: "Get Pro",
                popular: true
              },
              {
                name: "Team",
                price: "$29",
                period: "/mo",
                desc: "For study groups and research labs.",
                features: ["Everything in Pro", "Collaborative Editing", "Shared Templates", "Priority Support", "Team Analytics"],
                cta: "Contact Sales",
                popular: false
              }
            ].map((plan, i) => (
              <div
                key={i}
                className={clsx(
                  "p-12 rounded-[3rem] border transition-all duration-300 flex flex-col",
                  plan.popular
                    ? "bg-stone-900 text-white border-stone-900 shadow-2xl shadow-stone-300 scale-105 z-10"
                    : "bg-white text-stone-900 border-stone-100 hover:border-stone-200"
                )}
              >
                <div className="mb-10">
                  <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-5xl font-bold tracking-tighter">{plan.price}</span>
                    {plan.period && <span className={clsx("text-lg font-medium", plan.popular ? "text-stone-400" : "text-stone-500")}>{plan.period}</span>}
                  </div>
                  <p className={clsx("text-sm font-medium", plan.popular ? "text-stone-400" : "text-stone-500")}>{plan.desc}</p>
                </div>

                <ul className="space-y-4 mb-12 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm font-medium">
                      <CheckCircle2 size={18} className={plan.popular ? "text-white" : "text-stone-900"} />
                      <span className={plan.popular ? "text-stone-300" : "text-stone-600"}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate('/signup')}
                  className={clsx(
                    "w-full py-5 rounded-2xl font-bold text-lg transition-all active:scale-[0.98]",
                    plan.popular
                      ? "bg-white text-stone-900 hover:bg-stone-50"
                      : "bg-stone-900 text-white hover:bg-stone-800"
                  )}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Process Flow */}
      <section id="how-it-works" className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-32">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-6 block">The Workflow</span>
            <h2 className="text-6xl font-bold tracking-tight">From brief to submission.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { step: "01", title: "Upload Template", desc: "Drop your assignment brief or a sample document to set the structure." },
              { step: "02", title: "AI Generation", desc: "Our models draft the content section by section based on your requirements." },
              { step: "03", title: "Refine & Edit", desc: "Polish the draft in our smart editor with built-in AI writing assistance." },
              { step: "04", title: "Export & Submit", desc: "Download a professional DOCX or PDF file ready for your professor." }
            ].map((item, i) => (
              <div key={i} className="relative space-y-8">
                <div className="text-8xl font-serif italic font-bold text-stone-100 absolute -top-12 -left-4 z-0">{item.step}</div>
                <div className="relative z-10 pt-8">
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-stone-500 leading-relaxed">{item.desc}</p>
                </div>
                {i < 3 && <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-px bg-stone-200"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      <section id="testimonials" className="py-40 bg-stone-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 z-0 opacity-10">
          <Aurora colorStops={['#FFFFFF', '#A1A1A1', '#FFFFFF']} speed={0.2} />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-1 space-y-8">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em]">Testimonials</span>
              <h2 className="text-6xl font-bold tracking-tight leading-[0.95]">What the community says.</h2>
              <p className="text-xl text-stone-400 leading-relaxed">Join 10,000+ students who have upgraded their academic workflow.</p>
              <div className="flex items-center gap-4 pt-8">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => <div key={i} className="w-12 h-12 rounded-full border-4 border-stone-900 bg-stone-800 overflow-hidden"><img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" /></div>)}
                </div>
                <p className="text-sm font-bold text-stone-300 uppercase tracking-widest">4.9/5 Rating</p>
              </div>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { name: "Sarah K.", role: "PhD Candidate", quote: "The structure extraction tool saved me hours of planning. It perfectly understood my professor's complex brief." },
                { name: "David M.", role: "Undergrad Student", quote: "I was skeptical about AI for writing, but AssignMate's focus on academic tone is unmatched. It's my daily driver now." },
                { name: "Elena R.", role: "Law Student", quote: "The citation manager alone is worth the price. It handles legal citations better than any other tool I've tried." },
                { name: "Marcus T.", role: "History Major", quote: "Clean, fast, and reliable. The export to DOCX is seamless and looks professional every time." }
              ].map((t, i) => (
                <div key={i} className="p-12 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-sm space-y-8">
                  <p className="text-xl font-serif italic text-stone-200">"{t.quote}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-stone-800 rounded-full overflow-hidden">
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

      {/* Final CTA */}
      <section className="py-40 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-stone-900 rounded-[4rem] p-20 md:p-32 text-center text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <Aurora colorStops={['#FFFFFF', '#A1A1A1', '#FFFFFF']} />
            </div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-10 leading-[0.9]">Ready to write your best work?</h2>
              <p className="text-2xl text-stone-400 mb-16 font-medium">Join the next generation of academic writers and scholars.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full sm:w-auto px-12 py-6 bg-white text-stone-900 rounded-2xl text-xl font-bold hover:bg-stone-50 transition-all shadow-2xl flex items-center justify-center gap-3 group btn-aurora-light"
                >
                  Get Started Free <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full sm:w-auto px-12 py-6 bg-transparent text-white border border-white/20 rounded-2xl text-xl font-bold hover:bg-white/5 transition-all">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 bg-white border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
                  <Sparkles className="text-white" size={20} />
                </div>
                <span className="text-2xl font-bold tracking-tight">AssignMate</span>
              </div>
              <p className="text-xl text-stone-500 max-w-sm leading-relaxed">Empowering the next generation of scholars with ethical, academic-grade artificial intelligence.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-10">Product</h4>
              <ul className="space-y-6 text-lg font-medium text-stone-600">
                <li><a href="#features" className="hover:text-stone-900 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-stone-900 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-stone-900 transition-colors">AI Assistant</a></li>
                <li><a href="#" className="hover:text-stone-900 transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-10">Company</h4>
              <ul className="space-y-6 text-lg font-medium text-stone-600">
                <li><a href="#" className="hover:text-stone-900 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-stone-900 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-stone-900 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-stone-900 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-16 border-t border-stone-100 text-xs font-bold text-stone-400 uppercase tracking-[0.3em]">
            <p>© 2026 AssignMate AI. Crafted for excellence.</p>
            <div className="flex gap-12 mt-8 md:mt-0">
              <a href="#" className="hover:text-stone-900 transition-colors">Twitter</a>
              <a href="#" className="hover:text-stone-900 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-stone-900 transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
