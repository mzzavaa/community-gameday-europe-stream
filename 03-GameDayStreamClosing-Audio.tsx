import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BackgroundLayer,
  HexGridOverlay,
  AudioBadge,
  GlassCard,
  springConfig,
  formatTime,
  GD_DARK,
  GD_GOLD,
  GD_PURPLE,
  GD_VIOLET,
  GD_PINK,
  GD_ACCENT,
} from "./shared/GameDayDesignSystem";
import { USER_GROUPS, LOGO_MAP } from "./archive/CommunityGamedayEuropeV4";

// ── Derived Data ──
const COUNTRIES = Array.from(new Set(USER_GROUPS.map((g) => g.flag)));

// ── Phase Enum ──
export enum Phase {
  Showcase = "showcase",
  Shuffle = "shuffle",
  Reveal = "reveal",
  ThankYou = "thankyou",
}

// ── Phase Boundary Constants ──
export const PHASE_BOUNDARIES = {
  showcaseStart: 0,
  showcaseEnd: 7199,
  shuffleStart: 7200,
  shuffleEnd: 8999,
  revealStart: 9000,
  revealEnd: 17999,
  thankYouStart: 18000,
  thankYouEnd: 26999,
} as const;

// ── Reveal Frame Offsets ──
export const REVEAL_FRAMES = {
  6: 9000, 5: 9600, 4: 10200, 3: 10800, 2: 11700, 1: 12600,
  fullPodium: 13500,
} as const;

// ── Composition Constants ──
export const WIDTH = 1280;
export const HEIGHT = 720;
export const FPS = 30;
export const TOTAL_FRAMES = 27000;
export const GROUPS_PER_PAGE = 6;
export const PAGE_DURATION = 120;
export const SHUFFLE_POSITIONS = 6;
export const SHUFFLE_SCORE_MIN = 3000;
export const SHUFFLE_SCORE_MAX = 5000;
export const FLASH_DURATION = 60;
export const PHASE_BOUNDARY_FRAMES = [0, 7200, 9000, 18000];
export const FADE_START = 26910;
export const FADE_END = 26999;
export const FULL_PODIUM_FRAME = 13500;

// ── Showcase Sub-Phase Timing ──
const HERO_INTRO_END = 899;
const FAST_SCROLL_START = 900;

// ── TeamData Interface ──
export interface TeamData {
  name: string;
  flag: string;
  city: string;
  score: number;
  logoUrl: string | null;
}

// ── Podium Teams (1st through 6th) ──
export const PODIUM_TEAMS: TeamData[] = [
  { name: "AWS User Group Vienna", flag: "🇦🇹", city: "Vienna Austria", score: 4850, logoUrl: LOGO_MAP["AWS User Group Vienna"] ?? null },
  { name: "Berlin AWS User Group", flag: "🇩🇪", city: "Berlin Germany", score: 4720, logoUrl: LOGO_MAP["Berlin AWS User Group"] ?? null },
  { name: "AWS User Group France- Paris", flag: "🇫🇷", city: "Paris France", score: 4580, logoUrl: LOGO_MAP["AWS User Group France- Paris"] ?? null },
  { name: "AWS User Group Finland", flag: "🇫🇮", city: "Helsinki Finland", score: 4410, logoUrl: LOGO_MAP["AWS User Group Finland"] ?? null },
  { name: "AWS User Group Roma", flag: "🇮🇹", city: "Roma Italy", score: 4250, logoUrl: LOGO_MAP["AWS User Group Roma"] ?? null },
  { name: "AWS User Group Warsaw", flag: "🇵🇱", city: "Warsaw Poland", score: 4090, logoUrl: LOGO_MAP["AWS User Group Warsaw"] ?? null },
];

// ── Reveal Schedule ──
export const REVEAL_SCHEDULE = [
  { rank: 6, frame: 9000, duration: 600 },
  { rank: 5, frame: 9600, duration: 600 },
  { rank: 4, frame: 10200, duration: 600 },
  { rank: 3, frame: 10800, duration: 900 },
  { rank: 2, frame: 11700, duration: 900 },
  { rank: 1, frame: 12600, duration: 900 },
];

