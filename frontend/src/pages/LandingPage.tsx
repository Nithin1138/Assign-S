import React, { useState, useEffect, useRef } from 'react';
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
  GraduationCap,
  Lock,
  Play,
  Volume2,
  Settings,
  Maximize,
  MoreVertical,
  Twitter,
  Linkedin,
  Instagram,
  Github,
  Mail,
  ArrowUpRight,
  Facebook
} from 'lucide-react';
import { useAuth } from '../features/auth/context/AuthContext';
import clsx from 'clsx';
import TextType from '../shared/components/TextType/TextType';
import DotField from '../shared/components/DotField';
import GradualBlur from '../shared/components/GradualBlur/GradualBlur';
import BorderGlow from '../shared/components/BorderGlow/BorderGlow';
import SplitText from '../shared/components/SplitText/SplitText';
import LogoLoop from '../shared/components/LogoLoop/LogoLoop';
import Hyperspeed from '../shared/components/Hyperspeed/Hyperspeed';
import ShinyText from '../shared/components/ShinyText/ShinyText';
import PillNav from '../shared/components/PillNav/PillNav';
import AnimatedList from '../shared/components/AnimatedList/AnimatedList';
import Grainient from '../shared/components/Grainient/Grainient';
import ShapeGrid from '../shared/components/ShapeGrid/ShapeGrid';
import toast from 'react-hot-toast';
import { config } from '../shared/config';

const NAV_ITEMS = [
  { label: 'Features', href: '#features' },
  { label: 'Process', href: '#how-it-works' },
  { label: 'Reviews', href: '#testimonials' },
  { label: 'Pricing', href: '#pricing' }
];

const WaitlistModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

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
            className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white border border-stone-200 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6">
              <button onClick={onClose} className="text-stone-400 hover:text-stone-900 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center border border-violet-200 shrink-0">
                  <GraduationCap className="text-violet-600" size={20} />
                </div>
                <h3 className="text-3xl font-bold tracking-tight text-stone-900 leading-tight">Get Early Access</h3>
              </div>

              <div className="space-y-2">
                <p className="text-stone-600 leading-relaxed">
                  Generate complete assignments from your template in seconds.
                </p>
                <p className="text-xs text-stone-500 mt-2">
                  Join the waitlist and we’ll notify you by email when we launch. Early users get <span className="text-violet-600 font-bold underline underline-offset-4 decoration-violet-500/30">1 month Pro free</span>.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-1000"></div>
                  <div className="relative flex items-center bg-white border border-stone-200 rounded-2xl p-1.5 overflow-hidden">
                    <Mail className="ml-4 text-stone-400" size={20} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="bg-transparent border-none outline-none px-4 py-3 w-full text-stone-900 placeholder-stone-400 font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold text-lg hover:bg-stone-800 transition-all shadow-xl disabled:opacity-50"
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

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clickedPos = (x / rect.width) * videoRef.current.duration;
      videoRef.current.currentTime = clickedPos;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAction = () => {
    setIsWaitlistModalOpen(true);
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 50;
          setIsScrolled(prev => {
            if (prev !== scrolled) return scrolled;
            return prev;
          });

          // Update scroll progress directly via DOM to avoid re-renders (FLASH smooth & precise)
          if (progressBarRef.current) {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = totalHeight > 0 ? (window.scrollY / totalHeight) : 0;
            progressBarRef.current.style.transform = `scaleX(${progress})`;
          }

          const sections = ['features', 'how-it-works', 'testimonials', 'pricing'];
          const current = sections.find(section => {
            const element = document.getElementById(section);
            if (element) {
              const rect = element.getBoundingClientRect();
              return rect.top >= 0 && rect.top <= 300;
            }
            return false;
          });

          if (current) {
            setActiveSection(prev => {
              if (prev !== current) return current;
              return prev;
            });
          } else if (window.scrollY < 200) {
            setActiveSection(prev => {
              if (prev !== 'hero') return 'hero';
              return prev;
            });
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="text-stone-900 font-sans selection:bg-violet-500/10">
      {/* Fixed background to ensure total coverage regardless of scroll */}
      <div className="fixed inset-0 bg-white z-[-1]">
        {/* Global Background Effects */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <DotField
            dotRadius={1.7}
            dotSpacing={22}
            bulgeOnly={true}
            bulgeStrength={70}
            glowRadius={180}
            sparkle={true}
            waveAmplitude={0.4}
            gradientFrom="rgba(167, 139, 250, 0.2)"
            gradientTo="rgba(34, 211, 238, 0.15)"
            glowColor="#F5F3FF"
          />
        </div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none [background-image:linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] [background-size:60px_60px]" />
      </div>

      <div className="overflow-x-hidden relative min-h-screen w-full">
        <div className="z-50">
          <PillNav
            logo="/logo.png"
            logoAlt="Doxio"
            items={NAV_ITEMS}
            activeHref={`#${activeSection}`}
            baseColor="#1c1917"
            pillColor="#ffffff"
            pillTextColor="#1c1917"
            hoveredPillTextColor="#ffffff"
            className="shadow-xl shadow-stone-200/50"
            scrolled={isScrolled}
          />
        </div>

        <section className="relative min-h-screen overflow-hidden flex flex-col justify-center pt-[14vh] pb-[8vh]">
          {/* Global Background Elements */}
          <div className="absolute inset-0 z-[0]">
            <ShapeGrid
              speed={0.4}
              squareSize={65}
              direction="diagonal"
              borderColor="#aed4daff"
              hoverFillColor="#97d7e2ff"
              shape="square"
              hoverTrailAmount={8}
              gradientColor="transparent"
            />
          </div>
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-violet-100 to-transparent pointer-events-none z-[3]" />

          <div className="max-w-[1440px] w-[90%] mx-auto relative z-10 pointer-events-none">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center pointer-events-auto">
              {/* Left: Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center text-center lg:items-center lg:text-center"
              >
                <span className="inline-block px-4 py-1.5 mb-8 bg-white text-violet-600 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase border border-violet-200 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
                  Academic Excellence Powered by AI
                </span>
                <h1
                  className="font-bold tracking-tighter text-stone-900 leading-[0.95] md:leading-[0.9]"
                  style={{
                    fontSize: 'clamp(2.5rem, 6vw, 6.5rem)',
                    marginBottom: '3vh'
                  }}
                >
                  Write with<br />
                  <TextType
                    text="precision."
                    as="span"
                    className="italic font-serif bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(139,92,246,0.15)]"
                    typingSpeed={80}
                    cursorClassName="text-violet-600"
                    cursorCharacter="_"
                    loop={true}
                    pauseDuration={3000}
                    hideCursorOnComplete={false}
                  /><br />
                  Deliver with<br />
                  <TextType
                    text="confidence."
                    as="span"
                    className="italic font-serif bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(56,189,248,0.15)]"
                    typingSpeed={80}
                    initialDelay={1200}
                    cursorClassName="text-cyan-600"
                    cursorCharacter="_"
                    loop={true}
                    pauseDuration={3000}
                    hideCursorOnComplete={false}
                  />
                </h1>
                <p
                  className="text-stone-500 leading-relaxed font-medium text-center"
                  style={{
                    fontSize: 'clamp(0.9rem, 1.2vw, 1.1rem)',
                    maxWidth: '520px',
                    marginBottom: '5vh'
                  }}
                >
                  The professional writing suite designed specifically for students. Transform complex research into polished assignments with academic-grade AI.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <BorderGlow
                    edgeSensitivity={30}
                    glowColor="266 85% 66%"
                    backgroundColor="transparent"
                    borderRadius={24}
                    glowRadius={40}
                    glowIntensity={0.8}
                    animated={false}
                    colors={['#c084fc', '#f472b6', '#38bdf8']}
                    className="w-full sm:w-auto"
                  >
                    <button
                      onClick={handleAction}
                      className="w-full px-10 py-4 bg-stone-900 text-white rounded-2xl text-base font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-3 group"
                    >
                      Start Writing Free <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </BorderGlow>
                  <BorderGlow
                    edgeSensitivity={30}
                    glowColor="0 0 90"
                    backgroundColor="#FFFFFF"
                    borderRadius={24}
                    glowRadius={40}
                    glowIntensity={0.5}
                    animated={false}
                    colors={['#e5e7eb', '#d1d5db', '#9ca3af']}
                    className="w-full sm:w-auto"
                  >
                    <button
                      onClick={handleAction}
                      className="w-full px-10 py-4 bg-white text-stone-900 rounded-2xl text-base font-bold hover:bg-stone-50 transition-all border border-stone-100"
                    >
                      Watch Demo
                    </button>
                  </BorderGlow>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-8 mt-10">
                  {[
                    { icon: GraduationCap, label: 'Academic-Grade AI' },
                    { icon: ShieldCheck, label: 'Plagiarism-Free' },
                    { icon: Lock, label: 'Data Secure' },
                  ].map((badge, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-stone-500">
                      <badge.icon size={18} className="text-violet-500/70" />
                      <span className="text-xs font-semibold tracking-wide">{badge.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right: Enhanced iframe/Video Preview */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative hidden lg:block"
              >
                {/* iframe container wrapper to prevent sub-pixel bleeding */}
                <div className="relative rounded-[1.5rem] bg-black shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
                  {/* Animated glow border */}
                  <div className="absolute -inset-[2px] rounded-[1.5rem] overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#c084fc,#f472b6,#38bdf8,#c084fc)] template-card-border-spin" style={{ width: '200%', height: '200%', top: '-50%', left: '-50%' }} />
                  </div>

                  {/* Glow effects behind the iframe */}
                  <div className="absolute -inset-6 bg-gradient-to-r from-violet-200/40 via-cyan-100/30 to-violet-200/40 rounded-[3rem] blur-[80px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />

                  <div className="relative rounded-[1.5rem] overflow-hidden border border-[#2d2d2d] bg-black group/video">
                    {/* Browser chrome mockup */}
                    <div className="flex items-center gap-2 px-5 py-3 bg-[#1e1e1e] border-b border-[#2d2d2d] z-10 relative">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                        <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                      </div>
                      <div className="flex-1 flex justify-center">
                        <div className="bg-[#2d2d2d] text-stone-400 text-xs font-mono px-4 py-1.5 rounded-md flex items-center gap-2">
                          <Lock size={10} />
                          doxio.ai/editor
                        </div>
                      </div>
                    </div>
                    {/* Video content area */}
                    <div className="relative aspect-[16/10] bg-black">
                      <video
                        ref={videoRef}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover cursor-pointer"
                        src="https://vjs.zencdn.net/v/oceans.mp4"
                        onClick={togglePlay}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                      />
                      <div
                        className={clsx(
                          "absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300",
                          isPlaying ? "opacity-0" : "opacity-100"
                        )}
                      >
                        <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200 flex items-center justify-center shadow-lg">
                          <Play size={24} className="text-stone-900 ml-1" fill="currentColor" />
                        </div>
                      </div>

                      {/* Bottom Control Bar */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex flex-col gap-2 opacity-0 group-hover/video:opacity-100 transition-opacity duration-300">
                        <div
                          className="w-full h-1 bg-white/30 rounded-full relative group/progress cursor-pointer"
                          onClick={handleSeek}
                        >
                          <div
                            className="absolute top-0 left-0 h-full bg-violet-500 transition-all duration-100"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <button onClick={togglePlay} className="focus:outline-none text-white">
                              {isPlaying ? (
                                <div className="w-4 h-4 flex gap-1 items-center justify-center">
                                  <div className="w-1 h-4 bg-white" />
                                  <div className="w-1 h-4 bg-white" />
                                </div>
                              ) : (
                                <Play size={16} className="fill-white" />
                              )}
                            </button>
                            <div className="text-[10px] font-mono text-white/80 tabular-nums shadow-sm">
                              {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-white/80">
                            <button onClick={toggleMute} className="focus:outline-none hover:text-white transition-colors">
                              {isMuted ? (
                                <div className="relative">
                                  <Volume2 size={16} className="opacity-60" />
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-[1.5px] bg-white rotate-45" />
                                </div>
                              ) : (
                                <Volume2 size={16} />
                              )}
                            </button>
                            <button onClick={toggleFullscreen} className="focus:outline-none hover:text-white transition-colors">
                              <Maximize size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                {/* handwritten text */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="absolute -bottom-24 left-48 flex items-center gap-1.5"
                >
                  <div className="relative -top-4">
                    <svg width="50" height="50" viewBox="0 0 50 50" fill="none" className="text-violet-600/60">
                      <path d="M45 45 Q 10 45, 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      <path d="M4 22 L10 10 L16 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                  <div className="relative group rotate-[-2deg]">
                    <span className="text-violet-600 font-handwriting text-3xl tracking-wide block">See Doxio in action</span>
                    <div className="absolute -bottom-1 left-0 w-full overflow-visible pointer-events-none rotate-[1deg]">
                      <svg width="100%" height="10" viewBox="0 0 100 10" preserveAspectRatio="none" className="text-violet-500/30">
                        <path d="M1 5C30 4 60 7 99 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                        <path d="M3 8C35 7 65 9 97 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-4 border-y border-stone-100 bg-stone-50 w-full overflow-hidden relative z-10">
          <div className="w-full px-0">
            <p className="text-center text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em] mb-8">Trusted by students from global institutions</p>
            <div className="relative h-8 overflow-hidden">
              <LogoLoop
                logos={[
                  { node: <span className="font-serif italic text-stone-900 opacity-60 hover:opacity-100 transition-opacity">IIT</span> },
                  { node: <span className="font-serif italic text-stone-900 opacity-60 hover:opacity-100 transition-opacity">VIT</span> },
                  { node: <span className="font-serif italic text-stone-900 opacity-60 hover:opacity-100 transition-opacity">SRM</span> },
                  { node: <span className="font-serif italic text-stone-900 opacity-60 hover:opacity-100 transition-opacity">AMRITA</span> },
                  { node: <span className="font-serif italic text-stone-900 opacity-60 hover:opacity-100 transition-opacity">BITS</span> },
                  { node: <span className="font-serif italic text-stone-900 opacity-60 hover:opacity-100 transition-opacity">NIT</span> },
                  { node: <span className="font-serif italic text-stone-900 opacity-60 hover:opacity-100 transition-opacity">JNTU</span> },
                  { node: <span className="font-serif italic text-stone-900 opacity-60 hover:opacity-100 transition-opacity">LPU</span> },
                  { node: <span className="font-serif italic text-stone-900 opacity-60 hover:opacity-100 transition-opacity">AIIMS</span> },
                  { node: <span className="font-serif italic text-stone-900 opacity-60 hover:opacity-100 transition-opacity">OU</span> },
                  { node: <span className="font-serif italic text-stone-900 opacity-60 hover:opacity-100 transition-opacity">BHU</span> },
                  { node: <span className="font-serif italic text-stone-900 opacity-60 hover:opacity-100 transition-opacity">MANIPAL</span> },
                  { node: <span className="font-serif italic text-stone-900 opacity-60 hover:opacity-100 transition-opacity">KIIT</span> },
                  { node: <span className="font-serif italic text-stone-900 opacity-60 hover:opacity-100 transition-opacity">SVEC</span> },
                  { node: <span className="font-serif italic text-stone-900 opacity-60 hover:opacity-100 transition-opacity">GITAM</span> },
                  { node: <span className="font-serif italic text-stone-900 opacity-60 hover:opacity-100 transition-opacity">CBIT</span> },
                  { node: <span className="font-serif italic text-stone-900 opacity-60 hover:opacity-100 transition-opacity">NIPER</span> },
                  { node: <span className="font-serif italic text-stone-900 opacity-60 hover:opacity-100 transition-opacity">KLU</span> },
                  { node: <span className="font-serif italic text-stone-900 opacity-60 hover:opacity-100 transition-opacity">IISC</span> },
                ]}
                speed={60}
                gap={120}
                logoHeight={32}
                fadeOut={true}
                fadeOutColor="#FFFFFF"
                pauseOnHover={true}
              />
            </div>
          </div>
        </section>

        <section className="py-20 bg-white overflow-hidden">
          <div className="max-w-[1300px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="relative">
                <div className="max-w-[90%] aspect-[4/5] rounded-[4rem] bg-stone-50 overflow-hidden relative shadow-2xl border border-stone-100 mx-auto lg:ml-0">
                  <img
                    src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000"
                    alt="Focused student"
                    className="w-full h-full object-cover grayscale brightness-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                </div>
                <div className="absolute -bottom-8 -right-4 w-72 h-[17rem] bg-white/80 backdrop-blur-3xl rounded-[2rem] p-7 text-stone-900 hidden xl:flex flex-col justify-between shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-stone-200 group hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                  <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center border border-violet-100 shadow-inner">
                    <Quote className="text-violet-600" size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-serif italic leading-snug mb-5 text-stone-800">
                      "It's not just an AI; it's a mentor that understands high-quality writing."
                    </p>
                    <div className="pt-5 border-t border-stone-100">
                      <p className="text-[8px] text-violet-600 font-bold uppercase tracking-[0.3em] mb-1">Scholar Insight</p>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-stone-900 tracking-wide">Veera Nithin</span>
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
                  <p className="text-lg text-stone-600 leading-relaxed font-medium">
                    Generic AI tools often fail the test of academic integrity and depth. Doxio was built by researchers to ensure your work remains original, cited, and high-quality.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-center text-stone-900">
                      <BookOpen size={24} />
                    </div>
                    <h4 className="text-xl font-bold">Context Aware</h4>
                    <p className="text-stone-600 leading-relaxed">Our models are trained on academic papers, not just web content, ensuring appropriate tone and depth.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-center text-stone-900">
                      <ShieldCheck size={24} />
                    </div>
                    <h4 className="text-xl font-bold">Integrity First</h4>
                    <p className="text-stone-600 leading-relaxed">Built-in plagiarism detection and citation management keep your work safe and professional.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="pt-20 pb-20 bg-transparent relative overflow-hidden">
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
              <p className="text-xl text-stone-600 font-medium">From initial research to final formatting, we've automated the boring parts so you can focus on the ideas.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-200 border border-stone-200 rounded-[3rem] overflow-hidden shadow-2xl">
              {[
                { title: 'Template Parsing', desc: 'Upload your assignment brief or a sample document. Our AI extracts the structure and requirements automatically.', icon: FileSearch },
                { title: 'Deep Generation', desc: 'Generate comprehensive drafts section by section. Maintain logical flow and consistent academic tone throughout.', icon: Sparkles },
                { title: 'Citation Engine', desc: 'Automatic APA, MLA, and Chicago formatting. Never lose marks for a missing comma in your bibliography again.', icon: BookOpen },
                { title: 'Plagiarism Shield', desc: 'Real-time scanning against billions of sources. Ensure your work is 100% original before you submit.', icon: ShieldCheck },
                { title: 'Smart Editor', desc: 'A distraction-free writing environment with AI-powered expansion, summarization, and rephrasing tools.', icon: FileText },
                { title: 'One-Click Export', desc: 'Download your work as a perfectly formatted DOCX or PDF. Ready for submission in seconds.', icon: Download },
              ].map((feature, i) => (
                <div key={i} className="p-10 bg-white hover:bg-stone-50 transition-colors group">
                  <div className="w-11 h-11 bg-stone-900 rounded-xl flex items-center justify-center mb-8 text-white group-hover:scale-110 transition-transform">
                    <feature.icon size={22} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-stone-500 leading-relaxed text-base">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>



        <section id="how-it-works" className="pt-20 pb-20 bg-stone-50/30 relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em] mb-4 block">The Workflow</span>
              <h2 className="text-6xl font-bold tracking-tight text-stone-900">
                <ShinyText text="From brief to submission." speed={3} color="#444" shineColor="#000" />
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
                  <div className="text-8xl font-serif italic font-bold text-stone-100 absolute -top-12 -left-1 z-0">{item.step}</div>
                  <div className="relative z-10 pt-8">
                    <h3 className="text-2xl font-bold mb-4 text-stone-900">{item.title}</h3>
                    <p className="text-stone-600 leading-relaxed">{item.desc}</p>
                  </div>
                  {i < 3 && <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-px bg-stone-200"></div>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="pt-20 pb-8 bg-transparent overflow-hidden relative">
          <div className="max-w-[1440px] mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-8">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.4em] mb-4 block">User Reviews</span>
              <h2 className="text-6xl font-bold tracking-tight mb-6 text-stone-900">
                <ShinyText text="What the community says." speed={3} color="#444" shineColor="#000" />
              </h2>
              <p className="text-xl text-stone-600 font-medium">Discover early user feedback on Doxio integration within their workflows.</p>
            </div>

            <div className="relative h-[800px] md:h-[600px] flex items-center justify-center">
              {[
                { name: 'Ananya Sharma', role: 'PhD Candidate', quote: "The structure extraction tool saved me hours of planning. It perfectly understood my professor's complex brief.", pos: 'md:-translate-x-[110%] md:-translate-y-[60%] rotate-[-2deg]', date: '2026.04.15' },
                { name: 'Arjun Reddy', role: 'Undergrad Student', quote: "I was skeptical about AI for writing, but Doxio's focus on academic tone is unmatched. It's my daily driver now.", pos: 'md:translate-x-[100%] md:-translate-y-[45%] rotate-[3deg]', date: '2026.04.08' },
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
                    "absolute w-full max-w-[420px] p-8 rounded-[2rem] bg-white text-stone-900 shadow-xl border border-stone-100 transition-all hover:scale-105 hover:z-50 group cursor-default",
                    t.pos
                  )}
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-stone-100 overflow-hidden shadow-inner">
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
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Doxio user, {t.date}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-stone-100 overflow-hidden">
                    <img src={`https://picsum.photos/seed/member${i}/100/100`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-[0.4em]">Trusted by 10,000+ scholars worldwide</p>
            </div>
          </div>
        </section>

        <section id="pricing" className="pt-12 pb-24 bg-stone-50/30">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em] mb-4 block">Investment</span>
              <h2 className="text-5xl font-bold tracking-tight mb-6 text-stone-900">
                <ShinyText text="Simple, transparent pricing." speed={3} color="#444" shineColor="#000" />
              </h2>
              <p className="text-xl text-stone-600 font-medium leading-relaxed">Choose the plan that fits your academic journey perfectly.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr_1fr] gap-6 items-end max-w-[1200px] mx-auto">
              {[
                {
                  name: 'SCHOLARLY FREE',
                  price: '₹0',
                  desc: 'Perfect for trying out Doxio.',
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
                    'relative overflow-hidden p-8 rounded-[2.5rem] border transition-all duration-300 flex flex-col group',
                    plan.popular
                      ? 'bg-white text-stone-900 border-violet-500 shadow-2xl shadow-violet-200 z-10 min-h-[680px]'
                      : 'bg-white text-stone-900 border-stone-200 min-h-[640px]',
                    !plan.popular && i === 0 && 'hover:border-emerald-500 hover:shadow-lg',
                    !plan.popular && i === 2 && 'hover:border-rose-500 hover:shadow-lg'
                  )}
                >
                  {plan.badge && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500 text-white text-[8px] font-bold rounded-full uppercase tracking-[0.15em] shadow-lg z-20">
                      {plan.badge}
                    </div>
                  )}
                  <div
                    className={clsx(
                      'pointer-events-none absolute left-0 right-0 bottom-0 h-32 transition-opacity duration-500',
                      i === 0 && 'bg-[radial-gradient(72%_130%_at_86%_100%,rgba(52,211,153,0.1),transparent_74%)] opacity-60 group-hover:opacity-100',
                      i === 1 && 'bg-[radial-gradient(70%_130%_at_50%_100%,rgba(167,139,250,0.15),transparent_74%)] opacity-80 group-hover:opacity-100',
                      i === 2 && 'bg-[radial-gradient(72%_130%_at_14%_100%,rgba(244,63,94,0.1),transparent_74%)] opacity-60 group-hover:opacity-100'
                    )}
                  />
                  <div className="mb-12">
                    <h3 className={clsx(
                      "text-2xl font-bold mb-4",
                      plan.name === 'ARCHIVE PRO' ? "text-violet-600" : "text-stone-900"
                    )}>{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-4 text-stone-900">
                      <span className="text-5xl font-bold tracking-tighter">{plan.price}</span>
                      {plan.period && <span className="text-sm font-medium text-stone-500">{plan.period}</span>}
                    </div>
                    <p className="text-base font-medium text-stone-600">{plan.desc}</p>
                  </div>
                  <div className="flex-1 relative z-10 mb-12">
                    <AnimatedList
                      items={plan.features}
                      displayScrollbar={false}
                      showGradients={false}
                      className="!p-0"
                      itemClassName="!p-0 !bg-transparent !border-none !mb-5"
                      renderItem={(feature) => (
                        <div className="flex items-center gap-4 text-base font-medium">
                          <CheckCircle2 size={20} className={plan.popular ? 'text-violet-600' : 'text-stone-400'} />
                          <span className={plan.popular ? 'text-stone-900' : 'text-stone-600'}>{feature}</span>
                        </div>
                      )}
                    />
                  </div>

                  <GradualBlur
                    target="parent"
                    position="bottom"
                    height="10rem"
                    strength={3}
                    divCount={6}
                    curve="bezier"
                    exponential={true}
                    opacity={1}
                    zIndex={0}
                  />

                  <div className="relative z-10 mt-auto">
                    <BorderGlow
                      edgeSensitivity={20}
                      glowColor={i === 0 ? "160 84 45" : i === 2 ? "350 89 60" : "266 85 66"}
                      backgroundColor={plan.popular ? "#1c1917" : "#FFFFFF"}
                      borderRadius={24}
                      glowRadius={60}
                      glowIntensity={1.2}
                      animated={true}
                      colors={
                        i === 0 ? ['#34d399', '#10b981', '#6ee7b7'] :
                          i === 2 ? ['#fb7185', '#f43f5e', '#fda4af'] :
                            ['#c084fc', '#f472b6', '#7dd3fc']
                      }
                      className="w-full"
                    >
                      <button
                        onClick={handleAction}
                        className={clsx(
                          "w-full py-5 rounded-2xl font-bold text-lg transition-all active:scale-[0.98]",
                          plan.popular ? "bg-transparent text-white hover:bg-white/5" : "bg-transparent text-stone-900 hover:bg-stone-50"
                        )}
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

        <section className="pt-20 pb-40 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-stone-900 rounded-[4rem] p-20 md:p-32 text-center text-white relative overflow-hidden shadow-2xl border border-stone-800">
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
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
                <p className="text-2xl text-stone-300 mb-16 font-medium">Join the next generation of academic writers and scholars.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <BorderGlow
                    edgeSensitivity={30}
                    glowColor="266 85 66"
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
                      className="w-full sm:w-auto px-10 py-5 bg-white text-stone-900 rounded-2xl text-lg font-bold hover:bg-stone-50 transition-all shadow-xl flex items-center justify-center gap-3 group"
                    >
                      Get Started Free <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </BorderGlow>
                  <BorderGlow
                    edgeSensitivity={30}
                    glowColor="0 0 100"
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
                      className="w-full sm:w-auto px-12 py-6 bg-transparent text-white border border-white/20 rounded-2xl text-xl font-bold hover:bg-white/5 transition-all"
                    >
                      Contact Support
                    </button>
                  </BorderGlow>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="pt-32 pb-16 bg-stone-50 border-t border-stone-200 relative overflow-hidden text-stone-900">
          <div className="max-w-[1440px] mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-24">
              {/* Brand Section */}
              <div className="lg:col-span-4 space-y-10">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img src="/logo.png" alt="Doxio Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-3xl font-bold tracking-tighter text-stone-900">Doxio</span>
                </div>
                <p className="text-lg text-stone-600 max-w-sm leading-relaxed">
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
                      className="w-12 h-12 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:border-stone-400 hover:bg-stone-50 transition-all group shadow-sm"
                    >
                      <social.icon size={20} className="group-hover:scale-110 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Links Columns */}
              <div className="lg:col-span-2 space-y-8">
                <h4 className="text-sm font-bold text-stone-900 uppercase tracking-[0.2em]">Product</h4>
                <ul className="space-y-4">
                  {['Features', 'Pricing', 'Templates', 'AI Editor'].map((link) => (
                    <li key={link}>
                      <a href="#" className="text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-2 group">
                        {link}
                        <ArrowUpRight size={14} className="opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <h4 className="text-sm font-bold text-stone-900 uppercase tracking-[0.2em]">Resources</h4>
                <ul className="space-y-4">
                  {['Documentation', 'Help Center', 'API Reference', 'Community'].map((link) => (
                    <li key={link}>
                      <a href="#" className="text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-2 group">
                        {link}
                        <ArrowUpRight size={14} className="opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter Section */}
              <div className="lg:col-span-4 space-y-8">
                <h4 className="text-sm font-bold text-stone-900 uppercase tracking-[0.2em]">Be the first to try Doxio AI.</h4>
                <p className="text-stone-600 leading-relaxed">We’ll notify you when we launch.</p>
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
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-1000"></div>
                  <div className="relative flex items-center bg-white border border-stone-200 rounded-2xl p-1.5 overflow-hidden">
                    <Mail className="ml-4 text-stone-400" size={20} />
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="Enter your email"
                      className="bg-transparent border-none outline-none px-4 py-3 w-full text-stone-900 placeholder-stone-400 font-medium"
                    />
                    <button
                      type="submit"
                      className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-stone-800 transition-colors"
                    >
                      Join
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="pt-16 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center gap-8 text-stone-500 text-sm">
              <p className="text-xs font-bold uppercase tracking-[0.4em]">© 2026 Doxio AI. All rights reserved.</p>
              <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
                <a href="#" className="hover:text-stone-900 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-stone-900 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-stone-900 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>

        <WaitlistModal isOpen={isWaitlistModalOpen} onClose={() => setIsWaitlistModalOpen(false)} />
      </div>
    </div>
  );
};

export default LandingPage;
