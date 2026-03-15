import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  GD_DARK,
  GD_PURPLE,
  GD_VIOLET,
  GD_ACCENT,
  GD_ORANGE,
  GD_GOLD,
  BackgroundLayer,
  HexGridOverlay,
} from "@compositions/shared/GameDayDesignSystem";

// ─── SVG Icons ───────────────────────────────────────────────────────
const AudioIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = "#22c55e" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill={color} />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const MutedIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = "#6c3fa0" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill={color} />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

const GamepadIcon: React.FC<{ size?: number; color?: string }> = ({ size = 28, color = GD_GOLD }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="3" />
    <line x1="6" y1="10" x2="6" y2="14" />
    <line x1="4" y1="12" x2="8" y2="12" />
    <circle cx="16" cy="10" r="1" fill={color} />
    <circle cx="19" cy="12" r="1" fill={color} />
    <circle cx="16" cy="14" r="1" fill={color} />
  </svg>
);

// ─── Types ───────────────────────────────────────────────────────────
interface CountdownProps {
  eventDate: string;
  timezone: string;
  milestones: { label: string; time: string; id: string }[];
}

function msUntil(eventDate: string, time: string, nowMs: number): number {
  const target = new Date(`${eventDate}T${time}:00`).getTime();
  return Math.max(0, target - nowMs);
}

function formatHMS(ms: number): { d: string; h: string; m: string; s: string } {
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return {
    d: String(d),
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
  };
}

const FONT = "'Amazon Ember', 'Inter', system-ui, sans-serif";

