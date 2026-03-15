# Requirements Document

## Introduction

Complete redesign of the closing ceremony Remotion composition (`03-GameDayStreamClosing-Audio.tsx`). The composition is 1280×720 at 30fps, 27000 frames (15 minutes). The current design has broken circular logo crops, overlapping timers, and confusing numbered columns. The redesign introduces a four-phase cinematic flow: a user group showcase celebrating all 53+ participating communities, a suspenseful podium shuffle preview, a dramatic winner reveal from 6th to 1st place, and a thank-you finale. The composition reuses data and patterns from `archive/CommunityGamedayEuropeV4.tsx` (LOGO_MAP, USER_GROUPS, CardCoverV4 landscape rendering) and the shared design system.

## Glossary

- **Composition**: The `03-GameDayStreamClosing-Audio.tsx` Remotion component (1280×720, 30fps, 27000 frames / 15 minutes)
- **USER_GROUPS**: Array of 53 participating user group entries with `{ flag, name, city }` from `archive/CommunityGamedayEuropeV4.tsx`
- **LOGO_MAP**: A `Record<string, string>` mapping 48 user group names to logo image URLs from `archive/CommunityGamedayEuropeV4.tsx`
- **CardCoverV4**: Component from archive that renders user group logos at landscape aspect ratio (600:337) with `objectFit: "contain"` — the correct rendering approach
- **GlassCard**: Frosted-glass card component from the design system with blur backdrop and subtle border
- **Showcase_Phase**: Frames 0–7199 (4 minutes) — animated celebration of all 53+ participating user groups
- **Shuffle_Phase**: Frames 7200–8999 (1 minute) — animated podium with random user groups cycling through to build suspense
- **Reveal_Phase**: Frames 9000–17999 (~5 minutes) — winners revealed one by one from 6th to 1st place, then all together
- **ThankYou_Phase**: Frames 18000–26999 (~5 minutes) — thank-you message with celebration, fading to dark
- **PODIUM_TEAMS**: Array of 6 TeamData entries (name, flag, city, score, logoUrl) representing the final podium results
- **Segment_Transition_Flash**: A brief gold/violet gradient flash overlay triggered at phase boundaries
- **AudioBadge**: Bottom-right "AUDIO ON" indicator from the design system
- **BackgroundLayer**: Full-viewport background image with configurable darkening overlay from the design system
- **HexGridOverlay**: Subtle hexagonal grid pattern overlay from the design system
- **Results_Countdown**: A small, non-overlapping countdown timer showing time until the winner reveal begins

## Requirements

### Requirement 1: Export USER_GROUPS from Archive

**User Story:** As a developer, I want USER_GROUPS exported from the archive module, so that the closing ceremony composition can import and display all 53 participating user groups.

#### Acceptance Criteria

1. THE archive module (`archive/CommunityGamedayEuropeV4.tsx`) SHALL export the USER_GROUPS array with the `export` keyword
2. THE USER_GROUPS array SHALL contain all 53 user group entries, each with `flag`, `name`, and `city` string properties
3. WHEN the Composition imports USER_GROUPS, THE Composition SHALL receive the complete array without modification

### Requirement 2: Remove Obsolete UI Elements

**User Story:** As a stream viewer, I want the cluttered UI elements removed, so that the closing ceremony feels like a clean cinematic experience rather than a dashboard.

#### Acceptance Criteria

1. THE Composition SHALL render without the PhaseMarker component (bottom-left phase indicator with progress bar)
2. THE Composition SHALL render without any large "Event Ends In" countdown timer
3. THE Composition SHALL render without the Schedule_Sidebar (right-side panel with ScheduleCard components)
4. THE Composition SHALL render without the old LogoCarousel that uses circular image crops and numbered columns
5. WHEN the Composition renders at any frame between 0 and 26999, THE Composition SHALL not display any of the four removed elements listed above

### Requirement 3: Retain Core Visual Infrastructure

**User Story:** As a stream viewer, I want the background, hex grid, audio badge, and transition flash retained, so that the closing ceremony maintains visual consistency with the other stream compositions.

#### Acceptance Criteria

1. THE Composition SHALL display the BackgroundLayer component with darkening overlay throughout all 27000 frames
2. THE Composition SHALL display the HexGridOverlay component throughout all 27000 frames
3. THE Composition SHALL display the AudioBadge component at the bottom-right position with `muted={false}` throughout all 27000 frames
4. WHEN a phase boundary is crossed (frames 0, 7200, 9000, 18000), THE Composition SHALL display the Segment_Transition_Flash as a brief gold/violet gradient overlay lasting approximately 60 frames

