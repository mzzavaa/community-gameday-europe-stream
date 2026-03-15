# Implementation Plan: Closing Ceremony V2

## Overview

Complete rewrite of `03-GameDayStreamClosing-Audio.tsx` as a four-phase cinematic composition (1280×720, 30fps, 27000 frames). Export `USER_GROUPS` from the archive, implement pure utility functions for phase gating and animation logic, then build each phase incrementally: Showcase → Shuffle → Reveal → ThankYou. All sub-components are inline in the single composition file. Property-based tests validate the pure functions via fast-check + vitest.

## Tasks

- [x] 1. Export USER_GROUPS and set up pure utility functions
  - [x] 1.1 Export USER_GROUPS from `archive/CommunityGamedayEuropeV4.tsx`
    - Change `const USER_GROUPS` to `export const USER_GROUPS` so the closing composition can import it
    - Verify `LOGO_MAP` is already exported
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.2 Scaffold `03-GameDayStreamClosing-Audio.tsx` with Phase enum, constants, and pure utility functions
    - Define and export `Phase` enum, `PHASE_BOUNDARIES`, `REVEAL_FRAMES`, and all composition constants
    - Implement and export pure functions: `getActivePhase`, `isTransitionFrame`, `getShowcasePage`, `getAllShowcasePages`, `getShuffleCycleSpeed`, `getRevealedPlacements`, `getCountUpValue`, `getFadeOpacity`
    - Define `TeamData` interface and `PODIUM_TEAMS` array with 6 teams resolved from `LOGO_MAP`
    - Define `REVEAL_SCHEDULE` array with frame offsets and durations
    - Import `USER_GROUPS`, `LOGO_MAP` from archive and `BackgroundLayer`, `HexGridOverlay`, `AudioBadge`, `GlassCard`, `springConfig`, `formatTime` from `shared/GameDayDesignSystem.tsx`
    - Create a minimal `GameDayClosing` root component that renders persistent layers (BackgroundLayer, HexGridOverlay, AudioBadge) and phase-gated placeholder divs
    - Remove all old composition content (PhaseMarker, Big Timer, Schedule Sidebar, old LogoCarousel with circular crops)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 1.3 Write property tests for phase gating and transition flash (Properties 1, 6)
    - Create `__tests__/closing-ceremony-v2.property.test.ts`
    - **Property 1: Phase gating correctness** — for any frame in [0, 26999], `getActivePhase` returns exactly one correct phase
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**
    - **Property 6: Transition flash at phase boundaries** — for any frame in [0, 26999], `isTransitionFrame` returns true iff within 60 frames of a boundary start
    - **Validates: Requirements 3.4**

  - [ ]* 1.4 Write property test for USER_GROUPS data validity (Property 12)
    - **Property 12: USER_GROUPS data structure validity** — every entry has non-empty flag, name, city; array length is 53
    - **Validates: Requirements 1.2**

- [x] 2. Checkpoint - Verify scaffold and pure functions
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Implement Showcase Phase (frames 0–7199)
  - [x] 3.1 Implement `SegmentTransitionFlash` component
    - Gold/violet gradient overlay at phase boundaries (frames 0, 7200, 9000, 18000)
    - ~60 frame duration with opacity fade-in/fade-out using `interpolate`
    - Render in root composition at all frames, component self-gates via `isTransitionFrame`
    - _Requirements: 3.4_

  - [x] 3.2 Implement `GroupCard` component
    - GlassCard containing landscape logo (600:337 aspect ratio, `objectFit: "contain"`)
    - Look up logo from `LOGO_MAP` by group name; fallback to large flag emoji on gradient background if missing
    - Display flag emoji, group name, and city name below the logo
    - Spring-based entry animation with staggered delay per card index using `springConfig.entry`
    - No `borderRadius: 50%` or circular clipping anywhere
    - _Requirements: 4.2, 4.7, 9.1, 9.2, 9.3_

  - [x] 3.3 Implement `ShowcasePhase` component with paginated 3×2 grid
    - Calculate current page from frame using `getShowcasePage`
    - Slice `USER_GROUPS` for current page (6 per page in 3×2 grid)
    - Render 6 `GroupCard` components with staggered spring entry
    - Spring-based page transitions (opacity/translate)
    - 120 frames (4 seconds) per page minimum
    - All 53 groups shown at least once across the 7200-frame phase
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6, 4.8_

  - [x] 3.4 Implement `ResultsCountdown` component
    - Compact GlassCard positioned in corner/edge, not overlapping the 3×2 grid
    - Display `formatTime(Math.max(0, Math.floor((9000 - frame) / 30)))` countdown
    - Visible only during Showcase Phase (frames 0–7199)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 3.5 Wire ShowcasePhase into root composition
    - Conditionally render `ShowcasePhase` when `getActivePhase(frame) === Phase.Showcase`
    - Conditionally render `ResultsCountdown` when in Showcase phase
    - Visual QA: start Remotion Studio, navigate to GameDayClosing, take Playwright screenshots at frames 0 and 3600 to verify showcase grid and countdown
    - _Requirements: 4.1, 5.1, 10.1, 11.1_

  - [ ]* 3.6 Write property tests for showcase logic (Properties 2, 3, 4, 5)
    - **Property 2: Showcase group coverage** — pagination produces `ceil(N/6)` pages fitting within 7200 frames
    - **Validates: Requirements 4.1, 4.6**
    - **Property 3: Showcase page size invariant** — each page has `min(6, N - p*6)` groups
    - **Validates: Requirements 4.3**
    - **Property 4: Logo lookup completeness** — every group has either a LOGO_MAP URL or a non-empty flag fallback
    - **Validates: Requirements 4.7, 9.3**
    - **Property 5: Results countdown accuracy** — for any frame in [0, 7199], countdown matches expected calculation
    - **Validates: Requirements 5.2**