// ── Pure Utility Functions ──
export function getActivePhase(frame: number): Phase {
  if (frame <= 7199) return Phase.Showcase;
  if (frame <= 8999) return Phase.Shuffle;
  if (frame <= 17999) return Phase.Reveal;
  return Phase.ThankYou;
}

export function isTransitionFrame(frame: number): boolean {
  const boundaries = [0, 7200, 9000, 18000];
  return boundaries.some((b) => frame >= b && frame < b + 60);
}

export function getShowcasePage(frame: number, groupCount: number): number {
  const totalPages = Math.ceil(groupCount / GROUPS_PER_PAGE);
  const page = Math.floor(frame / PAGE_DURATION);
  return Math.min(page, totalPages - 1);
}

export function getAllShowcasePages(groupCount: number): number {
  return Math.ceil(groupCount / 6);
}

export function getShuffleCycleSpeed(frameInPhase: number): number {
  const progress = frameInPhase / 1800;
  return Math.round(10 + progress * 50);
}

export function getRevealedPlacements(frame: number): number[] {
  const placements: number[] = [];
  if (frame >= 9000) placements.push(6);
  if (frame >= 9600) placements.push(5);
  if (frame >= 10200) placements.push(4);
  if (frame >= 10800) placements.push(3);
  if (frame >= 11700) placements.push(2);
  if (frame >= 12600) placements.push(1);
  return placements;
}

export function getCountUpValue(targetScore: number, frame: number, revealFrame: number): number {
  const elapsed = Math.max(0, frame - revealFrame);
  const progress = Math.min(1, elapsed / 60);
  const eased = 1 - Math.pow(1 - progress, 3);
  return Math.round(eased * targetScore);
}

export function getFadeOpacity(frame: number): number {
  if (frame < 26910) return 0;
  return Math.min(1, (frame - 26910) / 90);
}

// ── Card Accent Colors ──
const CARD_ACCENTS = [GD_VIOLET, GD_PURPLE, GD_PINK, GD_ACCENT, "#6366f1", GD_VIOLET];

