import React from "react";
import {
  AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile, Sequence,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import {
  BackgroundLayer, HexGridOverlay, GlassCard, AudioBadge,
  GD_DARK, GD_PURPLE, GD_VIOLET, GD_PINK, GD_ACCENT, GD_ORANGE, GD_GOLD,
  calculateCountdown, formatTime, STREAM_START, GAME_START,
} from "./shared/GameDayDesignSystem";
import { USER_GROUPS, COUNTRIES } from "./shared/userGroups";
import { ORGANIZERS, AWS_SUPPORTERS } from "./shared/organizers";

const F = "'Amazon Ember', 'Inter', sans-serif";
const COMMUNITY_LOGO = staticFile("AWSCommunityGameDayEurope/AWSCommunityEurope_last_nobackground.png");
const GAMEDAY_LOGO = staticFile("AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White Geometric with text.png");

const SCHEDULE_CET = [
  { time: "17:30", label: "Pre-Show", color: GD_ACCENT },
  { time: "18:00", label: "Live Stream", color: GD_PINK },
  { time: "18:30", label: "GameDay", color: GD_GOLD },
  { time: "20:30", label: "Closing", color: GD_ORANGE },
];

// Shuffle UGs deterministically for "random" spotlight order
const SHUFFLED_UGS = [...USER_GROUPS].sort((a, b) => {
  const ha = a.name.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const hb = b.name.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return ha - hb;
});
// Split into pages of 6
const UG_PAGES: typeof USER_GROUPS[] = [];
for (let i = 0; i < SHUFFLED_UGS.length; i += 6) UG_PAGES.push(SHUFFLED_UGS.slice(i, i + 6));

// ── Schedule Bar (persistent top) ──
const Bar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = calculateCountdown(frame, 0, STREAM_START, fps);
  const gc = calculateCountdown(frame, 0, GAME_START, fps);
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 68, zIndex: 10,
      background: `linear-gradient(180deg, ${GD_DARK}ee, ${GD_DARK}bb)`,
      borderBottom: `1px solid ${GD_PURPLE}33`,
      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 36px",
    }}>
      <div style={{ display: "flex", gap: 28 }}>
        {SCHEDULE_CET.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: s.color }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: "white", fontFamily: F }}>{s.time}</span>
            <span style={{ fontSize: 13, color: GD_ACCENT, fontFamily: F }}>{s.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: GD_PINK, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Stream</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: GD_PINK, fontFamily: "monospace" }}>{formatTime(sc)}</div>
        </div>
        <div style={{ width: 1, height: 36, background: `${GD_PURPLE}44` }} />
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: GD_GOLD, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Game</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: GD_GOLD, fontFamily: "monospace" }}>{formatTime(gc)}</div>
        </div>
      </div>
    </div>
  );
};

// ── Reusable section heading ──
const Heading: React.FC<{ children: string }> = ({ children }) => (
  <div style={{ fontSize: 20, fontWeight: 700, color: GD_ACCENT, textTransform: "uppercase", letterSpacing: 4, marginBottom: 24, fontFamily: F, textAlign: "center" }}>
    {children}
  </div>
);

// ── Stagger helper ──
function useStagger(index: number, gap = 4) {
  const frame = useCurrentFrame();
  return interpolate(frame, [index * gap, index * gap + 15], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
}

// ── Section: Hero ──
const Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gc = calculateCountdown(frame, 0, GAME_START, fps);
  const m = String(Math.floor(gc / 60)).padStart(2, "0");
  const s = String(gc % 60).padStart(2, "0");
  const pulse = interpolate(frame % 60, [0, 30, 60], [0.3, 1, 0.3]);
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32 }}>
        <Img src={COMMUNITY_LOGO} style={{ height: 90 }} />
        <div style={{ width: 1, height: 56, background: `${GD_PURPLE}55` }} />
        <Img src={GAMEDAY_LOGO} style={{ height: 120 }} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: GD_GOLD, textTransform: "uppercase", letterSpacing: 5, marginBottom: 18, fontFamily: F }}>
        Game Starts In
      </div>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
        <TBox v={m} u="min" pulse={pulse} /><div style={{ fontSize: 52, color: GD_GOLD, opacity: 0.5, paddingBottom: 16 }}>:</div><TBox v={s} u="sec" pulse={pulse} />
      </div>
      <div style={{ fontSize: 20, color: GD_ACCENT, marginTop: 24, fontFamily: F }}>The first-ever AWS Community GameDay across Europe</div>
      <div style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", marginTop: 8, fontFamily: F }}>53+ User Groups · 20+ Countries · 4+ Timezones</div>
    </AbsoluteFill>
  );
};