// ─── Timer digit box ─────────────────────────────────────────────────
const TimerBox: React.FC<{ value: string; unit: string; pulse: number; large?: boolean }> = ({
  value, unit, pulse, large,
}) => (
  <div style={{
    background: `linear-gradient(180deg, ${GD_PURPLE}33, ${GD_DARK}ee)`,
    border: `1px solid ${GD_VIOLET}22`,
    borderRadius: large ? 12 : 6,
    padding: large ? "10px 14px" : "4px 8px",
    textAlign: "center",
    minWidth: large ? 72 : 44,
  }}>
    <div style={{
      fontSize: large ? 44 : 22,
      fontWeight: 800,
      fontFamily: "'Amazon Ember', monospace",
      color: GD_GOLD,
      textShadow: `0 0 ${(large ? 16 : 8) * pulse}px ${GD_ORANGE}55`,
      lineHeight: 1,
    }}>
      {value}
    </div>
    <div style={{ fontSize: large ? 11 : 9, color: GD_ACCENT, marginTop: 2, textTransform: "uppercase", letterSpacing: 1 }}>
      {unit}
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────
export const CountdownComposition: React.FC<CountdownProps> = ({
  eventDate,
  milestones,
}) => {
  const frame = useCurrentFrame();
  const realNow = Date.now();
  const pulse = interpolate(frame % 60, [0, 30, 60], [0.4, 1, 0.4]);

  const titleOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 25], [20, 0], { extrapolateRight: "clamp" });

  // Find the gameplay milestone for the hero section
  const gameplay = milestones.find((m) => m.id === "gameplay");
  const gameplayMs = gameplay ? msUntil(eventDate, gameplay.time, realNow) : 0;
  const gameplayTime = formatHMS(gameplayMs);
  const gameplayLive = gameplayMs === 0;

  // Other milestones (excluding gameplay)
  const others = milestones.filter((m) => m.id !== "gameplay");

  return (
    <AbsoluteFill style={{ background: GD_DARK, fontFamily: FONT }}>
      <BackgroundLayer darken={0.85} />
      <HexGridOverlay />

      {/* ── Title ── */}
      <div style={{
        position: "absolute", top: 36, width: "100%", textAlign: "center",
        opacity: titleOpacity, transform: `translateY(${titleY}px)`,
      }}>
        <div style={{
          fontSize: 18, fontWeight: 600, color: GD_ACCENT, letterSpacing: 3,
          textTransform: "uppercase",
        }}>
          AWS Community
        </div>
        <div style={{
          fontSize: 46, fontWeight: 800, color: "white", letterSpacing: 1,
          textShadow: `0 0 40px ${GD_VIOLET}66`,
          marginTop: -2,
        }}>
          GameDay Europe
        </div>
      </div>

      {/* ── Hero: Gameplay countdown ── */}
      <div style={{
        position: "absolute", top: 155, width: "100%",
        display: "flex", flexDirection: "column", alignItems: "center",
        opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateY(${interpolate(frame, [10, 30], [15, 0], { extrapolateRight: "clamp" })}px)`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <GamepadIcon size={24} />
          <span style={{ fontSize: 14, fontWeight: 700, color: GD_GOLD, textTransform: "uppercase", letterSpacing: 2 }}>
            Game Starts In
          </span>
          <GamepadIcon size={24} />
        </div>

        {gameplayLive ? (
          <div style={{ fontSize: 52, fontWeight: 800, color: "#22c55e", textShadow: `0 0 30px #22c55e44` }}>
            🎮 GAME ON
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            {Number(gameplayTime.d) > 0 && (
              <TimerBox value={gameplayTime.d} unit="days" pulse={pulse} large />
            )}
            <TimerBox value={gameplayTime.h} unit="hrs" pulse={pulse} large />
            <div style={{ fontSize: 36, color: GD_GOLD, fontWeight: 300, paddingBottom: 14, opacity: pulse }}>:</div>
            <TimerBox value={gameplayTime.m} unit="min" pulse={pulse} large />
            <div style={{ fontSize: 36, color: GD_GOLD, fontWeight: 300, paddingBottom: 14, opacity: pulse }}>:</div>
            <TimerBox value={gameplayTime.s} unit="sec" pulse={pulse} large />
          </div>
        )}

        <div style={{ fontSize: 12, color: GD_PURPLE, marginTop: 8 }}>
          {gameplay?.time} CET • 2 hours of competitive cloud gaming
        </div>
      </div>

      {/* ── Secondary milestones ── */}
      <div style={{
        position: "absolute", bottom: 60, width: "100%",
        display: "flex", justifyContent: "center", gap: 32,
        opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        {others.map((ms, i) => {
          const remaining = msUntil(eventDate, ms.time, realNow);
          const isLive = remaining === 0;
          const t = formatHMS(remaining);
          const isPreshow = ms.id === "preshow";
          const isMuted = ms.id === "preshow" || ms.id === "gameplay";

          return (
            <div key={ms.id} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              opacity: isPreshow ? 0.5 : 1,
              transform: `scale(${isPreshow ? 0.85 : 1})`,
            }}>
              {/* Label + icon */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                {isMuted ? <MutedIcon size={14} /> : <AudioIcon size={14} />}
                <span style={{
                  fontSize: isPreshow ? 11 : 13,
                  fontWeight: 600,
                  color: isLive ? "#22c55e" : GD_ACCENT,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}>
                  {ms.label.replace(/ \(.*\)/, "")}
                </span>
              </div>

              {/* Time */}
              <div style={{ fontSize: 11, color: GD_PURPLE, marginBottom: 4 }}>{ms.time} CET</div>

              {isLive ? (
                <div style={{ fontSize: 18, fontWeight: 700, color: "#22c55e" }}>✓ LIVE</div>
              ) : (
                <div style={{ display: "flex", gap: 4 }}>
                  {Number(t.d) > 0 && <TimerBox value={t.d} unit="d" pulse={pulse} />}
                  <TimerBox value={t.h} unit="h" pulse={pulse} />
                  <TimerBox value={t.m} unit="m" pulse={pulse} />
                  <TimerBox value={t.s} unit="s" pulse={pulse} />
                </div>
              )}

              {/* Preshow note */}
              {isPreshow && (
                <div style={{ fontSize: 9, color: GD_PURPLE, marginTop: 4, fontStyle: "italic" }}>
                  optional • audio test
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Bottom line ── */}
      <div style={{
        position: "absolute", bottom: 16, width: "100%", textAlign: "center",
        fontSize: 11, color: GD_PURPLE,
        opacity: interpolate(frame, [35, 50], [0, 0.5], { extrapolateRight: "clamp" }),
      }}>
        53+ User Groups • 20+ Countries • One GameDay
      </div>
    </AbsoluteFill>
  );
};
