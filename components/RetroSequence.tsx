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
  const castleRef = useRef<HTMLDivElement>(null);
  const hillsRef = useRef<HTMLDivElement>(null);
  const terrainRef = useRef<HTMLDivElement>(null);

  // ─── 1. MOUNTING LOGIC (RacingSequence Sync) ───
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

    // ─── 2. CONTINUOUS RETRO MOTIONS ───
    gsap.to(".retro-character", {
      y: -8, duration: 0.25, yoyo: true, repeat: -1, ease: "power1.inOut"
    });

    gsap.to(".retro-coin", {
      y: -10, rotationY: 360, duration: 1.2, yoyo: true, repeat: -1, ease: "sine.inOut"
    });

    // ─── 3. THE SNAPSCROLL SKILL DEPLOYMENT ───
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1, 
        end: "+=400%", 
        snap: {
          snapTo: [0, 0.333, 0.666, 1], // Perfect segment snapping loops
          duration: { min: 0.4, max: 0.8 },
          ease: "power2.inOut" 
        }
      }
    });

    // Precise Parallax ratios based on depth
    tl.to(skyRef.current, { xPercent: -12, ease: "none" }, 0);      
    tl.to(cloudsRef.current, { xPercent: -24, ease: "none" }, 0);   
    tl.to(castleRef.current, { xPercent: -40, ease: "none" }, 0);   
    tl.to(hillsRef.current, { xPercent: -55, ease: "none" }, 0);    
    tl.to(terrainRef.current, { xPercent: -75, ease: "none" }, 0);  

  }, { scope: containerRef, dependencies: [mounted] });

  const premiumEase = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const panels = [0, 1, 2, 3];

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-[100dvh] overflow-hidden bg-[#4CA0FF] flex items-center justify-center" 
    >
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}} />

      <div 
        className="absolute inset-0 w-full h-full flex items-center justify-center"
        style={{
          opacity: mounted ? 1 : 0,
          transition: `opacity 1s ${premiumEase}`,
          willChange: 'opacity'
        }}
      >
        {/* ─── TYPOGRAPHY LAYER ─── */}
        <div className="absolute top-[6vh] left-0 right-0 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 z-50 pointer-events-none">
          <span 
            className="text-[1.2rem] md:text-[2.5rem] text-[#FACC15] uppercase tracking-widest"
            style={{ fontFamily: "'Press Start 2P', cursive", textShadow: "3px 3px 0px #000, -3px -3px 0px #000, 3px -3px 0px #000, -3px 3px 0px #000" }}
          >
            pixels
          </span>
          <span 
            className="text-[1.2rem] md:text-[2.5rem] text-white uppercase tracking-widest"
            style={{ fontFamily: "'Press Start 2P', cursive", textShadow: "3px 3px 0px #000, -3px -3px 0px #000, 3px -3px 0px #000, -3px 3px 0px #000" }}
          >
            never died
          </span>
        </div>

        {/* ─── EXACT LAYER ORDER STACKING ─── */}
        
        {/* Layer 1: sky.png */}
        <div ref={skyRef} className="absolute inset-0 w-[400vw] h-full flex z-0">
          {panels.map(i => (
            <img key={`sky-${i}`} src="/retro/sky.png" className="w-[100vw] h-full object-cover" alt="" />
          ))}
        </div>

        {/* Layer 2: clouds.png */}
        <div ref={cloudsRef} className="absolute inset-0 w-[400vw] h-full flex items-start pt-[18vh] z-10 pointer-events-none">
          {panels.map(i => (
            <img key={`clouds-${i}`} src="/retro/clouds.png" className="w-[100vw] h-[30vh] object-contain object-top" alt="" />
          ))}
        </div>

        {/* Layer 3: castle.png */}
        <div ref={castleRef} className="absolute inset-0 w-[400vw] h-full z-20 pointer-events-none">
          <img src="/retro/castle.png" className="absolute bottom-[24vh] left-[135vw] w-[160px] md:w-[250px] object-contain" alt="Castle" />
        </div>

        {/* Layer 4: hills.png */}
        <div ref={hillsRef} className="absolute bottom-[16vh] w-[400vw] h-[35vh] flex z-30 pointer-events-none">
          {panels.map(i => (
            <img key={`hills-${i}`} src="/retro/hills.png" className="w-[100vw] h-full object-cover" alt="" />
          ))}
        </div>

        {/* Layer 5: terrain.png + Layer 7: coins */}
        <div ref={terrainRef} className="absolute bottom-0 w-[400vw] h-full z-40 pointer-events-none">
          
          {/* Ground Platform */}
          <div className="absolute bottom-0 w-full flex h-[18vh]">
            {panels.map(i => (
              <img key={`terrain-${i}`} src="/retro/terrain.png" className="w-[100vw] h-full object-cover" alt="" />
            ))}
          </div>

          {/* Multiple Multi-Row Coin Positions (Perfect Platformer Layout) */}
          {/* Section 1 Jumps */}
          <div className="retro-coin absolute bottom-[32vh] left-[45vw] w-8 h-8 md:w-10 md:h-10"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="" /></div>
          <div className="retro-coin absolute bottom-[42vh] left-[52vw] w-8 h-8 md:w-10 md:h-10"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="" /></div>
          <div className="retro-coin absolute bottom-[32vh] left-[59vw] w-8 h-8 md:w-10 md:h-10"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="" /></div>

          {/* Section 2 Castle Ascent */}
          <div className="retro-coin absolute bottom-[48vh] left-[125vw] w-8 h-8 md:w-10 md:h-10"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="" /></div>
          <div className="retro-coin absolute bottom-[54vh] left-[135vw] w-8 h-8 md:w-10 md:h-10"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="" /></div>
          <div className="retro-coin absolute bottom-[48vh] left-[145vw] w-8 h-8 md:w-10 md:h-10"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="" /></div>

          {/* Section 3 Straight Run */}
          <div className="retro-coin absolute bottom-[28vh] left-[230vw] w-8 h-8 md:w-10 md:h-10"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="" /></div>
          <div className="retro-coin absolute bottom-[28vh] left-[240vw] w-8 h-8 md:w-10 md:h-10"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="" /></div>
          <div className="retro-coin absolute bottom-[28vh] left-[250vw] w-8 h-8 md:w-10 md:h-10"><img src="/retro/coin.png" className="w-full h-full object-contain" alt="" /></div>
        </div>

        {/* Layer 6: character.png (Perfectly balanced bounding container) */}
        <div className="absolute bottom-[14vh] left-[16vw] z-50 pointer-events-none">
          <div className="retro-character relative w-[65px] h-[85px] md:w-[100px] md:h-[130px]" style={{ filter: "drop-shadow(5px 5px 0px rgba(0,0,0,0.35))" }}>
            <img src="/retro/character.png" alt="Main Character" className="w-full h-full object-contain object-bottom" />
          </div>
        </div>

      </div>
    </section>
  );
}
