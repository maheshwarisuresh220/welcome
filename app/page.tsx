
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const petals = Array.from({ length: 42 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 11) % 100}%`,
  delay: `${(i % 14) * 0.18}s`,
  duration: `${6 + (i % 7) * 0.55}s`,
  drift: `${((i * 19) % 150) - 75}px`,
  size: `${10 + (i % 5) * 3}px`,
  rotation: `${(i * 43) % 360}deg`,
}));

export default function SummitOpening() {
  const [curtainsActive, setCurtainsActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!curtainsActive || isOpen) return;

    const timer = window.setTimeout(() => {
      setIsOpen(true);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [curtainsActive, isOpen]);

  useEffect(() => {
    if (isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;

      const target = event.target as HTMLElement | null;

      if (
        target?.isContentEditable ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT"
      ) {
        return;
      }

      if (
        event.code === "Space" ||
        event.code === "Enter"
      ) {
        event.preventDefault();
        setCurtainsActive(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <main
      className={[
        "summit-stage",
        curtainsActive ? "curtains-active" : "",
        isOpen ? "is-open" : "",
      ].join(" ")}
    >
      {/* STAGE 2: SUMMIT POSTER */}
      <section
        className="summit-reveal"
        aria-label="AI and Healthcare Summit 2026 poster"
        aria-hidden={!isOpen}
      >
        <div className="poster-frame">
          <Image
            src="/summitposter.jpeg"
            alt="AI & Healthcare Summit 2026"
            fill
            priority
            sizes="(max-width: 768px) 94vw, 94vh"
            className="summit-poster"
          />
        </div>
      </section>

      {/* STAGE 1: UNIVERSITY WELCOME */}
      <section
        className="welcome-screen"
        aria-label="SMIU welcome ceremony"
        aria-hidden={isOpen}
      >
        <div className="welcome-content">
          <div className="university-identity">
            <div className="university-logo-frame">
              <Image
                src="/uni.png"
                alt="1885 SMI University"
                width={220}
                height={220}
                priority
                className="university-logo"
              />
            </div>

            <span className="identity-rule" />

            <p className="identity-caption">
              SMI UNIVERSITY
            </p>
          </div>

          <p className="welcome-eyebrow">
            WITH PRIDE, RESPECT &amp; WARMTH
          </p>

          <h1 className="welcome-title">
            SMI University
            <br />
            <span>Welcomes You</span>
          </h1>

          <div className="gold-divider" aria-hidden="true">
            <span />
            <span className="divider-diamond">✧</span>
            <span />
          </div>

          <p className="honour-text">
            We extend our heartfelt welcome to our Honourable
            Vice Chancellor, distinguished guests and dignitaries,
            esteemed faculty members, researchers, healthcare
            professionals, delegates and dear students.
          </p>

          <p className="welcome-message">
            Your presence makes this gathering meaningful.
            Together, let us explore ideas, share knowledge and
            advance a healthier future through innovation.
          </p>

          <div className="welcome-event">
            <span className="event-kicker">
              CELEBRATING KNOWLEDGE &amp; INNOVATION
            </span>

            <h2>
              AI &amp; Healthcare Summit
              <span className="event-year">2026</span>
            </h2>

            <p className="event-theme">
              Advancing Solutions for Stress, Mental Health &amp;
              Diabetes
            </p>

            <p className="event-date">
              <span className="date-line" />
              04 NOVEMBER 2026
              <span className="date-line" />
            </p>
          </div>

          <button
            className="enter-button"
            type="button"
            onClick={() => setCurtainsActive(true)}
            disabled={curtainsActive}
          >
            <span>
              {curtainsActive
                ? "THE CEREMONY BEGINS"
                : "REVEAL THE SUMMIT"}
            </span>
            <span className="enter-arrow" aria-hidden="true">
              →
            </span>
          </button>

          <p className="keyboard-hint">
            PRESS SPACE OR ENTER TO BEGIN
          </p>
        </div>

        <div className="welcome-footer">
          <span>1885 SMI UNIVERSITY</span>
          <span className="footer-separator">✦</span>
          <span>4 NOVEMBER 2026</span>
        </div>
      </section>

      {/* FRESH FLOWER SHOWER FOR EACH STAGE */}
      {(!isOpen || curtainsActive) && (
        <div
          key={isOpen ? "poster-petals" : "welcome-petals"}
          className="petal-shower"
          aria-hidden="true"
        >
          {petals.map((petal) => (
            <span
              key={petal.id}
              className="flower-petal"
              style={{
                left: petal.left,
                animationDelay: petal.delay,
                animationDuration: petal.duration,
                "--drift": petal.drift,
                "--petal-size": petal.size,
                "--rotation": petal.rotation,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* CURTAINS: HIDDEN UNTIL THE POSTER REVEAL */}
      <div className="curtain curtain-left" aria-hidden="true">
        <div className="curtain-folds" />
        <div className="curtain-edge" />
      </div>

      <div className="curtain curtain-right" aria-hidden="true">
        <div className="curtain-folds" />
        <div className="curtain-edge" />
      </div>

      <div className="curtain-seam" aria-hidden="true" />
    </main>
  );
}
