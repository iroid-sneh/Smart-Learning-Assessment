import React, { useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const SPRING_TRANSITION = {
  type: 'spring' as const,
  damping: 60,
  stiffness: 500,
  mass: 2,
};

const DOCS = [
  {
    closed: { x: 0, y: 0, rotate: 6, boxShadow: '0px -1px 2px 0px rgba(133,133,133,0.25)' },
    open: { x: -63, y: -85, rotate: -19, boxShadow: '0px 1px 3px 0px rgba(92,92,92,0.34)' },
    lines: [0.7, 0.9, 0.6, 0.8, 0.5, 0.75, 0.4],
    accent: '#3B82F6',
  },
  {
    closed: { x: -1, y: 0, rotate: -4, boxShadow: '0px -1px 2px 0px rgba(122,122,122,0.25)' },
    open: { x: -1, y: -58, rotate: -7, boxShadow: '-1px 1px 3px 0px rgba(92,92,92,0.3)' },
    lines: [0.85, 0.6, 0.75, 0.9, 0.5, 0.65, 0.8],
    accent: '#8B5CF6',
  },
  {
    closed: { x: 0, y: 0, rotate: 0, boxShadow: '0px -1px 2px 0px rgba(117,117,117,0.25)' },
    open: { x: 84, y: -85, rotate: 16, boxShadow: '0px 1px 2px 1px rgba(51,51,51,0.18)' },
    lines: [0.6, 0.8, 0.9, 0.5, 0.7, 0.85, 0.55],
    accent: '#10B981',
  },
];

function DocPreview({ lines, accent }: { lines: number[]; accent: string }) {
  return (
    <div className="w-full h-full bg-white flex flex-col p-4 gap-[6px]">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded" style={{ backgroundColor: accent, opacity: 0.15 }}>
          <svg viewBox="0 0 20 20" className="w-5 h-5" style={{ color: accent }}>
            <rect x="4" y="3" width="12" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="7" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1" />
            <line x1="7" y1="10" x2="11" y2="10" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
        <div className="h-[6px] rounded-full flex-1" style={{ backgroundColor: accent, opacity: 0.2, maxWidth: '45%' }} />
      </div>
      {lines.map((w, i) => (
        <div key={i} className="h-[4px] rounded-full bg-gray-200" style={{ width: `${w * 100}%`, opacity: 0.6 + (i % 2) * 0.2 }} />
      ))}
      <div className="mt-auto flex gap-2">
        <div className="h-[18px] rounded bg-gray-100 flex-1" />
        <div className="h-[18px] rounded bg-gray-100 w-1/3" />
      </div>
    </div>
  );
}

function MagneticWrapper({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.12);
    y.set((e.clientY - cy) * 0.12);
  };

  return (
    <motion.div onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0); }} style={{ x: springX, y: springY }}>
      {children}
    </motion.div>
  );
}

interface FolderCardProps {
  title: string;
  subtitle?: string;
  fileUrl?: string;
  onClick?: () => void;
}

export function FolderCard({ title, subtitle, fileUrl, onClick }: FolderCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
    onClick?.();
  };

  return (
    <MagneticWrapper>
      <div
        className="flex flex-col items-center justify-center gap-[20px] cursor-pointer select-none"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={handleClick}
      >
        {/* Folder */}
        <div
          className="relative w-[238px] h-[190px] flex items-end justify-center"
          style={{ perspective: 2500, transformStyle: 'preserve-3d' }}
        >
          {/* Back */}
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'linear-gradient(176deg, #5AC8FA 5%, #34AADC 40%)',
              WebkitMaskImage: "url('https://framerusercontent.com/images/u6NHrizsQWk4u5sqIM2DGhO2EI.svg')",
              maskImage: "url('https://framerusercontent.com/images/u6NHrizsQWk4u5sqIM2DGhO2EI.svg')",
              WebkitMaskSize: 'cover',
              maskSize: 'cover',
            }}
            animate={{
              background: isOpen
                ? 'linear-gradient(176deg, #5AC8FA 43%, #34AADC 66%)'
                : 'linear-gradient(176deg, #5AC8FA 5%, #34AADC 40%)',
            }}
            transition={SPRING_TRANSITION}
          />

          {/* Document cards inside */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            {DOCS.map((doc, i) => (
              <motion.div
                key={i}
                className="absolute w-[170px] h-[120px] rounded-[10px] overflow-hidden border-[3px] border-white"
                initial={false}
                animate={{
                  x: isOpen ? doc.open.x : doc.closed.x,
                  y: isOpen ? doc.open.y : doc.closed.y,
                  rotate: isOpen ? doc.open.rotate : doc.closed.rotate,
                  boxShadow: isOpen ? doc.open.boxShadow : doc.closed.boxShadow,
                }}
                transition={SPRING_TRANSITION}
              >
                <DocPreview lines={doc.lines} accent={doc.accent} />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-[54px] h-[142px] opacity-20 blur-[5px]"
                  style={{
                    right: '-20%',
                    background: 'linear-gradient(148deg, #A3A3A3, #8A8A8A)',
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Front cover */}
          <motion.div
            className="absolute bottom-0 w-[238px] h-[147px] rounded-xl overflow-hidden flex items-center justify-center z-20 origin-bottom"
            style={{
              background: 'linear-gradient(0deg, #4FC3F7 0%, #29B6F6 30%, #03A9F4 60%, #039BE5 100%)',
              boxShadow: 'inset 0px 2px 0px 0px rgba(255,255,255,0.35)',
            }}
            animate={{
              rotateX: isOpen ? -65 : 0,
              boxShadow: isOpen ? 'none' : 'inset 0px 2px 0px 0px rgba(255,255,255,0.35)',
            }}
            transition={SPRING_TRANSITION}
          >
            {/* Shiny reflection */}
            <motion.div
              className="absolute top-[-27px] w-[54px] h-[172px] blur-[5px] opacity-30 pointer-events-none"
              style={{ background: 'rgba(255,255,255,0.7)' }}
              initial={false}
              animate={{ left: isOpen ? '120%' : '-30%', rotate: 15 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />

            {/* Noise texture */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: "url('https://framerusercontent.com/images/rR6HYXBrMmX4cRpXfXUOvpvpB0.png')",
                backgroundSize: '128px 128px',
                backgroundRepeat: 'repeat',
              }}
            />

            {/* Subtle bottom shadow line */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-t from-black/10 to-transparent" />
          </motion.div>
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-1">
          <motion.div
            className="px-3 py-1 rounded font-medium text-[16px]"
            animate={{
              backgroundColor: isOpen ? 'rgb(59,130,246)' : 'rgba(0,0,0,0)',
              color: isOpen ? 'rgb(255,255,255)' : 'rgb(116,117,119)',
            }}
            transition={{ duration: 0.2 }}
          >
            {title}
          </motion.div>
          {subtitle && <p className="text-[11px] text-gray-400">{subtitle}</p>}
        </div>
      </div>
    </MagneticWrapper>
  );
}
