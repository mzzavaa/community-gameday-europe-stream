# Requirements Document

## Introduction

Redesign of the Final Standings slide and addition of a new Team Podium Reveal slide in the closing ceremony composition (`03-GameDayStreamClosing-Audio.tsx`). The current Final Standings shows 6 user group cards in a flat 5+1 layout with no position numbers. The redesign introduces a tiered 3+3 layout with explicit position labels and visual hierarchy. A new slide is added after Final Standings to reveal the top 6 teams within the winning user group's city, displayed in a proportional podium-style layout. The composition is 1280×720 at 30fps using Remotion.

## Glossary

- **Composition**: The `03-GameDayStreamClosing-Audio.tsx` Remotion component (1280×720, 30fps)
- **Final_Standings**: The slide shown at `FULL_PODIUM_FRAME` (frame 13500+) displaying all 6 user groups with their final rankings
- **Team_Podium_Reveal**: A new slide inserted after Final_Standings that shows the top 6 teams within the winning user group's city
- **PODIUM_TEAMS**: The existing array of 6 `TeamData` objects representing user groups ranked 1st through 6th
- **Team**: A sub-group within a user group city; multiple teams compete per city
- **Winning_City_Teams**: The top 6 teams from the 1st-place user group's city, ordered by score descending
- **Position_Label**: A visual badge showing the rank number (e.g., "#1", "#2") on each card
- **Top_Row**: The first row of the Final_Standings layout containing positions 1, 2, and 3
- **Bottom_Row**: The second row of the Final_Standings layout containing positions 4, 5, and 6
- **Podium_Bar**: A vertical bar behind a team card whose height is proportional to the team's score relative to the highest score
- **BackgroundLayer**: Shared design system component providing the dark background image with overlay
- **HexGridOverlay**: Shared design system component providing the subtle hex pattern overlay
- **GD_GOLD**: Design system color `#fbbf24` used for 1st place accents
- **GD_PURPLE**: Design system color `#6c3fa0` used for podium bar gradients
- **GD_ACCENT**: Design system color `#c084fc` used for secondary accents
- **RevealPhase**: The existing component (frames 9000–17999) that handles the reveal sequence
- **TeamRevealCard**: The existing card component used to display a team/group with logo, name, city, and score

## Requirements

### Requirement 1: Final Standings Two-Row Layout

**User Story:** As a stream viewer, I want the Final Standings to display in two rows of three, so that the layout is balanced and the top 3 are visually prominent.

#### Acceptance Criteria

1. WHEN the Final_Standings slide renders at `FULL_PODIUM_FRAME`, THE Composition SHALL display 6 user group cards in two rows: Top_Row (positions 1, 2, 3) and Bottom_Row (positions 4, 5, 6)
2. THE Top_Row cards SHALL have a larger width than the Bottom_Row cards to create visual hierarchy between the top 3 and positions 4–6
3. THE Top_Row and Bottom_Row SHALL each be horizontally centered within the 1280px viewport
4. THE layout SHALL fit within the 1280×720 viewport without clipping or overflow

### Requirement 2: Position Labels on Final Standings Cards

**User Story:** As a stream viewer, I want each card to show its position number, so that I can immediately identify each group's ranking.

#### Acceptance Criteria

1. WHEN the Final_Standings slide renders, THE Composition SHALL display a Position_Label on each of the 6 user group cards
2. THE Position_Label SHALL show the format "#N" where N is the rank (1 through 6)
3. THE Position_Label for positions 1, 2, and 3 SHALL use medal emoji prefixes (🥇, 🥈, 🥉 respectively)
4. THE Position_Label SHALL be positioned at the top-left corner of each card and be legible at 1280×720 resolution

### Requirement 3: Visual Hierarchy for Top 3 Cards

**User Story:** As a stream viewer, I want the top 3 cards to be visually bigger and more prominent, so that the winners stand out from positions 4–6.

#### Acceptance Criteria

