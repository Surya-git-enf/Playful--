"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

interface RetroProps {
  isActive?: boolean;
}

export default function RetroSequence({ isActive }: RetroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const cloudsRef = useRef<HTMLDivElement>(null);
  const hillsRef = useRef<HTMLDivElement>(null);
  const castleRef = useRef<HTMLDivElement>(null);
  const terrainRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // ── 1. CHARACTER IDLE BOUNCE ─────────────────────────────────────────────
    // Simple vertical bob — no rotationY on pixel sprites (they disappear!)
    gsap.to(".retro-character", {
      y: -10,
      duration: 0.4,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut",
    });

    // ── 2. COIN IDLE ANIMATION ───────────────────────────────────────────────
    // BUG FIX: rotationY on flat PNGs causes flicker/disappear.
    // Use scaleX for a convincing 2D coin flip effect instead.
    gsap.to(".retro-coin", {
      scaleX: 0.1,
      duration: 0.5,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut",
      stagger: {
        each: 0.15,
        from: "start",
      },
    });

    // Coin bob (separate tween, offset timing)
    gsap.to(".retro-coin", {
      y: -8,
      duration: 0.6,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      stagger: {
        each: 0.1,
        from: "center",
      },
    });

    // ── 3. PARALLAX SCROLL ───────────────────────────────────────────────────
    //
    // THE MATH (fixed):
    // Container is 400vw wide. We want the world to scroll 3 full viewports
    // worth (from panel 1 to panel 4 = 3 panels of travel = 300vw of world).
    //
    // For a layer with width 400vw, moving it by X pixels shifts all content.
    // xPercent is relative to the ELEMENT's own width (400vw).
    //
    // To move the VISIBLE WINDOW 300vw of world content, each layer needs:
    //   Sky (slowest, 0.2x speed):   300vw * 0.20 = 60vw  → xPercent = -(60/400)*100 = -15%  ✓
    //   Clouds (0.35x speed):        300vw * 0.35 = 105vw → xPercent = -(105/400)*100 = -26.25%
    //   Hills (0.55x speed):         300vw * 0.55 = 165vw → xPercent = -(165/400)*100 = -41.25%
    //   Castle (same as hills):      same as hills
    //   Terrain (1.0x, full speed):  300vw * 1.00 = 300vw → xPercent = -(300/400)*100 = -75%  ✓
    //
    // BUG FIX: Old code had clouds at -30% and hills at -50% which is eyeballed
    // and inconsistent. These corrected values create proper parallax depth.
    //
    // SNAP FIX: 4 panels = snap at 0, 1/3, 2/3, 1 of the scroll progress.
    // end: "+=300%" means 3 scroll-lengths (to go through 4 panels).
    // snap values [0, 0.333, 0.667, 1] are exactly correct for 4 panels.

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1.2,
        end: "+=300%", // BUG FIX: Was "+=400%" — that's 5 panels worth. 4 panels = 3 scroll lengths.
        snap: {
          snapTo: [0, 0.333, 0.667, 1], // BUG FIX: Was [0, 0.33, 0.66, 1] — minor but 0.333/0.667 are exact thirds
          duration: { min: 0.4, max: 0.8 },
          ease: "power2.inOut",
        },
      },
    });

    // All tweens at position 0 so they all animate together during the same scrub
    tl.to(skyRef.current,     { xPercent: -15,     ease: "none" }, 0); // 0.20x parallax
    tl.to(cloudsRef.current,  { xPercent: -26.25,  ease: "none" }, 0); // 0.35x parallax (BUG FIX: was -30)
    tl.to(hillsRef.current,   { xPercent: -41.25,  ease: "none" }, 0); // 0.55x parallax (BUG FIX: was -50)
    tl.to(castleRef.current,  { xPercent: -41.25,  ease: "none" }, 0); // same speed as hills (BUG FIX: castle was inside hills layer, now independent)
    tl.to(terrainRef.current, { xPercent: -75,     ease: "none" }, 0); // 1.0x full speed

  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[100dvh] overflow-hidden bg-[#4CA0FF]"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        /* BUG FIX: Pixel art must use pixelated rendering or it looks blurry */
        .retro-layer img,
        .retro-character img,
        .retro-coin img {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }

        /* BUG FIX: Promote parallax layers to GPU for smooth compositing */
        .retro-layer {
          will-change: transform;
        }
      `}} />

      {/* ── TITLE ──────────────────────────────────────────────────────────── */}
      <div className="absolute top-12 md:top-16 left-0 w-full flex justify-center z-50 pointer-events-none px-4">
        <h1
          className="uppercase leading-tight tracking-widest flex flex-col md:flex-row gap-3 md:gap-6 items-center text-center"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            textShadow: "4px 4px 0px #000, -4px -4px 0px #000, 4px -4px 0px #000, -4px 4px 0px #000",
            fontSize: "clamp(1.2rem, 4vw, 3rem)",
          }}
        >
          <span style={{ color: "#FACC15" }}>pixels</span>
          <span style={{ color: "#FFFFFF" }}>never died</span>
        </h1>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          LAYER STACK (back to front):
          z-0   Sky
          z-10  Clouds
          z-20  Hills
          z-25  Castle  ← BUG FIX: Own layer so it's NOT buried under terrain
          z-30  (open)
          z-40  Terrain + Coins
          z-50  Character (fixed position, doesn't parallax)
      ════════════════════════════════════════════════════════════════════ */}

      {/* ── LAYER 1: SKY (z-0, slowest) ────────────────────────────────────── */}
      <div
        ref={skyRef}
        className="retro-layer absolute inset-0 w-[400vw] h-full flex z-0"
      >
        {[0, 1, 2, 3].map((i) => (
          <img
            key={i}
            src="/retro/sky.png"
            className="w-[100vw] h-full object-cover flex-shrink-0"
            alt=""
            aria-hidden="true"
          />
        ))}
      </div>

      {/* ── LAYER 2: CLOUDS (z-10) ─────────────────────────────────────────── */}
      {/* BUG FIX: object-position="bottom" so clouds sit at the skyline,      */}
      {/* not floating from the top. Height is top 55% of screen.              */}
      <div
        ref={cloudsRef}
        className="retro-layer absolute top-0 w-[400vw] h-[55vh] flex z-10 pointer-events-none"
      >
        {[0, 1, 2, 3].map((i) => (
          <img
            key={i}
            src="/retro/clouds.png"
            className="w-[100vw] h-full object-cover object-bottom flex-shrink-0"
            alt=""
            aria-hidden="true"
          />
        ))}
      </div>

      {/* ── LAYER 3: HILLS (z-20) ──────────────────────────────────────────── */}
      {/* BUG FIX: Hills should sit on top of the ground, anchored to bottom.  */}
      {/* Old: bottom-[20vh] + h-[40vh] = top edge at 40vh from bottom.        */}
      {/* New: bottom-[18vh] (just above terrain) + h-[45vh] for more presence */}
      <div
        ref={hillsRef}
        className="retro-layer absolute bottom-[18vh] w-[400vw] h-[45vh] flex z-20 pointer-events-none"
      >
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="relative w-[100vw] h-full flex-shrink-0">
            <img
              src="/retro/hills.png"
              className="absolute bottom-0 w-full h-full object-cover object-bottom"
              alt=""
              aria-hidden="true"
            />
          </div>
        ))}
      </div>

      {/* ── LAYER 4: CASTLE (z-25, own layer!) ─────────────────────────────── */}
      {/* BUG FIX: Castle was INSIDE the hills div, meaning it moved at hill   */}
      {/* speed but was visually buried under terrain (z-40). Now it's its own */}
      {/* absolutely positioned layer between hills and terrain.               */}
      {/* It moves at hill speed (same xPercent -41.25 in GSAP above).         */}
      {/* Positioned in the second viewport of the 400vw world = left: 130vw   */}
      <div
        ref={castleRef}
        className="retro-layer absolute w-[400vw] h-full z-25 pointer-events-none"
        style={{ bottom: 0 }}
      >
        <img
          src="/retro/castle.png"
          className="absolute object-contain"
          style={{
            bottom: "calc(18vh + 15%)", // sits on top of the hill layer
            left: "130vw",              // visible in the 2nd scroll panel
            width: "clamp(120px, 15vw, 280px)",
          }}
          alt="Castle"
        />
      </div>

      {/* ── LAYER 5: TERRAIN + COINS (z-40, fastest / ground speed) ────────── */}
      {/* BUG FIX: Coin left positions must account for the 400vw container.   */}
      {/* A coin at "left-[40vw]" inside a 400vw div = only 10% from the left  */}
      {/* edge of the world = visible immediately on panel 1. That's correct.  */}
      {/* Coins in panels 2-4 need left values like 140vw, 240vw, 340vw.       */}
      <div
        ref={terrainRef}
        className="retro-layer absolute bottom-0 w-[400vw] h-full z-40 pointer-events-none"
      >

        {/* Ground tiles */}
        <div className="absolute bottom-0 w-full h-[18vh] flex">
          {[0, 1, 2, 3].map((i) => (
            <img
              key={i}
              src="/retro/terrain.png"
              className="w-[100vw] h-full object-cover flex-shrink-0"
              alt=""
              aria-hidden="true"
            />
          ))}
        </div>

        {/* ── COINS: Panel 1 (left: 0–100vw) ─── */}
        {/* Arc 1: low arc across mid-screen */}
        <div className="retro-coin absolute" style={{ bottom: "34vh", left: "20vw" }}>
          <img src="/retro/coin.png" className="w-8 h-8 md:w-11 md:h-11 object-contain" alt="Coin" />
        </div>
        <div className="retro-coin absolute" style={{ bottom: "42vh", left: "28vw" }}>
          <img src="/retro/coin.png" className="w-8 h-8 md:w-11 md:h-11 object-contain" alt="Coin" />
        </div>
        <div className="retro-coin absolute" style={{ bottom: "34vh", left: "36vw" }}>
          <img src="/retro/coin.png" className="w-8 h-8 md:w-11 md:h-11 object-contain" alt="Coin" />
        </div>
        {/* Straight run near end of panel 1 */}
        <div className="retro-coin absolute" style={{ bottom: "28vh", left: "55vw" }}>
          <img src="/retro/coin.png" className="w-8 h-8 md:w-11 md:h-11 object-contain" alt="Coin" />
        </div>
        <div className="retro-coin absolute" style={{ bottom: "28vh", left: "65vw" }}>
          <img src="/retro/coin.png" className="w-8 h-8 md:w-11 md:h-11 object-contain" alt="Coin" />
        </div>
        <div className="retro-coin absolute" style={{ bottom: "28vh", left: "75vw" }}>
          <img src="/retro/coin.png" className="w-8 h-8 md:w-11 md:h-11 object-contain" alt="Coin" />
        </div>

        {/* ── COINS: Panel 2 (left: 100–200vw) — near castle ─── */}
        {/* High arc */}
        <div className="retro-coin absolute" style={{ bottom: "50vh", left: "115vw" }}>
          <img src="/retro/coin.png" className="w-8 h-8 md:w-11 md:h-11 object-contain" alt="Coin" />
        </div>
        <div className="retro-coin absolute" style={{ bottom: "58vh", left: "125vw" }}>
          <img src="/retro/coin.png" className="w-8 h-8 md:w-11 md:h-11 object-contain" alt="Coin" />
        </div>
        <div className="retro-coin absolute" style={{ bottom: "62vh", left: "135vw" }}>
          <img src="/retro/coin.png" className="w-8 h-8 md:w-11 md:h-11 object-contain" alt="Coin" />
        </div>
        <div className="retro-coin absolute" style={{ bottom: "58vh", left: "145vw" }}>
          <img src="/retro/coin.png" className="w-8 h-8 md:w-11 md:h-11 object-contain" alt="Coin" />
        </div>
        <div className="retro-coin absolute" style={{ bottom: "50vh", left: "155vw" }}>
          <img src="/retro/coin.png" className="w-8 h-8 md:w-11 md:h-11 object-contain" alt="Coin" />
        </div>

        {/* ── COINS: Panel 3 (left: 200–300vw) — straight line run ─── */}
        <div className="retro-coin absolute" style={{ bottom: "30vh", left: "210vw" }}>
          <img src="/retro/coin.png" className="w-8 h-8 md:w-11 md:h-11 object-contain" alt="Coin" />
        </div>
        <div className="retro-coin absolute" style={{ bottom: "30vh", left: "220vw" }}>
          <img src="/retro/coin.png" className="w-8 h-8 md:w-11 md:h-11 object-contain" alt="Coin" />
        </div>
        <div className="retro-coin absolute" style={{ bottom: "30vh", left: "230vw" }}>
          <img src="/retro/coin.png" className="w-8 h-8 md:w-11 md:h-11 object-contain" alt="Coin" />
        </div>
        <div className="retro-coin absolute" style={{ bottom: "30vh", left: "240vw" }}>
          <img src="/retro/coin.png" className="w-8 h-8 md:w-11 md:h-11 object-contain" alt="Coin" />
        </div>
        <div className="retro-coin absolute" style={{ bottom: "30vh", left: "250vw" }}>
          <img src="/retro/coin.png" className="w-8 h-8 md:w-11 md:h-11 object-contain" alt="Coin" />
        </div>

        {/* ── COINS: Panel 4 (left: 300–400vw) — final arc ─── */}
        <div className="retro-coin absolute" style={{ bottom: "38vh", left: "315vw" }}>
          <img src="/retro/coin.png" className="w-8 h-8 md:w-11 md:h-11 object-contain" alt="Coin" />
        </div>
        <div className="retro-coin absolute" style={{ bottom: "46vh", left: "330vw" }}>
          <img src="/retro/coin.png" className="w-8 h-8 md:w-11 md:h-11 object-contain" alt="Coin" />
        </div>
        <div className="retro-coin absolute" style={{ bottom: "38vh", left: "345vw" }}>
          <img src="/retro/coin.png" className="w-8 h-8 md:w-11 md:h-11 object-contain" alt="Coin" />
        </div>

      </div>

      {/* ── PLAYER CHARACTER ────────────────────────────────────────────────── */}
      {/* Fixed at left-[15vw], does NOT scroll — it's the "camera anchor".    */}
      {/* bottom aligns with terrain top (18vh ground height).                 */}
      <div
        className="absolute z-50 pointer-events-none"
        style={{ bottom: "18vh", left: "15vw" }}
      >
        <div
          className="retro-character"
          style={{
            width: "clamp(60px, 7vw, 120px)",
            height: "clamp(75px, 9vw, 155px)",
            filter: "drop-shadow(4px 6px 0px rgba(0,0,0,0.45))",
          }}
        >
          <img
            src="/retro/character.png"
            alt="Player character"
            className="w-full h-full object-contain object-bottom"
            style={{ imageRendering: "pixelated" }}
          />
        </div>
      </div>

    </section>
  );
}
