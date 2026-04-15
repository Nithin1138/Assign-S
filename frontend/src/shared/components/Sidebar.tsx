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
  LogOut,
  Settings,
  Shield,
  History,
  Info,
  Zap,
  Sun,
  Moon,
  Bell,
  Lock,
  MessageSquare,
  Monitor,
  CreditCard,
  Search,
  Edit3
} from 'lucide-react';

import { useAuth } from '../../features/auth/context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import { signOut } from '../services/auth';
import { UserProfile, updateUserProfile } from '../services/db';

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
  const { user, profile, refreshProfile } = useAuth();
  const { isMobile, isTablet } = useResponsive();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const [notifPreferences, setNotifPreferences] = React.useState({
    studyReminders: true,
    assignmentStatus: true,
    newBlueprints: false,
    systemAlerts: true
  });

  const toggleNotif = (key: keyof typeof notifPreferences) => {
    setNotifPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };


  const menuItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
    { icon: Sparkles, label: 'Generate', path: '/generate' },
    { icon: FileText, label: 'Documents', path: '/documents' },
    { icon: Book, label: 'Templates', path: '/templates' },
    { icon: Edit3, label: 'Editor', path: '/editor' },
  ];

  const sidebarContent = (
    <div className={clsx(
      "flex flex-col h-full bg-[var(--bg-sidebar)] border-r border-[var(--border-main)] py-3 transition-all duration-500 shadow-[inset_-1px_0_0_rgba(0,0,0,0.05)]",
      isMobile || isTablet ? "w-full" : "w-20"
    )}>
      {/* Brand Identity / Logo */}
      <div className="flex justify-center mb-3 px-4 pt-2">
        <Link to="/dashboard" className="relative flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-12 h-12 bg-[var(--text-main)] rounded-[1.2rem] flex items-center justify-center text-[var(--bg-card)] shadow-[0_12px_25px_rgba(0,0,0,0.1)] relative z-10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[var(--bg-card)]" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2ZM12 15.27L8.63 16.76L12 8.54L15.37 16.76L12 15.27Z" />
            </svg>
          </motion.div>
        </Link>
      </div>

      {/* Single Horizontal Separator */}
      <div className="mx-6 mb-6 border-b border-[var(--text-main)] opacity-60" />

      {/* Navigation Stack */}
      <nav className="flex-1 flex flex-col items-center gap-4">
        {menuItems.map((item) => {
          const isActive = item.path === '/editor' 
            ? location.pathname.startsWith('/editor') 
            : location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={clsx(
                "group relative flex flex-col items-center gap-1 w-full px-2 py-2 transition-all outline-none rounded-xl",
                isActive ? "bg-[var(--bg-card)] shadow-[0_8px_20px_rgba(0,0,0,0.04)] ring-1 ring-[var(--border-main)]" : "hover:bg-[var(--text-main)]/[0.02]"
              )}
            >
              {/* Active High-Fidelity Indicator Pill */}
              <AnimatePresence>
                {isActive && (
                  <>
                    <motion.div
                      layoutId="sidebar-active-glow"
                      className="absolute -inset-1 bg-gradient-to-br from-[var(--text-main)]/5 to-transparent rounded-xl blur-lg"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--text-main)] rounded-full"
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 5 }}
                    />
                  </>
                )}
              </AnimatePresence>

              <div className={clsx(
                "relative z-10 flex items-center justify-center transition-all duration-500",
                isActive ? "text-[var(--text-main)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-main)]"
              )}>
                <item.icon
                  size={22}
                  className={clsx(
                    "transition-all duration-300",
                    isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(0,0,0,0.1)]" : "group-hover:scale-110"
                  )}
                />
              </div>

              <span className={clsx(
                "text-[10.5px] capitalize tracking-tight transition-all duration-500",
                isActive ? "text-[var(--text-main)] font-bold" : "text-[var(--text-muted)] font-medium group-hover:text-[var(--text-main)]"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Profile Anchor & Context Popover */}
      <div className="flex flex-col items-center gap-6 mt-auto relative">
        <button
          onClick={() => {
            setIsProfileOpen(!isProfileOpen);
            setIsNotificationOpen(false);
          }}
          className="group relative transition-all outline-none"
        >
          <div className="absolute -inset-2 bg-[var(--text-main)]/5 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className={clsx(
            "relative z-10 w-11 h-11 rounded-full border-2 p-0.5 transition-all duration-500 group-hover:rotate-12",
            isProfileOpen ? "border-[var(--text-main)] scale-110 shadow-lg" : "border-[var(--border-main)] group-hover:border-[var(--text-main)]"
          )}>
            <div className="w-full h-full rounded-full overflow-hidden bg-[var(--bg-card)] flex items-center justify-center shadow-lg">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Scholar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={18} className="text-[var(--text-main)] opacity-40" />
              )}
            </div>
          </div>
        </button>

        {/* High-Fidelity Profile Popover */}
        <AnimatePresence>
          {isProfileOpen && (
            <>
              {/* Invisible Click-away Overlay */}
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => {
                  setIsProfileOpen(false);
                  setIsNotificationOpen(false);
                }}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: isMobile || isTablet ? 0 : 20, y: isMobile || isTablet ? 20 : 10 }}
                animate={{ opacity: 1, scale: 1, x: isMobile || isTablet ? 0 : 90, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: isMobile || isTablet ? 0 : 20, y: isMobile || isTablet ? 20 : 10 }}
                className={clsx(
                  "fixed z-50 w-72 bg-[var(--bg-app)] border border-[var(--border-main)] shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden backdrop-blur-xl",
                  isMobile || isTablet ? "left-1/2 -translate-x-1/2 bottom-[15%]" : "left-0 bottom-12"
                )}
              >
                {/* Header: Identity */}
                <div className="p-5 border-b border-[var(--border-main)] bg-gradient-to-br from-white/[0.02] to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--bg-card)] border border-[var(--border-main)] flex items-center justify-center shadow-inner">
                      {profile?.photoURL ? (
                        <img src={profile.photoURL} alt="Scholar" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={20} className="text-[var(--text-main)] opacity-40" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[var(--text-main)] font-bold text-sm">{profile?.displayName || 'Scholar'}</span>
                      <span className="text-[var(--text-muted)] text-[11px] truncate max-w-[160px]">{profile?.email || 'No email associated'}</span>
                    </div>
                  </div>
                </div>

                {/* List: Attributes & Actions */}
                <div className="py-2">
                  {[
                    { icon: UserIcon, label: 'My Profile', onClick: () => navigate('/profile') },
                    { icon: Settings, label: 'Account', onClick: () => navigate('/settings') },
                    { icon: CreditCard, label: 'Billing', onClick: () => navigate('/billing') },
                    {
                      icon: (profile?.preferences?.theme === 'dark' || profile?.preferences?.theme === 'midnight') ? Sun : Moon,
                      label: (profile?.preferences?.theme === 'dark' || profile?.preferences?.theme === 'midnight') ? 'Light Mode' : 'Dark Mode',
                      onClick: async () => {
                        const current = profile?.preferences?.theme || 'light';
                        const next = (current === 'dark' || current === 'midnight') ? 'light' : 'dark';

                        // Optimistic UI: Apply theme immediately
                        const root = document.documentElement;
                        root.classList.remove('light', 'dark', 'midnight', 'nord', 'coffee', 'emerald', 'rose', 'amber');
                        root.classList.add(next);

                        if (user) {
                          try {
                            await updateUserProfile(user.uid, {
                              preferences: { ...(profile?.preferences || {}), theme: next }
                            } as UserProfile);
                            await refreshProfile();
                          } catch (error) {
                            console.error("Theme persistent sync failed:", error);
                          }
                        }
                      }
                    },
                    { icon: Bell, label: 'Notification', hasArrow: true, onClick: () => setIsNotificationOpen(!isNotificationOpen) },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (item.onClick) item.onClick();
                        if (!item.hasArrow) setIsProfileOpen(false);
                      }}
                      className={clsx(
                        "w-full px-4 py-2.5 flex items-center gap-3 transition-all rounded-xl group/popover",
                        item.hasArrow && isNotificationOpen ? "bg-[var(--text-main)]/5 text-[var(--text-main)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--text-main)]/[0.03]"
                      )}
                    >
                      <item.icon size={18} className={clsx("transition-transform group-hover/popover:scale-110", item.hasArrow && isNotificationOpen ? "opacity-100" : "opacity-60 group-hover/popover:opacity-100")} />
                      <span className="text-[13px] font-medium flex-1 text-left">{item.label}</span>
                      {item.hasArrow && <ChevronRight size={14} className={clsx("transition-transform duration-300", isNotificationOpen ? "rotate-90 opacity-100" : "opacity-30")} />}
                    </button>
                  ))}
                </div>

                {/* Footer: Logout */}
                <div className="p-2 border-t border-[var(--border-main)]">
                  <button
                    onClick={async () => {
                      await signOut();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/5 rounded-xl transition-all font-semibold text-[13px]"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Notification Settings Side-Window */}
        <AnimatePresence>
          {isProfileOpen && isNotificationOpen && (
            <motion.div
              initial={{ opacity: 0, x: isMobile || isTablet ? 0 : 70, scale: 0.95 }}
              animate={{ opacity: 1, x: isMobile || isTablet ? 0 : 380, scale: 1 }}
              exit={{ opacity: 0, x: isMobile || isTablet ? 0 : 70, scale: 0.95 }}
              className={clsx(
                "fixed z-50 w-72 bg-[var(--bg-app)] border border-[var(--border-main)] shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden backdrop-blur-xl p-5 flex flex-col gap-5",
                isMobile || isTablet ? "left-1/2 -translate-x-1/2 bottom-[45%]" : "left-0 bottom-12"
              )}
            >
              <div className="flex items-center gap-3 border-b border-[var(--border-main)] pb-3">
                <Bell size={18} className="text-amber-500" />
                <span className="text-sm font-bold text-[var(--text-main)]">Alert Settings</span>
              </div>

              <div className="flex flex-col gap-1">
                {[
                  { key: 'studyReminders', label: 'Study Alerts', desc: 'Reminders for synthesis' },
                  { key: 'assignmentStatus', label: 'Status Updates', desc: 'Phase progress alerts' },
                  { key: 'newBlueprints', label: 'Blueprints', desc: 'New template notifications' },
                  { key: 'systemAlerts', label: 'Critical', desc: 'Security & system alerts' },
                ].map((pref) => (
                  <button
                    key={pref.key}
                    onClick={() => toggleNotif(pref.key as keyof typeof notifPreferences)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--text-main)]/[0.03] transition-all group/pref"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-[12px] font-bold text-[var(--text-main)]">{pref.label}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{pref.desc}</span>
                    </div>
                    <div className={clsx(
                      "w-9 h-5 rounded-full relative transition-all duration-300 flex items-center px-1",
                      notifPreferences[pref.key as keyof typeof notifPreferences] ? "bg-amber-400" : "bg-[var(--border-main)]"
                    )}>
                      <motion.div
                        animate={{ x: notifPreferences[pref.key as keyof typeof notifPreferences] ? 16 : 0 }}
                        className="w-3 h-3 bg-white rounded-full shadow-sm"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <>
      <div className={clsx(
        "hidden lg:block h-screen sticky top-0 z-50",
        isMobile || isTablet ? "w-0 overflow-hidden" : "w-20"
      )}>
        {sidebarContent}
      </div>

      {/* Mobile/Tablet Drawer Shell */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-64 bg-[var(--bg-app)] z-[70] lg:hidden shadow-2xl overflow-hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};