"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  isActive?: boolean;
}

export default function RetroSequence({ isActive }: Props) {
  const [mounted, setMounted] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const cloudsRef = useRef<HTMLDivElement>(null);
  const hillsRef = useRef<HTMLDivElement>(null);
  const terrainRef = useRef<HTMLDivElement>(null);

  // ─── 1. MOUNTING LOGIC (Identical to RacingSequence) ───
  useEffect(() => {
    let mountTimer: NodeJS.Timeout;
    if (isActive) {
      mountTimer = setTimeout(() => setMounted(true), 50);
    } else {
      setMounted(false);
    }
    return () => clearTimeout(mountTimer);
  }, [isActive]);

  useGSAP(() => {
    if (!mounted) return;

    // ─── 2. ARCADE MOTIONS ───
    gsap.to(".retro-character", {
      y: -15, duration: 0.3, yoyo: true, repeat: -1, ease: "power1.inOut"
    });

    gsap.to(".retro-coin", {
      y: -15, rotationY: 360, duration: 1.2, yoyo: true, repeat: -1, ease: "sine.inOut"
    });

    // ─── 3. SNAPSCROLL & PARALLAX ───
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1, 
        end: "+=400%", 
        snap: {
          snapTo: [0, 0.333, 0.666, 1], 
          duration: { min: 0.4, max: 0.8 },
          ease: "power2.inOut" 
        }
      }
    });

    tl.to(skyRef.current, { xPercent: -15, ease: "none" }, 0);      
    tl.to(cloudsRef.current, { xPercent: -30, ease: "none" }, 0);   
    tl.to(hillsRef.current, { xPercent: -50, ease: "none" }, 0);    
    tl.to(terrainRef.current, { xPercent: -75, ease: "none" }, 0);  

  }, { scope: containerRef, dependencies: [mounted] });

  const premiumEase = 'cubic-bezier(0.16, 1, 0.3, 1)';

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-[100dvh] overflow-hidden bg-[#4CA0FF]" 
    >
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}} />

      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: mounted ? 1 : 0,
          transition: `opacity 1s ${premiumEase}`,
          willChange: 'opacity'
        }}
      >

        {/* ─── TYPOGRAPHY ─── */}
        <div className="absolute top-[8vh] left-0 right-0 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 z-50 pointer-events-none">
          <span 
            className="text-[1.5rem] md:text-[3rem] text-[#FACC15] uppercase tracking-widest"
            style={{ fontFamily: "'Press Start 2P', cursive", textShadow: "4px 4px 0px #000, -4px -4px 0px #000, 4px -4px 0px #000, -4px 4px 0px #000" }}
          >
            pixels
          </span>
          <span 
            className="text-[1.5rem] md:text-[3rem] text-white uppercase tracking-widest"
            style={{ fontFamily: "'Press Start 2P', cursive", textShadow: "4px 4px 0px #000, -4px -4px 0px #000, 4px -4px 0px #000, -4px 4px 0px #000" }}
          >
            never died
          </span>
        </div>

        {/* ─── LAYER BY LAYER FLEXBOX (Just like RacingSequence) ─── */}
        
        {/* 1. SKY */}
        <div ref={skyRef} className="absolute inset-0 w-[400vw] h-full flex z-0">
          <img src="/retro/sky.png" className="w-[100vw] h-full object-cover" alt="" />
          <img src="/retro/sky.png" className="w-[100vw] h-full object-cover" alt="" />
          <img src="/retro/sky.png" className="w-[100vw] h-full object-cover" alt="" />
          <img src="/retro/sky.png" className="w-[100vw] h-full object-cover" alt="" />
        </div>

        {/* 2. CLOUDS */}
        <div ref={cloudsRef} className="absolute inset-0 w-[400vw] h-full flex items-end pb-[40vh] z-10 pointer-events-none">
          <img src="/retro/clouds.png" className="w-[100vw] h-[60vh] object-contain object-bottom" alt="" />
          <img src="/retro/clouds.png" className="w-[100vw] h-[60vh] object-contain object-bottom" alt="" />
          <img src="/retro/clouds.png" className="w-[100vw] h-[60vh] object-contain object-bottom" alt="" />
          <img src="/retro/clouds.png" className="w-[100vw] h-[60vh] object-contain object-bottom" alt="" />
        </div>

        {/* 3. HILLS & CASTLE */}
        <div ref={hillsRef} className="absolute bottom-[20vh] md:bottom-[15vh] w-[400vw] h-[45vh] flex z-20 pointer-events-none">
          <div className="relative w-[100vw] h-full"><img src="/retro/hills.png" className="absolute bottom-0 w-[100vw] h-full object-cover" alt="" /></div>
          <div className="relative w-[100vw] h-full">
            <img src="/retro/hills.png" className="absolute bottom-0 w-[100vw] h-full object-cover" alt="" />
            <img src="/retro/castle.png" className="absolute bottom-[5vh] left-[30vw] w-[150px] md:w-[250px] object-contain" alt="Castle" />
          </div>
          <div className="relative w-[100vw] h-full"><img src="/retro/hills.png" className="absolute bottom-0 w-[100vw] h-full object-cover" alt="" /></div>
          <div className="relative w-[100vw] h-full"><img src="/retro/hills.png" className="absolute bottom-0 w-[100vw] h-full object-cover" alt="" /></div>
        </div>

        {/* 4. TERRAIN & COINS */}
        <div ref={terrainRef} className="absolute bottom-0 w-[400vw] h-full z-40 pointer-events-none">
          
          <div className="absolute bottom-0 w-full flex h-[25vh] md:h-[20vh]">
            <img src="/retro/terrain.png" className="w-[100vw] h-full object-cover" alt="" />
            <img src="/retro/terrain.png" className="w-[100vw] h-full object-cover" alt="" />
            <img src="/retro/terrain.png" className="w-[100vw] h-full object-cover" alt="" />
            <img src="/retro/terrain.png" className="w-[100vw] h-full object-cover" alt="" />
          </div>

          {/* Arc 1 */}
          <div className="retro-coin absolute bottom-[35vh] left-[40vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="" /></div>
          <div className="retro-coin absolute bottom-[45vh] left-[50vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="" /></div>
          <div className="retro-coin absolute bottom-[35vh] left-[60vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="" /></div>

          {/* Arc 2 */}
          <div className="retro-coin absolute bottom-[55vh] left-[130vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="" /></div>
          <div className="retro-coin absolute bottom-[60vh] left-[140vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="" /></div>
          <div className="retro-coin absolute bottom-[55vh] left-[150vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="" /></div>

          {/* Line 3 */}
          <div className="retro-coin absolute bottom-[30vh] left-[220vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="" /></div>
          <div className="retro-coin absolute bottom-[30vh] left-[230vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="" /></div>
          <div className="retro-coin absolute bottom-[30vh] left-[240vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="" /></div>
        </div>

        {/* ─── PLAYER CHARACTER ─── */}
        <div className="absolute bottom-[22vh] md:bottom-[18vh] left-[10vw] md:left-[15vw] z-50 pointer-events-none">
          <div className="retro-character relative w-[70px] h-[90px] md:w-[110px] md:h-[140px]" style={{ filter: "drop-shadow(6px 6px 0px rgba(0,0,0,0.4))" }}>
            <img src="/retro/character.png" alt="Main Character" className="w-full h-full object-contain object-bottom" />
          </div>
        </div>

      </div>
    </section>
  );
}
