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
    // ── 1. CONTINUOUS ARCADE MOTIONS ─────────────────────────────────────────
    gsap.to(".retro-character", {
      y: -15, 
      duration: 0.3,
      yoyo: true, 
      repeat: -1, 
      ease: "power1.inOut"
    });

    gsap.to(".retro-coin", {
      y: -15,
      rotationY: 360,
      duration: 1.2,
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
      className="relative w-full h-screen overflow-hidden" 
      style={{ backgroundColor: "#4CA0FF" }} // Hardcoded inline so Vercel never drops it
    >
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}} />

      {/* ── MISTRAL CODE TYPOGRAPHY ── */}
      <div className="absolute top-12 left-0 w-full flex justify-center z-50 pointer-events-none px-4">
        <h1 
          className="text-3xl md:text-5xl uppercase leading-snug tracking-widest flex flex-col md:flex-row gap-4 md:gap-6 text-center"
          style={{ 
            fontFamily: "'Press Start 2P', cursive",
            textShadow: "4px 4px 0px #000, -4px -4px 0px #000, 4px -4px 0px #000, -4px 4px 0px #000" 
          }}
        >
          <span style={{ color: "#FACC15" }}>pixels</span>
          <span style={{ color: "#FFFFFF" }}>never died</span>
        </h1>
      </div>

      {/* ── BACKGROUND LAYERS (Switched to standard <img> for Vercel stability) ── */}
      
      {/* 1. SKY */}
      <div ref={skyRef} className="absolute bottom-0 h-full w-[150vw] z-0">
        <img src="/retro/sky.png" alt="Sky" className="w-full h-full object-cover object-bottom" />
      </div>

      {/* 2. CLOUDS */}
      <div ref={cloudsRef} className="absolute bottom-0 h-full w-[200vw] z-10">
        <img src="/retro/clouds.png" alt="Clouds" className="w-full h-full object-cover object-bottom" />
      </div>

      {/* 3. HILLS */}
      <div ref={hillsRef} className="absolute bottom-0 h-full w-[250vw] z-20">
        <img src="/retro/hills.png" alt="Hills" className="w-full h-full object-cover object-bottom" />
      </div>

      {/* 4. CASTLE */}
      <div ref={castleRef} className="absolute bottom-[20vh] h-[40vh] w-[250vw] z-30">
        <div className="relative w-full h-full">
          <div className="absolute left-[40vw] bottom-0 w-[150px] h-[150px] md:w-[250px] md:h-[250px] opacity-80">
            <img src="/retro/castle.png" alt="Castle" className="w-full h-full object-contain object-bottom" />
          </div>
        </div>
      </div>

      {/* 5. TERRAIN & COINS */}
      <div ref={terrainRef} className="absolute bottom-0 h-full w-[300vw] z-40">
        <div className="relative w-full h-full">
          
          <div className="absolute bottom-0 w-full h-[20vh]">
            <img src="/retro/terrain.png" alt="Terrain" className="w-full h-full object-cover object-bottom" />
          </div>

          {/* Cluster 1 */}
          <div className="retro-coin absolute bottom-[35vh] left-[20vw] w-10 h-10 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>
          <div className="retro-coin absolute bottom-[35vh] left-[25vw] w-10 h-10 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>
          <div className="retro-coin absolute bottom-[35vh] left-[30vw] w-10 h-10 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>

          {/* Cluster 2 */}
          <div className="retro-coin absolute bottom-[65vh] left-[45vw] w-10 h-10 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>
          <div className="retro-coin absolute bottom-[65vh] left-[50vw] w-10 h-10 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>
          <div className="retro-coin absolute bottom-[65vh] left-[55vw] w-10 h-10 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>

          {/* Cluster 3 */}
          <div className="retro-coin absolute bottom-[55vh] left-[110vw] w-10 h-10 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>
          <div className="retro-coin absolute bottom-[55vh] left-[115vw] w-10 h-10 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>
          <div className="retro-coin absolute bottom-[55vh] left-[120vw] w-10 h-10 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>
          <div className="retro-coin absolute bottom-[55vh] left-[125vw] w-10 h-10 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>

          {/* Cluster 4 */}
          <div className="retro-coin absolute bottom-[40vh] left-[180vw] w-10 h-10 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>
          <div className="retro-coin absolute bottom-[45vh] left-[220vw] w-10 h-10 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>
          <div className="retro-coin absolute bottom-[60vh] left-[260vw] w-10 h-10 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>
        </div>
      </div>

      {/* ── THE PLAYER CHARACTER ── */}
      <div className="absolute bottom-[18vh] left-[15vw] z-50 pointer-events-none">
        <div className="retro-character relative w-[90px] h-[110px] md:w-[130px] md:h-[160px]" style={{ filter: "drop-shadow(8px 8px 0px rgba(0,0,0,0.4))" }}>
          <img src="/retro/character.png" alt="Main Character" className="w-full h-full object-contain object-bottom" />
        </div>
      </div>

    </section>
  );
}