1. THE Top_Row cards (positions 1, 2, 3) SHALL have a width at least 20% larger than the Bottom_Row cards (positions 4, 5, 6)
2. THE 1st place card SHALL have a gold border using GD_GOLD color
3. THE 2nd place card SHALL have a silver border (#C0C0C0)
4. THE 3rd place card SHALL have a bronze border (#CD7F32)
5. THE 1st place card SHALL have a gold glow drop-shadow effect to further distinguish the winner

### Requirement 4: Team Podium Reveal Data Model

**User Story:** As a developer, I want a data structure for the winning city's teams, so that the Team Podium Reveal slide can render team-level results.

#### Acceptance Criteria

1. THE Composition SHALL define a `WINNING_CITY_TEAMS` array containing 6 team objects ordered by score descending
2. Each team object SHALL include: `name` (string), `score` (number), `flag` (string), `city` (string), and `logoUrl` (string or null)
3. THE team data SHALL represent teams from the 1st-place user group's city (Vienna)
4. THE `score` values SHALL be distinct and ordered such that index 0 has the highest score and index 5 has the lowest

### Requirement 5: Team Podium Reveal Slide Placement

**User Story:** As a stream viewer, I want the Team Podium Reveal to appear after the Final Standings, so that the ceremony builds from group-level to team-level results.

#### Acceptance Criteria

1. THE Team_Podium_Reveal slide SHALL render after the Final_Standings slide within the RevealPhase timeline
2. THE Team_Podium_Reveal SHALL have a dedicated frame range between the Final_Standings end and the ThankYou phase start (frame 18000)
3. THE transition from Final_Standings to Team_Podium_Reveal SHALL use a spring animation entry consistent with the existing reveal animation style
4. THE Team_Podium_Reveal SHALL use the existing BackgroundLayer and HexGridOverlay (no additional panel or container background)

### Requirement 6: Podium Layout for Top 3 Teams

**User Story:** As a stream viewer, I want the top 3 teams displayed in a podium arrangement, so that the visual layout reflects the classic 1st-2nd-3rd podium style.

#### Acceptance Criteria

1. THE Team_Podium_Reveal SHALL display the top 3 teams in a podium arrangement: 2nd place on the left, 1st place in the center, 3rd place on the right
2. THE 1st place team SHALL be positioned highest (tallest Podium_Bar)
3. THE 2nd place team SHALL be positioned lower than 1st but higher than 3rd
4. THE 3rd place team SHALL be positioned lower than 2nd
5. THE Podium_Bar heights SHALL be proportional to each team's score relative to the highest score among the top 3
6. THE 1st place card SHALL have a gold/orange border using GD_GOLD, the 2nd place card SHALL have a silver border, and the 3rd place card SHALL have a bronze border

### Requirement 7: Bottom 3 Teams Row

**User Story:** As a stream viewer, I want positions 4, 5, and 6 displayed in a flat row below the podium, so that all top 6 teams are visible.

#### Acceptance Criteria

1. THE Team_Podium_Reveal SHALL display teams ranked 4th, 5th, and 6th in a horizontal row below the podium section
2. THE Bottom_Row team cards SHALL be smaller than the podium cards to maintain visual hierarchy
3. Each Bottom_Row card SHALL display the team name, score, position label, user group logo, and city/country
4. THE Bottom_Row SHALL be horizontally centered within the viewport

### Requirement 8: Team Card Content

**User Story:** As a stream viewer, I want each team card to show the team name, score, position, logo, and location, so that I can identify each team.

#### Acceptance Criteria

1. Each team card on the Team_Podium_Reveal SHALL display: user group logo (or flag fallback), city, country, team name, and numeric score
2. THE score SHALL be displayed with locale-formatted number separators (e.g., "17,320")
3. THE Position_Label ("#1" through "#6") SHALL be visible on each team card
4. WHEN a team has a `logoUrl`, THE card SHALL display the logo image; IF the `logoUrl` is null, THEN THE card SHALL display the team's flag emoji as a fallback

### Requirement 9: Podium Bar Proportional Heights

**User Story:** As a stream viewer, I want the podium bar heights to reflect actual score differences, so that the visual representation is honest and proportional.

#### Acceptance Criteria

1. THE Podium_Bar height for each of the top 3 teams SHALL be calculated as `(teamScore / maxScore) * maxBarHeight` where `maxScore` is the highest score among the top 3
2. THE minimum Podium_Bar height SHALL be at least 40% of the maximum bar height to ensure all bars are visually meaningful
3. THE Podium_Bar SHALL use a gradient from GD_ACCENT to GD_PURPLE consistent with the existing design system

### Requirement 10: Phase Timing Adjustment

**User Story:** As a developer, I want the reveal phase timing to accommodate both the Final Standings and the Team Podium Reveal, so that both slides have adequate screen time.

#### Acceptance Criteria

1. THE Final_Standings slide SHALL render for a minimum of 1500 frames (50 seconds) starting at `FULL_PODIUM_FRAME`
2. THE Team_Podium_Reveal slide SHALL render for a minimum of 1500 frames (50 seconds) after the Final_Standings ends
3. THE combined Final_Standings and Team_Podium_Reveal duration SHALL fit within the existing RevealPhase boundary (frames 9000–17999)
4. THE `PHASE_BOUNDARIES` and related constants SHALL be updated to reflect the new timing without affecting other phases
