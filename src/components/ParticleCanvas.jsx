import React, { useEffect, useRef } from 'react';

const ParticleCanvas = ({ theme }) => {
  const canvasRef = useRef(null);
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    let mouse = { x: null, y: null, radius: 180 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.0 + 1.0;
        this.baseSpeedX = (Math.random() - 0.5) * 0.5;
        this.baseSpeedY = (Math.random() - 0.5) * 0.5;
        this.speedX = this.baseSpeedX;
        this.speedY = this.baseSpeedY;
        this.colorType = Math.floor(Math.random() * 3);
        this.orbitRadius = Math.random() * 30 + 10;
      }

      update() {
        if (mouse.x != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;

            const tangentialX = -forceDirectionY;
            const tangentialY = forceDirectionX;

            let radialForce = force * 0.35; // Stronger attraction to pull them closer
            if (distance < this.orbitRadius) {
              radialForce = -0.8 * ((this.orbitRadius - distance) / this.orbitRadius); // Restrictive boundary closer to the mouse
            }

            this.speedX += forceDirectionX * radialForce;
            this.speedY += forceDirectionY * radialForce;

            this.speedX += tangentialX * force * 0.3; // Slightly lower tangential speed for smooth tight orbit
            this.speedY += tangentialY * force * 0.3;
          } else {
            this.speedX += (this.baseSpeedX - this.speedX) * 0.03;
            this.speedY += (this.baseSpeedY - this.speedY) * 0.03;
          }
        } else {
          this.speedX += (this.baseSpeedX - this.speedX) * 0.03;
          this.speedY += (this.baseSpeedY - this.speedY) * 0.03;
        }

        this.speedX *= 0.97;
        this.speedY *= 0.97;

        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) {
          this.speedX *= -1;
          this.baseSpeedX *= -1;
          this.x = Math.max(0, Math.min(this.x, canvas.width));
        }
        if (this.y < 0 || this.y > canvas.height) {
          this.speedY *= -1;
          this.baseSpeedY *= -1;
          this.y = Math.max(0, Math.min(this.y, canvas.height));
        }
      }

      draw() {
        const currentColors = themeRef.current === 'light'
          ? ['#3B82F6', '#000000', '#555555']
          : ['#3B82F6', '#ffffff', '#444444'];

        ctx.fillStyle = currentColors[this.colorType];
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const numParticles = window.innerWidth < 768 ? 160 : 450;
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 90) {
            ctx.beginPath();
            ctx.strokeStyle = themeRef.current === 'light'
              ? `rgba(0, 0, 0, ${0.15 - distance / 600})`
              : `rgba(230, 200, 117, ${0.1 - distance / 900})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full opacity-40 dark:opacity-70 pointer-events-none z-0"
    />
  );
};

export default ParticleCanvas;
