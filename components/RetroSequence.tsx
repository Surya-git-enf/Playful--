"use client";

import React, { useEffect, useMemo, useState } from "react";

interface Props {
  isActive: boolean;
}

type Viewport = {
  width: number;
  height: number;
  coarse: boolean;
};

export default function RetroSequence({ isActive }: Props) {
  const [mounted, setMounted] = useState(false);
  const [viewport, setViewport] = useState<Viewport>({
    width: 0,
    height: 0,
    coarse: false,
  });

  useEffect(() => {
    const updateViewport = () => {
      const coarse =
        window.matchMedia("(pointer: coarse)").matches ||
        navigator.maxTouchPoints > 0;

      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        coarse,
      });
    };

    let mountTimer: ReturnType<typeof setTimeout> | undefined;

    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("orientationchange", updateViewport);

    if (isActive) {
      mountTimer = setTimeout(() => setMounted(true), 50);
    } else {
      setMounted(false);
    }

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("orientationchange", updateViewport);
      if (mountTimer) clearTimeout(mountTimer);
    };
  }, [isActive]);

  const premiumEase = "cubic-bezier(0.16, 1, 0.3, 1)";
  const aggressiveEase = "cubic-bezier(0.19, 1, 0.22, 1)";

  const characterConfig = useMemo(() => {
    const isTouch = viewport.coarse;
    const isSmallPhone = viewport.width > 0 && viewport.width <= 480;

    if (isTouch) {
      return {
        left: isSmallPhone ? "67%" : "65%",
        bottom: isSmallPhone
          ? "calc(env(safe-area-inset-bottom, 0px) + 10px)"
          : "calc(env(safe-area-inset-bottom, 0px) + 12px)",
        width: isSmallPhone
          ? "clamp(118px, 31vw, 150px)"
          : "clamp(140px, 34vw, 185px)",
        scale: 1.02,
      };
    }

    return {
      left: "45vw",
      bottom: "calc(env(safe-area-inset-bottom, 0px) + 6dvh)", // bottom +2 from 4dvh
      width: "clamp(96px, 8.8vw, 132px)", // smaller on desktop
      scale: 0.78,
    };
  }, [viewport]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#59b0ff",
      }}
    >
      <style>{`
        @keyframes skyDrift {
          0%,100% { transform: perspective(1400px) rotateX(0deg) scale(1.03) translateY(0px); }
          50%     { transform: perspective(1400px) rotateX(1.2deg) scale(1.06) translateY(-6px); }
        }

        @keyframes cloudPan3D {
          0%,100% { transform: perspective(900px) rotateY(0deg) translateX(0px) translateY(0px); }
          33%     { transform: perspective(900px) rotateY(-2deg) translateX(16px) translateY(-6px); }
          66%     { transform: perspective(900px) rotateY(1.5deg) translateX(-6px) translateY(-3px); }
        }

        @keyframes castleBreathe {
          0%,100% { transform: scaleX(1) scaleY(1) translateY(0px); filter: brightness(1); }
          40%,60% { transform: scaleX(1.03) scaleY(1.02) translateY(-5px); filter: brightness(1.07); }
        }

        @keyframes hillsFloat {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-4px); }
        }

        @keyframes terrainPulse {
          0%,100% { transform: scale(1); }
          50%     { transform: scale(1.005); }
        }

        @keyframes coinSpin3D {
          0%   { transform: perspective(260px) rotateY(0deg) translateY(0px); }
          25%  { transform: perspective(260px) rotateY(90deg) translateY(-10px); }
          50%  { transform: perspective(260px) rotateY(180deg) translateY(-16px); }
          75%  { transform: perspective(260px) rotateY(270deg) translateY(-8px); }
          100% { transform: perspective(260px) rotateY(360deg) translateY(0px); }
        }

        @keyframes charTilt3D {
          0%,100% { transform: perspective(600px) rotateY(-4deg) rotateX(1.5deg); }
          50%     { transform: perspective(600px) rotateY(4deg) rotateX(-1deg); }
        }

        .retro-character {
          position: absolute;
          z-index: 6;
          opacity: 0;
          transition: all 1.1s cubic-bezier(0.19, 1, 0.22, 1) 0.35s;
          will-change: transform, opacity, left, bottom, width;
        }

        .retro-character.mounted {
          opacity: 1;
        }

        .retro-character-inner {
          width: 100%;
          height: 100%;
          filter: drop-shadow(6px 8px 0px rgba(0,0,0,0.4));
          animation: ${mounted ? "charTilt3D 4s ease-in-out infinite" : "none"};
          transform-origin: bottom center;
        }

        @media (max-width: 768px) {
          .stage-title {
            top: 6.5dvh !important;
          }
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1)",
          willChange: "opacity",
        }}
      >
        {/* SKY */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0) scale(1)" : "translateY(-20px) scale(1.05)",
            transition: `all 1.5s ${premiumEase}`,
          }}
        >
          <div style={{ width: "100%", height: "100%", animation: mounted ? "skyDrift 20s ease-in-out infinite" : "none" }}>
            <img
              src="/retro/sky.png"
              alt="Sky"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top center",
              }}
            />
          </div>
        </div>

        {/* CLOUDS */}
        <div
          style={{
            position: "absolute",
            top: "5dvh",
            left: 0,
            right: 0,
            height: "25dvh",
            zIndex: 2,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-40px)",
            transition: `all 1.4s ${premiumEase} 0.1s`,
          }}
        >
          <div style={{ width: "100%", height: "100%", animation: mounted ? "cloudPan3D 13s ease-in-out infinite" : "none" }}>
            <img
              src="/retro/clouds.png"
              alt="Clouds"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "top",
              }}
            />
          </div>
        </div>

        {/* CASTLE */}
        <div
          style={{
            position: "absolute",
            bottom: "10dvh",
            left: 0,
            right: 0,
            zIndex: 3,
            display: "flex",
            justifyContent: "center",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(40px)",
            transition: `all 1.5s ${premiumEase} 0.2s`,
          }}
        >
          <div style={{ width: "100%", animation: mounted ? "castleBreathe 5s ease-in-out infinite" : "none", transformOrigin: "bottom center" }}>
            <img
              src="/retro/castle.png"
              alt="Castle"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </div>

        {/* HILLS */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "45dvh",
            zIndex: 4,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(80px)",
            transition: `all 1.2s ${premiumEase} 0.15s`,
          }}
        >
          <div style={{ width: "100%", height: "100%", animation: mounted ? "hillsFloat 14s ease-in-out infinite" : "none" }}>
            <img
              src="/retro/hills.png"
              alt="Hills"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "bottom center",
              }}
            />
          </div>
        </div>

        {/* TERRAIN */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "30dvh",
            zIndex: 5,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(100px)",
            transition: `all 1s ${aggressiveEase} 0.25s`,
          }}
        >
          <div style={{ width: "100%", height: "100%", animation: mounted ? "terrainPulse 10s ease-in-out infinite" : "none" }}>
            <img
              src="/retro/terrain.png"
              alt="Terrain"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "bottom",
              }}
            />
          </div>
        </div>

        {/* CHARACTER */}
        <div
          className={`retro-character ${mounted ? "mounted" : ""}`}
          style={{
            left: characterConfig.left,
            bottom: characterConfig.bottom,
            width: characterConfig.width,
            transform: `translateX(-50%) scale(${characterConfig.scale})`,
          }}
        >
          <div className="retro-character-inner">
            <img
              src="/retro/character.png"
              alt="Character"
              style={{
                width: "100%",
                height: "100%",
                display: "block",
              }}
            />
          </div>
        </div>

        {/* COINS */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 7,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(50px)",
            transition: `all 1.3s ${premiumEase} 0.4s`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "10%",
              bottom: "10dvh",
              width: "clamp(40px, 10vw, 65px)",
              animation: "coinSpin3D 1.6s ease-in-out infinite",
            }}
          >
            <img src="/retro/coin.png" style={{ width: "100%" }} alt="" />
          </div>

          <div
            style={{
              position: "absolute",
              left: "60%",
              bottom: "5dvh",
              width: "clamp(40px, 10vw, 65px)",
              animation: "coinSpin3D 1.6s ease-in-out infinite 0.2s",
            }}
          >
            <img src="/retro/coin.png" style={{ width: "100%" }} alt="" />
          </div>

          <div
            style={{
              position: "absolute",
              left: "65%",
              bottom: "5dvh",
              width: "clamp(40px, 10vw, 65px)",
              animation: "coinSpin3D 1.6s ease-in-out infinite 0.4s",
            }}
          >
            <img src="/retro/coin.png" style={{ width: "100%" }} alt="" />
          </div>

          <div
            style={{
              position: "absolute",
              left: "76%",
              bottom: "8dvh",
              width: "clamp(40px, 10vw, 65px)",
              animation: "coinSpin3D 1.8s ease-in-out infinite",
            }}
          >
            <img src="/retro/coin.png" style={{ width: "100%" }} alt="" />
          </div>

          <div
            style={{
              position: "absolute",
              left: "81%",
              bottom: "8dvh",
              width: "clamp(40px, 10vw, 65px)",
              animation: "coinSpin3D 1.8s ease-in-out infinite 0.3s",
            }}
          >
            <img src="/retro/coin.png" style={{ width: "100%" }} alt="" />
          </div>
        </div>
      </div>

      {/* TOP DARK GRADIENT */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(to bottom, rgba(2,2,2,0.85) 0%, rgba(2,2,2,0.1) 25%, transparent 45%)",
          opacity: mounted ? 1 : 0,
          transition: `opacity 1s ${premiumEase}`,
          zIndex: 10,
        }}
      />

      {/* TITLE */}
      <div
        className="stage-title"
        style={{
          position: "absolute",
          top: "8dvh",
          left: 0,
          right: 0,
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0) skewX(0deg)" : "translateY(-20px) skewX(-4deg)",
          filter: mounted ? "blur(0px)" : "blur(8px)",
          transition: `all 1.2s ${aggressiveEase} 0.3s`,
          willChange: "opacity, transform, filter",
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.65rem",
            letterSpacing: "0.4em",
            color: "rgba(255,255,255,0.7)",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          Stage 2 · Retro
        </span>

        <h2
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "clamp(1.2rem, 5vw, 3.5rem)",
            margin: 0,
            fontWeight: 400,
            lineHeight: 1.2,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            textShadow: "0 6px 0px #000",
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#FACC15" }}>pixels</span>
          <span style={{ color: "#FFFFFF" }}>never died</span>
        </h2>
      </div>
    </div>
  );
            }
