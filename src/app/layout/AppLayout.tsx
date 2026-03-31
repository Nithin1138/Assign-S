import React, { useState, useEffect } from 'react';
import { useResponsive } from '../../shared/hooks/useResponsive';
import { Sidebar } from '../../shared/components/Sidebar';
import { Menu } from 'lucide-react';
import clsx from 'clsx';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    if (isMobile || isTablet) {
      setIsSidebarOpen(false);
      setIsSidebarCollapsed(false);
    }
  }, [isMobile, isTablet]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-app)]">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-[var(--border-main)] bg-[var(--bg-app)]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] rounded-xl transition-all active:scale-95"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-[var(--text-main)] tracking-tight">AssignMate</span>
          </div>
        </header>

        <main className={clsx(
          "flex-1 relative overflow-y-auto overflow-x-hidden",
          !isMobile && !isTablet && "sidebar-scroll"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};
