import { useEffect, useRef, useCallback } from "react";

const STAR_SIZE = 3;
const STAR_MIN_SCALE = 0.2;
const OVERFLOW_THRESHOLD = 50;

export default function Background({ isDarkMode = true, fullScreen = false }) {
  const colorsRef = useRef({ star: "#fff" });

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const starsRef = useRef([]);
  const scaleRef = useRef(1);
  const widthRef = useRef(0);
  const heightRef = useRef(0);
  const pointerRef = useRef({ x: null, y: null });
  const velocityRef = useRef({ x: 0, y: 0, tx: 0, ty: 0, z: 0.0005 });
  const touchInputRef = useRef(false);

  // Frame boundaries (derived from CSS vars set on the page)
  const frameBoundsRef = useRef({
    top: 0.05,
    bottom: 0.95,
    left: 0.025,
    right: 0.975,
  });

  useEffect(() => {
    colorsRef.current = isDarkMode ? { star: "#fff" } : { star: "#000" };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.backgroundColor = isDarkMode ? "#000" : "#fff";
    }
  }, [isDarkMode]);

  // When fullScreen toggles, expand or restore the frame bounds and regenerate stars
  // (moved below function declarations so helpers are defined)

  const generateStars = useCallback(() => {
    // Calculate visible area for stars
    const bounds = frameBoundsRef.current;
    const visibleWidth = window.innerWidth * (bounds.right - bounds.left);
    const visibleHeight = window.innerHeight * (bounds.bottom - bounds.top);
    const starCount = (visibleWidth + visibleHeight) / 8;

    const stars = [];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: 0,
        y: 0,
        z: STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE)
      });
    }

    starsRef.current = stars;
  }, []);

  const placeStar = (star) => {
    // Place star only within frame bounds
    const bounds = frameBoundsRef.current;
    const leftBound = window.innerWidth * bounds.left * scaleRef.current;
    const rightBound = window.innerWidth * bounds.right * scaleRef.current;
    const topBound = window.innerHeight * bounds.top * scaleRef.current;
    const bottomBound = window.innerHeight * bounds.bottom * scaleRef.current;

    star.x = leftBound + Math.random() * (rightBound - leftBound);
    star.y = topBound + Math.random() * (bottomBound - topBound);
  };

  const recycleStar = (star) => {
    let direction = 'z';
    const vx = Math.abs(velocityRef.current.x);
    const vy = Math.abs(velocityRef.current.y);

    if (vx > 1 || vy > 1) {
      let axis;
      if (vx > vy) {
        axis = Math.random() < vx / (vx + vy) ? 'h' : 'v';
      } else {
        axis = Math.random() < vy / (vx + vy) ? 'v' : 'h';
      }

      if (axis === 'h') {
        direction = velocityRef.current.x > 0 ? 'l' : 'r';
      } else {
        direction = velocityRef.current.y > 0 ? 't' : 'b';
      }
    }

    star.z = STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE);

    // Calculate frame boundaries
    const bounds = frameBoundsRef.current;
    const leftBound = window.innerWidth * bounds.left * scaleRef.current;
    const rightBound = window.innerWidth * bounds.right * scaleRef.current;
    const topBound = window.innerHeight * bounds.top * scaleRef.current;
    const bottomBound = window.innerHeight * bounds.bottom * scaleRef.current;
    const frameWidth = rightBound - leftBound;
    const frameHeight = bottomBound - topBound;

    if (direction === 'z') {
      star.z = 0.1;
      star.x = leftBound + Math.random() * frameWidth;
      star.y = topBound + Math.random() * frameHeight;
    } else if (direction === 'l') {
      star.x = leftBound - OVERFLOW_THRESHOLD;
      star.y = topBound + Math.random() * frameHeight;
    } else if (direction === 'r') {
      star.x = rightBound + OVERFLOW_THRESHOLD;
      star.y = topBound + Math.random() * frameHeight;
    } else if (direction === 't') {
      star.x = leftBound + Math.random() * frameWidth;
      star.y = topBound - OVERFLOW_THRESHOLD;
    } else if (direction === 'b') {
      star.x = leftBound + Math.random() * frameWidth;
      star.y = bottomBound + OVERFLOW_THRESHOLD;
    }
  };

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Calculate actual frame positions from viewport
    const actualFrameX = Math.max(12, Math.min(window.innerWidth * 0.025, 32));
    const actualFrameY = Math.max(16, Math.min(window.innerHeight * 0.05, 48));

    if (!fullScreen) {
      frameBoundsRef.current = {
        top: actualFrameY / window.innerHeight,
        bottom: 1 - actualFrameY / window.innerHeight,
        left: actualFrameX / window.innerWidth,
        right: 1 - actualFrameX / window.innerWidth,
      };
    } else {
      frameBoundsRef.current = { top: 0, bottom: 1, left: 0, right: 1 };
    }

    scaleRef.current = window.devicePixelRatio || 1;
    widthRef.current = window.innerWidth * scaleRef.current;
    heightRef.current = window.innerHeight * scaleRef.current;

    canvas.width = widthRef.current;
    canvas.height = heightRef.current;

    starsRef.current.forEach(placeStar);
  }, [fullScreen]);

  useEffect(() => {
    if (fullScreen) {
      frameBoundsRef.current = { top: 0, bottom: 1, left: 0, right: 1 };
    }
    generateStars();
    resize();
  }, [fullScreen, generateStars, resize]);

  const update = () => {
    velocityRef.current.tx *= 0.96;
    velocityRef.current.ty *= 0.96;

    velocityRef.current.x += (velocityRef.current.tx - velocityRef.current.x) * 0.8;
    velocityRef.current.y += (velocityRef.current.ty - velocityRef.current.y) * 0.8;

    // Calculate frame boundaries
    const bounds = frameBoundsRef.current;
    const leftBound = window.innerWidth * bounds.left * scaleRef.current;
    const rightBound = window.innerWidth * bounds.right * scaleRef.current;
    const topBound = window.innerHeight * bounds.top * scaleRef.current;
    const bottomBound = window.innerHeight * bounds.bottom * scaleRef.current;

    starsRef.current.forEach((star) => {
      star.x += velocityRef.current.x * star.z;
      star.y += velocityRef.current.y * star.z;

      star.x += (star.x - (leftBound + (rightBound - leftBound) / 2)) * velocityRef.current.z * star.z;
      star.y += (star.y - (topBound + (bottomBound - topBound) / 2)) * velocityRef.current.z * star.z;
      star.z += velocityRef.current.z;

      // Recycle only when outside frame boundaries
      if (
        star.x < leftBound - OVERFLOW_THRESHOLD ||
        star.x > rightBound + OVERFLOW_THRESHOLD ||
        star.y < topBound - OVERFLOW_THRESHOLD ||
        star.y > bottomBound + OVERFLOW_THRESHOLD
      ) {
        recycleStar(star);
      }
    });
  };

  const render = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context) return;

    // Clear entire canvas
    context.clearRect(0, 0, widthRef.current, heightRef.current);

    // Calculate frame boundaries
    const bounds = frameBoundsRef.current;
    const leftBound = window.innerWidth * bounds.left * scaleRef.current;
    const rightBound = window.innerWidth * bounds.right * scaleRef.current;
    const topBound = window.innerHeight * bounds.top * scaleRef.current;
    const bottomBound = window.innerHeight * bounds.bottom * scaleRef.current;

    // Optional: Add subtle glow effect
    context.save();
    
    // Create clipping path for the frame
    context.beginPath();
    context.rect(leftBound, topBound, rightBound - leftBound, bottomBound - topBound);
    context.clip();

    // Draw stars only within clipped area
    starsRef.current.forEach((star) => {
      context.beginPath();
      context.lineCap = 'round';
      context.lineWidth = STAR_SIZE * star.z * scaleRef.current;
      context.globalAlpha = 0.5 + 0.5 * Math.random();
      context.strokeStyle = colorsRef.current.star;

      context.beginPath();
      context.moveTo(star.x, star.y);

      let tailX = velocityRef.current.x * 2;
      let tailY = velocityRef.current.y * 2;

      if (Math.abs(tailX) < 0.1) tailX = 0.5;
      if (Math.abs(tailY) < 0.1) tailY = 0.5;

      context.lineTo(star.x + tailX, star.y + tailY);
      context.stroke();
    });

    context.restore();
  };

  const step = () => {
    update();
    render();
    animationRef.current = requestAnimationFrame(step);
  };

  const movePointer = (x, y) => {
    const pointer = pointerRef.current;
    const velocity = velocityRef.current;

    // Track movement regardless of frame boundaries
    if (pointer.x !== null && pointer.y !== null) {
      const ox = x - pointer.x;
      const oy = y - pointer.y;

      velocity.tx = velocity.tx + (ox / 8 * scaleRef.current) * (touchInputRef.current ? 1 : -1);
      velocity.ty = velocity.ty + (oy / 8 * scaleRef.current) * (touchInputRef.current ? 1 : -1);
    }

    pointer.x = x;
    pointer.y = y;
  };

  const onMouseMove = (event) => {
    touchInputRef.current = false;
    movePointer(event.clientX, event.clientY);
  };

  const onTouchMove = (event) => {
    touchInputRef.current = true;
    movePointer(event.touches[0].clientX, event.touches[0].clientY);
    event.preventDefault();
  };

  const onMouseLeave = () => {
    pointerRef.current.x = null;
    pointerRef.current.y = null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    generateStars();
    resize();
    step();

    window.addEventListener('resize', resize);
    // Attach mouse events to document to track cursor everywhere
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onMouseLeave);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onMouseLeave);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, );

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: fullScreen ? 5 : 0,
        pointerEvents: 'none',
        backgroundColor: isDarkMode ? "#000" : "#fff",
      }}
    />
  );
}