"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

// ── THIS IS THE FIX: Telling TypeScript to expect the isActive prop ──
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
    // ── 1. CONTINUOUS ARCADE MOTIONS ─────────────────────────────────────────
    
    gsap.to(".retro-character", {
      y: -15, 
      duration: 0.3,
      yoyo: true, 
      repeat: -1, 
      ease: "power1.inOut"
    });

    gsap.to(".retro-coin", {
      y: -20,
      rotationY: 360,
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    // ── 2. THE MASTER PARALLAX & SNAP SCROLL ─────────────────────────────────
    
    const getScrollAmount = (el: HTMLDivElement | null) => {
      if (!el) return 0;
      return -(el.scrollWidth - window.innerWidth);
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1, 
        end: "+=400%", 
        snap: {
          snapTo: 1 / 3, 
          duration: { min: 0.4, max: 0.8 },
          ease: "power2.inOut" 
        }
      }
    });

    tl.to(skyRef.current, { x: () => getScrollAmount(skyRef.current), ease: "none" }, 0);
    tl.to(cloudsRef.current, { x: () => getScrollAmount(cloudsRef.current), ease: "none" }, 0);
    tl.to(hillsRef.current, { x: () => getScrollAmount(hillsRef.current), ease: "none" }, 0);
    tl.to(castleRef.current, { x: () => getScrollAmount(castleRef.current), ease: "none" }, 0);
    tl.to(terrainRef.current, { x: () => getScrollAmount(terrainRef.current), ease: "none" }, 0);

  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-screen overflow-hidden bg-[#87CEEB]" 
    >
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}} />

      <div className="absolute top-12 left-0 w-full text-center z-50 pointer-events-none">
        <h1 
          className="text-white text-3xl md:text-5xl uppercase leading-snug tracking-widest"
          style={{ 
            fontFamily: "'Press Start 2P', cursive",
            textShadow: "4px 4px 0px #000, -4px -4px 0px #000, 4px -4px 0px #000, -4px 4px 0px #000" 
          }}
        >
          pixels never died
        </h1>
      </div>

      <div ref={skyRef} className="absolute bottom-0 h-full w-[150vw] z-0">
        <Image src="/retro/sky.png" alt="Sky" fill className="object-cover object-bottom" priority />
      </div>

      <div ref={cloudsRef} className="absolute bottom-0 h-full w-[200vw] z-10">
        <Image src="/retro/clouds.png" alt="Clouds" fill className="object-cover object-bottom" priority />
      </div>

      <div ref={hillsRef} className="absolute bottom-0 h-full w-[250vw] z-20">
        <Image src="/retro/hills.png" alt="Hills" fill className="object-cover object-bottom" />
      </div>

      <div ref={castleRef} className="absolute bottom-0 h-full w-[250vw] z-30">
        <Image src="/retro/castle.png" alt="Castle" fill className="object-cover object-bottom" />
      </div>

      <div ref={terrainRef} className="absolute bottom-0 h-full w-[300vw] z-40 flex items-end">
        <div className="relative w-full h-full">
          <Image src="/retro/terrain.png" alt="Terrain" fill className="object-cover object-bottom" />
          
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

      <div className="absolute bottom-[18vh] md:bottom-[20vh] left-[15vw] z-50 pointer-events-none">
        <div className="retro-character relative w-[80px] h-[100px] md:w-[120px] md:h-[150px]" style={{ filter: "drop-shadow(10px 10px 0px rgba(0,0,0,0.3))" }}>
          <Image src="/retro/character.png" alt="Main Character" fill className="object-contain object-bottom" />
        </div>
      </div>

    </section>
  );
}