const TBox: React.FC<{ v: string; u: string; pulse: number }> = ({ v, u, pulse }) => (
  <div style={{ background: `linear-gradient(180deg,${GD_PURPLE}40,${GD_DARK}dd)`, border: `1px solid ${GD_VIOLET}30`, borderRadius: 16, padding: "16px 28px", textAlign: "center", minWidth: 110 }}>
    <div style={{ fontSize: 64, fontWeight: 800, fontFamily: F, color: GD_GOLD, lineHeight: 1, textShadow: `0 0 ${22 * pulse}px ${GD_ORANGE}55` }}>{v}</div>
    <div style={{ fontSize: 13, color: GD_ACCENT, marginTop: 5, textTransform: "uppercase", letterSpacing: 2 }}>{u}</div>
  </div>
);

// ── Section: UG Spotlight (6 groups per page) ──
const UGSpotlight: React.FC<{ page: number }> = ({ page }) => {
  const groups = UG_PAGES[page] || [];
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Heading>{`User Group Spotlight (${page + 1}/${UG_PAGES.length})`}</Heading>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center", maxWidth: 1100 }}>
        {groups.map((g, i) => {
          const o = useStagger(i, 6);
          return (
            <div key={g.name} style={{
              opacity: o, transform: `translateY(${(1 - o) * 20}px)`,
              width: 320, background: "rgba(255,255,255,0.05)", border: `1px solid ${GD_PURPLE}33`,
              borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16,
            }}>
              <span style={{ fontSize: 40 }}>{g.flag}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "white", fontFamily: F }}>{g.name}</div>
                <div style={{ fontSize: 14, color: GD_ACCENT, marginTop: 2 }}>{g.city}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Section: Organizers ──
const OrgSection: React.FC = () => {
  const all = [...ORGANIZERS, ...AWS_SUPPORTERS];
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Heading>Organized by the Community</Heading>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "center", maxWidth: 1050 }}>
        {all.map((p, i) => {
          const o = useStagger(i, 5);
          return (
            <div key={p.name} style={{
              opacity: o, transform: `translateY(${(1 - o) * 16}px)`,
              display: "flex", alignItems: "center", gap: 14,
              background: "rgba(255,255,255,0.05)", border: `1px solid ${p.type === "aws" ? GD_ORANGE : GD_PURPLE}33`,
              borderRadius: 16, padding: "14px 20px", minWidth: 240,
            }}>
              <Img src={staticFile(p.face)} style={{ width: 56, height: 56, borderRadius: 28, objectFit: "cover" }} />
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "white", fontFamily: F }}>{p.flag} {p.name}</div>
                <div style={{ fontSize: 13, color: p.type === "aws" ? GD_ORANGE : GD_ACCENT }}>{p.role}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{p.country}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Section: Event Info ──
const InfoSection: React.FC = () => {
  const items = [
    { t: "What is AWS GameDay?", d: "A competitive, team-based learning exercise where you solve real-world challenges on AWS. No prior experience needed — just curiosity and teamwork." },
    { t: "How does it work?", d: "Teams of 4 compete on a gamified platform. You'll face scenarios that test your cloud skills. Points are earned by solving challenges correctly and quickly." },
    { t: "What makes this special?", d: "For the first time ever, 53+ AWS User Groups across Europe are playing simultaneously. Same challenges, same leaderboard, one winner." },
    { t: "What do you need?", d: "Just show up at your local User Group. Teams are formed on-site. Watch the live stream for instructions, then your UG leader distributes the team codes." },
  ];
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Heading>About the Event</Heading>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "center", maxWidth: 1100 }}>
        {items.map((item, i) => {
          const o = useStagger(i, 8);
          return (
            <div key={item.t} style={{
              opacity: o, transform: `translateY(${(1 - o) * 16}px)`,
              width: 500, background: "rgba(255,255,255,0.05)", border: `1px solid ${GD_PURPLE}22`,
              borderRadius: 16, padding: "22px 26px",
            }}>
              <div style={{ fontSize: 19, fontWeight: 700, color: GD_GOLD, marginBottom: 10, fontFamily: F }}>{item.t}</div>
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, fontFamily: F }}>{item.d}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Section: Detailed Schedule ──
const ScheduleSection: React.FC = () => {
  const timeline = [
    { time: "17:30", label: "Pre-Show begins", detail: "Optional — audio & stream test at your location", color: GD_ACCENT },
    { time: "18:00", label: "Live Stream starts", detail: "Welcome, community intro, special guest", color: GD_PINK },
    { time: "18:14", label: "GameDay Instructions", detail: "Arnaud & Loïc explain the rules and gameplay", color: GD_VIOLET },
    { time: "18:25", label: "Team codes distributed", detail: "Your UG leader shares the codes locally", color: GD_GOLD },
    { time: "18:30", label: "Game ON", detail: "2 hours of competitive cloud gaming — stream muted", color: GD_GOLD },
    { time: "20:30", label: "Closing Ceremony", detail: "Winners announced, wrap-up", color: GD_ORANGE },
    { time: "21:00", label: "Stream ends", detail: "Local User Groups continue with their own schedule", color: GD_ACCENT },
  ];
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Heading>Detailed Schedule (CET)</Heading>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 750 }}>
        {timeline.map((t, i) => {
          const o = useStagger(i, 5);
          return (
            <div key={t.time + t.label} style={{
              opacity: o, transform: `translateX(${(1 - o) * 30}px)`,
              display: "flex", alignItems: "center", gap: 18,
              padding: "12px 22px", borderRadius: 14,
              background: "rgba(255,255,255,0.04)", borderLeft: `4px solid ${t.color}`,
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: t.color, width: 70, fontFamily: F }}>{t.time}</div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 700, color: "white", fontFamily: F }}>{t.label}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{t.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Section: Stream Host ──
const HostSection: React.FC = () => {
  const linda = ORGANIZERS.find((p) => p.name === "Linda")!;
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Heading>Your Stream Host</Heading>
      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        <Img src={staticFile(linda.face)} style={{ width: 180, height: 180, borderRadius: 90, objectFit: "cover", border: `3px solid ${GD_VIOLET}44` }} />
        <div>
          <div style={{ fontSize: 40, fontWeight: 800, color: "white", fontFamily: F }}>Linda Mohamed</div>
          <div style={{ fontSize: 20, color: GD_ACCENT, marginTop: 6, fontFamily: F }}>AWS Community Hero</div>
          <div style={{ fontSize: 17, color: "rgba(255,255,255,0.6)", marginTop: 4, fontFamily: F }}>{linda.flag} AWS & Women's User Group Vienna, Austria</div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 14, maxWidth: 520, lineHeight: 1.6, fontFamily: F }}>
            Organizing the first-ever pan-European AWS Community GameDay — connecting 53+ User Groups across 20+ countries for a shared competitive cloud experience.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Section: Get Ready ──
const ReadySection: React.FC = () => {
  const items = [
    "Form your team locally before the stream",
    "Be seated with audio ready 5 minutes before start",
    "Watch the live stream for instructions",
    "Team codes will be distributed locally by your UG leader",
    "Game runs for 2 hours — stream is muted during gameplay",
    "Stream returns for the closing ceremony at 20:30 CET",
    "After the ceremony, local User Groups continue their own schedule",
  ];
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Heading>Get Ready</Heading>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 750 }}>
        {items.map((text, i) => {
          const o = useStagger(i, 5);
          return (
            <div key={i} style={{ opacity: o, transform: `translateX(${(1 - o) * 20}px)`, display: "flex", alignItems: "center", gap: 16, fontSize: 20, color: "rgba(255,255,255,0.9)", fontFamily: F }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: `${GD_VIOLET}33`, border: `1px solid ${GD_VIOLET}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: GD_ACCENT, flexShrink: 0 }}>{i + 1}</div>
              <span>{text}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Section: Stats ──
const StatsSection: React.FC = () => {
  const stats = [
    { v: "53+", l: "User Groups", c: GD_GOLD },
    { v: "20+", l: "Countries", c: GD_PINK },
    { v: "4+", l: "Timezones", c: GD_VIOLET },
    { v: "1st", l: "Edition", c: GD_ORANGE },
  ];
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Heading>Community GameDay Europe in Numbers</Heading>
      <div style={{ display: "flex", gap: 32, justifyContent: "center" }}>
        {stats.map((s, i) => {
          const o = useStagger(i, 8);
          return (
            <div key={s.l} style={{
              opacity: o, transform: `scale(${0.8 + o * 0.2})`,
              background: "rgba(255,255,255,0.05)", border: `1px solid ${s.c}33`,
              borderRadius: 20, padding: "28px 40px", textAlign: "center",
            }}>
              <div style={{ fontSize: 56, fontWeight: 800, color: s.c, fontFamily: F }}>{s.v}</div>
              <div style={{ fontSize: 16, color: GD_ACCENT, marginTop: 8, fontFamily: F }}>{s.l}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Wrap each section with the persistent background + bar ──
const Wrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ fontFamily: F, background: GD_DARK }}>
    <BackgroundLayer darken={0.7} />
    <HexGridOverlay />
    <AudioBadge muted />
    <Bar />
    <div style={{ position: "absolute", top: 68, left: 0, right: 0, bottom: 0 }}>{children}</div>
  </AbsoluteFill>
);

// ── Build the section sequence ──
// Each section 40s = 1200 frames, transition 20 frames
// Sections: hero, 10 UG pages, organizers, info, schedule, host, ready, stats, then repeat UG pages
// Total unique: 1 + 10 + 1 + 1 + 1 + 1 + 1 + 1 = 17 sections × 1200 = 20400 frames first pass
// Then cycle: hero, UG pages again, organizers, schedule, ready, stats = fills 54000

const SECTION_DUR = 1200; // 40s
const TRANS_DUR = 20;

function buildSections(): Array<{ key: string; el: React.ReactNode }> {
  const sections: Array<{ key: string; el: React.ReactNode }> = [];
  // Cycle 1
  sections.push({ key: "hero1", el: <Wrap><Hero /></Wrap> });
  for (let i = 0; i < UG_PAGES.length; i++) sections.push({ key: `ug1-${i}`, el: <Wrap><UGSpotlight page={i} /></Wrap> });
  sections.push({ key: "org1", el: <Wrap><OrgSection /></Wrap> });
  sections.push({ key: "info1", el: <Wrap><InfoSection /></Wrap> });
  sections.push({ key: "sched1", el: <Wrap><ScheduleSection /></Wrap> });
  sections.push({ key: "host1", el: <Wrap><HostSection /></Wrap> });
  sections.push({ key: "ready1", el: <Wrap><ReadySection /></Wrap> });
  sections.push({ key: "stats1", el: <Wrap><StatsSection /></Wrap> });
  // Cycle 2
  sections.push({ key: "hero2", el: <Wrap><Hero /></Wrap> });
  for (let i = 0; i < UG_PAGES.length; i++) sections.push({ key: `ug2-${i}`, el: <Wrap><UGSpotlight page={i} /></Wrap> });
  sections.push({ key: "org2", el: <Wrap><OrgSection /></Wrap> });
  sections.push({ key: "sched2", el: <Wrap><ScheduleSection /></Wrap> });
  sections.push({ key: "ready2", el: <Wrap><ReadySection /></Wrap> });
  sections.push({ key: "stats2", el: <Wrap><StatsSection /></Wrap> });
  return sections;
}

// ── Main Composition ──
export const GameDayPreShowInfo: React.FC = () => {
  const sections = buildSections();
  // Alternate between fade and slide transitions
  const presentations = [
    () => fade(),
    () => slide({ direction: "from-left" }),
    () => fade(),
    () => slide({ direction: "from-bottom" }),
  ];

  return (
    <TransitionSeries>
      {sections.map((s, i) => {
        const items: React.ReactNode[] = [];
        if (i > 0) {
          const pres = presentations[i % presentations.length]();
          items.push(
            <TransitionSeries.Transition
              key={`t-${s.key}`}
              presentation={pres}
              timing={linearTiming({ durationInFrames: TRANS_DUR })}
            />
          );
        }
        items.push(
          <TransitionSeries.Sequence key={s.key} durationInFrames={SECTION_DUR}>
            {s.el}
          </TransitionSeries.Sequence>
        );
        return items;
      })}
    </TransitionSeries>
  );
};