### Requirement 4: User Group Showcase Phase

**User Story:** As a stream viewer, I want to see all 53+ participating user groups celebrated with their logos, flags, and city names during the first 4 minutes, so that every community feels recognized and attendees can film the moment for social media.

#### Acceptance Criteria

1. WHILE the current frame is within the Showcase_Phase (frames 0–7199), THE Composition SHALL display user group cards for all entries in the USER_GROUPS array
2. THE Composition SHALL render each user group card as a GlassCard containing the group logo at landscape aspect ratio (600:337) using `objectFit: "contain"`, the country flag emoji displayed prominently, the group name, and the city name
3. THE Composition SHALL display user group cards in a paginated grid layout showing 6 cards per page in a 3×2 arrangement, consistent with the GroupsScrollSceneV4 pattern from the archive
4. THE Composition SHALL animate between pages of user group cards using spring-based transitions with staggered entry for each card
5. THE Composition SHALL cycle through all pages of user group cards at a pace that allows each page to be visible for a minimum of 4 seconds (120 frames) before transitioning
6. THE Composition SHALL display all 53 user group entries at least once during the Showcase_Phase
7. THE Composition SHALL look up each user group logo from the LOGO_MAP using the group name as key, and handle missing logos gracefully by displaying a placeholder with the group flag
8. WHEN the Showcase_Phase ends (frame 7200), THE Composition SHALL stop displaying the user group showcase cards

### Requirement 5: Results Countdown During Showcase

**User Story:** As a stream viewer, I want a small countdown timer visible during the showcase phase, so that I know when the results will be revealed.

#### Acceptance Criteria

1. WHILE the current frame is within the Showcase_Phase (frames 0–7199), THE Composition SHALL display the Results_Countdown timer
2. THE Results_Countdown SHALL display time remaining until the Reveal_Phase, calculated as `(9000 - currentFrame) / 30` seconds, formatted using the `formatTime` utility
3. THE Results_Countdown SHALL use a compact visual style positioned in a corner or edge area that does not overlap user group cards
4. WHEN the Showcase_Phase ends (frame 7200), THE Results_Countdown SHALL stop displaying

### Requirement 6: Podium Shuffle Preview Phase

**User Story:** As a stream viewer, I want to see an animated podium with random user groups cycling through during the 1-minute shuffle phase, so that maximum suspense builds before the actual winner reveal.

#### Acceptance Criteria

1. WHILE the current frame is within the Shuffle_Phase (frames 7200–8999), THE Composition SHALL display an animated podium with 6 positions
2. THE Composition SHALL cycle random user groups from the USER_GROUPS array through each podium position, showing different group names, flags, and fictitious scores on each cycle
3. THE Composition SHALL animate podium bars growing and shrinking dynamically as different groups appear in each position
4. THE Composition SHALL display fictitious scores that change on each shuffle cycle, using random values within a plausible range (3000–5000)
5. THE Composition SHALL start the shuffle animation at a fast pace (cycling every 10–15 frames) and progressively slow down toward the end of the Shuffle_Phase, with the final cycle lasting approximately 60 frames
6. WHEN the Shuffle_Phase ends (frame 9000), THE Composition SHALL freeze the podium display and transition to the Reveal_Phase

### Requirement 7: Winner Reveal Phase — Sequential Placement Reveals

**User Story:** As a stream viewer, I want winners revealed one by one from 6th place to 1st place with dramatic animations, so that the announcement builds excitement and each team gets their moment of recognition.

#### Acceptance Criteria

1. WHEN the current frame reaches 9000, THE Composition SHALL begin the Reveal_Phase by revealing the 6th place team from PODIUM_TEAMS
2. THE Composition SHALL reveal each placement at the following frame offsets: 6th place at frame 9000, 5th place at frame 9600, 4th place at frame 10200, 3rd place at frame 10800, 2nd place at frame 11700, 1st place at frame 12600
3. THE Composition SHALL animate each team reveal with a spring-based entry animation for the team card, including the team name, flag, city, logo at landscape aspect ratio, and score
4. THE Composition SHALL animate each team score with a counting-up animation from 0 to the final score value over approximately 60 frames (2 seconds)
5. THE Composition SHALL animate podium bars growing upward with spring animations, with bar height proportional to the team score
6. THE Composition SHALL give 3rd, 2nd, and 1st place reveals longer display durations (900 frames for 3rd and 2nd, 900 frames for 1st) compared to 6th, 5th, and 4th place (600 frames each)
7. THE Composition SHALL make the 1st place reveal the most dramatic moment with enhanced animation effects (larger scale, additional glow, celebration particles or emphasis)
8. WHEN the current frame reaches 13500, THE Composition SHALL display all 6 teams together on the complete podium for the remaining duration of the Reveal_Phase

