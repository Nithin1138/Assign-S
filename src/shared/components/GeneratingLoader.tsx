import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Aurora from '../../features/editor/components/Aurora';

interface GeneratingLoaderProps {
  topic: string;
}

const GeneratingLoader: React.FC<GeneratingLoaderProps> = ({ topic }) => {
  const [step, setStep] = useState(0);
  const steps = [
    "Initializing AI writing engine...",
    "Analyzing research topic and context...",
    "Structuring academic arguments...",
    "Synthesizing high-quality content...",
    "Applying formal academic tone...",
    "Finalizing document structure...",
    "Preparing your workspace..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-stone-950 text-white overflow-hidden"
    >
      {/* Immersive Background */}
      <div className="absolute inset-0 opacity-40">
        <Aurora colorStops={['#FFFFFF', '#222222', '#FFFFFF']} speed={0.3} />
      </div>

      {/* Neural Grid Background */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Binary Stream (Vertical) */}
      <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none flex justify-around">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -1000 }}
            animate={{ y: 1000 }}
            transition={{ duration: 15 + Math.random() * 20, repeat: Infinity, ease: "linear" }}
            className="text-[10px] font-mono text-white whitespace-pre"
          >
            {Array(100).fill(0).map(() => Math.round(Math.random())).join('\n')}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full px-6 text-center">
        {/* Central Morphing Liquid Blob */}
        <div className="relative mb-16">
          <motion.div
            animate={{
              borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 60% 40% 60%", "40% 60% 70% 30% / 40% 50% 60% 50%"],
              rotate: [0, 120, 240, 360],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-56 h-56 bg-gradient-to-br from-amber-400/20 via-white/10 to-transparent border border-white/20 backdrop-blur-3xl flex items-center justify-center relative shadow-[0_0_100px_rgba(251,191,36,0.1)]"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Sparkles className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" size={56} />
            </motion.div>

            {/* Scanning Line */}
            <motion.div
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent z-20 shadow-[0_0_10px_rgba(251,191,36,0.8)]"
            />
          </motion.div>

          {/* Orbiting Particles */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ rotate: 360 }}
              transition={{ duration: 8 + i * 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 pointer-events-none"
            >
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                className="w-2 h-2 bg-white rounded-full absolute"
                style={{ top: '10%', left: '50%' }}
              />
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-400">Neural Synthesis In Progress</span>
            <h2 className="text-3xl font-bold tracking-tight">Generating: <span className="text-amber-400 italic">{topic || 'Project'}</span></h2>
          </div>

          <div className="h-10 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-stone-400 font-medium italic serif text-lg transition-all"
              >
                {steps[step]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <div className="w-64 h-1 bg-white/5 rounded-full mx-auto mt-12 overflow-hidden border border-white/5">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full bg-gradient-to-r from-transparent via-amber-400 to-transparent"
            />
          </div>
        </div>
      </div>

      {/* Decorative Bottom Text */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-20">
        <p className="text-[8px] font-mono uppercase tracking-[1em]">Protocol: ASSIGNMATE_GEN_V2.0</p>
      </div>
    </motion.div>
  );
};

export default GeneratingLoader;
