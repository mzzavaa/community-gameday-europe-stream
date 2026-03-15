# Implementation Plan: Closing Podium Redesign

## Overview

Redesign the Final Standings slide to a 3+3 two-row layout with position labels and visual hierarchy, then add a new Team Podium Reveal slide showing the top 6 teams from the winning city in a podium arrangement. All changes are in `03-GameDayStreamClosing-Audio.tsx`. Implementation order: timing constants and data first, then PositionLabel component, then Final Standings layout rewrite, then TeamPodiumReveal component, then integration wiring.

## Tasks

- [x] 1. Add timing constants and WINNING_CITY_TEAMS data
  - [x] 1.1 Add `TEAM_PODIUM_FRAME` constant and `WINNING_CITY_TEAMS` array in `03-GameDayStreamClosing-Audio.tsx`
    - Add `export const TEAM_PODIUM_FRAME = 15000;` after the existing `FULL_PODIUM_FRAME` constant
    - Define `WINNING_CITY_TEAMS: TeamData[]` array with 6 Vienna team entries ordered by score descending
    - Team names: Team Alpha (17320), Team Bravo (16890), Team Charlie (15740), Team Delta (14200), Team Echo (13650), Team Foxtrot (12980)
    - All entries use `flag: "🇦🇹"`, `city: "Vienna Austria"`, `logoUrl: LOGO_MAP["AWS User Group Vienna"] ?? null`
    - Scores must be distinct and strictly descending by index
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 10.4_

  - [ ]* 1.2 Write property test: WINNING_CITY_TEAMS data validity (Property 3)
    - **Property 3: WINNING_CITY_TEAMS Data Validity**
    - Verify array has exactly 6 elements
    - Verify each element has `name` (string), `score` (number), `flag` (string), `city` (string), `logoUrl` (string | null)
    - Verify all scores are distinct and strictly descending by index
    - Verify every element's `city` field contains "Vienna"
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

  - [ ]* 1.3 Write property test: Phase timing validity (Property 8)
    - **Property 8: Phase Timing Validity**
    - Generate random valid timing configurations for `FULL_PODIUM_FRAME`, `TEAM_PODIUM_FRAME`, `PHASE_BOUNDARIES.revealEnd`
    - Verify `TEAM_PODIUM_FRAME - FULL_PODIUM_FRAME >= 1500`
    - Verify `PHASE_BOUNDARIES.revealEnd - TEAM_PODIUM_FRAME + 1 >= 1500`
    - Verify `FULL_PODIUM_FRAME >= PHASE_BOUNDARIES.revealStart` and `TEAM_PODIUM_FRAME <= PHASE_BOUNDARIES.revealEnd`
    - **Validates: Requirements 10.1, 10.2, 10.3**

- [x] 2. Implement PositionLabel component and getPodiumBarHeight utility
  - [x] 2.1 Create `PositionLabel` component in `03-GameDayStreamClosing-Audio.tsx`
    - Accepts `{ rank: number }` prop
    - For ranks 1, 2, 3: display medal emoji prefix (🥇, 🥈, 🥉) followed by `#N`
    - For ranks 4–6: display `#N` only
    - Styled as absolute-positioned badge at top-left: dark semi-transparent background, blur, rounded, white text, Inter font
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 2.2 Create `getPodiumBarHeight` utility function in `03-GameDayStreamClosing-Audio.tsx`
    - Signature: `function getPodiumBarHeight(teamScore: number, maxScore: number, maxBarHeight: number): number`
    - Formula: `Math.max(0.4, teamScore / maxScore) * maxBarHeight`
    - Ensures minimum bar height of 40% of max, maximum of 100% of max
    - Export for testing
    - _Requirements: 9.1, 9.2_

  - [ ]* 2.3 Write property test: Position label format (Property 2)
    - **Property 2: Position Label Format**
    - For any rank N in [1, 6], output string contains `#N`
    - For ranks 1, 2, 3: output additionally contains 🥇, 🥈, 🥉 respectively
    - For ranks 4–6: output does not contain medal emoji
    - **Validates: Requirements 2.2, 2.3, 8.3**

  - [ ]* 2.4 Write property test: Podium bar height correctness (Property 4)
    - **Property 4: Podium Bar Height Correctness**
    - Generate random positive `teamScore <= maxScore` and positive `maxBarHeight`
    - Verify result equals `Math.max(0.4, teamScore / maxScore) * maxBarHeight`
    - Verify result is always >= `0.4 * maxBarHeight` and <= `maxBarHeight`
    - **Validates: Requirements 9.1, 9.2**

  - [ ]* 2.5 Write property test: Podium bar ordering (Property 5)
    - **Property 5: Podium Bar Ordering**
    - Generate 3 distinct scores where `score[0] > score[1] > score[2]`
    - Compute bar heights using `getPodiumBarHeight`
    - Verify `height[0] > height[1] > height[2]`
    - **Validates: Requirements 6.2, 6.3, 6.4**

