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

  // ─── 1. MOUNTING LOGIC (From your RacingSequence reference) ───
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

    // ─── 3. THE TRUE SNAPSCROLL & PARALLAX ───
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1, 
        end: "+=400%", // 4 full screens of scroll track
        snap: {
          snapTo: [0, 0.333, 0.666, 1], // THE SKILL: 4 perfect locks
          duration: { min: 0.4, max: 0.8 },
          ease: "power2.inOut" 
        }
      }
    });

    // Moving xPercent is mathematically perfect. 
    // -75% of a 400vw track means the final screen stops perfectly on the last 100vw.
    tl.to(skyRef.current, { xPercent: -15, ease: "none" }, 0);      
    tl.to(cloudsRef.current, { xPercent: -30, ease: "none" }, 0);   
    tl.to(hillsRef.current, { xPercent: -50, ease: "none" }, 0);    
    tl.to(terrainRef.current, { xPercent: -75, ease: "none" }, 0);  

  }, { scope: containerRef, dependencies: [mounted] });

  // Array to map 4 physical panels so flexbox wrapping cannot break the layout
  const panels = [0, 1, 2, 3];
  const premiumEase = 'cubic-bezier(0.16, 1, 0.3, 1)';

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-[100dvh] overflow-hidden bg-[#4CA0FF]" 
    >
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}} />

      {/* ─── ENTIRE SCENE FADE IN (Like your reference) ─── */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: mounted ? 1 : 0,
          transition: `opacity 1s ${premiumEase}`,
          willChange: 'opacity'
        }}
      >

        {/* ─── TYPOGRAPHY (Forced Mobile Stacking) ─── */}
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

        {/* ─── BULLETPROOF ABSOLUTE LAYERS ─── */}
        {/* We physically pin each image to exactly 0vw, 100vw, 200vw, 300vw. It cannot wrap. */}
        {/* scale-[1.02] instantly deletes any baked-in black borders! */}
        
        {/* 1. SKY */}
        <div ref={skyRef} className="absolute inset-0 w-[400vw] h-full z-0">
          {panels.map(i => (
            <img key={`sky-${i}`} src="/retro/sky.png" className="absolute top-0 h-full w-[100vw] object-cover scale-[1.02]" style={{ left: `${i * 100}vw` }} alt="" />
          ))}
        </div>

        {/* 2. CLOUDS */}
        <div ref={cloudsRef} className="absolute inset-0 w-[400vw] h-full z-10 pointer-events-none">
          {panels.map(i => (
            <img key={`clouds-${i}`} src="/retro/clouds.png" className="absolute bottom-[10vh] h-[60vh] w-[100vw] object-cover scale-[1.02]" style={{ left: `${i * 100}vw` }} alt="" />
          ))}
        </div>

        {/* 3. HILLS & CASTLE */}
        <div ref={hillsRef} className="absolute bottom-[20vh] md:bottom-[15vh] w-[400vw] h-[45vh] z-20 pointer-events-none">
          {panels.map(i => (
            <img key={`hills-${i}`} src="/retro/hills.png" className="absolute bottom-0 h-full w-[100vw] object-cover scale-[1.02]" style={{ left: `${i * 100}vw` }} alt="" />
          ))}
          {/* Castle injected into the second panel track */}
          <img src="/retro/castle.png" className="absolute bottom-[5vh] left-[130vw] w-[150px] md:w-[250px] object-contain" alt="Castle" />
        </div>

        {/* 4. TERRAIN & COINS */}
        <div ref={terrainRef} className="absolute bottom-0 w-[400vw] h-full z-40 pointer-events-none">
          
          {panels.map(i => (
            <img key={`terrain-${i}`} src="/retro/terrain.png" className="absolute bottom-0 h-[25vh] md:h-[20vh] w-[100vw] object-cover scale-[1.02]" style={{ left: `${i * 100}vw` }} alt="" />
          ))}

          {/* ── THE PLATFORMER COIN ARCS ── */}
          {/* Arc 1 */}
          <div className="retro-coin absolute bottom-[35vh] left-[40vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain scale-[1.2]" alt="" /></div>
          <div className="retro-coin absolute bottom-[45vh] left-[50vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain scale-[1.2]" alt="" /></div>
          <div className="retro-coin absolute bottom-[35vh] left-[60vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain scale-[1.2]" alt="" /></div>

          {/* Arc 2 */}
          <div className="retro-coin absolute bottom-[55vh] left-[130vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain scale-[1.2]" alt="" /></div>
          <div className="retro-coin absolute bottom-[60vh] left-[140vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain scale-[1.2]" alt="" /></div>
          <div className="retro-coin absolute bottom-[55vh] left-[150vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain scale-[1.2]" alt="" /></div>

          {/* Line 3 */}
          <div className="retro-coin absolute bottom-[30vh] left-[220vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain scale-[1.2]" alt="" /></div>
          <div className="retro-coin absolute bottom-[30vh] left-[230vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain scale-[1.2]" alt="" /></div>
          <div className="retro-coin absolute bottom-[30vh] left-[240vw] w-8 h-8 md:w-12 md:h-12"><img src="/retro/coin.png" className="w-full h-full object-contain scale-[1.2]" alt="" /></div>
        </div>

        {/* ── PLAYER CHARACTER ── */}
        <div className="absolute bottom-[22vh] md:bottom-[18vh] left-[10vw] md:left-[15vw] z-50 pointer-events-none">
          <div className="retro-character relative w-[70px] h-[90px] md:w-[110px] md:h-[140px]" style={{ filter: "drop-shadow(6px 6px 0px rgba(0,0,0,0.4))" }}>
            <img src="/retro/character.png" alt="Main Character" className="w-full h-full object-contain object-bottom" />
          </div>
        </div>

      </div>
    </section>
  );
}
