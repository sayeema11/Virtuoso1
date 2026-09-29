import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Sparkles, X, Award, CheckCircle2 } from 'lucide-react';

export interface ConfettiTriggerOptions {
  originX?: number; // Normalized 0-1 or pixel coordinate
  originY?: number; // Normalized 0-1 or pixel coordinate
  count?: number;
  title?: string;
  subtitle?: string;
}

export interface SubtleCanvasConfettiRef {
  trigger: (options?: ConfettiTriggerOptions) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  type: 'rect' | 'circle' | 'strip';
  color: string;
  rotation: number;
  rotationSpeed: number;
  angleX: number;
  angleSpeedX: number;
  opacity: number;
  decay: number;
  wobble: number;
  wobbleSpeed: number;
}

// Sophisticated, editorial monochromatic + radiant indigo/cyan + warm champagne palette
const CELEBRATION_PALETTE = [
  '#312E81', // Deep indigo
  '#4F46E5', // Electric indigo
  '#06B6D4', // Vibrant cyan
  '#F5EEE4', // Warm parchment cream
  '#E8DDCC', // Soft sand
  '#DED0BD', // Light almond beige
  '#C5A059', // Brushed champagne gold
  '#D4AF37', // Subtle metallic gold shimmer
  '#8E8271', // Muted bronze grey
];

export const SubtleCanvasConfetti = forwardRef<SubtleCanvasConfettiRef, {
  className?: string;
}>(({ className = '' }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const [toast, setToast] = useState<{
    id: number;
    title: string;
    subtitle: string;
  } | null>(null);

  const toastTimeoutRef = useRef<any>(null);

  const spawnParticles = useCallback((options?: ConfettiTriggerOptions) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    const count = options?.count ?? 68;
    const originX = options?.originX !== undefined
      ? (options.originX <= 1 ? options.originX * width : options.originX)
      : width / 2;
    const originY = options?.originY !== undefined
      ? (options.originY <= 1 ? options.originY * height : options.originY)
      : Math.min(height * 0.35, 220);

    const newParticles: Particle[] = [];

    // Dual-fountain subtle burst calculation
    for (let i = 0; i < count; i++) {
      // Emitter offset (burst slightly left and right)
      const emitterOffset = (Math.random() - 0.5) * 60;
      const posX = originX + emitterOffset;
      const posY = originY + (Math.random() - 0.5) * 20;

      // Gentle launch angles
      const angle = (Math.PI / 2) + (Math.random() - 0.5) * (Math.PI * 0.75); // generally upward
      const speed = Math.random() * 5.5 + 2.5;

      const vx = Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1) * 0.7;
      const vy = -Math.abs(Math.sin(angle) * speed);

      // Determine shape
      const randType = Math.random();
      const type: 'rect' | 'circle' | 'strip' =
        randType < 0.45 ? 'rect' : randType < 0.75 ? 'circle' : 'strip';

      const color = CELEBRATION_PALETTE[Math.floor(Math.random() * CELEBRATION_PALETTE.length)];

      let w = 5;
      let h = 4;
      if (type === 'circle') {
        w = Math.random() * 3 + 2; // radius ~2-3.5px
        h = w;
      } else if (type === 'strip') {
        w = Math.random() * 2 + 1.5;
        h = Math.random() * 8 + 6;
      } else {
        w = Math.random() * 4 + 3.5;
        h = Math.random() * 3 + 2.5;
      }

      newParticles.push({
        x: posX,
        y: posY,
        vx,
        vy,
        w,
        h,
        type,
        color,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        angleX: Math.random() * Math.PI,
        angleSpeedX: (Math.random() - 0.5) * 0.12,
        opacity: 0.95,
        decay: Math.random() * 0.007 + 0.006, // lingers smoothly for ~2.5 - 3.5 seconds
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.08 + 0.03,
      });
    }

    particlesRef.current.push(...newParticles);

    // If toast requested
    if (options?.title) {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setToast({
        id: Date.now(),
        title: options.title,
        subtitle: options.subtitle || 'Skill progression verified & telemetry updated.',
      });

      toastTimeoutRef.current = setTimeout(() => {
        setToast(null);
      }, 4200);
    }

    // Start render loop if not running
    if (!animationFrameRef.current) {
      const runLoop = () => {
        const c = canvasRef.current;
        if (!c) return;

        const ctx = c.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const w = c.width / dpr;
        const h = c.height / dpr;

        ctx.clearRect(0, 0, w, h);

        const activeParticles = particlesRef.current;
        const nextParticles: Particle[] = [];

        for (let i = 0; i < activeParticles.length; i++) {
          const p = activeParticles[i];

          // Physics updates
          p.x += p.vx + Math.sin(p.wobble) * 0.35;
          p.y += p.vy;
          p.vy += 0.11; // subtle gravity
          p.vx *= 0.986; // air resistance
          p.rotation += p.rotationSpeed;
          p.angleX += p.angleSpeedX;
          p.wobble += p.wobbleSpeed;
          p.opacity -= p.decay;

          if (p.opacity > 0 && p.y < h + 50) {
            nextParticles.push(p);

            // Draw particle
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.scale(Math.cos(p.angleX), 1); // 3D flip effect

            ctx.fillStyle = p.color;

            if (p.type === 'circle') {
              ctx.beginPath();
              ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
              ctx.fill();
            } else {
              ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            }

            ctx.restore();
          }
        }

        particlesRef.current = nextParticles;

        if (nextParticles.length > 0) {
          animationFrameRef.current = requestAnimationFrame(runLoop);
        } else {
          ctx.clearRect(0, 0, w, h);
          animationFrameRef.current = null;
        }
      };

      animationFrameRef.current = requestAnimationFrame(runLoop);
    }
  }, []);

  // Expose imperative trigger
  useImperativeHandle(ref, () => ({
    trigger: (options) => {
      spawnParticles(options);
    },
  }), [spawnParticles]);

  // Handle Resize and DPR scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Full-bleed Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className={`pointer-events-none absolute inset-0 z-40 w-full h-full ${className}`}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Subtle Milestone Celebration Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 max-w-sm w-full bg-gradient-to-br from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white p-4 rounded-2xl shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#F5EEE4] text-[#111111] mt-0.5 shadow-xs">
                <Sparkles className="w-4 h-4 text-[#111111]" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#F5EEE4]/60">
                    MILESTONE REACHED
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <h4 className="font-extrabold text-sm text-[#F5EEE4] font-['Cabinet_Grotesk'] leading-tight">
                  {toast.title}
                </h4>
                <p className="text-xs text-[#F5EEE4]/75 leading-relaxed pt-0.5">
                  {toast.subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={() => setToast(null)}
              className="text-[#F5EEE4]/50 hover:text-[#F5EEE4] transition-colors p-1"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
});

SubtleCanvasConfetti.displayName = 'SubtleCanvasConfetti';
