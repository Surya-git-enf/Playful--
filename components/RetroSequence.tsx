"use client";

import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─────────────────────────────────────────────────────────────────────────────
// NO ScrollTrigger. NO pin. This component is ALREADY inside a snapped world.
// Using ScrollTrigger + pin inside a snap-scroll parent causes:
//   1. Double-pinning = black gaps / layout breaks
//   2. Wrong scroll distance calculations
//   3. The 3 blue rectangles you saw in the screenshot
//
// ARCHITECTURE: Internal wheel/touch/keyboard listener drives a GSAP
// timeline manually via timeline.progress(). The parent world snap-scroll
// is completely unaware of this internal scrolling.
//
// The world has 4 "panels" of content spread across a 400vw canvas.
// Panel 0 = leftmost (start), Panel 3 = rightmost (end).
// ─────────────────────────────────────────────────────────────────────────────

interface RetroProps {
  isActive?: boolean;
}

const TOTAL_PANELS = 4;

export default function RetroSequence({ isActive }: RetroProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const skyRef        = useRef<HTMLDivElement>(null);
  const cloudsRef     = useRef<HTMLDivElement>(null);
  const hillsRef      = useRef<HTMLDivElement>(null);
  const castleRef     = useRef<HTMLDivElement>(null);
  const terrainRef    = useRef<HTMLDivElement>(null);

  // Track current panel (0-3) and whether a transition is in progress
  const currentPanel  = useRef(0);
  const isTransiting  = useRef(false);
  const tlRef         = useRef<gsap.core.Timeline | null>(null);
  const touchStartY   = useRef(0);

  // ── BUILD THE PARALLAX TIMELINE ─────────────────────────────────────────
  // We build it once, paused at progress 0. Moving to panel N means
  // animating timeline.progress() to N / (TOTAL_PANELS - 1).
  //
  // xPercent math (same correct values as before):
  //   Sky:     300vw * 0.20 / 400vw * 100 = -15%
  //   Clouds:  300vw * 0.35 / 400vw * 100 = -26.25%
  //   Hills:   300vw * 0.55 / 400vw * 100 = -41.25%
  //   Castle:  same as hills              = -41.25%
  //   Terrain: 300vw * 1.00 / 400vw * 100 = -75%

  useGSAP(() => {
    // ── CHARACTER IDLE BOB ───────────────────────────────────────────────
    gsap.to(".retro-character", {
      y: -10,
      duration: 0.4,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut",
    });

    // ── COIN FLIP + BOB ──────────────────────────────────────────────────
    // scaleX coin-flip (NOT rotationY — that makes PNGs invisible at 90°)
    gsap.to(".retro-coin", {
      scaleX: 0.08,
      duration: 0.45,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut",
      stagger: { each: 0.12, from: "start" },
    });
    gsap.to(".retro-coin", {
      y: -7,
      duration: 0.55,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      stagger: { each: 0.09, from: "center" },
    });

    // ── PARALLAX TIMELINE (paused, driven manually) ──────────────────────
    const tl = gsap.timeline({ paused: true });

    tl.to(skyRef.current,     { xPercent: -15,    ease: "none" }, 0);
    tl.to(cloudsRef.current,  { xPercent: -26.25, ease: "none" }, 0);
    tl.to(hillsRef.current,   { xPercent: -41.25, ease: "none" }, 0);
    tl.to(castleRef.current,  { xPercent: -41.25, ease: "none" }, 0);
    tl.to(terrainRef.current, { xPercent: -75,    ease: "none" }, 0);

    tlRef.current = tl;

  }, { scope: containerRef });

  // ── NAVIGATE TO PANEL ────────────────────────────────────────────────────
  const goToPanel = useCallback((index: number) => {
    if (isTransiting.current) return;
    const target = Math.max(0, Math.min(TOTAL_PANELS - 1, index));
    if (target === currentPanel.current) return;

    isTransiting.current = true;
    currentPanel.current = target;

    const progress = target / (TOTAL_PANELS - 1);

    gsap.to(tlRef.current, {
      progress,
      duration: 0.85,
      ease: "power2.inOut",
      onComplete: () => { isTransiting.current = false; },
    });
  }, []);

  // ── INPUT HANDLERS (only active when this world is active) ──────────────
  useEffect(() => {
    if (!isActive) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaY > 30)  goToPanel(currentPanel.current + 1);
      if (e.deltaY < -30) goToPanel(currentPanel.current - 1);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const delta = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(delta) < 40) return;
      e.preventDefault();
      if (delta > 0) goToPanel(currentPanel.current + 1);
      else           goToPanel(currentPanel.current - 1);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown")  goToPanel(currentPanel.current + 1);
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")    goToPanel(currentPanel.current - 1);
    };

    const el = containerRef.current;
    if (!el) return;

    // Use the container itself as the wheel target so it doesn't bubble
    el.addEventListener("wheel",      onWheel,      { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true  });
    el.addEventListener("touchend",   onTouchEnd,   { passive: false });
    window.addEventListener("keydown", onKey);

    return () => {
      el.removeEventListener("wheel",      onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend",   onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [isActive, goToPanel]);

  // Reset to panel 0 when world becomes inactive
  useEffect(() => {
    if (!isActive && tlRef.current) {
      currentPanel.current = 0;
      isTransiting.current = false;
      gsap.to(tlRef.current, { progress: 0, duration: 0.4, ease: "power2.inOut" });
    }
  }, [isActive]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[100dvh] overflow-hidden bg-[#4CA0FF]"
      // tabIndex so it can receive keyboard focus
      tabIndex={isActive ? 0 : -1}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        .retro-layer img,
        .retro-character img,
        .retro-coin img {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
        .retro-layer {
          will-change: transform;
        }
      `}} />

      {/* ── TITLE ── */}
      <div className="absolute top-12 md:top-16 left-0 w-full flex justify-center z-50 pointer-events-none px-4">
        <h1
          className="uppercase leading-tight tracking-widest flex flex-col md:flex-row gap-3 md:gap-6 items-center text-center"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            textShadow: "4px 4px 0px #000, -4px -4px 0px #000, 4px -4px 0px #000, -4px 4px 0px #000",
            fontSize: "clamp(1rem, 3.5vw, 2.8rem)",
          }}
        >
          <span style={{ color: "#FACC15" }}>pixels</span>
          <span style={{ color: "#FFFFFF" }}>never died</span>
        </h1>
      </div>

      {/* ── PANEL DOTS (bottom center) ── */}
      <div className="absolute bottom-6 left-0 w-full flex justify-center gap-3 z-50 pointer-events-none">
        {Array.from({ length: TOTAL_PANELS }).map((_, i) => (
          <button
            key={i}
            onClick={() => goToPanel(i)}
            className="w-3 h-3 rounded-full border-2 border-white pointer-events-auto transition-all"
            style={{
              background: i === currentPanel.current ? "#FACC15" : "transparent",
              boxShadow: "2px 2px 0px #000",
            }}
            aria-label={`Go to panel ${i + 1}`}
          />
        ))}
      </div>

      {/* ════════════ LAYER STACK (back → front) ════════════
          z-0   Sky       (slowest, 0.20×)
          z-10  Clouds    (0.35×)
          z-20  Hills     (0.55×)
          z-25  Castle    (0.55×, own layer so not buried by terrain)
          z-40  Terrain + Coins  (1.00×, full ground speed)
          z-50  Character (fixed, no parallax — camera anchor)
      ════════════════════════════════════════════════════ */}

      {/* LAYER 1 — SKY */}
      <div ref={skyRef} className="retro-layer absolute inset-0 w-[400vw] h-full flex z-0">
        {[0,1,2,3].map(i => (
          <img key={i} src="/retro/sky.png"
            className="w-[100vw] h-full object-cover flex-shrink-0"
            alt="" aria-hidden="true" />
        ))}
      </div>

      {/* LAYER 2 — CLOUDS */}
      <div ref={cloudsRef} className="retro-layer absolute top-0 w-[400vw] h-[55vh] flex z-10 pointer-events-none">
        {[0,1,2,3].map(i => (
          <img key={i} src="/retro/clouds.png"
            className="w-[100vw] h-full object-cover object-bottom flex-shrink-0"
            alt="" aria-hidden="true" />
        ))}
      </div>

      {/* LAYER 3 — HILLS */}
      <div ref={hillsRef} className="retro-layer absolute bottom-[18vh] w-[400vw] h-[45vh] flex z-20 pointer-events-none">
        {[0,1,2,3].map(i => (
          <div key={i} className="relative w-[100vw] h-full flex-shrink-0">
            <img src="/retro/hills.png"
              className="absolute bottom-0 w-full h-full object-cover object-bottom"
              alt="" aria-hidden="true" />
          </div>
        ))}
      </div>

      {/* LAYER 4 — CASTLE (own layer, z-25, hill speed) */}
      <div ref={castleRef} className="retro-layer absolute w-[400vw] h-full z-[25] pointer-events-none" style={{ bottom: 0 }}>
        <img src="/retro/castle.png"
          className="absolute object-contain"
          style={{
            bottom: "calc(18vh + 14%)",
            left: "130vw",
            width: "clamp(100px, 14vw, 260px)",
          }}
          alt="Castle" />
      </div>

      {/* LAYER 5 — TERRAIN + COINS */}
      <div ref={terrainRef} className="retro-layer absolute bottom-0 w-[400vw] h-full z-40 pointer-events-none">

        {/* Ground */}
        <div className="absolute bottom-0 w-full h-[18vh] flex">
          {[0,1,2,3].map(i => (
            <img key={i} src="/retro/terrain.png"
              className="w-[100vw] h-full object-cover flex-shrink-0"
              alt="" aria-hidden="true" />
          ))}
        </div>

        {/* ── PANEL 0 COINS (0–100vw) — low arc then straight run ── */}
        <Coin b="34vh" l="20vw"  />
        <Coin b="42vh" l="28vw"  />
        <Coin b="34vh" l="36vw"  />
        <Coin b="28vh" l="55vw"  />
        <Coin b="28vh" l="65vw"  />
        <Coin b="28vh" l="75vw"  />

        {/* ── PANEL 1 COINS (100–200vw) — high arc near castle ── */}
        <Coin b="50vh" l="115vw" />
        <Coin b="58vh" l="125vw" />
        <Coin b="62vh" l="135vw" />
        <Coin b="58vh" l="145vw" />
        <Coin b="50vh" l="155vw" />

        {/* ── PANEL 2 COINS (200–300vw) — long straight run ── */}
        <Coin b="30vh" l="210vw" />
        <Coin b="30vh" l="220vw" />
        <Coin b="30vh" l="230vw" />
        <Coin b="30vh" l="240vw" />
        <Coin b="30vh" l="250vw" />

        {/* ── PANEL 3 COINS (300–400vw) — final arc ── */}
        <Coin b="38vh" l="315vw" />
        <Coin b="46vh" l="330vw" />
        <Coin b="38vh" l="345vw" />

      </div>

      {/* CHARACTER — fixed camera anchor, never moves */}
      <div className="absolute z-50 pointer-events-none" style={{ bottom: "18vh", left: "15vw" }}>
        <div
          className="retro-character"
          style={{
            width: "clamp(55px, 6.5vw, 115px)",
            height: "clamp(70px, 8.5vw, 148px)",
            filter: "drop-shadow(4px 6px 0px rgba(0,0,0,0.45))",
          }}
        >
          <img src="/retro/character.png" alt="Player"
            className="w-full h-full object-contain object-bottom"
            style={{ imageRendering: "pixelated" }} />
        </div>
      </div>

    </section>
  );
}

// ── TINY COIN HELPER ─────────────────────────────────────────────────────────
function Coin({ b, l }: { b: string; l: string }) {
  return (
    <div className="retro-coin absolute" style={{ bottom: b, left: l }}>
      <img src="/retro/coin.png"
        className="w-8 h-8 md:w-11 md:h-11 object-contain"
        alt="Coin"
        style={{ imageRendering: "pixelated" }} />
    </div>
  );
}
