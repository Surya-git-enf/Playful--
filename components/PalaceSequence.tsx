'use client';

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useImageSequence } from "../hooks/useImageSequence";

gsap.registerPlugin(ScrollTrigger);

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = canvasW / canvasH;
  let drawW: number, drawH: number, offsetX: number, offsetY: number;

  if (imgRatio > canvasRatio) {
    drawH = canvasH;
    drawW = drawH * imgRatio;
    offsetX = (canvasW - drawW) / 2;
    offsetY = 0;
  } else {
    drawW = canvasW;
    drawH = drawW / imgRatio;
    offsetX = 0;
    offsetY = (canvasH - drawH) / 2;
  }

  ctx.clearRect(0, 0, canvasW, canvasH);
  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
}

export default function PalaceSequence({ isActive }: { isActive: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const frameIndexRef = useRef(0);
  const needsDrawRef = useRef(false);

  const { images, loaded, loadProgress, totalFrames } = useImageSequence();

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
  };

  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imgs = images.current;
    if (!imgs || imgs.length === 0) return;

    const img = imgs[Math.max(0, Math.min(index, imgs.length - 1))];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    drawCover(ctx, img, canvas.width / dpr, canvas.height / dpr);
  };

  const startRAF = () => {
    const loop = () => {
      if (needsDrawRef.current) {
        drawFrame(frameIndexRef.current);
        needsDrawRef.current = false;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (!loaded) return;

    setupCanvas();
    frameIndexRef.current = 0;
    drawFrame(0);
    startRAF();

    const section = sectionRef.current!;

    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=400%",
      pin: true,
      pinSpacing: true,
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;

        const frameIdx = Math.floor(progress * (totalFrames - 1));
        if (frameIdx !== frameIndexRef.current) {
          frameIndexRef.current = frameIdx;
          needsDrawRef.current = true;
        }

        // Calculate text animation progress within the 100-120 frame range
        const frameStart = 100;
        const frameEnd = 120;
        const totalFramesInRange = frameEnd - frameStart; // 20 frames

        let textProgress = 0;
        if (frameIdx >= frameStart && frameIdx <= frameEnd) {
          // Map frame 100-120 to text progress 0-1
          textProgress = (frameIdx - frameStart) / totalFramesInRange;
        } else if (frameIdx < frameStart) {
          textProgress = 0; // Before animation range
        } else {
          textProgress = 1; // After animation range
        }

        // Apply animation to the headline
        const headline = document.getElementById("palace-headline");
        if (headline) {
          // Fade in and slide up
          headline.style.opacity = String(textProgress);
          headline.style.transform = `translateY(${(1 - textProgress) * 20}px)`;
        }
      },
    });

    const handleResize = () => {
      setupCanvas();
      drawFrame(frameIndexRef.current);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  return (
    <div
      ref={sectionRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "#020202",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, display: "block" }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <h2
          id="palace-headline"
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(1.6rem, 4vw, 3rem)",
            letterSpacing: "0.02em",
            color: "#FFFFFF",
            marginBottom: "1.5rem",
            lineHeight: 1.2,
          }}
        >
          Step Inside the Kingdom
        </h2>
      </div>
    </div>
  );
}