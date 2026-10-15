import { useEffect, useRef } from "react";

// A subtle gold sparkle trail for mouse users. Off for touch and reduced motion.
export function CursorSparkles({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!fine || reduced || !canvas || !ctx) return;

    type P = { x: number; y: number; vx: number; vy: number; life: number; size: number; hue: number; rot: number };
    const parts: P[] = [];
    let raf = 0;
    let last = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const star = (p: P) => {
      const a = Math.max(0, p.life);
      const s = p.size * (0.5 + a * 0.5);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = a * 0.9;
      ctx.fillStyle = p.hue ? "#E8A3B0" : "#D9B26A";
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.15, -s * 0.15, s, 0);
      ctx.quadraticCurveTo(s * 0.15, s * 0.15, 0, s);
      ctx.quadraticCurveTo(-s * 0.15, s * 0.15, -s, 0);
      ctx.quadraticCurveTo(-s * 0.15, -s * 0.15, 0, -s);
      ctx.fill();
      ctx.restore();
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.life -= 0.022;
        p.rot += 0.04;
        if (p.life <= 0) parts.splice(i, 1);
        else star(p);
      }
      raf = parts.length ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const now = performance.now();
      if (now - last < 34 || parts.length > 40) return;
      last = now;
      parts.push({
        x: e.clientX + (Math.random() - 0.5) * 6,
        y: e.clientY + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.2 - Math.random() * 0.4,
        life: 1,
        size: 3 + Math.random() * 4,
        hue: Math.random() < 0.3 ? 1 : 0,
        rot: Math.random() * Math.PI,
      });
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active]);

  return <canvas ref={canvasRef} className="cursor-sparkles" aria-hidden="true" />;
}
