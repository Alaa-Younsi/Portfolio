import { useEffect, useRef, useState } from 'react';

// Accretion disk particle for smooth, scientifically accurate rendering
class DiskParticle {
  constructor(centerX, centerY, innerRadius, outerRadius) {
    this.centerX = centerX;
    this.centerY = centerY;
    
    // Random position in disk with weighted distribution (more particles closer to black hole)
    const radiusFactor = Math.pow(Math.random(), 0.6); // Weight towards inner radius
    this.radius = innerRadius + radiusFactor * (outerRadius - innerRadius);
    this.angle = Math.random() * Math.PI * 2;
    
    // Orbital speed (faster closer to black hole - Keplerian motion)
    this.speed = 0.8 / Math.sqrt(this.radius);
    
    // Color based on distance (hotter closer to black hole - orange to red)
    const temp = 1 - (this.radius - innerRadius) / (outerRadius - innerRadius);
    this.brightness = 0.3 + temp * 0.7;
    
    // Doppler effect colors (approaching vs receding)
    const dopplerShift = Math.cos(this.angle);
    if (dopplerShift > 0) {
      // Approaching - blueshift
      this.r = 200 + temp * 55;
      this.g = 150 + temp * 80;
      this.b = 100 + dopplerShift * 100;
    } else {
      // Receding - redshift
      this.r = 255;
      this.g = 100 + temp * 100;
      this.b = 50 - dopplerShift * 30;
    }
    
    // Slight vertical offset for 3D effect
    this.verticalOffset = Math.sin(this.angle) * this.radius * 0.15;
  }
  
  update() {
    this.angle += this.speed * 0.01;
    if (this.angle > Math.PI * 2) this.angle -= Math.PI * 2;
  }
  
  draw(ctx) {
    const x = this.centerX + Math.cos(this.angle) * this.radius;
    const y = this.centerY + Math.sin(this.angle) * this.radius * 0.3 + this.verticalOffset;
    
    // Particle size based on distance (perspective)
    const size = 1 + (1 - (this.radius / 150)) * 1.5;
    
    // Alpha based on vertical position (back particles are dimmer)
    const alpha = this.brightness * (0.4 + 0.6 * Math.abs(Math.cos(this.angle)));
    
    ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function BlackHole({ active, onExplode, isExploding: parentIsExploding }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const explosionParticlesRef = useRef([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const explosionStartRef = useRef(null);
  const timeRef = useRef(0);

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

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    
    // Same design for both, just different size
    const size = isMobile ? 240 : 300;
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const scale = size / 300; // Scale factor based on desktop size
    const eventHorizon = 30 * scale; // Event horizon radius
    const innerDisk = 50 * scale;
    const outerDisk = 130 * scale;

    // Reinitialize particles with correct dimensions for current screen size
    if (particlesRef.current.length === 0 || particlesRef.current[0]?.centerX !== centerX) {
      particlesRef.current = [];
      const particleCount = 400; // Same for both mobile and desktop
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(new DiskParticle(centerX, centerY, innerDisk, outerDisk));
      }
    }

    const drawBlackHole = () => {
      // Photon sphere glow (gravitational lensing effect) - drawn first
      const gradient = ctx.createRadialGradient(
        centerX, centerY, eventHorizon,
        centerX, centerY, eventHorizon + 8
      );
      gradient.addColorStop(0, 'rgba(255, 150, 50, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, eventHorizon + 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Event horizon (pure black) - drawn on top to ensure it's fully black
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, eventHorizon, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawAccretionDisk = () => {
      // Draw particles (sorted by Y for proper layering)
      const sorted = [...particlesRef.current].sort((a, b) => {
        const yA = centerY + Math.sin(a.angle) * a.radius * 0.3 + a.verticalOffset;
        const yB = centerY + Math.sin(b.angle) * b.radius * 0.3 + b.verticalOffset;
        return yA - yB;
      });
      
      sorted.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });
    };

    const drawExplosion = () => {
      const elapsed = Date.now() - explosionStartRef.current;
      const duration = 800;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      // Draw explosion particles
      explosionParticlesRef.current.forEach(p => {
        p.x += p.vx * (1 + easeProgress * 2);
        p.y += p.vy * (1 + easeProgress * 2);
        p.life = 1 - progress;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + easeProgress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.life * 0.8})`;
        ctx.fill();
      });

      // Expanding event horizon
      const expandRadius = eventHorizon * (1 + easeProgress * 4);
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, expandRadius
      );
      gradient.addColorStop(0, `rgba(0, 0, 0, ${1 - progress})`);
      gradient.addColorStop(0.7, `rgba(255, 100, 0, ${(1 - progress) * 0.5})`);
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, expandRadius, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, size, size);
      
      if (parentIsExploding && explosionStartRef.current) {
        drawExplosion();
      } else {
        // Subtle glow effect on hover
        if (isHovered) {
          const pulseGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, outerDisk + 20
          );
          pulseGradient.addColorStop(0, 'rgba(255, 150, 50, 0)');
          pulseGradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.05)');
          pulseGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
          ctx.fillStyle = pulseGradient;
          ctx.beginPath();
          ctx.arc(centerX, centerY, outerDisk + 20, 0, Math.PI * 2);
          ctx.fill();
        }
        
        drawAccretionDisk();
        drawBlackHole();
      }
      
      timeRef.current += 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, isHovered, parentIsExploding, isMobile]);

  useEffect(() => {
    if (parentIsExploding && !explosionStartRef.current) {
      explosionStartRef.current = Date.now();
      const canvas = canvasRef.current;
      if (canvas) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        explosionParticlesRef.current = [];
        const explosionCount = 200; // Same for both mobile and desktop
        
        for (let i = 0; i < explosionCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 2;
          const size = 1 + Math.random() * 3;
          
          // Hot plasma colors
          const colorChoice = Math.random();
          let r, g, b;
          if (colorChoice < 0.4) {
            r = 255; g = 150 + Math.random() * 100; b = 50;
          } else if (colorChoice < 0.7) {
            r = 255; g = 50 + Math.random() * 100; b = 50;
          } else {
            r = 255; g = 200; b = 100 + Math.random() * 155;
          }
          
          explosionParticlesRef.current.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size,
            r, g, b,
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

  const containerSize = isMobile ? 240 : 300;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className="fixed top-1/2 left-1/2 pointer-events-auto z-10 cursor-pointer transition-opacity duration-500 opacity-100"
      style={{ 
        width: `${containerSize}px`, 
        height: `${containerSize}px`, 
        transform: 'translate(-50%, -50%)',
        willChange: 'transform'
      }}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute top-0 left-0"
        style={{ display: 'block' }}
      />
    </div>
  );
}
