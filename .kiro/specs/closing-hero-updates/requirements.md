# Requirements Document

## Introduction

Updates to the HeroIntro section (frames 0–899) of the closing ceremony composition (`03-GameDayStreamClosing-Audio.tsx`). The changes affect Scene 2 (stats), Scene 3 (thank-you text), and Scene 4 (organizer showcase). The goal is to correct stat display values, improve the community acknowledgment messaging, and expand the organizer section to show all community organizers and AWS supporters with color-coded face bubbles (purple for community, orange for AWS).

## Glossary

- **Composition**: The `03-GameDayStreamClosing-Audio.tsx` Remotion component (1280×720, 30fps)
- **HeroIntro**: The component handling frames 0–899, containing 5 scenes within the Showcase phase
- **Scene_2**: Stats cascade (frames 180–379) displaying key event numbers in a 2×2 grid
- **Scene_3**: Flag parade (frames 380–549) showing country flags and a thank-you message to user group leaders
- **Scene_4**: Organizer showcase (frames 550–699) displaying organizer face bubbles with names and roles
- **STATS**: Array of stat objects `{ value, label, suffix, delay }` rendered as animated count-up numbers
- **ORGANIZERS**: Array of organizer objects with name, role, city, flag, face image path, and type
- **GD_PURPLE**: Design system color `#7c3aed` used for community organizer glow
- **GD_VIOLET**: Design system color `#8b5cf6` used as secondary community accent
- **GD_ORANGE**: Design system color `#f97316` used for AWS supporter glow
- **GD_GOLD**: Design system color `#fbbf24` used for celebration accents
- **Community_Organizer**: A user group leader who organized the event voluntarily (type: "community")
- **AWS_Supporter**: An AWS employee who supported the event organization (type: "aws") — preserved for future use; currently all 8 organizers are community type
- **Face_Bubble**: A circular image element showing an organizer's face with a colored glowing border
- **CountUp**: Existing animated number component that counts from 0 to a target value

## Requirements

### Requirement 1: Add "+" Suffix to User Groups Stat

**User Story:** As a stream viewer, I want the user groups count to show "53+" instead of "53", so that it reflects that some groups do joint events and the actual participation is higher.

#### Acceptance Criteria

1. WHEN Scene_2 renders, THE STATS entry for "USER GROUPS" SHALL display the suffix "+" after the numeric value
2. THE STATS entry for "USER GROUPS" SHALL have its `suffix` property set to `"+"` instead of `""`

### Requirement 2: Add Timezones Stat

**User Story:** As a stream viewer, I want to see a "4+ TIMEZONES" stat, so that the geographic spread of the event is highlighted.

#### Acceptance Criteria

1. THE STATS array SHALL contain a fifth entry with value `4`, label `"TIMEZONES"`, and suffix `"+"`
2. WHEN Scene_2 renders, THE Composition SHALL display all five stats in a layout that accommodates the additional stat without overflow
3. THE new TIMEZONES stat SHALL animate with a delay consistent with the existing stagger pattern (delay after the last current stat)

### Requirement 3: Verify Country Count Display

**User Story:** As a stream viewer, I want the country count to be accurate, so that the displayed number matches the actual unique countries from the data.

#### Acceptance Criteria

1. THE STATS entry for "COUNTRIES" SHALL derive its value dynamically from `COUNTRIES.length` (computed as unique flags from USER_GROUPS)
2. THE STATS entry for "COUNTRIES" SHALL retain the "+" suffix
3. WHEN the USER_GROUPS data contains 24 unique country flags, THE displayed country count SHALL show "24+"

### Requirement 4: Update Scene 3 Bottom Text

**User Story:** As a stream viewer, I want the thank-you message to emphasize the pan-European community effort across all participating countries, instead of stating employment status.

#### Acceptance Criteria

1. THE Scene_3 bottom text SHALL NOT contain the phrase "NOT EMPLOYED BY AWS"
2. THE Scene_3 bottom text SHALL reference all participating countries (e.g., "ACROSS ALL 24+ PARTICIPATING COUNTRIES")
3. THE Scene_3 bottom text SHALL retain the "VOLUNTEERS" and "PURE COMMUNITY SPIRIT" phrases with bullet separators

### Requirement 5: Expand Organizers Array with All Faces

**User Story:** As a stream viewer, I want to see all community organizers and AWS supporters displayed in Scene 4, so that everyone who contributed is recognized.

#### Acceptance Criteria

1. THE ORGANIZERS array SHALL include entries for all available face images: Jerome, Anda, Andreas, Linda, Lucian, Manuel, Marcel, and Mihaly (all 8 are community type)
2. Each ORGANIZERS entry SHALL have properties: `name` (string), `role` (string), `city` (string), `flag` (string), `face` (string path), and `type` ("community" | "aws"). The `type` union is preserved for future use; currently all entries use `type: "community"`
3. THE face image path for each organizer SHALL follow the pattern `AWSCommunityGameDayEurope/faces/{lowercase_name}.jpg`
4. WHEN the user provides country assignments later, THE ORGANIZERS entries SHALL be updatable with correct flag and city values without structural changes

### Requirement 6: Color-Coded Face Bubble Borders

**User Story:** As a stream viewer, I want community organizers to have purple-glowing face bubbles and AWS supporters to have orange-glowing face bubbles, so that I can visually distinguish who is community and who is AWS.

#### Acceptance Criteria

1. WHEN an organizer has `type: "community"`, THE Face_Bubble border and box-shadow SHALL use GD_PURPLE (`#7c3aed`) or GD_VIOLET (`#8b5cf6`)
2. WHEN an organizer has `type: "aws"`, THE Face_Bubble border and box-shadow SHALL use GD_ORANGE (`#f97316`). Currently all 8 organizers are community type; the aws color path is preserved for future use
3. THE Face_Bubble glow effect SHALL be visible as a `box-shadow` with sufficient spread to create a shining/glowing appearance around the circular image
4. THE border color distinction SHALL be clearly visible at 1280×720 resolution

### Requirement 7: Import GD_ORANGE into Composition

**User Story:** As a developer, I want GD_ORANGE imported in the composition file, so that the AWS supporter color coding can be applied.

#### Acceptance Criteria

1. THE Composition import statement from `./shared/GameDayDesignSystem` SHALL include `GD_ORANGE`
2. WHEN GD_ORANGE is referenced in the organizer rendering logic, THE Composition SHALL resolve it to `#f97316`

### Requirement 8: Scene 4 Layout Accommodates Multiple Organizers

**User Story:** As a stream viewer, I want all organizers to fit on screen without overlap, so that every face and name is clearly visible.

#### Acceptance Criteria

1. WHEN Scene_4 renders with 8 organizers, THE layout SHALL display all face bubbles without overlapping or clipping outside the 1280×720 viewport
2. THE Face_Bubble size SHALL be reduced proportionally if needed to fit all organizers (smaller than the current 140×140px for 2 organizers)
3. THE organizer names and roles SHALL remain legible at the reduced size
4. THE layout SHALL use a grid or wrapped flex arrangement that distributes organizers evenly across the available space
