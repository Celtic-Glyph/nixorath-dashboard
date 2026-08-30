"use client";

import { useEffect, useRef } from "react";

interface Flake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wind: number;
  opacity: number;
}

export default function SnowfallCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let flakes: Flake[] = [];
    let frameId = 0;

    function resizeCanvas() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function createSnowflakes() {
      flakes = [];
      const count = Math.floor(window.innerWidth / 12);
      for (let i = 0; i < count; i++) {
        flakes.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          radius: Math.random() * 2.5 + 1,
          speed: Math.random() * 0.8 + 0.3,
          wind: Math.random() * 0.5 - 0.25,
          opacity: Math.random() * 0.5 + 0.4,
        });
      }
    }

    function drawSnow() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const f of flakes) {
        ctx!.beginPath();
        ctx!.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
        ctx!.fill();

        f.y += f.speed;
        f.x += f.wind;

        if (f.y > canvas!.height) {
          f.y = -5;
          f.x = Math.random() * canvas!.width;
        }
        if (f.x > canvas!.width) f.x = 0;
        if (f.x < 0) f.x = canvas!.width;
      }
      frameId = requestAnimationFrame(drawSnow);
    }

    const handleResize = () => {
      resizeCanvas();
      createSnowflakes();
    };

    resizeCanvas();
    createSnowflakes();
    drawSnow();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden />;
}
