import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface SamRobotProps {
  onClick: () => void;
  isRightPanelOpen: boolean;
}

const SamRobot: React.FC<SamRobotProps> = ({ onClick, isRightPanelOpen }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Get relative position to the robot (roughly)
      // We just need a general direction for the eyes
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="relative flex items-center gap-2 cursor-pointer group -translate-y-[2px]"
      onClick={onClick}
    >
      {/* Animated Arms - Context Aware */}
      <div className="flex items-center">
        <AnimatePresence mode="wait">
          {!isRightPanelOpen ? (
            <motion.div
              key="arm-closed"
              initial={{ scale: 0, opacity: 0, x: -10 }}
              animate={{ scale: 0.85, opacity: 1, x: 0 }}
              exit={{ scale: 0, opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              {/* Body */}
              <div className="relative w-8 h-8 bg-[var(--text-main)] rounded-xl shadow-xl border border-white/5 overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-white/10 blur-xl rounded-full pointer-events-none" />
                <div className="flex gap-2 z-10">
                  <div className="w-2 h-2 bg-black rounded-full flex items-center justify-center shadow-inner">
                    <motion.div 
                      animate={{ x: mousePos.x * 0.5, y: mousePos.y * 0.5, scale: [1, 1.1, 1] }}
                      transition={{ scale: { duration: 4, repeat: Infinity } }}
                      className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.9)]" 
                    />
                  </div>
                  <div className="w-2 h-2 bg-black rounded-full flex items-center justify-center shadow-inner">
                    <motion.div 
                      animate={{ x: mousePos.x * 0.5, y: mousePos.y * 0.5, scale: [1, 1.1, 1] }}
                      transition={{ scale: { duration: 4, repeat: Infinity, delay: 0.2 } }}
                      className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.9)]" 
                    />
                  </div>
                </div>
              </div>

              {/* Right Arm (Pointing Right) */}
              <motion.div
                animate={{ x: [0, 4, 0], y: [0, 1, 0], rotate: [45, 40, 45] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors origin-left scale-[0.85]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                  <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                  <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                  <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                </svg>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="arm-open"
              initial={{ scale: 0, opacity: 0, x: 10 }}
              animate={{ scale: 0.85, opacity: 1, x: 0 }}
              exit={{ scale: 0, opacity: 0, x: 10 }}
              className="flex items-center gap-2"
            >
              {/* Left Arm (Pointing Right across body) */}
              <motion.div
                animate={{ x: [0, -2, 0], y: [0, 1, 0], rotate: [-10, -5, -10] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-blue-400 group-hover:text-blue-600 transition-colors origin-right scale-[0.85] scale-x-[-1]"
              >
                <svg width="24" height="24" viewBox="0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                  <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                  <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                  <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                </svg>
              </motion.div>

              {/* Body (Active State) */}
              <div className="relative w-8 h-8 bg-black rounded-xl shadow-xl border border-blue-500/20 overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-blue-500/5 to-blue-500/20 pointer-events-none" />
                <div className="flex gap-2 z-10">
                  <div className="w-2 h-2 bg-[#111] rounded-full flex items-center justify-center shadow-inner">
                    <motion.div 
                      animate={{ x: mousePos.x * 0.5, y: mousePos.y * 0.5, scale: [1, 1.2, 1] }}
                      transition={{ scale: { duration: 4, repeat: Infinity } }}
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_12px_rgba(96,165,250,0.9)]" 
                    />
                  </div>
                  <div className="w-2 h-2 bg-[#111] rounded-full flex items-center justify-center shadow-inner">
                    <motion.div 
                      animate={{ x: mousePos.x * 0.5, y: mousePos.y * 0.5, scale: [1, 1.2, 1] }}
                      transition={{ scale: { duration: 4, repeat: Infinity, delay: 0.2 } }}
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_12px_rgba(96,165,250,0.9)]" 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tooltip */}
      <div className="absolute -bottom-8 right-0 bg-stone-900 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest font-bold z-50 shadow-xl border border-white/10">
        {isRightPanelOpen ? "Sam is Active" : "Open Sam Assistant"}
      </div>
    </motion.div>
  );
};

export const SamHead = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
  <div className={clsx("relative rounded-xl overflow-hidden flex items-center justify-center bg-stone-900 border border-white/10 shadow-lg", className)} style={{ width: size, height: size }}>
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
    <div className="flex gap-1.5 z-10">
      <div className="w-1.5 h-1.5 bg-black rounded-full flex items-center justify-center shadow-inner">
        <div className="w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_5px_rgba(52,211,153,0.9)]" />
      </div>
      <div className="w-1.5 h-1.5 bg-black rounded-full flex items-center justify-center shadow-inner">
        <div className="w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_5px_rgba(52,211,153,0.9)]" />
      </div>
    </div>
  </div>
);

export default SamRobot;
