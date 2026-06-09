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
    // ── 1. ARCADE MOTIONS ────────────────────────────────────────────────────
    gsap.to(".retro-character", {
      y: -15, duration: 0.3, yoyo: true, repeat: -1, ease: "power1.inOut"
    });

    gsap.to(".retro-coin", {
      y: -15, rotationY: 360, duration: 1.2, yoyo: true, repeat: -1, ease: "sine.inOut"
    });

    // ── 2. RESPONSIVE PARALLAX ───────────────────────────────────────────────
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
        invalidateOnRefresh: true, 
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
      className="relative w-full h-[100dvh] overflow-hidden" 
      style={{ backgroundColor: "#4CA0FF" }} 
    >
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}} />

      {/* ── RESPONSIVE TYPOGRAPHY (Fixed Mobile Stacking) ── */}
      <div className="absolute top-12 md:top-16 left-0 w-full flex justify-center z-50 pointer-events-none px-4">
        <h1 
          className="uppercase leading-tight tracking-widest flex flex-col md:flex-row gap-3 md:gap-6 items-center text-center"
          style={{ 
            fontFamily: "'Press Start 2P', cursive",
            textShadow: "4px 4px 0px #000, -4px -4px 0px #000, 4px -4px 0px #000, -4px 4px 0px #000",
            fontSize: "clamp(1.2rem, 4vw, 3rem)" // Safely scales text down
          }}
        >
          <span style={{ color: "#FACC15" }}>pixels</span>
          <span style={{ color: "#FFFFFF" }}>never died</span>
        </h1>
      </div>

      {/* ── CSS TILING BACKGROUND LAYERS (FOOLPROOF FIX) ── */}
      
      {/* 1. SKY */}
      <div 
        ref={skyRef} 
        className="absolute bottom-0 h-full w-[300vw] z-0"
        style={{ 
          backgroundImage: "url('/retro/sky.png')", 
          backgroundSize: "auto 100%", // Forces image to fit height natively
          backgroundRepeat: "repeat-x", // Tiles it horizontally forever
          backgroundPosition: "bottom left" 
        }} 
      />

      {/* 2. CLOUDS */}
      <div 
        ref={cloudsRef} 
        className="absolute bottom-0 h-full w-[400vw] z-10"
        style={{ 
          backgroundImage: "url('/retro/clouds.png')", 
          backgroundSize: "auto 100%", 
          backgroundRepeat: "repeat-x", 
          backgroundPosition: "bottom left" 
        }} 
      />

      {/* 3. HILLS */}
      <div 
        ref={hillsRef} 
        className="absolute bottom-0 h-full w-[500vw] z-20"
        style={{ 
          backgroundImage: "url('/retro/hills.png')", 
          backgroundSize: "auto 100%", 
          backgroundRepeat: "repeat-x", 
          backgroundPosition: "bottom left" 
        }} 
      />

      {/* 4. CASTLE (Placed once, not tiled) */}
      <div ref={castleRef} className="absolute bottom-[20vh] h-[40vh] w-[500vw] z-30 flex items-end">
        <div className="relative left-[40vw] w-[150px] md:w-[250px] opacity-80">
          <img src="/retro/castle.png" alt="Castle" className="w-full h-auto object-contain object-bottom" />
        </div>
      </div>

      {/* 5. TERRAIN & COINS */}
      <div ref={terrainRef} className="absolute bottom-0 h-full w-[600vw] z-40">
        
        {/* Repeating Floor Background */}
        <div 
          className="absolute bottom-0 w-full h-[22vh] md:h-[20vh]"
          style={{ 
            backgroundImage: "url('/retro/terrain.png')", 
            backgroundSize: "auto 100%", // Fits exactly into the 20vh height
            backgroundRepeat: "repeat-x", 
            backgroundPosition: "top left" 
          }} 
        />

        {/* ── EXACT COIN CLUSTERS ── */}
        {/* Cluster 1 */}
        <div className="retro-coin absolute bottom-[35vh] left-[10%] w-8 h-8 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>
        <div className="retro-coin absolute bottom-[35vh] left-[12%] w-8 h-8 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>
        <div className="retro-coin absolute bottom-[35vh] left-[14%] w-8 h-8 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>

        {/* Cluster 2 */}
        <div className="retro-coin absolute bottom-[60vh] left-[35%] w-8 h-8 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>
        <div className="retro-coin absolute bottom-[60vh] left-[37%] w-8 h-8 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>
        <div className="retro-coin absolute bottom-[60vh] left-[39%] w-8 h-8 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>

        {/* Cluster 3 */}
        <div className="retro-coin absolute bottom-[50vh] left-[65%] w-8 h-8 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>
        <div className="retro-coin absolute bottom-[50vh] left-[67%] w-8 h-8 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>
        <div className="retro-coin absolute bottom-[50vh] left-[69%] w-8 h-8 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>
        <div className="retro-coin absolute bottom-[50vh] left-[71%] w-8 h-8 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>

        {/* Cluster 4 */}
        <div className="retro-coin absolute bottom-[40vh] left-[85%] w-8 h-8 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>
        <div className="retro-coin absolute bottom-[45vh] left-[90%] w-8 h-8 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>
        <div className="retro-coin absolute bottom-[60vh] left-[95%] w-8 h-8 md:w-14 md:h-14"><img src="/retro/coin.png" alt="Coin" className="w-full h-full object-contain" /></div>

      </div>

      {/* ── THE PLAYER CHARACTER ── */}
      <div className="absolute bottom-[20vh] md:bottom-[18vh] left-[10vw] md:left-[15vw] z-50 pointer-events-none">
        <div className="retro-character relative w-[80px] h-[100px] md:w-[130px] md:h-[160px]" style={{ filter: "drop-shadow(8px 8px 0px rgba(0,0,0,0.4))" }}>
          <img src="/retro/character.png" alt="Main Character" className="w-full h-full object-contain object-bottom" />
        </div>
      </div>

    </section>
  );
}
