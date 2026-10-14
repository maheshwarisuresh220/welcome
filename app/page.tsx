"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface FloatingElement {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: number;
  drift: string;
  rotation: string;
  type: "petal" | "stardust";
}

export default function SummitWelcomePage() {
  const [curtainsVisible, setCurtainsVisible] = useState(false);
  const [curtainsOpening, setCurtainsOpening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const applauseRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);

  // Deterministic petals & gold stardust particles
  const floatingItems: FloatingElement[] = useMemo(() => {
    return Array.from({ length: 54 }, (_, i) => {
      const isStardust = i % 3 === 0;
      return {
        id: i,
        left: `${((i * 37 + 13) % 96) + 2}%`,
        delay: `${((i * 0.24) % 4.5).toFixed(2)}s`,
        duration: `${(isStardust ? 6.5 : 8.2) + (i % 6) * 0.65}s`,
        size: isStardust ? 5 + (i % 4) * 2 : 11 + (i % 5) * 3,
        drift: `${((i * 19) % 140) - 70}px`,
        rotation: `${(i * 53) % 360}deg`,
        type: isStardust ? "stardust" : "petal",
      };
    });
  }, []);

  // Gentle Web Audio chime fallback if /applause.mp3 is absent or blocked
  const playCeremonialChime = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const frequencies = [528, 660, 792, 1056];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(
          0.11 / (idx + 1),
          ctx.currentTime + idx * 0.15 + 0.1
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          ctx.currentTime + idx * 0.15 + 4.5
        );
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 4.8);
      });
    } catch {
      // Ignore audio restriction errors
    }
  }, []);

  const handleReveal = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const audio = applauseRef.current;
    if (soundEnabled) {
      if (audio) {
        if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
        audio.currentTime = 0;
        audio.volume = 0.65;
        audio.play().catch(() => {
          playCeremonialChime();
        });

        fadeTimerRef.current = setInterval(() => {
          if (!audio || audio.paused) {
            if (fadeTimerRef.current) {
              clearInterval(fadeTimerRef.current);
              fadeTimerRef.current = null;
            }
            return;
          }

          if (audio.currentTime >= 6.5 && audio.volume > 0.025) {
            audio.volume = Math.max(0, audio.volume - 0.02);
          }

          if (audio.volume <= 0.025) {
            audio.pause();
            audio.currentTime = 0;
            if (fadeTimerRef.current) {
              clearInterval(fadeTimerRef.current);
              fadeTimerRef.current = null;
            }
          }
        }, 180);
      } else {
        playCeremonialChime();
      }
    }

    // Step 1: Bring the closed velvet curtains & gold seal onto the stage
    setCurtainsVisible(true);

    // Step 2: Swap background to poster stage & begin slow 9.5s curtain parting
    openTimerRef.current = setTimeout(() => {
      setIsOpen(true);
      setCurtainsOpening(true);
    }, 650);
  }, [soundEnabled, playCeremonialChime]);

  const handleReset = useCallback(() => {
    if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    if (applauseRef.current) {
      applauseRef.current.pause();
      applauseRef.current.currentTime = 0;
    }
    setCurtainsOpening(false);
    setCurtainsVisible(false);
    setIsOpen(false);
    startedRef.current = false;
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.code === "Space" || event.key === "Enter") {
        event.preventDefault();
        if (!startedRef.current) {
          handleReveal();
        }
      } else if (event.key === "Escape" && startedRef.current) {
        handleReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
    };
  }, [handleReveal, handleReset]);

  return (
    <main
      className={[
        "summit-stage",
        curtainsVisible ? "curtains-visible" : "",
        curtainsOpening ? "curtains-opening" : "",
        isOpen ? "is-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <audio
        ref={applauseRef}
        src="/applause.mp3"
        preload="auto"
        aria-hidden="true"
      />

      {/* Ambient Royal Backdrop */}
      <div className="ambient-backdrop" aria-hidden="true">
        <div className="ambient-orb orb-top" />
        <div className="ambient-orb orb-bottom" />
        <div className="stage-border-frame" />
      </div>

      {/* ---------------- WELCOME SCREEN (LOCKED TO 100SVH) ---------------- */}
      <section className="welcome-screen" aria-label="Summit Welcome Note">
        <div className="welcome-card">
          {/* Decorative Corner Accents */}
          <span className="corner-ornament corner-tl" aria-hidden="true" />
          <span className="corner-ornament corner-tr" aria-hidden="true" />
          <span className="corner-ornament corner-bl" aria-hidden="true" />
          <span className="corner-ornament corner-br" aria-hidden="true" />

          {/* Pure-White Medallion so uni.png blends seamlessly */}
          <div className="crest-header">
            <div className="crest-medallion">
              <Image
                src="/uni.png"
                alt="SMI University Logo - Established 1885"
                width={120}
                height={120}
                priority
                className="logo-image"
              />
            </div>
          </div>

          <p className="eyebrow">
            <span>ESTD. 1885</span>
            <span className="eyebrow-dot">✦</span>
            <span>SINDH MADRESSATUL ISLAM UNIVERSITY</span>
          </p>

          <h1 className="welcome-title">Welcome to the Grand Summit</h1>

          <div className="ornamental-divider" aria-hidden="true">
            <span className="divider-line" />
            <span className="divider-diamond">❖</span>
            <span className="divider-line" />
          </div>

          <p className="honour-text">
            Honourable Vice Chancellor, Distinguished Guests, Respected Faculty,
            Researchers, Healthcare Dignitaries, Delegates, and Esteemed Students
          </p>

          <p className="welcome-message">
            It is our distinct privilege to convene this gathering at the
            intersection of empathetic artificial intelligence, clinical
            innovation, and mental well-being—envisioning compassionate
            solutions that foster resilience and healthier lives.
          </p>

          {/* Compact Royal Event Showcase Box */}
          <div className="event-showcase">
            <div className="event-kicker-row">
              <span className="kicker-line" />
              <span className="event-label">INAUGURAL CEREMONY</span>
              <span className="kicker-line" />
            </div>

            <h2 className="event-title">AI &amp; Healthcare Summit 2026</h2>

            <p className="event-theme">
              Advancing Solutions for Stress, Mental Health &amp; Diabetes
            </p>

            <div className="thematic-pills">
              <span className="theme-pill">Stress Resilience</span>
              <span className="theme-pill">Mental Well-Being</span>
              <span className="theme-pill">Metabolic &amp; Diabetes Care</span>
            </div>

            <div className="event-date-bar">
              <span className="date-badge">04 NOVEMBER 2026</span>
              <span className="date-divider">•</span>
              <span className="awareness-tag">
                IN RECOGNITION OF WORLD STRESS AWARENESS DAY
              </span>
            </div>
          </div>

          {/* Ceremonial Reveal Trigger */}
          <div className="cta-footer">
            <button
              type="button"
              className="reveal-button"
              onClick={handleReveal}
              disabled={curtainsVisible}
            >
              <span className="button-shimmer" aria-hidden="true" />
              <span className="button-star">✦</span>
              <span>
                {curtainsVisible
                  ? "Unveiling the Summit..."
                  : "Begin the Ceremony"}
              </span>
              <span className="button-arrow">→</span>
            </button>

            <p className="keyboard-hint">
              Press <kbd>SPACE</kbd> or <kbd>ENTER</kbd> to unveil
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- SLOW ROYAL VELVET CURTAINS ---------------- */}
      <div className="curtain-layer" aria-hidden="true">
        <div className="curtain curtain-left">
          <div className="curtain-velvet-pleats" />
          <div className="curtain-sheen" />
          <div className="curtain-gold-edge" />
        </div>

        <div className="curtain curtain-right">
          <div className="curtain-velvet-pleats" />
          <div className="curtain-sheen" />
          <div className="curtain-gold-edge" />
        </div>

        <div className="curtain-center-seam" />

        {/* Central Royal Gold Seal */}
        <div className="curtain-royal-seal">
          <div className="seal-outer-ring">
            <div className="seal-inner-disc">
              <span className="seal-emblem">✦</span>
              <span className="seal-year">1885</span>
              <span className="seal-sub">SMIU</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- PETAL & GOLD STARDUST SHOWER ---------------- */}
      {(curtainsVisible || isOpen) && (
        <div className="petal-shower" aria-hidden="true">
          {floatingItems.map((item) => (
            <span
              key={item.id}
              className={
                item.type === "petal" ? "flower-petal" : "stardust-mote"
              }
              style={
                {
                  left: item.left,
                  animationDelay: item.delay,
                  animationDuration: item.duration,
                  width: `${item.size}px`,
                  height:
                    item.type === "petal"
                      ? `${item.size * 1.35}px`
                      : `${item.size}px`,
                  "--petal-drift": item.drift,
                  "--petal-rot": item.rotation,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {/* ---------------- POSTER REVEAL STAGE (LOCKED TO 100SVH) ---------------- */}
      <section
        className="summit-reveal"
        aria-label="AI and Healthcare Summit 2026 Official Poster"
        aria-hidden={!isOpen}
      >
        <header className="poster-header">
          <p className="poster-kicker">
            1885 • SINDH MADRESSATUL ISLAM UNIVERSITY
          </p>
          <h2 className="poster-heading-title">The Summit Begins</h2>
          <p className="poster-subtitle">
            Innovation, Empathy &amp; Clinical Excellence for Mental Health
          </p>
        </header>

        <div className="poster-stage-area">
          <div className="poster-frame">
            <Image
              src="/summitposter.jpeg"
              alt="AI & Healthcare Summit 2026 official poster"
              width={1200}
              height={1697}
              priority
              className="summit-poster"
              sizes="(max-width: 768px) 90vw, 55vh"
            />
          </div>
        </div>

        <footer className="poster-footer-bar">
          <div className="poster-meta-text">
            <span>AI &amp; Healthcare Summit 2026</span>
            <span className="meta-sep">✦</span>
            <span className="meta-gold">04 November 2026</span>
            <span className="meta-sep">✦</span>
            <span>World Stress Awareness Day</span>
          </div>

          <div className="stage-controls">
            <button
              type="button"
              className="control-pill"
              onClick={handleReset}
              title="Replay the curtain reveal (or press Esc)"
            >
              ↺ Replay Ceremony
            </button>
            <button
              type="button"
              className="control-pill"
              onClick={() => setSoundEnabled((prev) => !prev)}
            >
              {soundEnabled ? "♫ Applause: On" : "✕ Applause: Muted"}
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}