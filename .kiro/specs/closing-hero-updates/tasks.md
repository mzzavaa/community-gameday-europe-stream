# Implementation Plan: Closing Hero Updates

## Overview

Eight targeted changes to the HeroIntro component (frames 0–899) in `03-GameDayStreamClosing-Audio.tsx`: stats corrections (suffix, new timezone stat, country count verification), Scene 3 messaging update, and organizer showcase expansion (2→8 organizers with color-coded borders and grid layout). All changes are in a single file with one new import from the design system.

## Tasks

- [x] 1. Import GD_ORANGE and expand ORGANIZERS array
  - [x] 1.1 Add GD_ORANGE to the design system import statement
    - Add `GD_ORANGE` to the existing import from `./shared/GameDayDesignSystem`
    - _Requirements: 7.1, 7.2_

  - [x] 1.2 Expand ORGANIZERS array from 2 to 8 entries with type field
    - Replace the current 2-entry ORGANIZERS array with 8 entries
    - Add `type: "community" | "aws"` field to each entry
    - All 8 organizers (Jerome, Anda, Andreas, Linda, Lucian, Manuel, Marcel, Mihaly) → `type: "community"`
    - The `"aws"` type is preserved in the union type for future use
    - New entries use placeholder values for role/city/flag ("TBD" / "🏳️")
    - Face paths follow pattern `AWSCommunityGameDayEurope/faces/{lowercase_name}.jpg`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 1.3 Write property test for organizer data integrity (Property 3)
    - **Property 3: Organizer data integrity**
    - Verify all 8 entries have required fields (name, role, city, flag, face, type)
    - Verify type is "community" or "aws"
    - Verify face path equals `"AWSCommunityGameDayEurope/faces/" + name.toLowerCase() + ".jpg"`
    - **Validates: Requirements 5.2, 5.3**

- [x] 2. Update STATS array and Scene 2 layout
  - [x] 2.1 Add "+" suffix to USER GROUPS stat and add TIMEZONES entry
    - Change USER GROUPS suffix from `""` to `"+"`
    - Add 5th stat: `{ value: 4, label: "TIMEZONES", suffix: "+", delay: 270 }`
    - Verify COUNTRIES stat uses `COUNTRIES.length` with `"+"` suffix (already correct)
    - _Requirements: 1.1, 1.2, 2.1, 2.3, 3.1, 3.2, 3.3_

  - [x] 2.2 Update Scene 2 layout from 2×2 grid to flex-wrap for 5 stats
    - Replace `display: "grid", gridTemplateColumns: "1fr 1fr"` with `display: "flex", flexWrap: "wrap", justifyContent: "center"`
    - Set `gap: "40px 60px"` and `maxWidth: 1100`
    - Expand accent colors array to 5: `[GD_ACCENT, GD_VIOLET, GD_PINK, GD_GOLD, GD_ORANGE]`
    - _Requirements: 2.2_

  - [ ]* 2.3 Write property test for stat delay stagger consistency (Property 1)
    - **Property 1: Stat delay stagger consistency**
    - For any pair of adjacent stats, delay difference must equal 20 frames
    - **Validates: Requirements 2.3**

  - [ ]* 2.4 Write property test for country count matching unique flags (Property 2)
    - **Property 2: Country count matches unique flags**
    - COUNTRIES.length must equal number of unique flag values in USER_GROUPS
    - STATS entry for "COUNTRIES" must use this dynamic value
    - **Validates: Requirements 3.1, 3.3**

- [x] 3. Update Scene 3 bottom text
  - [x] 3.1 Replace "NOT EMPLOYED BY AWS" with participating countries message
    - Change bottom text from `VOLUNTEERS • NOT EMPLOYED BY AWS • PURE COMMUNITY SPIRIT`
    - To template literal: `` `VOLUNTEERS • ACROSS ALL ${COUNTRIES.length}+ PARTICIPATING COUNTRIES • PURE COMMUNITY SPIRIT` ``
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 4. Redesign Scene 4 with color-coded grid layout
  - [x] 4.1 Replace Scene 4 organizer flex layout with 4×2 grid
    - Change from `display: "flex", gap: 60` to `display: "grid", gridTemplateColumns: "repeat(4, 1fr)"`
    - Set `gap: "24px 32px"` and `maxWidth: 1000`
    - Reduce face bubble from 140×140px to 90×90px
    - Reduce name font from 24px to 16px, role font to 11px, city font to 10px
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 4.2 Apply color-coded borders based on organizer type
    - Community organizers: `border: 3px solid ${GD_PURPLE}`, `boxShadow: 0 0 20px ${GD_VIOLET}40`
    - AWS supporters: `border: 3px solid ${GD_ORANGE}`, `boxShadow: 0 0 20px ${GD_ORANGE}40`
    - Replace current `GD_GOLD` border with type-based color logic
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 4.3 Remove separate Linda host section from Scene 4
    - Delete the "Host mention" block at the bottom of Scene 4 (Linda is now in ORGANIZERS array)
    - _Requirements: 5.1_

  - [ ]* 4.4 Write property test for border color determined by organizer type (Property 4)
    - **Property 4: Border color determined by organizer type**
    - For any organizer with type "community": border = GD_PURPLE, glow = GD_VIOLET
    - For any organizer with type "aws": border = GD_ORANGE, glow = GD_ORANGE
    - **Validates: Requirements 6.1, 6.2**

  - [ ]* 4.5 Write property test for Scene 4 layout fits viewport (Property 5)
    - **Property 5: Scene 4 layout fits viewport**
    - For N organizers in repeat(4, 1fr) grid with 90px bubbles, 24px row gap, 32px col gap
    - Total grid height + top offset must not exceed 720px
    - Total grid width must not exceed 1280px
    - **Validates: Requirements 8.1**

- [x] 5. Checkpoint — Verify all changes
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All changes are confined to `03-GameDayStreamClosing-Audio.tsx` (single file)
- The design system already exports `GD_ORANGE` — only the import in the composition needs updating
- Property tests use `fast-check` with Vitest
- Placeholder organizer data (TBD) is intentional per Requirement 5.4
