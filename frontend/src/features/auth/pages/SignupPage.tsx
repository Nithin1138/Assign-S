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
import { signInWithGoogleToken, signUpWithEmail } from '../../../shared/services/auth';
import Aurora from '../../editor/components/Aurora';
import Antigravity from '../../editor/components/Antigravity';
import { useGoogleLogin } from '@react-oauth/google';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUpWithEmail(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await signInWithGoogleToken(tokenResponse.access_token);
        toast.success("Account created via Google!");
        navigate('/dashboard');
      } catch (err: any) {
        console.error('Google signup error:', err);
        toast.error('Failed to sign up with Google: ' + err.message);
      }
    },
    onError: error => {
      console.error('Google signup failed:', error);
      toast.error('Google signup was unsuccessful');
    }
  });

  const handleGoogleSignup = () => {
    loginWithGoogle();
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
              <span className="text-xs font-bold text-white uppercase tracking-[0.2em]">Join the Evolution</span>
            </div>

            <h1 className="text-7xl font-bold text-white tracking-tight leading-[0.85] mb-10">
              Create <br />Without <br />Boundaries.
            </h1>

            <p className="text-xl text-stone-400 leading-relaxed max-w-md mb-16">
              Unlock the full potential of your academic writing with AI-powered research and drafting tools.
            </p>

            <div className="grid grid-cols-2 gap-12">
              <div>
                <p className="text-5xl font-bold text-white mb-2 tracking-tighter">98%</p>
                <p className="text-[10px] text-stone-500 font-black uppercase tracking-[0.2em]">Satisfaction Rate</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-white mb-2 tracking-tighter">24/7</p>
                <p className="text-[10px] text-stone-500 font-black uppercase tracking-[0.2em]">AI Assistance</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Minimalist Signup Form */}
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
            <h2 className="text-5xl font-bold text-stone-900 tracking-tight mb-4">Get Started</h2>
            <p className="text-stone-500 text-lg">Create your free account in seconds.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-8">
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
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">Create Password</label>
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
                  placeholder="Min 6 characters"
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
                  Create Account
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-12">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100"></div></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]"><span className="px-6 bg-stone-50 lg:bg-white text-stone-400">Join AssignMate</span></div>
          </div>

          <button
            onClick={handleGoogleSignup}
            className="w-full py-5 bg-white border border-stone-200 text-stone-900 rounded-[2rem] font-bold text-lg hover:bg-stone-50 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
          >
            <div className="w-6 h-6 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Globe size={22} />
            </div>
            Continue with Google
          </button>

          <p className="text-center text-stone-500 mt-16 text-lg">
            Already have an account? <Link to="/login" className="text-stone-900 font-bold hover:underline decoration-2 underline-offset-4">Sign in here</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
