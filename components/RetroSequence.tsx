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
  const terrainRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // ── 1. ARCADE JUMP & SPIN MOTIONS ────────────────────────────────────────
    gsap.to(".retro-character", {
      y: -15, duration: 0.3, yoyo: true, repeat: -1, ease: "power1.inOut"
    });

    gsap.to(".retro-coin", {
      y: -15, rotationY: 360, duration: 1.2, yoyo: true, repeat: -1, ease: "sine.inOut"
    });

    // ── 2. THE TRUE SNAPSCROLL SKILL & PARALLAX ──────────────────────────────
    // By using xPercent, we don't need complex pixel math. It just works.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1, 
        end: "+=400%", // 4 full screens of scrolling
        snap: {
          snapTo: [0, 0.33, 0.66, 1], // THE SKILL: Locks exactly to 4 precise checkpoints!
          duration: { min: 0.4, max: 0.8 },
          ease: "power2.inOut" 
        }
      }
    });

    // 400vw total width. To reach the end, we slide left by 75% of the container's width.
    tl.to(skyRef.current, { xPercent: -15, ease: "none" }, 0);      // Slowest
    tl.to(cloudsRef.current, { xPercent: -30, ease: "none" }, 0);   // Slow
    tl.to(hillsRef.current, { xPercent: -50, ease: "none" }, 0);    // Medium
    tl.to(terrainRef.current, { xPercent: -75, ease: "none" }, 0);  // Fastest (Ground level)

  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-[100dvh] overflow-hidden bg-[#4CA0FF]" 
    >
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}} />

      {/* ── MISTRAL CODE TYPOGRAPHY ── */}
      <div className="absolute top-12 md:top-16 left-0 w-full flex justify-center z-50 pointer-events-none px-4">
        <h1 
          className="uppercase leading-tight tracking-widest flex flex-col md:flex-row gap-3 md:gap-6 items-center text-center"
          style={{ 
            fontFamily: "'Press Start 2P', cursive",
            textShadow: "4px 4px 0px #000, -4px -4px 0px #000, 4px -4px 0px #000, -4px 4px 0px #000",
            fontSize: "clamp(1.2rem, 4vw, 3rem)" 
          }}
        >
          <span style={{ color: "#FACC15" }}>pixels</span>
          <span style={{ color: "#FFFFFF" }}>never died</span>
        </h1>
      </div>

      {/* ── FOOLPROOF PHYSICAL LAYERS (No more CSS background bugs) ── */}
      
      {/* 1. SKY */}
      <div ref={skyRef} className="absolute inset-0 w-[400vw] h-full flex z-0">
        <img src="/retro/sky.png" className="w-[100vw] h-full object-cover" alt="Sky" />
        <img src="/retro/sky.png" className="w-[100vw] h-full object-cover" alt="Sky" />
        <img src="/retro/sky.png" className="w-[100vw] h-full object-cover" alt="Sky" />
        <img src="/retro/sky.png" className="w-[100vw] h-full object-cover" alt="Sky" />
      </div>

      {/* 2. CLOUDS */}
      <div ref={cloudsRef} className="absolute inset-0 w-[400vw] h-full flex z-10 pointer-events-none">
        <img src="/retro/clouds.png" className="w-[100vw] h-[60vh] object-cover" alt="Clouds" />
        <img src="/retro/clouds.png" className="w-[100vw] h-[60vh] object-cover" alt="Clouds" />
        <img src="/retro/clouds.png" className="w-[100vw] h-[60vh] object-cover" alt="Clouds" />
        <img src="/retro/clouds.png" className="w-[100vw] h-[60vh] object-cover" alt="Clouds" />
      </div>

      {/* 3. HILLS & CASTLE */}
      <div ref={hillsRef} className="absolute bottom-[20vh] w-[400vw] h-[40vh] flex z-20 pointer-events-none">
        <div className="relative w-[100vw] h-full"><img src="/retro/hills.png" className="absolute bottom-0 w-full h-full object-cover" alt="Hills" /></div>
        <div className="relative w-[100vw] h-full">
          <img src="/retro/hills.png" className="absolute bottom-0 w-full h-full object-cover" alt="Hills" />
          {/* Castle perfectly nested in the second hill section */}
          <img src="/retro/castle.png" className="absolute bottom-[10vh] left-[30vw] w-[150px] md:w-[250px] object-contain" alt="Castle" />
        </div>
        <div className="relative w-[100vw] h-full"><img src="/retro/hills.png" className="absolute bottom-0 w-full h-full object-cover" alt="Hills" /></div>
        <div className="relative w-[100vw] h-full"><img src="/retro/hills.png" className="absolute bottom-0 w-full h-full object-cover" alt="Hills" /></div>
      </div>

      {/* 4. TERRAIN & COINS (The Ground Level) */}
      <div ref={terrainRef} className="absolute bottom-0 w-[400vw] h-full z-40 pointer-events-none">
        
        {/* The repeating ground blocks */}
        <div className="absolute bottom-0 w-full h-[25vh] md:h-[20vh] flex">
          <img src="/retro/terrain.png" className="w-[100vw] h-full object-cover" alt="Terrain" />
          <img src="/retro/terrain.png" className="w-[100vw] h-full object-cover" alt="Terrain" />
          <img src="/retro/terrain.png" className="w-[100vw] h-full object-cover" alt="Terrain" />
          <img src="/retro/terrain.png" className="w-[100vw] h-full object-cover" alt="Terrain" />
        </div>

        {/* ── COIN JUMP ARCS (Proper Platformer Layout) ── */}
        
        {/* Arc 1: First Jump */}
        <div className="retro-coin absolute bottom-[35vh] left-[40vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="Coin" /></div>
        <div className="retro-coin absolute bottom-[45vh] left-[50vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="Coin" /></div>
        <div className="retro-coin absolute bottom-[35vh] left-[60vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="Coin" /></div>

        {/* Arc 2: High Jump near Castle */}
        <div className="retro-coin absolute bottom-[55vh] left-[130vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="Coin" /></div>
        <div className="retro-coin absolute bottom-[60vh] left-[140vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="Coin" /></div>
        <div className="retro-coin absolute bottom-[55vh] left-[150vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="Coin" /></div>

        {/* Arc 3: Straight line run */}
        <div className="retro-coin absolute bottom-[30vh] left-[220vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="Coin" /></div>
        <div className="retro-coin absolute bottom-[30vh] left-[230vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="Coin" /></div>
        <div className="retro-coin absolute bottom-[30vh] left-[240vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="Coin" /></div>
        <div className="retro-coin absolute bottom-[30vh] left-[250vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="Coin" /></div>

      </div>

      {/* ── THE PLAYER CHARACTER (Fixed position) ── */}
      <div className="absolute bottom-[22vh] md:bottom-[18vh] left-[15vw] z-50 pointer-events-none">
        <div className="retro-character relative w-[70px] h-[90px] md:w-[110px] md:h-[140px]" style={{ filter: "drop-shadow(6px 6px 0px rgba(0,0,0,0.4))" }}>
          <img src="/retro/character.png" alt="Main Character" className="w-full h-full object-contain object-bottom" />
        </div>
      </div>

    </section>
  );
      }
