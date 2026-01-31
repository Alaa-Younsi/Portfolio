import { useEffect, useRef, useState } from 'react';

class Particle {
  constructor(x, y, r) {
    this.ox = x;
    this.oy = y;
    this.br = r;
    this.re = Math.random() * r * 1.5;
    
    // Glitch effect colors - magenta and cyan
    const colorType = Math.random();
    const alpha = 0.4 + Math.random() * 0.5;
    if (colorType < 0.5) {
      this.col = `rgba(255, 0, 255, ${alpha})`; // Magenta
    } else {
      this.col = `rgba(0, 255, 255, ${alpha})`; // Cyan
    }
    
    this.a = Math.random() * 2 * Math.PI;
    this.size = 0.5 + Math.random() * 2;
    this.q = 0.15 + Math.random() * 0.15; // Flatter orbit
    this.h2p = 5;
    
    // Distance-based speed for gravitational effect
    const distance = this.br + this.re;
    this.baseSpeed = (1 / (distance * 0.8)) * 0.8;
    
    this.x = this.ox + (this.br + this.re + this.size + this.h2p) * Math.cos(this.a);
    this.y = this.oy + (this.br + this.re + this.size + this.h2p) * this.q * Math.sin(this.a);
    this.tail = [{ x: this.x, y: this.y, a: this.a }];
    this.tl = Math.floor(Math.random() * 3 + 3);
  }

  move(x, y, speed) {
    this.ox = x;
    this.oy = y;
    this.x = this.ox + (this.br + this.re + this.size + this.h2p) * Math.cos(this.a);
    this.y = this.oy + (this.br + this.re + this.size + this.h2p) * this.q * Math.sin(this.a);
    this.tail.push({ x: this.x, y: this.y, a: this.a });

    if (this.tail.length > this.tl) {
      this.tail.splice(0, 1);
    }
    this.a += this.baseSpeed * speed;
  }

  show(b, f) {
    for (let i = 0; i < this.tail.length; i++) {
      const opacity = (i / this.tail.length) * 0.8;
      const ctx = Math.floor((this.tail[i].a + Math.random() * 0.2 - 0.1) / Math.PI) % 2 !== 0 ? b : f;
      
      // Draw elongated ellipse for melted plasma effect with curved rotation
      if (i > 0) {
        const prevTail = this.tail[i - 1];
        const angle = Math.atan2(this.tail[i].y - prevTail.y, this.tail[i].x - prevTail.x);
        
        ctx.save();
        ctx.translate(this.tail[i].x, this.tail[i].y);
        ctx.rotate(angle);
        ctx.beginPath();
        // Wider ellipse with more curve following the rotation
        ctx.ellipse(0, 0, this.size * 6, this.size * 0.8, 0, 0, 2 * Math.PI);
        ctx.fillStyle = this.col.replace(/[\d.]+\)$/g, opacity * 0.5 + ')');
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(this.tail[i].x, this.tail[i].y, this.size, 0, 2 * Math.PI);
        ctx.fillStyle = this.col.replace(/[\d.]+\)$/g, opacity * 0.5 + ')');
        ctx.fill();
      }
    }
  }
}