// ── SegmentTransitionFlash ──
const SegmentTransitionFlash: React.FC = () => {
  const frame = useCurrentFrame();
  if (!isTransitionFrame(frame)) return null;
  const boundary = PHASE_BOUNDARY_FRAMES.find((b) => frame >= b && frame < b + FLASH_DURATION);
  if (boundary === undefined) return null;
  const elapsed = frame - boundary;
  const opacity = interpolate(elapsed, [0, 10, 60], [0, 0.25, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  if (opacity <= 0) return null;
  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at center, ${GD_ACCENT}${Math.round(opacity * 120).toString(16).padStart(2, "0")}, transparent 70%)`,
      zIndex: 200, pointerEvents: "none",
    }} />
  );
};

// ── CountUp Helper ──
const CountUp: React.FC<{ target: number; frame: number; startFrame: number; suffix?: string }> = ({
  target, frame, startFrame, suffix = "",
}) => {
  const progress = Math.min(1, Math.max(0, (frame - startFrame) / 60));
  const eased = 1 - Math.pow(1 - progress, 3);
  const value = Math.round(eased * target);
  return <>{value}{suffix}</>;
};

// ── HeroIntro (frames 0-899): Epic intro with logos, stats, badge ──
const HeroIntro: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const titleSpring = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 14, stiffness: 120 } });
  const dateOpacity = interpolate(frame, [35, 55], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const statsOpacity = interpolate(frame, [55, 75], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const badgeSpring = spring({ frame: Math.max(0, frame - 70), fps, config: { damping: 14, stiffness: 120 } });
  const glowPulse = interpolate(frame, [0, 60, 120], [0.3, 0.7, 0.3], { extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [820, 899], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%", width: 800, height: 800,
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle, ${GD_PURPLE}${Math.round(glowPulse * 40).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
        borderRadius: "50%",
      }} />
      <div style={{
        position: "absolute", top: 45, left: 0, right: 0, display: "flex", justifyContent: "center",
        opacity: interpolate(frame, [0, 20], [0, 0.9], { extrapolateRight: "clamp" }),
      }}>
        <Img src={staticFile("AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White.png")} style={{ height: 80 }} />
      </div>
      <div style={{
        position: "absolute", top: 145, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center",
        transform: `translateY(${interpolate(titleSpring, [0, 1], [40, 0])}px)`, opacity: titleSpring,
      }}>
        <Img src={staticFile("AWSCommunityGameDayEurope/AWSCommunityEurope_last_nobackground.png")} style={{ height: 160 }} />
        <div style={{
          fontSize: 42, fontWeight: 900, letterSpacing: 4, textTransform: "uppercase",
          fontFamily: "'Inter', sans-serif", marginTop: 12,
          background: `linear-gradient(135deg, #ffffff 0%, ${GD_ACCENT} 50%, ${GD_PINK} 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>GAMEDAY EUROPE</div>
      </div>
      <div style={{ position: "absolute", top: 405, left: 0, right: 0, textAlign: "center", opacity: dateOpacity }}>
        <span style={{ fontSize: 22, fontWeight: 600, color: GD_PINK, fontFamily: "'Inter', sans-serif" }}>17 March 2026</span>
      </div>
      <div style={{ position: "absolute", top: 460, left: 80, right: 80, display: "flex", justifyContent: "center", gap: 80, opacity: statsOpacity }}>
        {[
          { label: "User Groups", value: 53, suffix: "", start: 60, isCountUp: true },
          { label: "Countries", value: COUNTRIES.length, suffix: "+", start: 65, isCountUp: true },
          { label: "One Epic Day", value: 1, suffix: "", start: 70, isCountUp: false },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: "#ffffff", fontFamily: "'Inter', sans-serif" }}>
              {stat.isCountUp ? <CountUp target={stat.value} frame={frame} startFrame={stat.start} suffix={stat.suffix} /> : <>{stat.value}{stat.suffix}</>}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, textTransform: "uppercase", letterSpacing: 2, fontFamily: "'Inter', sans-serif" }}>{stat.label}</div>
          </div>
        ))}
      </div>
      <div style={{
        position: "absolute", bottom: 60, left: 0, right: 0, display: "flex", justifyContent: "center",
        opacity: badgeSpring, transform: `scale(${interpolate(badgeSpring, [0, 1], [0.8, 1])})`,
      }}>
        <div style={{
          background: `linear-gradient(135deg, #4f46e5, ${GD_PINK})`, borderRadius: 12, padding: "10px 28px",
          fontSize: 14, fontWeight: 700, color: "#ffffff", fontFamily: "'Inter', sans-serif", letterSpacing: 1,
          display: "flex", alignItems: "center",
        }}>
          <Img src={staticFile("AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White.png")} style={{ height: 24, marginRight: 8 }} />
          Meet the Participating Communities
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── FastScroll (frames 900-7199): Continuous vertical scroll through all 53 groups ──
const SCROLL_COLS = 3;
const CARD_HEIGHT = 310;
const CARD_GAP = 14;
const SCROLL_ROW_HEIGHT = CARD_HEIGHT + CARD_GAP;
const TOTAL_ROWS = Math.ceil(USER_GROUPS.length / SCROLL_COLS);
const TOTAL_SCROLL_HEIGHT = TOTAL_ROWS * SCROLL_ROW_HEIGHT;
const VIEWPORT_TOP = 56;
const VIEWPORT_HEIGHT_PX = 720 - VIEWPORT_TOP - 24;

