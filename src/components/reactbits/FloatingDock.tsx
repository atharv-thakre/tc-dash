import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { KeyRound, FileCode2, BookOpen, Sparkles, LogIn, Server } from 'lucide-react';
import { ApiConfigModal } from '../common/ApiConfigModal';

interface DockItemProps {
  mouseX: ReturnType<typeof useMotionValue>;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  badge?: string;
  active?: boolean;
}

const DockIcon: React.FC<DockItemProps> = ({ mouseX, title, icon, onClick, badge, active }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-120, 0, 120], [42, 58, 42]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 180, damping: 14 });

  return (
    <div className="relative">
      {/* Animated Floating Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.85, x: '-50%' }}
            animate={{ opacity: 1, y: -4, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 6, scale: 0.9, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-zinc-950/95 border border-indigo-500/50 text-white text-[11px] font-semibold tracking-wide whitespace-nowrap shadow-xl shadow-black/80 backdrop-blur-md z-50 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span>{title}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={ref}
        style={{ width, height: width }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative flex items-center justify-center rounded-2xl border transition-colors cursor-pointer select-none ${
          active
            ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30'
            : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'
        }`}
      >
        {badge && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-zinc-950 shadow-sm" />
        )}

        <div className="w-5 h-5 flex items-center justify-center pointer-events-none">
          {icon}
        </div>
      </motion.div>
    </div>
  );
};

interface FloatingDockProps {
  onNavigate: (path: string) => void;
  onLaunchDemo?: () => void;
  onOpenConfig?: () => void;
  className?: string;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  onNavigate,
  onLaunchDemo,
  onOpenConfig,
  className = '',
}) => {
  const mouseX = useMotionValue(Infinity);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleOpenConfig = () => {
    if (onOpenConfig) {
      onOpenConfig();
    } else {
      setIsConfigOpen(true);
    }
  };

  const dockItems: Array<{
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
    badge?: string;
    active?: boolean;
  }> = [
    {
      title: 'Enter Demo Mode',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      onClick: onLaunchDemo || (() => onNavigate('/dashboard')),
      badge: 'Demo',
    },
    {
      title: 'Explore Overview',
      icon: <KeyRound className="w-4 h-4 text-rose-400" />,
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      title: 'REST API Docs',
      icon: <FileCode2 className="w-4 h-4 text-sky-400" />,
      onClick: () => onNavigate('/docs/api/login-routes'),
    },
    {
      title: 'Python SDK Docs',
      icon: <BookOpen className="w-4 h-4 text-purple-400" />,
      onClick: () => onNavigate('/docs/lib/setup'),
    },
    {
      title: 'Configure Server URL',
      icon: <Server className="w-4 h-4 text-emerald-400" />,
      onClick: handleOpenConfig,
    },
    {
      title: 'Sign In to Console',
      icon: <LogIn className="w-4 h-4 text-indigo-400" />,
      onClick: () => onNavigate('/login'),
    },
  ];

  return (
    <>
      <div className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-1rem)] px-2 ${className}`}>
        <motion.div
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl sm:rounded-3xl bg-zinc-950/90 border border-zinc-800/90 backdrop-blur-xl shadow-2xl shadow-indigo-950/30 overflow-visible max-w-full"
        >
          {dockItems.map((item, i) => (
            <DockIcon
              key={i}
              mouseX={mouseX}
              title={item.title}
              icon={item.icon}
              onClick={item.onClick}
              badge={item.badge}
            />
          ))}
        </motion.div>
      </div>

      <ApiConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </>
  );
};
