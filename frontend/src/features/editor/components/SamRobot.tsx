import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

  if (isRightPanelOpen) return null;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="relative flex items-center gap-2 cursor-pointer group"
      onClick={onClick}
    >
      {/* The Robot Body */}
      <div className="relative w-10 h-10 bg-[var(--text-main)] rounded-2xl shadow-2xl border border-white/5 overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
        {/* Glossy Reflection - More pronounced */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-white/10 blur-xl rounded-full pointer-events-none" />
        
        {/* Eyes Container */}
        <div className="flex gap-2.5 z-10">
          {/* Left Eye */}
          <div className="w-2.5 h-2.5 bg-black rounded-full flex items-center justify-center shadow-inner">
            <motion.div 
              animate={{ 
                x: mousePos.x * 0.5, 
                y: mousePos.y * 0.5,
                scale: [1, 1.1, 1]
              }}
              transition={{ scale: { duration: 4, repeat: Infinity } }}
              className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.9)]" 
            />
          </div>
          {/* Right Eye */}
          <div className="w-2.5 h-2.5 bg-black rounded-full flex items-center justify-center shadow-inner">
            <motion.div 
              animate={{ 
                x: mousePos.x * 0.5, 
                y: mousePos.y * 0.5,
                scale: [1, 1.1, 1]
              }}
              transition={{ scale: { duration: 4, repeat: Infinity, delay: 0.2 } }}
              className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.9)]" 
            />
          </div>
        </div>
      </div>

      {/* Extended Arm - Pointing to Sidebar */}
      <motion.div
        animate={{ 
          x: [0, 5, 0],
          y: [0, 2, 0],
          rotate: [45, 40, 45] // Rotated to point down and right
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors origin-left"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </svg>
      </motion.div>

      {/* Tooltip */}
      <div className="absolute -bottom-8 right-0 bg-[var(--text-main)] text-[var(--bg-card)] text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest font-bold">
        Open Sam Assistant
      </div>
    </motion.div>
  );
};

export default SamRobot;
