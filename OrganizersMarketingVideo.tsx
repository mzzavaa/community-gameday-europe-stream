import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import {
  GD_DARK,
  GD_PURPLE,
  GD_VIOLET,
  GD_PINK,
  GD_ACCENT,
  GD_GOLD,
  BackgroundLayer,
  springConfig,
} from "./shared/GameDayDesignSystem";
import { ORGANIZERS } from "./shared/organizers";

// ── Frame Constants ──
const TOTAL_FRAMES = 450;
const INTRO_START = 0;
const INTRO_END = 119;
const ORG_START = 120;
const ORG_END = 299;
const OUTRO_START = 300;
const OUTRO_END = 449;
const CROSSFADE_FRAMES = 15;

// ── Placeholder Scene Components (implemented in tasks 3.2, 3.3, 3.4) ──

const IntroScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Spring entrance for GameDay logo (from top)
  const logoTopSpring = spring({
    frame,
    fps,
    config: springConfig.entry,
    durationInFrames: 40,
  });
  const logoTopY = interpolate(logoTopSpring, [0, 1], [-50, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Spring entrance for AWS Community Europe logo (from bottom)
  const logoBotSpring = spring({
    frame: frame - 10,
    fps,
    config: springConfig.entry,
    durationInFrames: 40,
  });
  const logoBotY = interpolate(logoBotSpring, [0, 1], [50, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit crossfade (frames 105–119)
  const exitOpacity = interpolate(frame, [105, 119], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      {/* Ambient radial gradient glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, ${GD_PURPLE}40 0%, ${GD_VIOLET}20 40%, transparent 70%)`,
        }}
      />

      {/* Content container */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {/* GameDay logo — spring from top */}
        <Img
          src={staticFile(
            "AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White.png",
          )}
          style={{
            width: 320,
            objectFit: "contain",
            transform: `translateY(${logoTopY}px)`,
          }}
        />

        {/* AWS Community Europe logo — spring from bottom */}
        <Img
          src={staticFile(
            "AWSCommunityGameDayEurope/AWSCommunityEurope_last_nobackground.png",
          )}
          style={{
            width: 220,
            objectFit: "contain",
            transform: `translateY(${logoBotY}px)`,
          }}
        />

        {/* GAMEDAY title — fade + slide up */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontSize: 52,
            fontWeight: 900,
            color: "white",
            letterSpacing: 8,
            textAlign: "center",
          }}
        >
          GAMEDAY
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};


const OrganizerScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const relFrame = frame - ORG_START;

  // Scene opacity: fade in first 15 frames, fade out last 15 frames
  const sceneOpacity = interpolate(frame, [120, 134, 285, 299], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Heading spring entrance (5 frames into scene)
  const orgTitleSpring = spring({
    frame: Math.max(0, relFrame - 5),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* Heading + subheading */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: orgTitleSpring,
          transform: `translateY(${interpolate(orgTitleSpring, [0, 1], [20, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "rgba(255,255,255,0.5)",
            fontFamily: "'Inter', sans-serif",
            letterSpacing: 5,
          }}
        >
          COMMUNITY GAMEDAY EUROPE ORGANIZERS
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 900,
            fontFamily: "'Inter', sans-serif",
            marginTop: 8,
            color: GD_GOLD,
            letterSpacing: 1,
          }}
        >
          From the Community, for the Community
        </div>
      </div>

      {/* 4×2 Organizer card grid */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "36px 80px",
          maxWidth: 1250,
        }}
      >
        {ORGANIZERS.map((org, i) => {
          const cardSpring = spring({
            frame: Math.max(0, relFrame - 15 - i * 12),
            fps,
            config: springConfig.entry,
          });
          return (
            <div
              key={org.name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                opacity: cardSpring,
                transform: `translateY(${interpolate(cardSpring, [0, 1], [30, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 130,
                  height: 130,
                  borderRadius: "50%",
                  overflow: "hidden",
                  boxShadow: `0 0 30px ${GD_VIOLET}70, 0 0 60px ${GD_PURPLE}40, 0 4px 16px rgba(0,0,0,0.4)`,
                }}
              >
                <Img
                  src={staticFile(org.face)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#ffffff",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {org.flag} {org.name}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: "rgba(255,255,255,0.55)",
                    fontFamily: "'Inter', sans-serif",
                    marginTop: 3,
                    whiteSpace: "nowrap",
                  }}
                >
                  {org.role}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    color: "rgba(255,255,255,0.4)",
                    fontFamily: "'Inter', sans-serif",
                    marginTop: 1,
                  }}
                >
                  {org.country}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};


const OutroScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const relFrame = frame - OUTRO_START;

  // Spring entrance for logos (centered)
  const logoSpring = spring({
    frame: relFrame,
    fps,
    config: springConfig.entry,
    durationInFrames: 40,
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.7, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline fade-in (relFrame 20–40)
  const taglineOpacity = interpolate(relFrame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // CTA delayed fade-in (relFrame 40–60)
  const ctaOpacity = interpolate(relFrame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade to black: absolute frames 420–449
  const fadeToBlack = interpolate(frame, [420, 449], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Radial gradient glow burst */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, ${GD_PURPLE}60 0%, ${GD_VIOLET}30 40%, transparent 70%)`,
        }}
      />

      {/* Content container */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        {/* GameDay logo + AWS Community Europe logo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
          }}
        >
          <Img
            src={staticFile(
              "AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White.png",
            )}
            style={{ width: 280, objectFit: "contain" }}
          />
          <Img
            src={staticFile(
              "AWSCommunityGameDayEurope/AWSCommunityEurope_last_nobackground.png",
            )}
            style={{ width: 180, objectFit: "contain" }}
          />
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: taglineOpacity,
            fontSize: 24,
            fontWeight: 600,
            color: "white",
            letterSpacing: 1,
            textAlign: "center",
            marginTop: 12,
          }}
        >
          AWS Community GameDay Europe · 17 March 2026
        </div>

        {/* CTA */}
        <div
          style={{
            opacity: ctaOpacity,
            fontSize: 20,
            fontWeight: 700,
            color: GD_GOLD,
            letterSpacing: 2,
            textAlign: "center",
          }}
        >
          www.awsgameday.eu
        </div>
      </AbsoluteFill>

      {/* Fade to black overlay */}
      <AbsoluteFill
        style={{
          backgroundColor: "black",
          opacity: fadeToBlack,
        }}
      />
    </AbsoluteFill>
  );
};

// ── Main Composition ──

export const OrganizersMarketingVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ fontFamily: "'Inter', sans-serif", background: GD_DARK }}>
      <BackgroundLayer darken={0.65} />

      {frame >= INTRO_START && frame <= INTRO_END && (
        <AbsoluteFill style={{ zIndex: 10 }}>
          <IntroScene frame={frame} fps={fps} />
        </AbsoluteFill>
      )}

      {frame >= ORG_START && frame <= ORG_END && (
        <AbsoluteFill style={{ zIndex: 10 }}>
          <OrganizerScene frame={frame} fps={fps} />
        </AbsoluteFill>
      )}

      {frame >= OUTRO_START && frame <= OUTRO_END && (
        <AbsoluteFill style={{ zIndex: 10 }}>
          <OutroScene frame={frame} fps={fps} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