export default function BlackHole({ active, onExplode, isExploding: parentIsExploding }) {
  const backCanvasRef = useRef(null);
  const middleCanvasRef = useRef(null);
  const frontCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const explosionParticlesRef = useRef([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const explosionStartRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (active !== "home") return;

    const backCanvas = backCanvasRef.current;
    const middleCanvas = middleCanvasRef.current;
    const frontCanvas = frontCanvasRef.current;
    if (!backCanvas || !middleCanvas || !frontCanvas) return;

    const b = backCanvas.getContext('2d');
    const m = middleCanvas.getContext('2d');
    const f = frontCanvas.getContext('2d');

    const size = 280;
    backCanvas.width = size;
    middleCanvas.width = size;
    frontCanvas.width = size;
    backCanvas.height = size;
    middleCanvas.height = size;
    frontCanvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const blackHoleRadius = 50;

    if (particlesRef.current.length === 0) {
      const num = isMobile ? 180 : 600;
      for (let i = 0; i < num; i++) {
        const p = new Particle(centerX, centerY, blackHoleRadius);
        // Mobile performance tweaks: smaller tails and sizes
        if (isMobile) {
          p.tl = 1; // no trailing ellipses, simple dots
          p.size *= 0.6;
          p.baseSpeed *= 1.1;
        }
        particlesRef.current.push(p);
      }
    }

    const draw = () => {
      b.globalCompositeOperation = 'lighter';
      f.globalCompositeOperation = 'lighter';

      if (parentIsExploding && explosionStartRef.current) {
        const elapsed = Date.now() - explosionStartRef.current;
        const duration = 600; // shorter, snappier explosion
        const raw = Math.min(elapsed / duration, 1);
        // ease-out cubic for smoother motion
        const progress = 1 - Math.pow(1 - raw, 3);

        // Draw explosion particles with eased outward velocity
        explosionParticlesRef.current.forEach(p => {
          p.x += p.vx * (0.6 + progress);
          p.y += p.vy * (0.6 + progress);
          p.life = 1 - raw;
          const ctx = Math.random() < 0.5 ? b : f;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.8 + progress), 0, Math.PI * 2);
          ctx.fillStyle = p.color + p.life + ')';
          ctx.fill();
        });

        // Expanding black hole circle with eased scale and fade
        m.beginPath();
        m.arc(centerX, centerY, blackHoleRadius * (1 + progress * 3), 0, 2 * Math.PI);
        m.fillStyle = `rgba(0, 0, 0, ${1 - raw})`;
        m.fill();
        return;
      }

      // Draw black hole
      m.beginPath();
      m.arc(centerX, centerY, blackHoleRadius, 0, 2 * Math.PI);
      m.fillStyle = 'rgb(0, 0, 0)';
      m.fill();

      // Draw particles
      const speed = isHovered ? 1.5 : 1;
      for (let i = 0; i < particlesRef.current.length; i++) {
        particlesRef.current[i].move(centerX, centerY, speed);
        particlesRef.current[i].show(b, f);
      }
    };

    const loop = () => {
      b.clearRect(0, 0, size, size);
      m.clearRect(0, 0, size, size);
      f.clearRect(0, 0, size, size);
      draw();
      animationRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, isHovered, parentIsExploding, isMobile]);

  useEffect(() => {
    if (parentIsExploding && !explosionStartRef.current) {
      explosionStartRef.current = Date.now();
      const backCanvas = backCanvasRef.current;
      const middleCanvas = middleCanvasRef.current;
      const frontCanvas = frontCanvasRef.current;
      if (backCanvas && middleCanvas && frontCanvas) {
        const size = 280;
        const centerX = size / 2;
        const centerY = size / 2;
        // Create explosion particles
        explosionParticlesRef.current = [];
        const explosionCount = isMobile ? 80 : 150;
        for (let i = 0; i < explosionCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = (isMobile ? 0.8 : 1) + Math.random() * (isMobile ? 1.2 : 2);
          const pSize = (isMobile ? 0.8 : 1) + Math.random() * (isMobile ? 2 : 3);
          const color = Math.random() < 0.5 ? 'rgba(255,0,255,' : 'rgba(0,255,255,';
          explosionParticlesRef.current.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: pSize,
            color,
            life: 1
          });
        }
      }
    }
    if (!parentIsExploding) {
      explosionStartRef.current = null;
    }
  }, [parentIsExploding, isMobile]);

  const handleClick = () => {
    if (onExplode) {
      onExplode();
    }
  };

  if (active !== "home") return null;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className={`fixed top-1/2 left-1/2 pointer-events-auto z-10 cursor-pointer transition-opacity duration-500 opacity-100`}
      style={{ 
        width: '280px', 
        height: '280px', 
         left: '50%',
         top: '50%',
        transform: isMobile ? 'translate(-50%, -50%) scale(0.7)' : 'translate(-50%, -50%)'
      }}
    >
      <canvas
        ref={backCanvasRef}
        className="pointer-events-none absolute top-0 left-0"
        style={{ display: 'block' }}
      />
      <canvas
        ref={middleCanvasRef}
        className="pointer-events-none absolute top-0 left-0"
        style={{ display: 'block' }}
      />
      <canvas
        ref={frontCanvasRef}
        className="pointer-events-none absolute top-0 left-0"
        style={{ display: 'block' }}
      />
    </div>
  );
}
