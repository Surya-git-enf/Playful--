"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function RetroSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const cloudsRef = useRef<HTMLDivElement>(null);
  const hillsRef = useRef<HTMLDivElement>(null);
  const castleRef = useRef<HTMLDivElement>(null);
  const terrainRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // ── 1. CONTINUOUS ARCADE MOTIONS ─────────────────────────────────────────
    
    // Character walking/bobbing animation
    gsap.to(".retro-character", {
      y: -15, 
      duration: 0.3,
      yoyo: true, 
      repeat: -1, 
      ease: "power1.inOut"
    });

    // Coins floating and spinning in 3D
    gsap.to(".retro-coin", {
      y: -20,
      rotationY: 360,
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    // ── 2. THE MASTER PARALLAX & SNAP SCROLL ─────────────────────────────────
    
    // We calculate the maximum scroll distance based on the terrain width
    const getScrollAmount = (el: HTMLDivElement | null) => {
      if (!el) return 0;
      return -(el.scrollWidth - window.innerWidth);
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1, // Butter smooth drag
        end: "+=400%", // 4 full scrolls for the whole level
        snap: {
          snapTo: 1 / 3, // SKILL DEPLOYED: Snaps to exactly 4 checkpoints (0%, 33%, 66%, 100%)
          duration: { min: 0.4, max: 0.8 },
          ease: "power2.inOut" 
        }
      }
    });

    // We animate each layer differently to create a massive 3D Parallax effect!
    
    // Sky moves very slow (150vw wide)
    tl.to(skyRef.current, { x: () => getScrollAmount(skyRef.current), ease: "none" }, 0);
    
    // Clouds move a bit faster (200vw wide)
    tl.to(cloudsRef.current, { x: () => getScrollAmount(cloudsRef.current), ease: "none" }, 0);
    
    // Hills and Castle move medium speed (250vw wide)
    tl.to(hillsRef.current, { x: () => getScrollAmount(hillsRef.current), ease: "none" }, 0);
    tl.to(castleRef.current, { x: () => getScrollAmount(castleRef.current), ease: "none" }, 0);
    
    // Terrain moves the fastest, creating the illusion of the character running (300vw wide)
    tl.to(terrainRef.current, { x: () => getScrollAmount(terrainRef.current), ease: "none" }, 0);

  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-screen overflow-hidden bg-[#87CEEB]" // Fallback sky blue
    >
      {/* ── SECURELY LOAD PIXEL FONT ── */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}} />

      {/* ── TYPOGRAPHY ── */}
      <div className="absolute top-12 left-0 w-full text-center z-50 pointer-events-none">
        <h1 
          className="text-white text-3xl md:text-5xl uppercase leading-snug tracking-widest"
          style={{ 
            fontFamily: "'Press Start 2P', cursive",
            textShadow: "4px 4px 0px #000, -4px -4px 0px #000, 4px -4px 0px #000, -4px 4px 0px #000" // Hard 8-bit pixel border
          }}
        >
          pixels never died
        </h1>
      </div>

      {/* ── PARALLAX BACKGROUND LAYERS ── */}
      
      {/* 1. SKY (Slowest - 150vw wide) */}
      <div ref={skyRef} className="absolute bottom-0 h-full w-[150vw] z-0">
        <Image src="/retro/sky.png" alt="Sky" fill className="object-cover object-bottom" priority />
      </div>

      {/* 2. CLOUDS (Slow - 200vw wide) */}
      <div ref={cloudsRef} className="absolute bottom-0 h-full w-[200vw] z-10">
        <Image src="/retro/clouds.png" alt="Clouds" fill className="object-cover object-bottom" priority />
      </div>

      {/* 3. HILLS (Medium - 250vw wide) */}
      <div ref={hillsRef} className="absolute bottom-0 h-full w-[250vw] z-20">
        <Image src="/retro/hills.png" alt="Hills" fill className="object-cover object-bottom" />
      </div>

      {/* 4. CASTLE (Medium - 250vw wide) */}
      <div ref={castleRef} className="absolute bottom-0 h-full w-[250vw] z-30">
        <Image src="/retro/castle.png" alt="Castle" fill className="object-cover object-bottom" />
      </div>

      {/* 5. TERRAIN / FLOOR (Fastest - 300vw wide) */}
      {/* This layer holds the coins so they scroll towards the player! */}
      <div ref={terrainRef} className="absolute bottom-0 h-full w-[300vw] z-40 flex items-end">
        <div className="relative w-full h-full">
          <Image src="/retro/terrain.png" alt="Terrain" fill className="object-cover object-bottom" />
          
          {/* Collectible Coins placed along the terrain track */}
          <div className="retro-coin absolute bottom-[25vh] left-[50vw] w-12 h-12 md:w-16 md:h-16 z-50">
            <Image src="/retro/coin.png" alt="Coin" fill className="object-contain" />
          </div>
          <div className="retro-coin absolute bottom-[35vh] left-[150vw] w-12 h-12 md:w-16 md:h-16 z-50">
            <Image src="/retro/coin.png" alt="Coin" fill className="object-contain" />
          </div>
          <div className="retro-coin absolute bottom-[25vh] left-[250vw] w-12 h-12 md:w-16 md:h-16 z-50">
            <Image src="/retro/coin.png" alt="Coin" fill className="object-contain" />
          </div>
        </div>
      </div>

      {/* ── THE PLAYER CHARACTER ── */}
      {/* Locked in place on the screen (left side), giving the illusion of running forward as the world moves */}
      <div className="absolute bottom-[18vh] md:bottom-[20vh] left-[15vw] z-50 pointer-events-none">
        <div className="retro-character relative w-[80px] h-[100px] md:w-[120px] md:h-[150px]" style={{ filter: "drop-shadow(10px 10px 0px rgba(0,0,0,0.3))" }}>
          <Image 
            src="/retro/character.png" 
            alt="Main Character" 
            fill 
            className="object-contain object-bottom" 
          />
        </div>
      </div>

    </section>
  );
}