### Requirement 8: Thank You and Fade-Out Phase

**User Story:** As a stream viewer, I want a thank-you message displayed after the winner reveal with a smooth fade to dark at the end, so that the stream concludes gracefully.

#### Acceptance Criteria

1. WHEN the current frame reaches 18000, THE Composition SHALL display a "Thank You" message with spring-based entry animation
2. THE Composition SHALL display the text "AWS Community GameDay Europe" as a subtitle above the main "Thank You" heading
3. THE Composition SHALL display a closing message such as "See you at the next GameDay!" below the heading
4. WHILE the current frame is between 26910 and 26999, THE Composition SHALL apply a fade-to-dark overlay with opacity interpolating from 0 to 1 over the final 90 frames
5. WHEN the current frame reaches 26999, THE Composition SHALL display a fully opaque black overlay

### Requirement 9: Landscape Logo Rendering

**User Story:** As a developer, I want all user group logos rendered at their actual landscape aspect ratio, so that logos are displayed correctly without circular cropping distortion.

#### Acceptance Criteria

1. THE Composition SHALL render every user group logo using `objectFit: "contain"` within a container at landscape aspect ratio (600:337), consistent with the CardCoverV4 pattern
2. THE Composition SHALL not apply `borderRadius: 50%` or any circular clipping to user group logo images at any frame
3. WHEN a user group has no matching entry in LOGO_MAP, THE Composition SHALL display a styled placeholder containing the group country flag at large size instead of a broken image

### Requirement 10: Phase Gating Correctness

**User Story:** As a developer, I want each phase to display only its designated content at the correct frame ranges, so that there are no visual overlaps or premature reveals.

#### Acceptance Criteria

1. WHILE the current frame is in the Showcase_Phase (0–7199), THE Composition SHALL display only the user group showcase, Results_Countdown, BackgroundLayer, HexGridOverlay, and AudioBadge
2. WHILE the current frame is in the Shuffle_Phase (7200–8999), THE Composition SHALL display only the podium shuffle animation, BackgroundLayer, HexGridOverlay, and AudioBadge
3. WHILE the current frame is in the Reveal_Phase (9000–17999), THE Composition SHALL display only the winner reveal podium, BackgroundLayer, HexGridOverlay, and AudioBadge
4. WHILE the current frame is in the ThankYou_Phase (18000–26999), THE Composition SHALL display only the thank-you message, fade-to-dark overlay (in final 90 frames), BackgroundLayer, HexGridOverlay, and AudioBadge
5. FOR ALL frames between 0 and 26999, THE Composition SHALL display exactly one phase-specific content layer at any given frame

### Requirement 11: Visual QA via Playwright Screenshots

**User Story:** As a developer, I want to verify the visual output at key frames using Playwright screenshots in Remotion Studio, so that each phase renders correctly before moving on.

#### Acceptance Criteria

1. WHEN an implementation task is completed, THE developer SHALL start Remotion Studio, navigate to the GameDayClosing composition, and take Playwright screenshots at the following key frames: frame 0 (showcase start), frame 3600 (showcase mid), frame 7200 (shuffle start), frame 8700 (shuffle slow-down), frame 9000 (6th place reveal), frame 12600 (1st place reveal), frame 13500 (full podium), frame 18000 (thank you), frame 26950 (fade to dark)
2. WHEN a screenshot is taken, THE developer SHALL verify that only the expected phase content is visible and no elements from other phases are present

### Requirement 12: Property-Based Testing

**User Story:** As a developer, I want property-based tests that verify phase gating and logo completeness, so that the composition logic is provably correct across all frame ranges.

#### Acceptance Criteria

1. THE test suite SHALL include a property-based test that verifies for any random frame in range 0–26999, exactly one phase is active and the correct content is gated
2. THE test suite SHALL include a property-based test that verifies all 53 user group entries from USER_GROUPS are displayed at least once during the Showcase_Phase (frames 0–7199)
3. THE test suite SHALL include a property-based test that verifies no PODIUM_TEAMS data is visible before frame 9000 (the Reveal_Phase start)
4. WHEN any test in the existing test suite is executed, THE test SHALL continue to pass without modification (no regressions)
