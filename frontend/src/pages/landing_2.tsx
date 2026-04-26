import React, { useState, useEffect } from 'react';
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
import GradualBlur from '../shared/components/GradualBlur/GradualBlur';
import BorderGlow from '../shared/components/BorderGlow/BorderGlow';
import SplitText from '../shared/components/SplitText/SplitText';
import LogoLoop from '../shared/components/LogoLoop/LogoLoop';
import Hyperspeed from '../shared/components/Hyperspeed/Hyperspeed';
import ShinyText from '../shared/components/ShinyText/ShinyText';
import { Twitter, Linkedin, Instagram, Github, Mail, ArrowUpRight, Facebook } from 'lucide-react';
import toast from 'react-hot-toast';
import { config } from '../shared/config';

const WaitlistModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    
    // Add a timeout to the fetch to prevent "infinite" loading
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${config.apiUrl}/waitlist/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        toast.success("You're on the list!");
        onClose(); 
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        toast.error("Request timed out. Please check your connection.");
      } else {
        toast.error("Failed to connect to server.");
      }
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6">
              <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center border border-violet-500/30 mb-2">
                <Sparkles className="text-violet-400" size={32} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-3xl font-bold tracking-tight text-white leading-tight">Get Early Access</h3>
                <p className="text-stone-400 leading-relaxed">
                  Generate complete assignments from your template in seconds.
                </p>
                <p className="text-xs text-stone-500 mt-2">
                  Join the waitlist and we’ll notify you by email when we launch. Early users get 1 month Pro free.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative flex items-center bg-stone-950 border border-stone-800 rounded-2xl p-1.5 overflow-hidden">
                    <Mail className="ml-4 text-stone-500" size={20} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="bg-transparent border-none outline-none px-4 py-3 w-full text-white placeholder-stone-600 font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-4 bg-stone-100 text-stone-900 rounded-2xl font-bold text-lg hover:bg-white transition-all shadow-xl disabled:opacity-50"
                  >
                    {loading ? 'Joining...' : 'Get Early Access'}
                  </button>
                  <p className="text-center text-[10px] text-stone-500 font-medium uppercase tracking-widest">
                    We only send product updates. No spam.
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Landing2 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);

  const handleAction = () => {
    setIsWaitlistModalOpen(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="text-stone-100 font-sans selection:bg-violet-500/30">
      {/* Fixed background to ensure total coverage regardless of scroll */}
      <div className="fixed inset-0 bg-[#070810] z-[-1]">
        {/* Global Background Effects - Moved outside zoomed container to fill physical screen */}
        <div className="absolute inset-0 opacity-60 pointer-events-none">
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
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none [background-image:linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:60px_60px]" />
      </div>

      <div className="overflow-x-hidden relative min-h-screen w-full">
        <nav
          className={clsx(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
            isScrolled
              ? "bg-stone-950/90 backdrop-blur-xl border-stone-800 py-3"
              : "bg-transparent border-transparent py-5"
          )}
        >
          <div className="w-full px-6 md:px-16 lg:px-20 flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-stone-900/20">
                <Sparkles className="text-stone-900" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-stone-100">AssignMate</span>
            </div>

            <div className="hidden lg:flex items-center gap-6 xl:gap-10 text-[11px] font-bold text-stone-400 uppercase tracking-[0.2em]">
              <a href="#features" className="hover:text-stone-100 transition-all hover:tracking-[0.25em]">Features</a>
              <a href="#how-it-works" className="hover:text-stone-100 transition-all hover:tracking-[0.25em]">Process</a>
              <a href="#testimonials" className="hover:text-stone-100 transition-all hover:tracking-[0.25em]">Reviews</a>
              <a href="#pricing" className="hover:text-stone-100 transition-all hover:tracking-[0.25em]">Pricing</a>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
              <div className="hidden md:flex items-center gap-3 md:gap-6">
                {user ? (
                  <button
                    onClick={handleAction}
                    className="px-6 py-2.5 bg-stone-100 text-stone-900 rounded-full text-sm font-bold hover:bg-white transition-all shadow-lg shadow-stone-900/30 active:scale-95"
                  >
                    Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleAction}
                      className="px-4 py-2 text-sm font-bold text-stone-400 hover:text-stone-100 transition-colors"
                    >
                      Log in
                    </button>
                    <button
                      onClick={handleAction}
                      className="px-6 py-2.5 bg-stone-100 text-stone-900 rounded-full text-sm font-bold hover:bg-white transition-all shadow-lg shadow-stone-900/30 active:scale-95"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-stone-400 hover:text-stone-100 transition-colors bg-stone-900/50 rounded-lg border border-stone-800"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-full left-0 right-0 bg-stone-950/95 backdrop-blur-2xl border-b border-stone-800 p-8 lg:hidden shadow-2xl flex flex-col gap-8"
              >
                <div className="flex flex-col gap-6 text-[11px] font-bold text-stone-400 uppercase tracking-[0.2em]">
                  <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-stone-100 transition-colors">Features</a>
                  <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-stone-100 transition-colors">Process</a>
                  <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-stone-100 transition-colors">Reviews</a>
                  <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-stone-100 transition-colors">Pricing</a>
                </div>
                <div className="pt-8 border-t border-stone-800 flex flex-col gap-4">
                  {user ? (
                    <button
                      onClick={() => { handleAction(); setIsMobileMenuOpen(false); }}
                      className="w-full py-4 bg-stone-100 text-stone-900 rounded-2xl font-bold text-sm shadow-xl shadow-stone-900/40"
                    >
                      Dashboard
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => { handleAction(); setIsMobileMenuOpen(false); }}
                        className="w-full py-4 text-stone-100 font-bold border border-stone-800 rounded-2xl text-sm"
                      >
                        Log in
                      </button>
                      <button
                        onClick={() => { handleAction(); setIsMobileMenuOpen(false); }}
                        className="w-full py-4 bg-stone-100 text-stone-900 rounded-2xl font-bold text-sm shadow-xl shadow-stone-900/40"
                      >
                        Get Started
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <section className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center pt-[12vh] pb-[8vh]">
          {/* Background effects same as before */}
          <div className="absolute inset-0 pointer-events-none z-[1]">
            <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:60px_60px]" />
            <div className="absolute -top-24 left-1/4 w-80 h-80 rounded-full bg-violet-500/20 blur-[120px]" />
            <div className="absolute top-1/3 right-0 w-[26rem] h-[26rem] rounded-full bg-cyan-400/15 blur-[140px]" />
          </div>
          <div className="absolute inset-0 z-[2] opacity-40">
            <Aurora colorStops={['#14121F', '#2A2345', '#112534']} amplitude={1.0} blend={0.5} speed={0.4} />
          </div>
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-violet-400/10 to-transparent pointer-events-none z-[3]" />

          <div className="max-w-[1440px] w-[90%] mx-auto relative z-10">
            <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <span className="inline-block px-4 py-1.5 mb-8 bg-stone-900/80 text-violet-200 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase border border-violet-400/30 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                  Academic Excellence Powered by AI
                </span>
                <h1
                  className="font-bold tracking-tighter text-stone-100 leading-[0.95] md:leading-[0.9]"
                  style={{
                    fontSize: 'clamp(2.5rem, 8vw, 7.5rem)',
                    marginBottom: '3vh'
                  }}
                >
                  Write with<br />
                  <span className="italic font-serif bg-gradient-to-r from-violet-200 via-indigo-200 to-cyan-200 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(139,92,246,0.45)]">precision.</span><br />
                  Deliver with<br />
                  <span className="italic font-serif bg-gradient-to-r from-cyan-200 via-indigo-200 to-violet-200 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(56,189,248,0.4)]">confidence.</span>
                </h1>
                <p
                  className="mx-auto text-stone-400 leading-relaxed font-medium text-center"
                  style={{
                    fontSize: 'clamp(0.9rem, 1.4vw, 1.15rem)',
                    maxWidth: '42vw',
                    marginBottom: '5vh'
                  }}
                >
                  The professional writing suite designed specifically for students. Transform complex research into polished assignments with academic-grade AI.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-[4vh]">
                  <BorderGlow
                    edgeSensitivity={30}
                    glowColor="40 80 80"
                    backgroundColor="#120F17"
                    borderRadius={24}
                    glowRadius={40}
                    glowIntensity={1.0}
                    animated={false}
                    colors={['#c084fc', '#f472b6', '#38bdf8']}
                    className="w-full sm:w-auto"
                  >
                    <button
                      onClick={handleAction}
                      className="w-full px-10 py-4 bg-transparent text-white rounded-2xl text-base font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-3 group"
                    >
                      Start Writing Free <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </BorderGlow>
                  <BorderGlow
                    edgeSensitivity={30}
                    glowColor="40 80 80"
                    backgroundColor="#120F17"
                    borderRadius={24}
                    glowRadius={40}
                    glowIntensity={1.0}
                    animated={false}
                    colors={['#c084fc', '#f472b6', '#38bdf8']}
                    className="w-full sm:w-auto"
                  >
                    <button 
                      onClick={handleAction}
                      className="w-full px-10 py-4 bg-transparent text-white rounded-2xl text-base font-bold hover:bg-white/5 transition-all"
                    >
                      Watch Demo
                    </button>
                  </BorderGlow>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-4 border-y border-stone-800 bg-[#000000] w-full overflow-hidden relative z-10">
          <div className="w-full px-0">
            <p className="text-center text-[10px] font-bold text-stone-500 uppercase tracking-[0.3em] mb-8">Trusted by students from global institutions</p>
            <div className="relative h-8 overflow-hidden">
              <LogoLoop
                logos={[
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">IIT</span> },
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">VIT</span> },
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">SRM</span> },
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">AMRITA</span> },
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">BITS</span> },
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">NIT</span> },
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">JNTU</span> },
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">LPU</span> },
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">AIIMS</span> },
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">OU</span> },
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">BHU</span> },
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">MANIPAL</span> },
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">KIIT</span> },
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">SVEC</span> },
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">JNTU</span> },
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">GITAM</span> },
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">CBIT</span> },
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">NIPER</span> },
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">KLU</span> },
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">IISC</span> },
                  { node: <span className="font-serif italic text-stone-300 opacity-60 hover:opacity-100 transition-opacity">JNTU</span> },
                ]}
                speed={60}
                gap={120}
                logoHeight={32}
                fadeOut={true}
                fadeOutColor="#070810"
                pauseOnHover={true}
              />
            </div>
          </div>
        </section>

        <section className="py-20 bg-stone-950 overflow-hidden">
          <div className="max-w-[1300px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="relative">
                <div className="max-w-[90%] aspect-[4/5] rounded-[4rem] bg-stone-900 overflow-hidden relative shadow-2xl border border-stone-800 mx-auto lg:ml-0">
                  <img
                    src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000"
                    alt="Focused student"
                    className="w-full h-full object-cover brightness-50"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070810] via-transparent to-transparent"></div>
                </div>
                <div className="absolute -bottom-8 -right-4 w-72 h-[17rem] bg-stone-900/60 backdrop-blur-3xl rounded-[2rem] p-7 text-stone-100 hidden xl:flex flex-col justify-between shadow-[0_40px_80px_-15px_rgba(0,0,0,0.9)] border border-stone-100/10 group hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                  {/* Subtle decorative glow */}
                  <div className="absolute -top-8 -right-8 w-20 h-20 bg-violet-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center border border-violet-500/30 shadow-inner">
                    <Quote className="text-violet-300" size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-serif italic leading-snug mb-5 text-stone-200">
                      "It's not just an AI; it's a mentor that understands high-quality writing."
                    </p>
                    <div className="pt-5 border-t border-stone-100/5">
                      <p className="text-[8px] text-violet-400 font-bold uppercase tracking-[0.3em] mb-1">Scholar Insight</p>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-stone-100 tracking-wide">Veera Nithin</span>
                        <span className="text-[9px] text-stone-500 font-medium uppercase tracking-widest mt-0.5">Graduate Student</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-10">
                <div className="space-y-6">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em]">The Mission</span>
                  <h2 className="text-5xl font-bold tracking-tight leading-[0.95]">Bridging the gap between AI and Academia.</h2>
                  <p className="text-lg text-stone-400 leading-relaxed font-medium">
                    Generic AI tools often fail the test of academic integrity and depth. AssignMate was built by researchers to ensure your work remains original, cited, and high-quality.
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



        <section id="features" className="pt-20 pb-20 bg-stone-900/40">
          <div className="max-w-[1300px] mx-auto px-6">
            <div className="max-w-3xl mb-10">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em] mb-4 block">Capabilities</span>
              <SplitText
                text="A complete suite for the modern scholar."
                tag="h2"
                className="text-5xl font-bold tracking-tight mb-6"
                delay={40}
                duration={1}
                splitType="words"
                textAlign="left"
              />
              <p className="text-xl text-stone-400 font-medium">From initial research to final formatting, we've automated the boring parts so you can focus on the ideas.</p>
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
                <div key={i} className="p-10 bg-stone-950 hover:bg-stone-900 transition-colors group">
                  <div className="w-11 h-11 bg-stone-100 rounded-xl flex items-center justify-center mb-8 text-stone-900 group-hover:scale-110 transition-transform">
                    <feature.icon size={22} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-stone-400 leading-relaxed text-base">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="pt-18 pb-18 bg-stone-950">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em] mb-3 block">Investment</span>
              <h2 className="text-4xl font-bold tracking-tight mb-5">
                <ShinyText text="Simple, transparent pricing." speed={3} color="#b5b5b5" shineColor="#ffffff" />
              </h2>
              <p className="text-lg text-stone-400 font-medium">Choose the plan that fits your academic journey.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr_1fr] gap-5 items-end max-w-[1200px] mx-auto">
              {[
                {
                  name: 'SCHOLARLY FREE',
                  price: '₹0',
                  desc: 'Perfect for trying out AssignMate.',
                  features: ['1 Assignment per week', 'Max 5 pages generation', 'Basic formatting', 'Standard templates', 'Digital preview only'],
                  cta: 'JOIN FOR FREE',
                  popular: false
                },
                {
                  name: 'ARCHIVE PRO',
                  price: '₹99',
                  period: '/mo',
                  desc: 'For serious students who want the best.',
                  features: ['10 Assignments per month', 'Unlimited PDF/DOCX downloads', 'Complete Blueprint Library', 'Advanced AI Synthesizer', 'Priority processing stack', 'Scholarly watermark removal'],
                  cta: 'ELEVATE TO PRO',
                  popular: true
                },
                {
                  name: 'SEMESTER PASS',
                  price: '₹399',
                  period: '/6 mo',
                  desc: 'Best value for long-term researchers.',
                  features: ['80 Assignments per term', 'Highest priority queue', 'Top template access', 'Full AI editing ecosystem', 'Best value for you', 'Priority support'],
                  cta: 'SECURE PASS',
                  popular: false,
                  badge: 'BEST VALUE'
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className={clsx(
                    'relative overflow-hidden p-6 rounded-[2rem] border transition-all duration-300 flex flex-col group',
                    plan.popular
                      ? 'bg-gradient-to-b from-stone-900 to-stone-950 text-stone-200 border-violet-500/50 shadow-2xl shadow-violet-900/40 z-10 min-h-[550px]'
                      : 'bg-gradient-to-b from-stone-900 to-stone-950 text-stone-200 border-stone-800 min-h-[510px]',
                    !plan.popular && i === 0 && 'hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]',
                    !plan.popular && i === 2 && 'hover:border-rose-500/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.1)]'
                  )}
                >
                  {plan.badge && (
                    <div className="absolute top-5 right-5 px-2.5 py-1 bg-emerald-500 text-white text-[8px] font-bold rounded-full uppercase tracking-[0.15em] shadow-lg shadow-emerald-500/30 z-20">
                      {plan.badge}
                    </div>
                  )}
                  <div
                    className={clsx(
                      'pointer-events-none absolute left-0 right-0 bottom-0 h-24 transition-opacity duration-500',
                      // Opposite directional hotspot per card (towards center).
                      i === 0 && 'bg-[radial-gradient(72%_130%_at_86%_100%,rgba(52,211,153,0.45),rgba(52,211,153,0.20)_32%,transparent_74%)] opacity-60 group-hover:opacity-100',
                      i === 1 && 'bg-[radial-gradient(70%_130%_at_50%_100%,rgba(167,139,250,0.52),rgba(167,139,250,0.24)_34%,transparent_74%)] opacity-80 group-hover:opacity-100',
                      i === 2 && 'bg-[radial-gradient(72%_130%_at_14%_100%,rgba(244,63,94,0.45),rgba(244,63,94,0.20)_32%,transparent_74%)] opacity-60 group-hover:opacity-100'
                    )}
                  />
                  <div
                    className={clsx(
                      'pointer-events-none absolute bottom-0 h-px transition-opacity duration-500',
                      i === 0 && 'left-5 right-12 bg-gradient-to-r from-transparent via-emerald-300 to-emerald-400/80 opacity-40 group-hover:opacity-100',
                      i === 1 && 'left-8 right-8 bg-gradient-to-r from-transparent via-violet-400 to-transparent opacity-60 group-hover:opacity-100',
                      i === 2 && 'left-12 right-5 bg-gradient-to-r from-rose-400/80 via-rose-300 to-transparent opacity-40 group-hover:opacity-100'
                    )}
                  />
                  <div className="mb-10">
                    <h3 className={clsx(
                      "text-xl font-bold mb-3",
                      plan.name === 'ARCHIVE PRO' ? "text-amber-400" : "text-stone-300"
                    )}>{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-3 text-stone-300">
                      <span className="text-4xl font-bold tracking-tighter">{plan.price}</span>
                      {plan.period && <span className={clsx('text-xs font-medium', plan.popular ? 'text-violet-300' : 'text-stone-500')}>{plan.period}</span>}
                    </div>
                    <p className={clsx('text-sm font-medium', plan.popular ? 'text-stone-300' : 'text-stone-400')}>{plan.desc}</p>
                  </div>
                  <ul className="space-y-4 mb-10 flex-1 relative z-10">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm font-medium">
                        <CheckCircle2 size={18} className={plan.popular ? 'text-violet-400/80' : 'text-stone-500'} />
                        <span className={plan.popular ? 'text-stone-300' : 'text-stone-400'}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <GradualBlur
                    target="parent"
                    position="bottom"
                    height="8rem"
                    strength={3}
                    divCount={6}
                    curve="bezier"
                    exponential={true}
                    opacity={1}
                    zIndex={0}
                  />

                  <div className="relative z-10 mt-auto">
                    <BorderGlow
                      edgeSensitivity={30}
                      glowColor={i === 0 ? "150 70 60" : i === 2 ? "350 80 70" : "40 80 80"}
                      backgroundColor="#120F17"
                      borderRadius={24}
                      glowRadius={40}
                      glowIntensity={1.0}
                      animated={false}
                      colors={
                        i === 0 ? ['#34d399', '#10b981', '#059669'] :
                          i === 2 ? ['#fb7185', '#f43f5e', '#e11d48'] :
                            ['#c084fc', '#f472b6', '#38bdf8']
                      }
                      className="w-full"
                    >
                      <button
                        onClick={handleAction}
                        className="w-full py-4 bg-transparent text-white rounded-2xl font-bold text-base hover:bg-white/5 transition-all active:scale-[0.98]"
                      >
                        {plan.cta}
                      </button>
                    </BorderGlow>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="pt-20 pb-20 bg-stone-900/40">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em] mb-4 block">The Workflow</span>
              <h2 className="text-6xl font-bold tracking-tight">
                <ShinyText text="From brief to submission." speed={3} color="#b5b5b5" shineColor="#ffffff" />
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {[
                { step: '01', title: 'Upload Template', desc: 'Drop your assignment brief or a sample document to set the structure.' },
                { step: '02', title: 'AI Generation', desc: 'Our models draft the content section by section based on your requirements.' },
                { step: '03', title: 'Refine & Edit', desc: 'Polish the draft in our smart editor with built-in AI writing assistance.' },
                { step: '04', title: 'Export & Submit', desc: 'Download a professional DOCX or PDF file ready for your professor.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.4, ease: "easeOut" }}
                  className="relative space-y-8"
                >
                  <div className="text-8xl font-serif italic font-bold text-stone-800 absolute -top-12 -left-1 z-0 opacity-80">{item.step}</div>
                  <div className="relative z-10 pt-8">
                    <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                    <p className="text-stone-400 leading-relaxed">{item.desc}</p>
                  </div>
                  {i < 3 && <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-px bg-stone-700"></div>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="pt-20 pb-20 bg-[#070810] text-stone-400 overflow-hidden relative">
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/20 blur-[120px] rounded-full"></div>
          </div>
          <div className="max-w-[1440px] mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-8">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.4em] mb-4 block">User Reviews</span>
              <h2 className="text-6xl font-bold tracking-tight mb-6">
                <ShinyText text="What the community says." speed={3} color="#b5b5b5" shineColor="#ffffff" />
              </h2>
              <p className="text-xl text-stone-400 font-medium">Discover early user feedback on AssignMate integration within their workflows.</p>
            </div>

            <div className="relative h-[800px] md:h-[600px] flex items-center justify-center">
              {[
                { name: 'Ananya Sharma', role: 'PhD Candidate', quote: "The structure extraction tool saved me hours of planning. It perfectly understood my professor's complex brief.", pos: 'md:-translate-x-[110%] md:-translate-y-[60%] rotate-[-2deg]', date: '2026.04.15' },
                { name: 'Arjun Reddy', role: 'Undergrad Student', quote: "I was skeptical about AI for writing, but AssignMate's focus on academic tone is unmatched. It's my daily driver now.", pos: 'md:translate-x-[100%] md:-translate-y-[45%] rotate-[3deg]', date: '2026.04.08' },
                { name: 'Priyanka Gupta', role: 'Law Student', quote: "The citation manager alone is worth the price. It handles legal citations better than any other tool I've tried.", pos: 'md:-translate-x-[130%] md:translate-y-[10%] rotate-[1deg]', date: '2026.03.22' },
                { name: 'Vikram Iyer', role: 'History Major', quote: 'Clean, fast, and reliable. The export to DOCX is seamless and looks professional every time.', pos: 'md:translate-x-[110%] md:translate-y-[35%] rotate-[-4deg]', date: '2026.04.20' },
                { name: 'Rohan Mehta', role: 'Graduate Student', quote: "Finally an AI that understands academic rigor. It doesn't just write; it researches and cites with precision.", pos: 'md:-translate-x-[20%] md:-translate-y-[20%] rotate-[-1deg]', date: '2026.04.12' },
                { name: 'Kavya Singh', role: 'Biology Senior', quote: "The way it handles scientific terminology is incredible. It feels like it was built specifically for my lab reports.", pos: 'md:translate-x-[15%] md:translate-y-[65%] rotate-[2deg]', date: '2026.04.22' },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className={clsx(
                    "absolute w-full max-w-[420px] p-8 rounded-[2rem] bg-white text-stone-900 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all hover:scale-105 hover:z-50 group cursor-default",
                    t.pos
                  )}
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-stone-200 overflow-hidden shadow-inner">
                        <img src={`https://picsum.photos/seed/user${i + 10}/100/100`} alt={t.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-base tracking-tight">{t.name}</p>
                        <p className="text-[11px] text-stone-500 font-medium leading-none mt-1">{t.role}</p>
                      </div>
                    </div>
                    <p className="text-[15px] leading-relaxed text-stone-700 font-medium">
                      « {t.quote} »
                    </p>
                    <div className="pt-4 flex items-center gap-2 border-t border-stone-100">
                      <div className="w-4 h-4 rounded bg-violet-100 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-600"></div>
                      </div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">AssignMate user, {t.date}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-20 flex flex-col items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-[#070810] bg-stone-900 overflow-hidden">
                    <img src={`https://picsum.photos/seed/member${i}/100/100`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-[0.4em]">Trusted by 10,000+ scholars worldwide</p>
            </div>
          </div>
        </section>

        <section className="pt-20 pb-40 bg-stone-950">
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-stone-900 rounded-[4rem] p-20 md:p-32 text-center text-stone-100 relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] border border-stone-800">
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <Hyperspeed
                  effectOptions={{
                    distortion: 'turbulentDistortion',
                    length: 400,
                    roadWidth: 10,
                    islandWidth: 2,
                    lanesPerRoad: 3,
                    fov: 90,
                    fovSpeedUp: 150,
                    speedUp: 2,
                    carLightsFade: 0.4,
                    totalSideLightSticks: 20,
                    lightPairsPerRoadWay: 40,
                    shoulderLinesWidthPercentage: 0.05,
                    brokenLinesWidthPercentage: 0.1,
                    brokenLinesLengthPercentage: 0.5,
                    lightStickWidth: [0.12, 0.5],
                    lightStickHeight: [1.3, 1.7],
                    movingAwaySpeed: [20, 40],
                    movingCloserSpeed: [-40, -80],
                    carLightsLength: [12, 80],
                    carLightsRadius: [0.05, 0.14],
                    carWidthPercentage: [0.3, 0.5],
                    carShiftX: [-0.8, 0.8],
                    carFloorSeparation: [0, 2],
                    colors: {
                      roadColor: 0x080808,
                      islandColor: 0x0a0a0a,
                      background: 0x000000,
                      shoulderLines: 0xffffff,
                      brokenLines: 0xffffff,
                      leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
                      rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
                      sticks: 0x03b3c3
                    }
                  }}
                />
              </div>
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-10 leading-[0.9]">Ready to write your best work?</h2>
                <p className="text-2xl text-stone-400 mb-16 font-medium">Join the next generation of academic writers and scholars.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <BorderGlow
                    edgeSensitivity={30}
                    glowColor="40 80 80"
                    backgroundColor="transparent"
                    borderRadius={32}
                    glowRadius={40}
                    glowIntensity={1.0}
                    animated={false}
                    fillOpacity={0}
                    colors={['#c084fc', '#f472b6', '#38bdf8']}
                    className="w-full sm:w-auto !border-0 !shadow-none"
                  >
                    <button
                      onClick={handleAction}
                      className="w-full sm:w-auto px-10 py-5 bg-stone-100 text-stone-900 rounded-2xl text-lg font-bold hover:bg-white transition-all shadow-2xl flex items-center justify-center gap-3 group"
                    >
                      Get Started Free <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </BorderGlow>
                  <BorderGlow
                    edgeSensitivity={30}
                    glowColor="40 80 80"
                    backgroundColor="transparent"
                    borderRadius={32}
                    glowRadius={40}
                    glowIntensity={1.0}
                    animated={false}
                    fillOpacity={0}
                    colors={['#c084fc', '#f472b6', '#38bdf8']}
                    className="w-full sm:w-auto !border-0 !shadow-none"
                  >
                    <button 
                      onClick={handleAction}
                      className="w-full sm:w-auto px-12 py-6 bg-transparent text-stone-100 border border-stone-600 rounded-2xl text-xl font-bold hover:bg-stone-800 transition-all"
                    >
                      Contact Support
                    </button>
                  </BorderGlow>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="pt-32 pb-16 bg-[#050505] border-t border-stone-800/50 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="max-w-[1440px] mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-24">
              {/* Brand Section */}
              <div className="lg:col-span-4 space-y-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    <Sparkles className="text-black" size={24} />
                  </div>
                  <span className="text-3xl font-bold tracking-tighter text-white">AssignMate</span>
                </div>
                <p className="text-lg text-stone-400 max-w-sm leading-relaxed">
                  Elevating academic excellence through ethical AI. The ultimate companion for modern scholars and researchers.
                </p>
                <div className="flex gap-4">
                  {[
                    { icon: Twitter, href: '#' },
                    { icon: Linkedin, href: '#' },
                    { icon: Github, href: '#' },
                    { icon: Instagram, href: '#' }
                  ].map((social, i) => (
                    <a
                      key={i}
                      href={social.href}
                      className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-white hover:border-stone-600 hover:bg-stone-800 transition-all group"
                    >
                      <social.icon size={20} className="group-hover:scale-110 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Links Columns */}
              <div className="lg:col-span-2 space-y-8">
                <h4 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Product</h4>
                <ul className="space-y-4">
                  {['Features', 'Pricing', 'Templates', 'AI Editor'].map((link) => (
                    <li key={link}>
                      <a href="#" className="text-stone-400 hover:text-white transition-colors flex items-center gap-2 group">
                        {link}
                        <ArrowUpRight size={14} className="opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <h4 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Resources</h4>
                <ul className="space-y-4">
                  {['Documentation', 'Help Center', 'API Reference', 'Community'].map((link) => (
                    <li key={link}>
                      <a href="#" className="text-stone-400 hover:text-white transition-colors flex items-center gap-2 group">
                        {link}
                        <ArrowUpRight size={14} className="opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter Section */}
              <div className="lg:col-span-4 space-y-8">
                <h4 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Be the first to try AssignMate AI.</h4>
                <p className="text-stone-400 leading-relaxed">We’ll notify you when we launch.</p>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const email = (e.target as any).email.value;
                    if (!email) return;
                    try {
                      const response = await fetch(`${config.apiUrl}/waitlist/join`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email }),
                      });
                      if (response.ok) {
                        toast.success("You're on the list!");
                        (e.target as HTMLFormElement).reset();
                      } else {
                        toast.error("Something went wrong.");
                      }
                    } catch (error) {
                      toast.error("Failed to connect.");
                    }
                  }}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative flex items-center bg-stone-950 border border-stone-800 rounded-2xl p-1.5 overflow-hidden">
                    <Mail className="ml-4 text-stone-500" size={20} />
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="Enter your email"
                      className="bg-transparent border-none outline-none px-4 py-3 w-full text-white placeholder-stone-600 font-medium"
                    />
                    <button 
                      type="submit"
                      className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-stone-200 transition-colors"
                    >
                      Join
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="pt-16 border-t border-stone-800/50 flex flex-col md:flex-row justify-between items-center gap-8 text-stone-500 text-sm">
              <p className="text-xs font-bold uppercase tracking-[0.4em]">© 2026 AssignMate AI. All rights reserved.</p>
              <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
        
        <WaitlistModal isOpen={isWaitlistModalOpen} onClose={() => setIsWaitlistModalOpen(false)} />
      </div>
    </div>
  );
};

export default Landing2;