- [x] 4. Checkpoint - Verify Showcase Phase
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Shuffle Phase (frames 7200–8999)
  - [x] 5.1 Implement `PodiumBar` component
    - Vertical bar with height proportional to displayed score
    - Group flag and name label at top, score value on the bar
    - Spring animation for height changes
    - _Requirements: 6.3_

  - [x] 5.2 Implement `ShufflePhase` component
    - 6 `PodiumBar` components arranged horizontally
    - Cycle random groups from `USER_GROUPS` through each position with fictitious scores (3000–5000)
    - Deterministic pseudo-random selection based on frame (seeded by position + cycle index)
    - Cycle speed starts at ~10 frames/cycle, decelerates to ~60 frames/cycle using `getShuffleCycleSpeed`
    - Bars grow/shrink dynamically as groups change
    - Final cycle freezes at end of phase
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 5.3 Wire ShufflePhase into root composition
    - Conditionally render `ShufflePhase` when `getActivePhase(frame) === Phase.Shuffle`
    - Visual QA: take Playwright screenshots at frames 7200 and 8700 to verify shuffle animation and deceleration
    - _Requirements: 6.1, 10.2, 11.1_

  - [ ]* 5.4 Write property tests for shuffle logic (Properties 7, 8, 13)
    - **Property 7: Shuffle scores within plausible range** — all fictitious scores are integers in [3000, 5000]
    - **Validates: Requirements 6.4**
    - **Property 8: Shuffle deceleration** — `getShuffleCycleSpeed(f1) <= getShuffleCycleSpeed(f2)` for f1 < f2
    - **Validates: Requirements 6.5**
    - **Property 13: Shuffle selects valid group indices** — selection returns valid index into USER_GROUPS
    - **Validates: Requirements 6.2**

- [x] 6. Checkpoint - Verify Shuffle Phase
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Reveal Phase (frames 9000–17999)
  - [x] 7.1 Implement `TeamRevealCard` component
    - Landscape logo (600:337, `objectFit: "contain"`) or flag placeholder
    - Team name, flag, city displayed
    - Animated score count-up from 0 to final value over 60 frames using `getCountUpValue`
    - Border color: gold for 1st, silver for 2nd, bronze for 3rd, subtle for 4th–6th
    - Spring entry: `springConfig.emphasis` for 1st place, `springConfig.entry` for others
    - _Requirements: 7.3, 7.4, 7.7, 9.1, 9.2_

  - [x] 7.2 Implement `RevealPhase` component with sequential placement reveals
    - Reveal placements at scheduled frames: 6th@9000, 5th@9600, 4th@10200, 3rd@10800, 2nd@11700, 1st@12600
    - Use `getRevealedPlacements(frame)` to determine visible teams
    - Animate podium bars growing upward with spring animations, height proportional to score
    - 1st place gets enhanced effects (larger scale, gold glow, emphasis animation)
    - 600-frame duration for 6th/5th/4th, 900-frame duration for 3rd/2nd/1st
    - At frame 13500, display all 6 teams on complete podium for remaining reveal phase
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.6, 7.7, 7.8_

  - [x] 7.3 Wire RevealPhase into root composition
    - Conditionally render `RevealPhase` when `getActivePhase(frame) === Phase.Reveal`
    - Visual QA: take Playwright screenshots at frames 9000 (6th place), 12600 (1st place), and 13500 (full podium)
    - _Requirements: 7.1, 10.3, 11.1_

  - [ ]* 7.4 Write property tests for reveal logic (Properties 9, 10)
    - **Property 9: Reveal placement correctness** — `getRevealedPlacements` returns empty before 9000, accumulates monotonically, all 6 at ≥12600
    - **Validates: Requirements 7.2, 7.8, 12.3**
    - **Property 10: Score count-up bounds and convergence** — value in [0, s], equals s when elapsed ≥ 60, monotonically non-decreasing
    - **Validates: Requirements 7.4**

- [x] 8. Checkpoint - Verify Reveal Phase
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement ThankYou Phase (frames 18000–26999)
  - [x] 9.1 Implement `ThankYouPhase` component
    - "AWS Community GameDay Europe" subtitle above main heading
    - Large "Thank You" heading with spring-based entry animation
    - "See you at the next GameDay!" closing message below
    - Fade-to-dark overlay in final 90 frames (26910–26999) using `getFadeOpacity`
    - Fully opaque black overlay at frame 26999
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 9.2 Wire ThankYouPhase into root composition
    - Conditionally render `ThankYouPhase` when `getActivePhase(frame) === Phase.ThankYou`
    - Visual QA: take Playwright screenshots at frames 18000 (thank you) and 26950 (fade to dark)
    - _Requirements: 8.1, 10.4, 11.1_

  - [ ]* 9.3 Write property test for fade opacity (Property 11)
    - **Property 11: Fade opacity monotonic increase** — 0 before 26910, in [0,1] during fade, 1 at 26999, monotonically non-decreasing
    - **Validates: Requirements 8.4, 8.5**

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Verify no regressions in existing test suite (`__tests__/gameday-full-stream-timeline.property.test.ts`, `__tests__/gameday-mainevent-bugfix.property.test.ts`, `__tests__/gameday-stream-overlay.property.test.ts`)
  - _Requirements: 12.4_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests use fast-check with vitest, file: `__tests__/closing-ceremony-v2.property.test.ts`
- Visual QA uses Playwright MCP browser against Remotion Studio at key frames
- All code is TypeScript/React (Remotion) in a single file: `03-GameDayStreamClosing-Audio.tsx`
- All logos rendered at landscape 600:337 aspect ratio with `objectFit: "contain"` — no circular crops