- [x] 3. Checkpoint - Verify constants, PositionLabel, and utility compile cleanly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Redesign Final Standings layout in RevealPhase
  - [x] 4.1 Rewrite the `isFullPodium` branch in `RevealPhase` to use 3+3 two-row layout
    - Replace the current `flexWrap` layout with two explicit rows
    - Top Row: positions 1, 2, 3 at `width: 280px` with medal-colored borders
    - Bottom Row: positions 4, 5, 6 at `width: 220px` with subtle `rgba(255,255,255,0.1)` borders
    - Both rows: `display: flex; justifyContent: center; gap: 20px`
    - Each card wrapper is `position: relative` to host the `PositionLabel` overlay
    - Rank 1: gold border (`GD_GOLD`) + gold glow drop-shadow
    - Rank 2: silver border (`#C0C0C0`)
    - Rank 3: bronze border (`#CD7F32`)
    - Width ratio: 280/220 = 1.27 (27% larger, satisfies ≥20% requirement)
    - Spring entry animation using existing `springConfig.entry`
    - Render from `FULL_PODIUM_FRAME` to `TEAM_PODIUM_FRAME - 1`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 4.2 Write property test: Layout width hierarchy and viewport fit (Property 1)
    - **Property 1: Layout Width Hierarchy and Viewport Fit**
    - Verify `TOP_CARD_WIDTH` is at least 1.2× `BOTTOM_CARD_WIDTH`
    - Verify total width of 3 top cards + gaps does not exceed 1280px
    - Verify total width of 3 bottom cards + gaps does not exceed 1280px
    - **Validates: Requirements 1.4, 3.1**

- [x] 5. Implement TeamPodiumReveal component
  - [x] 5.1 Create `TeamPodiumReveal` component with podium layout for top 3 teams
    - Accepts `{ frame: number }` prop
    - Compute `phaseFrame = frame - TEAM_PODIUM_FRAME` for spring entry animation
    - Render title "🏆 Team Podium — Vienna" in GD_GOLD
    - Top 3 teams in podium arrangement: 2nd (left), 1st (center), 3rd (right)
    - Each team has a `PodiumBar` behind the card with proportional height via `getPodiumBarHeight`
    - `MAX_BAR_HEIGHT = 180`, `MIN_BAR_RATIO = 0.4`
    - Podium bars use gradient from `GD_ACCENT` to `GD_PURPLE`
    - 1st place positioned highest (tallest bar), 2nd lower, 3rd lowest
    - Medal-colored borders on top 3 cards (gold/silver/bronze)
    - Each card has a `PositionLabel` overlay
    - Use `BackgroundLayer` and `HexGridOverlay` (no additional panel background)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 8.1, 8.3, 9.1, 9.2, 9.3_

  - [x] 5.2 Add bottom 3 teams row to `TeamPodiumReveal`
    - Render teams ranked 4th, 5th, 6th in a horizontal row below the podium section
    - Cards smaller than podium cards to maintain visual hierarchy
    - Each card displays: team name, score (locale-formatted), position label, user group logo (or flag fallback), city/country
    - Row horizontally centered within viewport
    - `PositionLabel` on each card
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4_

  - [ ]* 5.3 Write property test: Card content completeness (Property 6)
    - **Property 6: Card Content Completeness**
    - For any `TeamData` object, rendered card includes team name, city, numeric score, and position label
    - If `logoUrl` is non-null, card renders an image element with that URL
    - If `logoUrl` is null, card renders the flag emoji as fallback
    - **Validates: Requirements 7.3, 8.1, 8.4**

  - [ ]* 5.4 Write property test: Score display formatting (Property 7)
    - **Property 7: Score Display Formatting**
    - For any non-negative integer score, displayed string equals `score.toLocaleString()`
    - Verify locale-appropriate thousand separators (e.g., 17320 → "17,320")
    - **Validates: Requirements 8.2**

- [x] 6. Checkpoint - Verify TeamPodiumReveal renders correctly in isolation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Wire RevealPhase routing and phase timing
  - [x] 7.1 Update `RevealPhase` routing logic to include TeamPodiumReveal
    - Add `isTeamPodium = frame >= TEAM_PODIUM_FRAME` check before `isFullPodium`
    - When `isTeamPodium` is true: render `<TeamPodiumReveal frame={frame} />`
    - When `isFullPodium` is true (and not `isTeamPodium`): render the redesigned 3+3 Final Standings
    - Otherwise: render existing individual reveal logic (unchanged)
    - Spring animation entry on `TeamPodiumReveal` consistent with existing reveal style
    - _Requirements: 5.1, 5.2, 5.3, 10.1, 10.2, 10.3_

  - [ ]* 7.2 Write unit tests for frame routing and timing
    - Verify `frame < FULL_PODIUM_FRAME` → individual reveal
    - Verify `FULL_PODIUM_FRAME <= frame < TEAM_PODIUM_FRAME` → Final Standings (3+3 layout)
    - Verify `frame >= TEAM_PODIUM_FRAME` → Team Podium Reveal
    - Verify `FULL_PODIUM_FRAME = 13500`, `TEAM_PODIUM_FRAME = 15000`
    - Verify Final Standings duration = 1500 frames (50s), Team Podium duration = 3000 frames (100s)
    - Verify both fit within RevealPhase boundary (9000–17999)
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 8. Final checkpoint - Ensure all tests pass and composition compiles
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate the 8 correctness properties from the design document
- All changes are confined to `03-GameDayStreamClosing-Audio.tsx` (single-file approach)
- Tests should be placed in `__tests__/closing-podium-redesign.property.test.ts` using vitest + fast-check
- Pure utility functions (`getPodiumBarHeight`, PositionLabel logic) should be exported for direct testing
- Existing components (`TeamRevealCard`, `BackgroundLayer`, `HexGridOverlay`, `springConfig`) are reused, not modified
