import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Book,
  User as UserIcon,
  Sparkles,
  X,
  ChevronRight,
  LogOut
} from 'lucide-react';

import { useAuth } from '../../features/auth/context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import { signOut } from '../services/auth';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  isCollapsed,
  setIsCollapsed
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMobile, isTablet } = useResponsive();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: PlusCircle, label: 'Generate', path: '/generate' },
    { icon: Book, label: 'Templates', path: '/templates' },
    { icon: FileText, label: 'Documents', path: '/documents' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
  ];

  const content = (
    <div
      onMouseEnter={() => !isMobile && !isTablet && setIsCollapsed(false)}
      onMouseLeave={() => !isMobile && !isTablet && setIsCollapsed(true)}
      className={clsx(
        "bg-[var(--bg-app)] flex flex-col h-full sidebar-scroll overflow-y-auto transition-all duration-300",
        !isMobile && !isTablet ? (isCollapsed ? "w-20" : "w-64") : "w-full",
        !isMobile && !isTablet && "border-r border-[var(--border-main)]"
      )}
    >
      <div className={clsx(
        "p-8 pb-6 flex items-center sticky top-0 bg-[var(--bg-app)] z-10 transition-all duration-300",
        isCollapsed && !isMobile && !isTablet ? "justify-center px-4" : "justify-between"
      )}>
        <Link to="/dashboard" className="flex items-center gap-3 text-[var(--text-main)] font-bold text-xl tracking-tight group">
          <div className="w-9 h-9 bg-[var(--accent-main)] rounded-xl flex items-center justify-center text-[var(--bg-card)] shadow-lg transition-transform duration-300 shrink-0">
            <Sparkles size={20} />
          </div>
          {(!isCollapsed || isMobile || isTablet) && (
            <span className="font-sans whitespace-nowrap overflow-hidden text-[var(--text-main)]">AssignMate</span>
          )}
        </Link>

        {(isMobile || isTablet) && (
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] rounded-lg transition-all duration-200 active:scale-90"
          >
            <motion.div whileHover={{ scale: 1.1 }}>
              <X size={20} />
            </motion.div>
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1.5">
        {(!isCollapsed || isMobile || isTablet) && (
          <div className="px-4 mb-4">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Main Menu</span>
          </div>
        )}
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              title={isCollapsed ? item.label : undefined}
              className={clsx(
                "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                isActive
                  ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm border border-[var(--border-main)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)]',
                isCollapsed && !isMobile && !isTablet && "justify-center px-0"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-5 bg-[var(--accent-main)] rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <item.icon
                  size={18}
                  className={clsx(
                    "transition-colors duration-300",
                    isActive ? "text-[var(--accent-main)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-main)]"
                  )}
                />
              </motion.div>
              {(!isCollapsed || isMobile || isTablet) && (
                <span className={clsx(
                  "font-medium text-sm tracking-tight transition-colors duration-300 whitespace-nowrap",
                  isActive ? "text-[var(--text-main)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-main)]"
                )}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border-main)] bg-[var(--bg-app)] sticky bottom-0 space-y-3">
        <Link
          to="/profile"
          onClick={() => setIsOpen(false)}
          className={clsx(
            "p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm group hover:border-[var(--accent-main)]/20 hover:shadow-md transition-all duration-500 block relative overflow-hidden",
            isCollapsed && !isMobile && !isTablet && "p-1.5"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-app)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-3 relative z-10">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-10 h-10 rounded-xl bg-[var(--accent-main)] flex items-center justify-center overflow-hidden shrink-0 shadow-lg transition-transform duration-300"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon size={20} className="text-[var(--bg-card)]" />
              )}
            </motion.div>
            {(!isCollapsed || isMobile || isTablet) && (
              <>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-[11px] font-black text-[var(--text-main)] truncate tracking-tight leading-none mb-1 uppercase">
                    {user?.displayName?.split(' ')[0] || 'Scholar'}
                  </p>
                  <p className="text-[9px] text-[var(--text-muted)] truncate font-medium leading-none tracking-wider">
                    {user?.email}
                  </p>
                </div>
                <div className="w-6 h-6 rounded-full bg-[var(--bg-app)] flex items-center justify-center group-hover:bg-[var(--accent-main)] group-hover:text-[var(--bg-card)] transition-all duration-300">
                  <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </>
            )}
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className={clsx(
            "flex items-center gap-3 w-full rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300",
            isCollapsed && !isMobile && !isTablet ? "justify-center p-2" : "px-3 py-2"
          )}
        >
          <LogOut size={18} />
          {(!isCollapsed || isMobile || isTablet) && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={clsx(
        "hidden lg:flex bg-[#FBFBFA] h-screen flex-col sticky top-0 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}>
        {content}
      </div>

      {/* Mobile/Tablet Drawer */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
                mass: 0.8
              }}
              className="fixed inset-y-0 left-0 w-64 bg-[#FBFBFA] z-[70] lg:hidden shadow-2xl"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};