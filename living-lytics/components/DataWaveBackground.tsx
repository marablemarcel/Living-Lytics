"use client";

import { useEffect, useRef } from "react";

interface WaveLine {
  baseY: number;
  amplitude: number;
  frequency: number;
  phase: number;
  speed: number;
  color: { r: number; g: number; b: number };
  opacity: number;
  points: { x: number; y: number }[];
}

export function DataWaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseXRef = useRef(-1000);
  const mouseYRef = useRef(-1000);
  const waveLinesRef = useRef<WaveLine[]>([]);
  const timeRef = useRef(0);
  const frameIdRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas.parentElement) return;
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      initWaves();
    };

    const initWaves = () => {
      // Create flowing wave lines with blue→cyan→green gradient
      const waves: WaveLine[] = [];
      const numWaves = 12;
      
      for (let i = 0; i < numWaves; i++) {
        const progress = i / numWaves;
        
        // Color gradient from blue to cyan to green
        let r, g, b;
        if (progress < 0.5) {
          // Blue to Cyan
          const t = progress * 2;
          r = Math.round(47 + (46 - 47) * t);   // 2F7BFF → 2EE8FF
          g = Math.round(123 + (232 - 123) * t);
          b = 255;
        } else {
          // Cyan to Green
          const t = (progress - 0.5) * 2;
          r = Math.round(46 + (37 - 46) * t);    // 2EE8FF → 25F4A6
          g = Math.round(232 + (244 - 232) * t);
          b = Math.round(255 + (166 - 255) * t);
        }

        waves.push({
          baseY: (height * 0.2) + (height * 0.6 * progress),
          amplitude: 40 + Math.random() * 60,
          frequency: 0.003 + Math.random() * 0.002,
          phase: Math.random() * Math.PI * 2,
          speed: 0.0005 + Math.random() * 0.001,
          color: { r, g, b },
          opacity: 0.15 + Math.random() * 0.25,
          points: []
        });
      }
      
      waveLinesRef.current = waves;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      timeRef.current += 1;
      const time = timeRef.current;

      const mouseInfluenceRadius = 200;
      const mouseInfluenceStrength = 50;

      // Draw each wave line
      waveLinesRef.current.forEach((wave) => {
        const points: { x: number; y: number }[] = [];
        const numPoints = Math.ceil(width / 10) + 1;

        // Generate wave points
        for (let i = 0; i < numPoints; i++) {
          const x = (i / (numPoints - 1)) * width;
          
          // Base sine wave motion
          let y = wave.baseY + 
                  Math.sin(x * wave.frequency + wave.phase + time * wave.speed) * wave.amplitude +
                  Math.sin(x * wave.frequency * 0.5 + wave.phase * 1.3 + time * wave.speed * 0.7) * (wave.amplitude * 0.5);

          // Mouse interaction - localized bending
          const dx = x - mouseXRef.current;
          const dy = y - mouseYRef.current;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < mouseInfluenceRadius) {
            const influence = (1 - dist / mouseInfluenceRadius) * mouseInfluenceStrength;
            const angle = Math.atan2(dy, dx);
            y += Math.sin(angle) * influence * 0.5;
          }

          points.push({ x, y });
        }

        wave.points = points;

        // Draw the flowing line
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, ${wave.opacity})`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        if (points.length > 0) {
          ctx.moveTo(points[0].x, points[0].y);
          
          // Use quadratic curves for smooth flowing lines
          for (let i = 1; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
          }
          
          if (points.length > 1) {
            const last = points[points.length - 1];
            ctx.lineTo(last.x, last.y);
          }
        }

        ctx.stroke();

        // Draw glowing particles along the wave
        const particleSpacing = 80;
        for (let i = 0; i < points.length; i += Math.floor(particleSpacing / 10)) {
          const point = points[i];
          
          // Particle glow
          const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 4);
          gradient.addColorStop(0, `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, ${wave.opacity * 2})`);
          gradient.addColorStop(1, `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, 0)`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
          ctx.fill();

          // Core particle
          ctx.fillStyle = `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, ${wave.opacity * 3})`;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      frameIdRef.current = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseXRef.current = e.clientX - rect.left;
      mouseYRef.current = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseXRef.current = -1000;
      mouseYRef.current = -1000;
    };

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    resize();
    window.addEventListener("resize", resize);
    
    if (!prefersReducedMotion) {
      window.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseleave", handleMouseLeave);
    }
    
    frameIdRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(frameIdRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Radial gradient overlays for atmospheric glow */}
      <div className="absolute top-[-10%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-ll-blue/15 blur-[100px] animate-pulse-slow" />
      <div className="absolute top-[30%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-ll-green/10 blur-[80px]" />
      
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full opacity-90"
      />
    </div>
  );
}
