"use client";

import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─────────────────────────────────────────────────────────────────────────────
// ARCHITECTURE EXPLANATION
// ─────────────────────────────────────────────────────────────────────────────
// HeroCanvas owns window-level wheel/touch events. When scene===1 (Retro),
// it intercepts ALL scroll events and snaps to scene 2 immediately — our
// internal listeners never fire.
//
// FIX: RetroSequence exposes a ref handle with two methods:
//   handle.onScroll(deltaY) → called BY HeroCanvas instead of snapTo()
//   handle.isAtEdge(dir)    → HeroCanvas checks this BEFORE snapping
//
// If Retro is at panel 0 and user scrolls UP → HeroCanvas snaps to scene 0 ✓
// If Retro is at panel 3 and user scrolls DOWN → HeroCanvas snaps to scene 2 ✓
// Otherwise → Retro handles the scroll internally ✓
//
// NO ScrollTrigger. NO pin. Zero interaction with window.scroll.
// ─────────────────────────────────────────────────────────────────────────────

export interface RetroHandle {
  /** Returns true if this scroll would leave the Retro world (caller should snap) */
  isAtEdge: (direction: "up" | "down") => boolean;
  /** Feed a scroll delta into the Retro world. Returns true if consumed. */
  onScroll: (deltaY: number) => boolean;
  /** Reset to panel 0 (called when world becomes inactive) */
  reset: () => void;
}

interface RetroProps {
  isActive?: boolean;
}

const TOTAL_PANELS = 4;