const FastScroll: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const scrollFrame = frame - FAST_SCROLL_START;
  const scrollDuration = 1800; // ~60s of scrolling then hold

  const entryOpacity = interpolate(scrollFrame, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scrollProgress = interpolate(scrollFrame, [15, scrollDuration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const eased = scrollProgress < 0.5 ? 2 * scrollProgress * scrollProgress : 1 - Math.pow(-2 * scrollProgress + 2, 2) / 2;

  const maxScroll = TOTAL_SCROLL_HEIGHT - VIEWPORT_HEIGHT_PX;
  const scrollY = eased * maxScroll;
  const glowX = interpolate(eased, [0, 1], [25, 75]);
  const glowY = interpolate(eased, [0, 0.5, 1], [30, 60, 35]);

  const firstVisibleRow = Math.max(0, Math.floor((scrollY - SCROLL_ROW_HEIGHT) / SCROLL_ROW_HEIGHT));
  const lastVisibleRow = Math.min(TOTAL_ROWS - 1, Math.ceil((scrollY + VIEWPORT_HEIGHT_PX + SCROLL_ROW_HEIGHT) / SCROLL_ROW_HEIGHT));

  return (
    <AbsoluteFill style={{ opacity: entryOpacity }}>
      <div style={{
        position: "absolute", top: `${glowY}%`, left: `${glowX}%`, width: 800, height: 800,
        transform: "translate(-50%, -50%)", background: `radial-gradient(circle, ${GD_PURPLE}30 0%, transparent 70%)`,
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{ position: "absolute", top: 48, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.03)", zIndex: 20 }}>
        <div style={{ height: "100%", width: `${scrollProgress * 100}%`, background: `linear-gradient(90deg, ${GD_PURPLE}, ${GD_VIOLET}, ${GD_PINK})`, boxShadow: `0 0 12px ${GD_PINK}60` }} />
      </div>
      <div style={{ position: "absolute", top: VIEWPORT_TOP, left: 0, right: 0, height: 60, background: `linear-gradient(180deg, ${GD_DARK} 0%, transparent 100%)`, zIndex: 15, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 50, background: `linear-gradient(0deg, ${GD_DARK} 0%, transparent 100%)`, zIndex: 15, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: VIEWPORT_TOP, left: 28, right: 28, bottom: 24, overflow: "hidden" }}>
        <div style={{ transform: `translateY(${-scrollY}px)`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: CARD_GAP, width: "100%" }}>
          {USER_GROUPS.map((group, i) => {
            const row = Math.floor(i / SCROLL_COLS);
            if (row < firstVisibleRow || row > lastVisibleRow) return <div key={i} style={{ height: CARD_HEIGHT }} />;
            const cardTop = row * SCROLL_ROW_HEIGHT;
            const cardCenter = cardTop + CARD_HEIGHT / 2;
            const viewportCenter = scrollY + VIEWPORT_HEIGHT_PX / 2;
            const distFromCenter = Math.abs(cardCenter - viewportCenter);
            const cardOpacity = interpolate(distFromCenter, [0, VIEWPORT_HEIGHT_PX * 0.45, VIEWPORT_HEIGHT_PX * 0.6], [1, 0.85, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
            const entrySpring = spring({ frame: Math.max(0, scrollFrame - i), fps, config: { damping: 18, stiffness: 100 } });
            const accentColor = CARD_ACCENTS[i % CARD_ACCENTS.length];
            const logoUrl = LOGO_MAP[group.name];
            return (
              <div key={i} style={{
                height: CARD_HEIGHT, opacity: cardOpacity * entrySpring,
                transform: `scale(${interpolate(cardOpacity, [0, 1], [0.95, 1])})`,
                background: "rgba(255,255,255,0.03)", backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden",
                display: "flex", flexDirection: "column",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}>
                {logoUrl ? (
                  <div style={{ width: "100%", flex: 1, borderRadius: "16px 16px 0 0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
                    <Img src={logoUrl} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </div>
                ) : (
                  <div style={{ width: "100%", flex: 1, borderRadius: "16px 16px 0 0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${accentColor}40, ${GD_DARK})` }}>
                    <div style={{ fontSize: 72, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}>{group.flag}</div>
                  </div>
                )}
                <div style={{ padding: "6px 12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 14, lineHeight: 1 }}>{group.flag}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", fontFamily: "'Inter', sans-serif", lineHeight: 1.2 }}>{group.name}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 4, marginLeft: 22 }}>📍 {group.city}</div>
                </div>
                <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }} />
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── ShowcasePhase (Hero Intro + Fast Scroll) ──
const ShowcasePhase: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <AbsoluteFill>
      {frame <= HERO_INTRO_END ? <HeroIntro frame={frame} /> : <FastScroll frame={frame} />}
    </AbsoluteFill>
  );
};

// ── ResultsCountdown ──
const ResultsCountdown: React.FC<{ frame: number }> = ({ frame }) => {
  // Only show during fast scroll phase (after hero intro)
  if (frame <= HERO_INTRO_END) return null;
  const countdown = formatTime(Math.max(0, Math.floor((9000 - frame) / 30)));
  return (
    <div style={{ position: "absolute", top: 16, right: 16, zIndex: 20 }}>
      <GlassCard style={{ padding: "6px 14px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 500, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: 1 }}>Results in</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: GD_GOLD, fontFamily: "'Inter', sans-serif", fontVariantNumeric: "tabular-nums" }}>{countdown}</div>
        </div>
      </GlassCard>
    </div>
  );
};

// ── ShufflePhase: Bell Curve Horizontal Scroll ──
// All 53 groups scroll right-to-left as vertical bars. Bars in the center of the screen
// are tallest (bell curve peak), bars at edges are shorter. Text is big and wraps.
const SHUFFLE_BAR_WIDTH = 160;
const SHUFFLE_BAR_GAP = 16;
const SHUFFLE_TOTAL_WIDTH = USER_GROUPS.length * (SHUFFLE_BAR_WIDTH + SHUFFLE_BAR_GAP);

const ShufflePhase: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const frameInPhase = frame - 7200;
  const phaseDuration = 1800; // 60 seconds

  // Entry animation
  const entrySpring = spring({ frame: frameInPhase, fps, config: { damping: 16, stiffness: 100 } });

  // Horizontal scroll: move all bars from right to left
  // Start with bars off-screen right, end with them off-screen left
  const scrollProgress = interpolate(frameInPhase, [15, phaseDuration - 30], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  // Ease for smooth feel
  const easedScroll = scrollProgress < 0.5
    ? 2 * scrollProgress * scrollProgress
    : 1 - Math.pow(-2 * scrollProgress + 2, 2) / 2;

  // Total scroll distance: from all bars off-screen right to all off-screen left
  const totalScrollDist = SHUFFLE_TOTAL_WIDTH + 1280;
  const scrollX = easedScroll * totalScrollDist - 1280 * 0.1; // start slightly off-screen right

  // Assign each group a deterministic shuffled score
  const groupsWithScores = USER_GROUPS.map((group, i) => {
    const score = SHUFFLE_SCORE_MIN + ((i * 17 + 31) % (SHUFFLE_SCORE_MAX - SHUFFLE_SCORE_MIN + 1));
    return { ...group, score };
  });

  // Sort by score for the bell curve visual (lowest at edges, highest in center)
  const sorted = [...groupsWithScores].sort((a, b) => a.score - b.score);
  // Interleave: place highest in center, lower scores alternate left/right
  const bellOrder: typeof sorted = new Array(sorted.length);
  let left = 0;
  let right = sorted.length - 1;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (i % 2 === 0) {
      bellOrder[Math.floor(sorted.length / 2) + left] = sorted[i];
      left++;
    } else {
      bellOrder[Math.floor(sorted.length / 2) - right + sorted.length - 1] = sorted[i];
      right--;
    }
  }
  // Simpler approach: sort ascending, then reorder so highest are in the middle
  const ascending = [...groupsWithScores].sort((a, b) => a.score - b.score);
  const bellCurveOrder: typeof ascending = [];
  for (let i = 0; i < ascending.length; i++) {
    if (i % 2 === 0) bellCurveOrder.push(ascending[i]);
    else bellCurveOrder.unshift(ascending[i]);
  }

  const screenCenter = 1280 / 2;

  return (
    <AbsoluteFill style={{ opacity: entrySpring }}>
      {/* Title */}
      <div style={{
        position: "absolute", top: 20, left: 0, right: 0, textAlign: "center", zIndex: 10,
        opacity: interpolate(frameInPhase, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: GD_ACCENT, fontFamily: "'Inter', sans-serif", letterSpacing: 2, textTransform: "uppercase" }}>
          Shuffling Results...
        </div>
      </div>

      {/* Horizontal scrolling bars container */}
      <div style={{ position: "absolute", top: 60, left: 0, right: 0, bottom: 40, overflow: "hidden" }}>
        {/* Left/right fade masks */}
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 120, background: `linear-gradient(90deg, ${GD_DARK} 0%, transparent 100%)`, zIndex: 10, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 120, background: `linear-gradient(270deg, ${GD_DARK} 0%, transparent 100%)`, zIndex: 10, pointerEvents: "none" }} />

        <div style={{
          display: "flex", alignItems: "flex-end", height: "100%",
          transform: `translateX(${-scrollX}px)`, gap: SHUFFLE_BAR_GAP,
          paddingLeft: 1280, // start off-screen right
        }}>
          {bellCurveOrder.map((group, i) => {
            const barX = i * (SHUFFLE_BAR_WIDTH + SHUFFLE_BAR_GAP) - scrollX + 1280;
            const barCenter = barX + SHUFFLE_BAR_WIDTH / 2;
            const distFromScreenCenter = Math.abs(barCenter - screenCenter);

            // Bell curve height: tallest at center, shortest at edges
            const maxBarHeight = 420;
            const minBarHeight = 80;
            const bellFactor = Math.exp(-Math.pow(distFromScreenCenter / 400, 2));
            const barHeight = minBarHeight + (maxBarHeight - minBarHeight) * bellFactor;

            // Opacity also follows bell curve
            const barOpacity = interpolate(distFromScreenCenter, [0, 500, 800], [1, 0.7, 0.15], {
              extrapolateRight: "clamp", extrapolateLeft: "clamp",
            });

            const accentColor = CARD_ACCENTS[i % CARD_ACCENTS.length];

            return (
              <div key={i} style={{
                minWidth: SHUFFLE_BAR_WIDTH, maxWidth: SHUFFLE_BAR_WIDTH,
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "flex-end", height: "100%", opacity: barOpacity,
              }}>
                {/* Flag */}
                <div style={{ fontSize: 28, marginBottom: 6, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}>{group.flag}</div>
                {/* Team name — wraps, no truncation */}
                <div style={{
                  fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)",
                  fontFamily: "'Inter', sans-serif", textAlign: "center",
                  marginBottom: 8, lineHeight: 1.3, width: SHUFFLE_BAR_WIDTH - 8,
                  wordWrap: "break-word", overflowWrap: "break-word",
                }}>{group.name}</div>
                {/* Bar */}
                <div style={{
                  width: "85%", height: barHeight, borderRadius: "10px 10px 0 0",
                  background: `linear-gradient(180deg, ${accentColor}cc, ${GD_PURPLE}90)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 24px ${accentColor}25`, border: `1px solid ${accentColor}30`, borderBottom: "none",
                  position: "relative",
                }}>
                  <div style={{
                    fontSize: 18, fontWeight: 800, color: "white", fontFamily: "'Inter', sans-serif",
                    fontVariantNumeric: "tabular-nums", textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                  }}>{Math.round(group.score)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── TeamRevealCard ──
const TeamRevealCard: React.FC<{ team: TeamData; rank: number; frame: number; revealFrame: number }> = ({ team, rank, frame, revealFrame }) => {
  const { fps } = useVideoConfig();
  const borderColor = rank === 1 ? GD_GOLD : rank === 2 ? "#C0C0C0" : rank === 3 ? "#CD7F32" : "rgba(255,255,255,0.1)";
  const config = rank === 1 ? springConfig.emphasis : springConfig.entry;
  const elapsed = Math.max(0, frame - revealFrame);
  const progress = spring({ frame: elapsed, fps, config });
  const translateY = interpolate(progress, [0, 1], [60, 0]);
  const scale = interpolate(progress, [0, 1], [0.9, 1]);
  const displayScore = getCountUpValue(team.score, frame, revealFrame);

  return (
    <div style={{ opacity: progress, transform: `translateY(${translateY}px) scale(${scale})` }}>
      <div style={{
        background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)",
        border: `1.5px solid ${borderColor}`, borderRadius: 16, overflow: "hidden",
        boxShadow: rank === 1 ? `0 0 30px ${GD_GOLD}25, 0 8px 32px rgba(0,0,0,0.4)` : "0 8px 32px rgba(0,0,0,0.3)",
      }}>
        {team.logoUrl ? (
          <div style={{ width: "100%", aspectRatio: "600 / 337", borderRadius: "16px 16px 0 0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
            <Img src={team.logoUrl} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          </div>
        ) : (
          <div style={{ width: "100%", aspectRatio: "600 / 337", borderRadius: "16px 16px 0 0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${GD_PURPLE}40, ${GD_DARK})` }}>
            <div style={{ fontSize: 72, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}>{team.flag}</div>
          </div>
        )}
        <div style={{ padding: "8px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "white", textAlign: "center", fontFamily: "'Inter', sans-serif", lineHeight: 1.2 }}>{team.flag} {team.name}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'Inter', sans-serif" }}>{team.city}</div>
          <div style={{ marginTop: 4, fontSize: 22, fontWeight: 800, color: rank === 1 ? GD_GOLD : "white", textAlign: "center", fontFamily: "'Inter', sans-serif", fontVariantNumeric: "tabular-nums" }}>{displayScore.toLocaleString()}</div>
        </div>
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${borderColor}60, transparent)` }} />
      </div>
    </div>
  );
};

// ── RevealPhase ──
const RevealPhase: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const revealed = getRevealedPlacements(frame);
  const isFullPodium = frame >= FULL_PODIUM_FRAME;
  const currentReveal = REVEAL_SCHEDULE.slice().reverse().find((r) => frame >= r.frame);
  if (!currentReveal) return null;

  if (isFullPodium) {
    const podiumOrder = [1, 2, 3, 4, 5, 6];
    const entryProgress = spring({ frame: frame - FULL_PODIUM_FRAME, fps, config: springConfig.entry });
    return (
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 40px", opacity: entryProgress }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: GD_GOLD, fontFamily: "'Inter', sans-serif", marginBottom: 16, textShadow: "0 2px 12px rgba(0,0,0,0.5)", textAlign: "center" }}>🏆 Final Standings</div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, width: "100%", maxWidth: 1100 }}>
          {podiumOrder.map((rank) => {
            const team = PODIUM_TEAMS[rank - 1];
            const revealEntry = REVEAL_SCHEDULE.find((r) => r.rank === rank);
            const revealFrame = revealEntry?.frame ?? FULL_PODIUM_FRAME;
            const isFirst = rank === 1;
            return (
              <div key={rank} style={{ width: isFirst ? 220 : 180, transform: isFirst ? "scale(1.08)" : "scale(1)", filter: isFirst ? `drop-shadow(0 0 20px ${GD_GOLD}80)` : "none" }}>
                <TeamRevealCard team={team} rank={rank} frame={frame} revealFrame={revealFrame} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }

  const currentRank = currentReveal.rank;
  const currentTeam = PODIUM_TEAMS[currentRank - 1];
  const previouslyRevealed = revealed.filter((r) => r !== currentRank);
  const cardProgress = spring({ frame: frame - currentReveal.frame, fps, config: currentRank === 1 ? springConfig.emphasis : springConfig.entry });

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 40px" }}>
      <div style={{
        fontSize: 20, fontWeight: 700, fontFamily: "'Inter', sans-serif", marginBottom: 8, opacity: cardProgress, textShadow: "0 2px 8px rgba(0,0,0,0.5)",
        color: currentRank === 1 ? GD_GOLD : currentRank === 2 ? "#C0C0C0" : currentRank === 3 ? "#CD7F32" : "rgba(255,255,255,0.7)",
      }}>
        {currentRank === 1 ? "🥇 1st Place" : currentRank === 2 ? "🥈 2nd Place" : currentRank === 3 ? "🥉 3rd Place" : `#${currentRank}`}
      </div>
      <div style={{
        width: currentRank === 1 ? 320 : 260,
        transform: `scale(${interpolate(cardProgress, [0, 1], [0.8, 1])})`, opacity: cardProgress,
        filter: currentRank === 1 ? `drop-shadow(0 0 30px ${GD_GOLD}90)` : "none",
      }}>
        <TeamRevealCard team={currentTeam} rank={currentRank} frame={frame} revealFrame={currentReveal.frame} />
      </div>
      {previouslyRevealed.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24, width: "100%", maxWidth: 900 }}>
          {previouslyRevealed.map((rank) => {
            const team = PODIUM_TEAMS[rank - 1];
            const revealEntry = REVEAL_SCHEDULE.find((r) => r.rank === rank);
            const revealFrame = revealEntry?.frame ?? 9000;
            const maxScore = PODIUM_TEAMS[0].score;
            const barHeight = interpolate(team.score, [0, maxScore], [30, 100]);
            const barProgress = spring({ frame: frame - revealFrame, fps, config: springConfig.entry });
            return (
              <div key={rank} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: Math.min(1, barProgress) }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontFamily: "'Inter', sans-serif", textAlign: "center", maxWidth: 100, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{team.flag} {team.name}</div>
                <div style={{ width: 80, height: barHeight * barProgress, background: `linear-gradient(180deg, ${GD_ACCENT}50, ${GD_PURPLE}60)`, borderRadius: 6, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 4, border: `1px solid ${GD_ACCENT}20`, borderBottom: "none" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "white", fontFamily: "'Inter', sans-serif", fontVariantNumeric: "tabular-nums" }}>{team.score.toLocaleString()}</div>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif" }}>#{rank}</div>
              </div>
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ── ThankYou Phase ──
const ThankYouPhase: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const phaseFrame = frame - 18000;
  const subtitleSpring = spring({ frame: phaseFrame, fps, config: { damping: 18, stiffness: 80 } });
  const titleSpring = spring({ frame: Math.max(0, phaseFrame - 20), fps, config: { damping: 14, stiffness: 70 } });
  const closingSpring = spring({ frame: Math.max(0, phaseFrame - 45), fps, config: { damping: 18, stiffness: 80 } });
  const fadeOpacity = getFadeOpacity(frame);
  const glowPulse = interpolate(phaseFrame % 180, [0, 90, 180], [0.15, 0.35, 0.15], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", zIndex: 10 }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%", width: 600, height: 600,
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle, ${GD_PURPLE}${Math.round(glowPulse * 60).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div style={{
          fontSize: 22, color: GD_ACCENT, fontWeight: 500, letterSpacing: 4, textTransform: "uppercase",
          opacity: subtitleSpring, transform: `translateY(${interpolate(subtitleSpring, [0, 1], [20, 0])}px)`,
          fontFamily: "'Inter', sans-serif",
        }}>AWS Community GameDay Europe</div>
        <div style={{
          fontSize: 80, fontWeight: 800, color: "white", textAlign: "center",
          opacity: titleSpring, transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px) scale(${interpolate(titleSpring, [0, 1], [0.85, 1])})`,
          fontFamily: "'Inter', sans-serif", textShadow: `0 0 60px ${GD_VIOLET}40`,
        }}>Thank You</div>
        <div style={{
          fontSize: 22, color: "rgba(255,255,255,0.6)", fontWeight: 400,
          opacity: closingSpring, transform: `translateY(${interpolate(closingSpring, [0, 1], [15, 0])}px)`,
          fontFamily: "'Inter', sans-serif",
        }}>See you at the next GameDay!</div>
      </div>
      {fadeOpacity > 0 && <AbsoluteFill style={{ backgroundColor: "black", opacity: fadeOpacity, zIndex: 100 }} />}
    </AbsoluteFill>
  );
};

// ── Closing Ceremony Composition ──
export const GameDayClosing: React.FC = () => {
  const frame = useCurrentFrame();
  const phase = getActivePhase(frame);

  return (
    <AbsoluteFill style={{ fontFamily: "'Inter', sans-serif", background: "#0c0820" }}>
      <BackgroundLayer darken={0.65} />
      <HexGridOverlay />
      <SegmentTransitionFlash />
      {phase === Phase.Showcase && (
        <AbsoluteFill style={{ zIndex: 10 }}>
          <ShowcasePhase frame={frame} />
          <ResultsCountdown frame={frame} />
        </AbsoluteFill>
      )}
      {phase === Phase.Shuffle && (
        <AbsoluteFill style={{ zIndex: 10 }}>
          <ShufflePhase frame={frame} />
        </AbsoluteFill>
      )}
      {phase === Phase.Reveal && (
        <AbsoluteFill style={{ zIndex: 10 }}>
          <RevealPhase frame={frame} />
        </AbsoluteFill>
      )}
      {phase === Phase.ThankYou && (
        <AbsoluteFill style={{ zIndex: 10 }}>
          <ThankYouPhase frame={frame} />
        </AbsoluteFill>
      )}
      <AudioBadge muted={false} />
    </AbsoluteFill>
  );
};
