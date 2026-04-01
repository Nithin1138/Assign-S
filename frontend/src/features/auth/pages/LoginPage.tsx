import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowRight,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import { signIn, signInWithEmail } from '../../../shared/services/auth';
import Aurora from '../../editor/components/Aurora';
import Antigravity from '../../editor/components/Antigravity';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Email login failed:', err);
      let message = 'Login failed. Please check your credentials.';
      if (err.code === 'auth/user-not-found') message = 'No account found with this email.';
      if (err.code === 'auth/wrong-password') message = 'Incorrect password.';
      if (err.code === 'auth/invalid-email') message = 'Invalid email format.';
      if (err.code === 'auth/network-request-failed') message = 'Network error. Check your internet.';
      if (err.code === 'auth/too-many-requests') message = 'Too many failed attempts. Try later.';
      toast.error(message + (err.message ? ` (${err.message})` : ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn();
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      let message = 'Failed to sign in with Google';
      if (err.code === 'auth/popup-blocked') message = 'Sign-in popup was blocked by your browser.';
      if (err.code === 'auth/popup-closed-by-user') message = 'Sign-in popup was closed before completion.';
      if (err.code === 'auth/operation-not-allowed') message = 'Google sign-in is not enabled in Firebase Console.';
      if (err.code === 'auth/unauthorized-domain') message = 'This domain is not authorized in Firebase Console.';
      toast.error(message + (err.message ? ` (${err.message})` : ''));
    }
  };

  return (
    <div className="min-h-screen flex bg-stone-50 font-sans selection:bg-stone-900 selection:text-white">
      {/* Left Side: Immersive Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-stone-950 items-center justify-center p-24">
        <div className="absolute inset-0 z-0 opacity-30">
          <Aurora
            colorStops={['#FFFFFF', '#444444', '#FFFFFF']}
            amplitude={1.2}
            blend={0.7}
            speed={0.2}
          />
        </div>
        <div className="absolute inset-0 z-0">
          <Antigravity
            count={100}
            color="#FFFFFF"
            magnetRadius={3}
            ringRadius={5}
            lerpSpeed={0.25}
            smoothFactor={0.15}
            particleSize={1.1}
          />
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-12">
              <Sparkles className="text-white" size={16} />
              <span className="text-xs font-bold text-white uppercase tracking-[0.2em]">The Future of Writing</span>
            </div>

            <h1 className="text-7xl font-bold text-white tracking-tight leading-[0.85] mb-10">
              Elevate <br />Your <br />Academic <br />Standard.
            </h1>

            <p className="text-xl text-stone-400 leading-relaxed max-w-md mb-16">
              AssignMate combines advanced AI with intuitive design to help you craft perfect assignments in record time.
            </p>

            <div className="flex items-center gap-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-stone-950 bg-stone-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i + 10}/100/100`} alt="User" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white font-bold text-lg">15k+ Students</p>
                <p className="text-stone-500 text-sm font-medium">Trust our platform daily</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Minimalist Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-24">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-16 flex items-center gap-3">
            <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center shadow-xl shadow-stone-200">
              <Sparkles className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tighter">AssignMate</span>
          </div>

          <div className="mb-12">
            <h2 className="text-5xl font-bold text-stone-900 tracking-tight mb-4">Welcome Back</h2>
            <p className="text-stone-500 text-lg">Sign in to continue your progress.</p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-900 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 rounded-[2rem] border border-stone-200 focus:border-stone-900 focus:ring-8 focus:ring-stone-900/5 outline-none transition-all bg-white text-lg placeholder:text-stone-300"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Password</label>
                <button type="button" className="text-[10px] font-black text-stone-900 uppercase tracking-[0.1em] hover:underline">Forgot Password?</button>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-900 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-14 py-5 rounded-[2rem] border border-stone-200 focus:border-stone-900 focus:ring-8 focus:ring-stone-900/5 outline-none transition-all bg-white text-lg placeholder:text-stone-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-stone-900 text-white rounded-[2rem] font-bold text-xl hover:bg-stone-800 active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl shadow-stone-900/20 flex items-center justify-center gap-4 group"
            >
              {loading ? <RefreshCw className="animate-spin" /> : (
                <>
                  Sign In
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-12">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100"></div></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]"><span className="px-6 bg-stone-50 lg:bg-white text-stone-400">Secure Login</span></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-5 bg-white border border-stone-200 text-stone-900 rounded-[2rem] font-bold text-lg hover:bg-stone-50 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
          >
            <div className="w-6 h-6 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Globe size={22} />
            </div>
            Continue with Google
          </button>

          <p className="text-center text-stone-500 mt-16 text-lg">
            Don't have an account? <Link to="/signup" className="text-stone-900 font-bold hover:underline decoration-2 underline-offset-4">Create one for free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
