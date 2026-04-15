import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  FileText, 
  Zap, 
  Clock, 
  Sparkles,
  Award,
  ArrowUpRight,
  TrendingUp,
  Target,
  BarChart3,
  Calendar,
  Flame,
  CheckCircle2,
  Lightbulb,
  PenTool,
  Trophy
} from 'lucide-react';
import { 
  format, 
  startOfWeek, 
  eachDayOfInterval, 
  subDays, 
  isSameDay, 
  isToday, 
  startOfDay
} from 'date-fns';
import clsx from 'clsx';
import { useAuth } from '../features/auth/context/AuthContext';
import { getUserActivities, UserActivity } from '../shared/services/db';
import { AppLayout as Layout } from '../app/layout/AppLayout';
import Aurora from '../features/editor/components/Aurora';

const ActivityPage = () => {
  const { user, profile } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<{ date: Date, count: number, id: number } | null>(null);
  const isGlassEnabled = profile?.preferences?.glassmorphism ?? false;

  useEffect(() => {
    if (user) {
      getUserActivities(user.uid).then(data => {
        setActivities(data);
        setLoading(false);
      });
    }
  }, [user]);

  // --- DERIVED METRICS ---
  const stats = useMemo(() => {
    if (activities.length === 0) {
      const today = new Date();
      const dayInterval = eachDayOfInterval({ start: subDays(today, 6), end: today });
      return {
        wordsToday: 0,
        docsCreated: 0,
        timeSpent: '0h',
        streak: 0,
        weeklyCounts: [0, 0, 0, 0, 0, 0, 0],
        dayLabels: dayInterval.map(d => format(d, 'EEE')),
        completionRate: 0,
        bestDay: 'None'
      };
    }

    const today = new Date();
    const weekStart = startOfWeek(today);
    const dayInterval = eachDayOfInterval({ start: subDays(today, 6), end: today });
    
    // 1. Weekly activity counts
    const weeklyCounts = dayInterval.map(day => 
      activities.filter(a => isSameDay(new Date(a.created_at), day)).length
    );

    // 2. Best Day
    const maxIdx = weeklyCounts.indexOf(Math.max(...weeklyCounts));
    const bestDayName = format(dayInterval[maxIdx], 'EEEE');

    // 3. Streak Calculation
    let streak = 0;
    let checkDay = startOfDay(today);
    while (true) {
      const hasActivity = activities.some(a => isSameDay(new Date(a.created_at), checkDay));
      if (hasActivity) {
        streak++;
        checkDay = subDays(checkDay, 1);
      } else {
        break;
      }
    }

    // 4. Words & Docs 
    const docsCount = activities.filter(a => a.event_type === 'document_created').length;
    const aiCount = activities.filter(a => a.event_type === 'ai_generated').length;
    const wordsToday = activities.filter(a => isToday(new Date(a.created_at))).length * 250; 

    // 5. Peak Hour Calculation
    const hourCounts = new Array(24).fill(0);
    activities.forEach(a => hourCounts[new Date(a.created_at).getHours()]++);
    const peakHourRaw = hourCounts.indexOf(Math.max(...hourCounts));
    const peakHour = activities.length > 0 ? format(new Date().setHours(peakHourRaw, 0), 'h:mm a') : 'N/A';

    return {
      wordsToday,
      docsCreated: docsCount,
      timeSpent: `${Math.max(1, Math.floor(activities.length * 0.2))}h`,
      streak,
      weeklyCounts,
      dayLabels: dayInterval.map(d => format(d, 'EEE')),
      completionRate: docsCount > 0 ? Math.round((aiCount / docsCount) * 100) : 0,
      bestDay: bestDayName,
      peakHour
    };
  }, [activities]);

  const insights = useMemo(() => [
    { text: `You perform best on ${stats.bestDay}.`, type: 'highlight' },
    { text: stats.streak >= 3 ? `Outstanding ${stats.streak}-day streak!` : 'Write for 15 mins today to start a streak.', type: 'suggestion' },
    { text: `Your peak output is usually around ${stats.peakHour}.`, type: 'insight' }
  ], [stats]);

  const goals = [
    { label: 'Weekly Word Target', current: stats.wordsToday, target: 5000, color: 'emerald' },
    { label: 'Daily Assignment Pulse', current: activities.filter(a => isToday(new Date(a.created_at))).length, target: 5, color: 'blue' }
  ];

  return (
    <Layout>
      <div className="relative min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] overflow-x-hidden">
        {/* Immersive Performance Background */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <Aurora colorStops={['#10b981', '#3b82f6', '#10b981']} speed={0.15} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-16 lg:py-24">
          
          {/* 1. ACTIVITY SUMMARY (TOP) */}
          <div className="mb-12">
             <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-[var(--text-main)] rounded-2xl flex items-center justify-center text-[var(--bg-card)]">
                <BarChart3 size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight uppercase">Performance <span className="text-[var(--text-muted)] italic">Analytics</span></h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-60">{"Insight > Data > Design"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Words Written', value: stats.wordsToday.toLocaleString(), unit: 'today', icon: PenTool, color: 'text-blue-500' },
                { label: 'Documents', value: stats.docsCreated, unit: 'lifetime', icon: FileText, color: 'text-emerald-500' },
                { label: 'Writing Time', value: stats.timeSpent, unit: 'approx', icon: Clock, color: 'text-amber-500' },
                { label: 'Streak', value: stats.streak, unit: 'days', icon: Flame, color: 'text-orange-500' }
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={clsx(
                    "p-6 rounded-[2rem] border border-[var(--border-main)] flex flex-col justify-between h-36 transition-all group hover:border-[var(--text-main)]/20",
                    isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)] shadow-sm"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <item.icon size={18} className={item.color} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">{item.unit}</span>
                  </div>
                  <div>
                    <div className="text-3xl font-black tracking-tight">{item.value}</div>
                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">{item.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* 2. WEEKLY ACTIVITY GRAPH & CONSISTENCY */}
            <div className="lg:col-span-2 space-y-8">
              {/* Main Graph Card */}
              <div className={clsx(
                "p-8 rounded-[2.5rem] border border-[var(--border-main)]",
                isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
              )}>
                <div className="flex items-center justify-between mb-10">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-widest">Weekly Velocity</h3>
                    <p className="text-[10px] text-[var(--text-muted)] font-medium">Daily action density vs word count estimation</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-app)] rounded-full text-[9px] font-black">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      ACTIONS
                    </div>
                  </div>
                </div>

                <div className="h-64 flex items-end justify-between gap-2 md:gap-4 px-2">
                  {stats.weeklyCounts.map((count, i) => {
                    const height = (count / (Math.max(...stats.weeklyCounts, 1))) * 100;
                    const isBest = count === Math.max(...stats.weeklyCounts) && count > 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          <div className="bg-[var(--text-main)] text-[var(--bg-card)] px-3 py-1.5 rounded-xl text-[10px] font-black whitespace-nowrap shadow-xl">
                            {count} ACTIONS
                          </div>
                          <div className="w-2 h-2 bg-[var(--text-main)] rotate-45 mx-auto -mt-1" />
                        </div>

                        <div 
                          className={clsx(
                            "w-full rounded-2xl transition-all duration-700 min-h-[4px]",
                            isBest ? "bg-gradient-to-t from-blue-600 to-emerald-400 shadow-[0_10px_30px_rgba(59,130,246,0.3)]" : "bg-[var(--text-main)]/5 group-hover:bg-[var(--text-main)]/10"
                          )}
                          style={{ height: `${Math.max(height, 5)}%` }}
                        />
                        <span className={clsx(
                          "text-[10px] font-black tracking-tighter",
                          isBest ? "text-[var(--text-main)]" : "text-[var(--text-muted)]"
                        )}>
                          {stats.dayLabels[i]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={clsx(
                "p-8 rounded-[2.5rem] border border-[var(--border-main)]",
                isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
              )}>
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={16} /> Content Consistency
                    </h3>
                    <p className="text-[10px] text-[var(--text-muted)] font-medium">Daily contribution density for the last 90 days</p>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-[var(--text-muted)]">
                    Less <div className="w-2 h-2 rounded-sm bg-[var(--text-main)]/5" />
                    <div className="w-2 h-2 rounded-sm bg-emerald-300" />
                    <div className="w-2 h-2 rounded-sm bg-emerald-500" />
                    <div className="w-2 h-2 rounded-sm bg-emerald-700" /> More
                  </div>
                </div>

                <div className="flex gap-4">
                  {/* Weekday Labels */}
                  <div className="flex flex-col justify-between py-1 text-[9px] font-black text-[var(--text-muted)] opacity-40 uppercase">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                  </div>

                  {/* The Grid */}
                  <div className="flex-1 relative group/calendar">
                    {/* Month Markers (Aligned to columns) */}
                    <div className="grid grid-cols-13 mb-3 px-1 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                      <span className="col-start-1">{format(subDays(new Date(), 90), 'MMM')}</span>
                      <span className="col-start-5">{format(subDays(new Date(), 60), 'MMM')}</span>
                      <span className="col-start-9">{format(subDays(new Date(), 30), 'MMM')}</span>
                      <span className="col-start-13 text-[var(--text-main)] text-right">TDY</span>
                    </div>
                    
                    <div className="grid grid-flow-col grid-rows-7 gap-1.5 relative w-fit">
                      {Array.from({ length: 91 }).map((_, i) => {
                        const date = subDays(new Date(), 90 - i);
                        const activityOnDay = activities.filter(a => isSameDay(new Date(a.created_at), date)).length;
                        
                        let bgColor = "bg-[var(--text-main)]/5";
                        if (activityOnDay > 0) bgColor = "bg-emerald-200";
                        if (activityOnDay > 2) bgColor = "bg-emerald-400";
                        if (activityOnDay > 5) bgColor = "bg-emerald-600";
                        
                        return (
                          <motion.div 
                            key={i} 
                            onMouseEnter={() => setHoveredDay({ date, count: activityOnDay, id: i })}
                            onMouseLeave={() => setHoveredDay(null)}
                            whileHover={{ scale: 1.3, zIndex: 20 }}
                            className={clsx(
                              "w-3.5 h-3.5 rounded-[3px] transition-all cursor-pointer relative",
                              bgColor,
                              isToday(date) && "ring-2 ring-[var(--text-main)] ring-offset-2 ring-offset-[var(--bg-app)]"
                            )}
                          />
                        );
                      })}

                      {/* LeetCode-style Interactive Tooltip */}
                      <AnimatePresence>
                        {hoveredDay && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: -45, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            className="absolute pointer-events-none z-50 bg-[#1a1a1a] text-white px-3 py-2 rounded-xl text-[10px] font-black whitespace-nowrap shadow-2xl flex flex-col items-center gap-0.5 border border-white/10"
                            style={{ 
                              // Accurate calculation: (colIndex * (squareWidth + gap)) + halfSquare
                              left: `${(Math.floor(hoveredDay.id / 7) * 20) + 7}px`,
                              top: `${(hoveredDay.id % 7) * 20}px`,
                              transform: 'translateX(-50%)'
                            }}
                          >
                            <span>{hoveredDay.count} ACTIONS</span>
                            <span className="opacity-60 text-[8px] uppercase">{format(hoveredDay.date, 'MMMM d, yyyy')}</span>
                            <div className="absolute top-full w-2 h-2 bg-[#1a1a1a] border-r border-b border-white/10 rotate-45 -mt-1" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

               {/* 6. RECENT ACTIVITY LOG */}
               <div className={clsx(
                "p-8 rounded-[2.5rem] border border-[var(--border-main)]",
                isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
              )}>
                 <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-black uppercase tracking-widest">Chronicle</h3>
                  <History size={16} className="text-[var(--text-muted)]" />
                </div>
                
                <div className="space-y-4">
                  {activities.slice(0, 5).map((a, i) => (
                    <div key={a.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[var(--bg-app)] rounded-xl flex items-center justify-center text-[var(--text-muted)] group-hover:bg-[var(--text-main)] group-hover:text-[var(--bg-card)] transition-all">
                          {a.event_type === 'document_created' ? <FileText size={16} /> : <Zap size={16} />}
                        </div>
                        <div>
                          <div className="text-xs font-black truncate max-w-[150px] md:max-w-xs">{a.title}</div>
                          <div className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">{format(new Date(a.created_at), 'h:mm a • MMM d')}</div>
                        </div>
                      </div>
                      <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: INSIGHTS, METRICS, GOALS */}
            <div className="space-y-8">
              
              {/* 3. PRODUCTIVITY INSIGHTS */}
              <div className="bg-[var(--text-main)] text-[var(--bg-card)] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <Lightbulb className="absolute right-[-10px] top-[-10px] w-24 h-24 opacity-10 rotate-12" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-60">Neural Insights</h3>
                <div className="space-y-5 relative z-10">
                  {insights.map((insight, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="mt-1 shrink-0">
                        {insight.type === 'highlight' ? <Trophy size={14} className="text-emerald-400" /> : <TrendingUp size={14} className="text-blue-400" />}
                      </div>
                      <p className="text-xs font-black leading-relaxed">{insight.text}</p>
                    </div>
                  ))}
                </div>
                <button className="mt-8 w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
                  Optimize Workflow <ArrowUpRight size={14} />
                </button>
              </div>

               {/* 8. GOALS (POWERFUL ADDITION) */}
               <div className={clsx(
                "p-8 rounded-[2.5rem] border border-[var(--border-main)]",
                isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
              )}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Target size={18} /> Strategic Goals
                  </h3>
                </div>
                
                <div className="space-y-8">
                  {goals.map((goal, i) => {
                    const percent = Math.min((goal.current / goal.target) * 100, 100);
                    return (
                      <div key={i} className="space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tight">
                          <span>{goal.label}</span>
                          <span className="text-[var(--text-muted)]">{Math.round(percent)}%</span>
                        </div>
                        <div className="h-3 bg-[var(--bg-app)] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 1, delay: i * 0.2 }}
                            className={clsx(
                              "h-full rounded-full bg-gradient-to-r",
                              goal.color === 'emerald' ? "from-emerald-400 to-emerald-600" : "from-blue-400 to-blue-600"
                            )} 
                          />
                        </div>
                        <div className="text-[9px] font-bold text-[var(--text-muted)]">
                          {goal.current} / {goal.target} {goal.label.includes('Word') ? 'words' : 'units'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

               {/* 4. PERFORMANCE METRICS */}
               <div className={clsx(
                "p-8 rounded-[2.5rem] border border-[var(--border-main)]",
                isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
              )}>
                <h3 className="text-sm font-black uppercase tracking-widest mb-8">Efficiency Indices</h3>
                <div className="grid grid-cols-1 gap-6">
                  {[
                    { label: 'Avg Words / Session', value: '450', sub: '↑ 12% from last week' },
                    { label: 'Completion Rate', value: `${stats.completionRate}%`, sub: 'Projects started vs finalized' },
                    { label: 'Peak Hour', value: stats.peakHour, sub: 'Highest cognitive output' }
                  ].map((m, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-2xl font-black">{m.value}</span>
                      <span className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-1">{m.label}</span>
                      <span className="text-[9px] font-bold text-emerald-500 opacity-80">{m.sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. ACHIEVEMENTS / MILESTONES */}
              <div className={clsx(
                "p-8 rounded-[2.5rem] border border-[var(--border-main)]",
                isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
              )}>
                <h3 className="text-sm font-black uppercase tracking-widest mb-6">Milestones</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: Award, label: 'First Seed', active: true },
                    { icon: Zap, label: 'AI Expert', active: stats.docsCreated >= 5 },
                    { icon: Flame, label: 'Striker', active: stats.streak >= 3 },
                    { icon: Target, label: 'Precision', active: stats.completionRate > 80 }
                  ].map((badge, i) => (
                    <div 
                      key={i} 
                      className={clsx(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                        badge.active ? "bg-amber-100 text-amber-600 border border-amber-200" : "bg-[var(--bg-app)] text-[var(--text-muted)] opacity-30 grayscale"
                      )}
                      title={badge.label}
                    >
                      <badge.icon size={20} />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ActivityPage;
