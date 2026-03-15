---
inclusion: auto
description: "AWS Community GameDay Europe project context, architecture, compositions, timing, and technical constraints"
---

# AWS Community GameDay Europe — Stream Visuals Project

## Project Context

This is a Remotion (React video framework) project containing 4 stream overlay compositions for the AWS Community GameDay Europe — a competitive cloud event across 53+ AWS User Groups in 20+ countries.

## Architecture

- All compositions are single-file React components at the workspace root
- Shared design system: `shared/GameDayDesignSystem.tsx`
- Static assets: `public/AWSCommunityGameDayEurope/`
- Archive of earlier promo videos: `archive/` (reference only, do not modify)
- Property-based tests: `__tests__/`

## The 4 Compositions

0. `00-GameDayStreamPreShow-Muted.tsx` — 10-min looping countdown (×3 = 30 min pre-stream, muted)
1. `01-GameDayStreamMainEvent-Audio.tsx` — 30-min live introductions (audio, currently being redesigned)
2. `02-GameDayStreamGameplay-Muted.tsx` — 120-min muted gameplay overlay
3. `03-GameDayStreamClosing-Audio.tsx` — 15-min closing ceremony (audio)

## Key Technical Constraints

- Resolution: 1280×720 at 30 fps
- All colors from DesignSystem palette only (GD_DARK, GD_PURPLE, GD_VIOLET, GD_PINK, GD_ACCENT, GD_ORANGE, GD_GOLD)
- All cards use GlassCard component
- All animations use springConfig presets and staggeredEntry
- Font: Inter family only
- MAIN_EVENT_SEGMENTS and TIMELINE_CHAPTERS arrays are immutable
- AudioBadge component must not be altered

## Timing Reference

- FPS = 30, MIN = 1800 frames
- Frame 0 = composition start (not absolute time)
- Each composition has its own frame space
- Cross-composition timing uses calculateCountdown() with event offsets

## Active Spec

The MainEvent composition is being redesigned: `.kiro/specs/gameday-mainevent-redesign/`

Key additions: SpeakerBubbles, CompactSidebar, OrganizerSection, PhaseTimeline, enhanced InfoCardDisplay.

## Event Website

- Official URL: https://www.awsgameday.eu/
- Use this URL for all CTA / call-to-action references in compositions

## File References

#[[file:shared/GameDayDesignSystem.tsx]]
#[[file:01-GameDayStreamMainEvent-Audio.tsx]]