const RetroSequence = forwardRef<RetroHandle, RetroProps>(function RetroSequence(
  { isActive },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const skyRef       = useRef<HTMLDivElement>(null);
  const cloudsRef    = useRef<HTMLDivElement>(null);
  const hillsRef     = useRef<HTMLDivElement>(null);
  const castleRef    = useRef<HTMLDivElement>(null);
  const terrainRef   = useRef<HTMLDivElement>(null);

  const currentPanel = useRef(0);
  const isTransiting = useRef(false);
  const tlRef        = useRef<gsap.core.Timeline | null>(null);
  const touchStartY  = useRef(0);

  // ── PARALLAX TIMELINE ──────────────────────────────────────────────────
  useGSAP(() => {
    // Character idle bob
    gsap.to(".retro-character", {
      y: -10, duration: 0.4, yoyo: true, repeat: -1, ease: "power1.inOut",
    });

    // Coin scaleX flip (NOT rotationY — PNGs vanish at 90° on Y axis)
    gsap.to(".retro-coin", {
      scaleX: 0.08, duration: 0.45, yoyo: true, repeat: -1, ease: "power1.inOut",
      stagger: { each: 0.12, from: "start" },
    });
    gsap.to(".retro-coin", {
      y: -7, duration: 0.55, yoyo: true, repeat: -1, ease: "sine.inOut",
      stagger: { each: 0.09, from: "center" },
    });

    // Parallax timeline — PAUSED, driven manually by goToPanel()
    //
    // Math: world is 400vw wide. To reveal 3 more viewports worth of content:
    //   Sky     (0.20× speed): 300vw * 0.20 / 400vw = -15%
    //   Clouds  (0.35× speed): 300vw * 0.35 / 400vw = -26.25%
    //   Hills   (0.55× speed): 300vw * 0.55 / 400vw = -41.25%
    //   Terrain (1.00× speed): 300vw * 1.00 / 400vw = -75%
    const tl = gsap.timeline({ paused: true });
    tl.to(skyRef.current,     { xPercent: -15,    ease: "none" }, 0);
    tl.to(cloudsRef.current,  { xPercent: -26.25, ease: "none" }, 0);
    tl.to(hillsRef.current,   { xPercent: -41.25, ease: "none" }, 0);
    tl.to(castleRef.current,  { xPercent: -41.25, ease: "none" }, 0);
    tl.to(terrainRef.current, { xPercent: -75,    ease: "none" }, 0);
    tlRef.current = tl;
  }, { scope: containerRef });

  // ── INTERNAL NAV ───────────────────────────────────────────────────────
  const goToPanel = useCallback((index: number) => {
    if (isTransiting.current) return false;
    const target = Math.max(0, Math.min(TOTAL_PANELS - 1, index));
    if (target === currentPanel.current) return false;

    isTransiting.current = true;
    currentPanel.current = target;

    gsap.to(tlRef.current, {
      progress: target / (TOTAL_PANELS - 1),
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => { isTransiting.current = false; },
    });
    return true;
  }, []);

  // ── EXPOSED HANDLE (called by HeroCanvas) ──────────────────────────────
  useImperativeHandle(ref, () => ({
    isAtEdge: (direction: "up" | "down") => {
      if (direction === "up")   return currentPanel.current === 0;
      if (direction === "down") return currentPanel.current === TOTAL_PANELS - 1;
      return false;
    },
    onScroll: (deltaY: number) => {
      if (Math.abs(deltaY) < 15) return false;
      const dir = deltaY > 0 ? 1 : -1;
      return goToPanel(currentPanel.current + dir);
    },
    reset: () => {
      currentPanel.current = 0;
      isTransiting.current = false;
      if (tlRef.current) {
        gsap.to(tlRef.current, { progress: 0, duration: 0.35, ease: "power2.inOut" });
      }
    },
  }), [goToPanel]);

  // ── RESET ON DEACTIVATE ────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive) {
      currentPanel.current = 0;
      isTransiting.current = false;
      if (tlRef.current) {
        gsap.to(tlRef.current, { progress: 0, duration: 0.35, ease: "power2.inOut" });
      }
    }
  }, [isActive]);

  // ── TOUCH HANDLER (mobile — HeroCanvas handles desktop wheel) ──────────
  useEffect(() => {
    if (!isActive) return;
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
    const onTouchEnd   = (e: TouchEvent) => {
      const delta = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(delta) < 45) return;
      // HeroCanvas also listens to touchend — we stopPropagation so it
      // doesn't also snap to next scene
      e.stopPropagation();
      goToPanel(currentPanel.current + (delta > 0 ? 1 : -1));
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend",   onTouchEnd,   { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend",   onTouchEnd);
    };
  }, [isActive, goToPanel]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[100dvh] overflow-hidden bg-[#4CA0FF]"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .retro-layer img, .retro-character img, .retro-coin img {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
        .retro-layer { will-change: transform; }
      `}} />

      {/* TITLE */}
      <div className="absolute top-12 md:top-16 left-0 w-full flex justify-center z-50 pointer-events-none px-4">
        <h1
          className="uppercase leading-tight tracking-widest flex flex-col md:flex-row gap-3 md:gap-6 items-center text-center"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            textShadow: "4px 4px 0px #000,-4px -4px 0px #000,4px -4px 0px #000,-4px 4px 0px #000",
            fontSize: "clamp(1rem,3.5vw,2.8rem)",
          }}
        >
          <span style={{ color: "#FACC15" }}>pixels</span>
          <span style={{ color: "#FFFFFF" }}>never died</span>
        </h1>
      </div>

      {/* PANEL DOTS */}
      <div className="absolute bottom-6 left-0 w-full flex justify-center gap-3 z-50">
        {Array.from({ length: TOTAL_PANELS }).map((_, i) => (
          <button
            key={i}
            onClick={() => goToPanel(i)}
            className="w-3 h-3 rounded-full border-2 border-white transition-all"
            style={{
              background: i === currentPanel.current ? "#FACC15" : "transparent",
              boxShadow: "2px 2px 0px #000",
            }}
            aria-label={`Panel ${i + 1}`}
          />
        ))}
      </div>

      {/* LAYER 1 — SKY (z-0, 0.20×) */}
      <div ref={skyRef} className="retro-layer absolute inset-0 w-[400vw] h-full flex z-0">
        {[0,1,2,3].map(i => (
          <img key={i} src="/retro/sky.png"
            className="w-[100vw] h-full object-cover flex-shrink-0" alt="" aria-hidden="true" />
        ))}
      </div>

      {/* LAYER 2 — CLOUDS (z-10, 0.35×) */}
      <div ref={cloudsRef} className="retro-layer absolute top-0 w-[400vw] h-[55vh] flex z-10 pointer-events-none">
        {[0,1,2,3].map(i => (
          <img key={i} src="/retro/clouds.png"
            className="w-[100vw] h-full object-cover object-bottom flex-shrink-0" alt="" aria-hidden="true" />
        ))}
      </div>

      {/* LAYER 3 — HILLS (z-20, 0.55×) */}
      <div ref={hillsRef} className="retro-layer absolute bottom-[18vh] w-[400vw] h-[45vh] flex z-20 pointer-events-none">
        {[0,1,2,3].map(i => (
          <div key={i} className="relative w-[100vw] h-full flex-shrink-0">
            <img src="/retro/hills.png"
              className="absolute bottom-0 w-full h-full object-cover object-bottom" alt="" aria-hidden="true" />
          </div>
        ))}
      </div>

      {/* LAYER 4 — CASTLE (z-25, 0.55× — own layer so terrain doesn't bury it) */}
      <div ref={castleRef} className="retro-layer absolute w-[400vw] h-full z-[25] pointer-events-none" style={{ bottom: 0 }}>
        <img src="/retro/castle.png" className="absolute object-contain"
          style={{ bottom: "calc(18vh + 14%)", left: "130vw", width: "clamp(100px,14vw,260px)" }}
          alt="Castle" />
      </div>

      {/* LAYER 5 — TERRAIN + COINS (z-40, 1.00×) */}
      <div ref={terrainRef} className="retro-layer absolute bottom-0 w-[400vw] h-full z-40 pointer-events-none">
        {/* Ground */}
        <div className="absolute bottom-0 w-full h-[18vh] flex">
          {[0,1,2,3].map(i => (
            <img key={i} src="/retro/terrain.png"
              className="w-[100vw] h-full object-cover flex-shrink-0" alt="" aria-hidden="true" />
          ))}
        </div>
        {/* Panel 0 coins */}
        <Coin b="34vh" l="20vw" /><Coin b="42vh" l="28vw" /><Coin b="34vh" l="36vw" />
        <Coin b="28vh" l="55vw" /><Coin b="28vh" l="65vw" /><Coin b="28vh" l="75vw" />
        {/* Panel 1 coins — high arc near castle */}
        <Coin b="50vh" l="115vw" /><Coin b="58vh" l="125vw" /><Coin b="62vh" l="135vw" />
        <Coin b="58vh" l="145vw" /><Coin b="50vh" l="155vw" />
        {/* Panel 2 coins — straight run */}
        <Coin b="30vh" l="210vw" /><Coin b="30vh" l="220vw" /><Coin b="30vh" l="230vw" />
        <Coin b="30vh" l="240vw" /><Coin b="30vh" l="250vw" />
        {/* Panel 3 coins — final arc */}
        <Coin b="38vh" l="315vw" /><Coin b="46vh" l="330vw" /><Coin b="38vh" l="345vw" />
      </div>

      {/* CHARACTER — fixed camera anchor */}
      <div className="absolute z-50 pointer-events-none" style={{ bottom: "18vh", left: "15vw" }}>
        <div className="retro-character"
          style={{
            width: "clamp(55px,6.5vw,115px)", height: "clamp(70px,8.5vw,148px)",
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
});

export default RetroSequence;

function Coin({ b, l }: { b: string; l: string }) {
  return (
    <div className="retro-coin absolute" style={{ bottom: b, left: l }}>
      <img src="/retro/coin.png" className="w-8 h-8 md:w-11 md:h-11 object-contain"
        alt="Coin" style={{ imageRendering: "pixelated" }} />
    </div>
  );
        }
