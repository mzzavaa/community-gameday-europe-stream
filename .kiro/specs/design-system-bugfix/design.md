# Design System Bugfix Design

## Overview

Two bugs affect visual consistency across the GameDay Remotion compositions:

1. **AWS organizer color mismatch**: In `03-GameDayStreamClosing-Audio.tsx` Scene 4b ("Thank You, AWS"), all AWS supporter elements use `GD_ACCENT` (#c084fc, purple) instead of `GD_ORANGE` (#f97316). The data model already has `type: "aws"` on these organizers — the color just needs switching. Similarly, `OrganizersMarketingVideo.tsx` does not render AWS supporters at all yet, but the "Thank You, AWS" section title and supporter text in the closing file use the wrong color.

2. **Inconsistent typography**: No standardized typography scale exists. Ad-hoc font sizes (9–104px) are scattered across all compositions. A proper scale should be defined in `shared/GameDayDesignSystem.tsx` and adopted across compositions.

The fix approach is minimal: switch color references for AWS supporters, define a typography scale as exported constants, and replace ad-hoc `fontSize` values with scale references.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug — when AWS supporters are rendered with `GD_ACCENT` instead of `GD_ORANGE`, or when ad-hoc font sizes are used instead of a standardized scale
- **Property (P)**: The desired behavior — AWS supporters use `GD_ORANGE` for their distinctive elements; all text uses named typography scale values
- **Preservation**: Existing community organizer colors, component rendering, and visual layout must remain unchanged
- **Scene 4b**: The "Thank You, AWS" section in `03-GameDayStreamClosing-Audio.tsx` (frames 1010–1399) that renders `AWS_SUPPORTERS`
- **GD_ACCENT**: Purple accent color `#c084fc` — correct for community organizers, incorrect for AWS supporters
- **GD_ORANGE**: Orange color `#f97316` — correct for AWS supporters
- **Typography Scale**: A set of named font size constants (h1–h6, body, caption, label, overline) exported from the design system

## Bug Details

### Bug Condition

**Bug 1 — AWS Color Mismatch:**
The bug manifests when AWS supporters (`type: "aws"`) are rendered in Scene 4b of the closing ceremony. The section title "Thank You, AWS" uses `GD_ACCENT`, the card `boxShadow` and `border` use `GD_ACCENT`, and the supporter's country text uses `GD_ACCENT` — all should be `GD_ORANGE`.

**Formal Specification:**
```
FUNCTION isBugCondition_Color(element)
  INPUT: element of type { organizer: Organizer, property: "title" | "border" | "glow" | "countryText" | "roleText", file: string }
  OUTPUT: boolean

  RETURN element.organizer.type == "aws"
         AND element.file IN ["03-GameDayStreamClosing-Audio.tsx", "OrganizersMarketingVideo.tsx"]
         AND element.property IN ["title", "border", "glow", "countryText"]
         AND currentColor(element) == GD_ACCENT
         AND expectedColor(element) == GD_ORANGE
END FUNCTION
```

**Bug 2 — Typography Inconsistency:**
The bug manifests when any composition renders text with a hardcoded pixel font size instead of a named typography scale constant.

**Formal Specification:**
```
FUNCTION isBugCondition_Typography(element)
  INPUT: element of type { fontSize: number, file: string }
  OUTPUT: boolean

  RETURN element.fontSize is a raw number literal
         AND NOT exists(TYPOGRAPHY_SCALE[name] == element.fontSize for some name)
         AND element.file IN compositionFiles
END FUNCTION
```

### Examples

- Scene 4b title "Thank You, AWS" renders in purple (`GD_ACCENT` = #c084fc) — should be orange (`GD_ORANGE` = #f97316)
- Scene 4b AWS supporter card border uses `GD_ACCENT` for `boxShadow` — should use `GD_ORANGE`
- Scene 4b AWS supporter country text uses `GD_ACCENT` — should use `GD_ORANGE`
- `fontSize: 104` in Scene 1 "WHAT. A. DAY." has no named constant — should reference `TYPOGRAPHY.h1` or similar
- `fontSize: 17` in Scene 2 stat labels is an unusual size with no semantic name — should map to a scale value

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Community organizers (`type: "community"`) in Scene 4 must continue using `GD_ACCENT`/`GD_VIOLET`/`GD_PURPLE` for card glow and text
- Community organizers in `04-GameDayStreamPreShowInfo-Muted.tsx` must continue using `GD_ACCENT` for role text and `GD_PURPLE` for card border
- All existing color constants (`GD_DARK`, `GD_PURPLE`, `GD_VIOLET`, `GD_PINK`, `GD_ACCENT`, `GD_ORANGE`, `GD_GOLD`) must remain exported with unchanged values
- All existing components (`BackgroundLayer`, `HexGridOverlay`, `GlassCard`, `AudioBadge`) must render identically
- `04-GameDayStreamPreShowInfo-Muted.tsx` already correctly uses `GD_ORANGE` for AWS supporters — this must remain unchanged
- Visual output of all compositions must remain pixel-identical after typography scale adoption (same numeric values, just referenced by name)

**Scope:**
All inputs that do NOT involve AWS supporter color rendering or font size references should be completely unaffected by this fix. This includes:
- Animation timing and spring configurations
- Layout positioning and spacing
- All non-text visual elements (backgrounds, borders, images)
- Audio badge behavior
- Phase transitions and frame boundaries

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Hardcoded GD_ACCENT in Scene 4b**: The "Thank You, AWS" section was likely copy-pasted from the community organizers section (Scene 4) and the color references were not updated to `GD_ORANGE` for the AWS-specific section. Specifically:
   - Line with `color: GD_ACCENT` for the "Thank You, AWS" title
   - Line with `boxShadow: ...${GD_ACCENT}50...` and `border: ...${GD_ACCENT}40` for supporter card styling
   - Line with `color: GD_ACCENT` for supporter country text

2. **OrganizersMarketingVideo.tsx missing AWS section**: The marketing video only renders `ORGANIZERS` (community type) and does not include `AWS_SUPPORTERS` at all. No color bug exists here since AWS supporters aren't rendered, but the requirements mention it should also use `GD_ORANGE` if/when AWS supporters are added.

3. **No typography system defined**: The design system file (`shared/GameDayDesignSystem.tsx`) exports colors, timing constants, spring configs, and UI components but has no typography scale. Each composition author picked font sizes ad-hoc, resulting in 20+ distinct sizes across the codebase.


## Correctness Properties

Property 1: Bug Condition - AWS Supporter Color Uses GD_ORANGE

_For any_ element rendered for an organizer with `type: "aws"` in Scene 4b of `03-GameDayStreamClosing-Audio.tsx`, the fixed code SHALL use `GD_ORANGE` (#f97316) for the section title color, card border/glow colors, and supporter country/role text color, instead of `GD_ACCENT`.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation - Community Organizer Colors Unchanged

_For any_ element rendered for an organizer with `type: "community"` in any composition, the fixed code SHALL produce the same color values as the original code, preserving `GD_ACCENT`/`GD_VIOLET`/`GD_PURPLE` usage for community organizer styling.

**Validates: Requirements 3.1, 3.2, 3.3**

Property 3: Bug Condition - Typography Scale Defined

_For any_ reference to the design system typography, the fixed code SHALL export a complete typography scale object from `shared/GameDayDesignSystem.tsx` with named sizes mapping to specific pixel values covering h1–h6, body, caption, label, and overline categories.

**Validates: Requirements 2.3**

Property 4: Preservation - Visual Output Unchanged After Typography Adoption

_For any_ composition that adopts the typography scale constants, the fixed code SHALL produce the same rendered font sizes as the original code, ensuring the scale values match the previously hardcoded pixel values exactly.

**Validates: Requirements 2.4, 3.4**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `shared/GameDayDesignSystem.tsx`

**Changes**:
1. **Add Typography Scale**: Export a `TYPOGRAPHY` constant object with named font sizes:
   - `h1: 104` — hero/dramatic headlines (Scene 1 "WHAT. A. DAY.")
   - `h2: 72` — major section titles ("THE RESULTS", "Thank You")
   - `h3: 42` — section headings ("From the Community...", "USER GROUP LEADER")
   - `h4: 36` — sub-section titles ("Thank You, AWS", stream host name)
   - `h5: 28` — emphasized text (date, organizer names)
   - `h6: 24` — card titles, speaker names
   - `body: 20` — primary body text, info card text
   - `bodySmall: 18` — secondary body text, schedule labels
   - `caption: 16` — card labels, phase names, schedule items
   - `captionSmall: 14` — metadata, timestamps, small labels
   - `label: 13` — card subtitles, small metadata
   - `labelSmall: 12` — tiny labels, phase indicators
   - `overline: 11` — overline text, smallest labels
   - `stat: 80` — large stat numbers
   - `timer: 64` — countdown timer displays
   - `timerSmall: 56` — smaller timer displays
   - `flag: 48` — flag emoji display size

**File**: `03-GameDayStreamClosing-Audio.tsx`

**Function**: Scene 4b ("Thank You, AWS") within `HeroIntro`

**Specific Changes**:
1. **Section title color**: Change `color: GD_ACCENT` to `color: GD_ORANGE` on the "Thank You, AWS" text (line ~489)
2. **Card boxShadow**: Change `${GD_ACCENT}50` to `${GD_ORANGE}50` and `${GD_ACCENT}40` to `${GD_ORANGE}40` in the supporter card styling (line ~516-517)
3. **Country text color**: Change `color: GD_ACCENT` to `color: GD_ORANGE` on the supporter country text (line ~524)
4. **Adopt typography scale**: Replace hardcoded `fontSize` values with `TYPOGRAPHY.*` references throughout the file

**File**: `OrganizersMarketingVideo.tsx`

**Specific Changes**:
1. **Adopt typography scale**: Replace hardcoded `fontSize` values with `TYPOGRAPHY.*` references
2. Note: This file currently only renders community organizers, so no AWS color fix is needed here

**File**: `00-GameDayStreamPreShow-Muted.tsx`

**Specific Changes**:
1. **Adopt typography scale**: Replace hardcoded `fontSize` values with `TYPOGRAPHY.*` references

**File**: `01-GameDayStreamMainEvent-Audio.tsx`

**Specific Changes**:
1. **Adopt typography scale**: Replace hardcoded `fontSize` values with `TYPOGRAPHY.*` references

**File**: `02-GameDayStreamGameplay-Muted.tsx`

**Specific Changes**:
1. **Adopt typography scale**: Replace hardcoded `fontSize` values with `TYPOGRAPHY.*` references

**File**: `04-GameDayStreamPreShowInfo-Muted.tsx`

**Specific Changes**:
1. **Adopt typography scale**: Replace hardcoded `fontSize` values with `TYPOGRAPHY.*` references

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that inspect the color values used in Scene 4b for AWS supporters and verify they use `GD_ACCENT` (the wrong color). Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Scene 4b Title Color Test**: Assert that the "Thank You, AWS" title uses `GD_ORANGE` — will fail on unfixed code because it uses `GD_ACCENT`
2. **Scene 4b Card Border Test**: Assert that AWS supporter card borders use `GD_ORANGE` — will fail on unfixed code
3. **Scene 4b Country Text Test**: Assert that AWS supporter country text uses `GD_ORANGE` — will fail on unfixed code
4. **Typography Scale Existence Test**: Assert that `TYPOGRAPHY` is exported from the design system — will fail on unfixed code

**Expected Counterexamples**:
- Scene 4b title color is `#c084fc` (GD_ACCENT) instead of `#f97316` (GD_ORANGE)
- Card border/glow references `GD_ACCENT` instead of `GD_ORANGE`
- No `TYPOGRAPHY` export exists in the design system

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL element WHERE isBugCondition_Color(element) DO
  result := renderElement_fixed(element)
  ASSERT result.color == GD_ORANGE
END FOR

FOR ALL composition WHERE isBugCondition_Typography(composition) DO
  result := renderComposition_fixed(composition)
  ASSERT ALL fontSize references use TYPOGRAPHY.* constants
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL element WHERE NOT isBugCondition_Color(element) DO
  ASSERT renderElement_original(element).color == renderElement_fixed(element).color
END FOR

FOR ALL composition WHERE NOT isBugCondition_Typography(composition) DO
  ASSERT renderComposition_original(composition) == renderComposition_fixed(composition)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for community organizer rendering and non-AWS elements, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Community Organizer Color Preservation**: Verify community organizers continue using `GD_ACCENT`/`GD_VIOLET`/`GD_PURPLE` after fix
2. **PreShowInfo AWS Color Preservation**: Verify `04-GameDayStreamPreShowInfo-Muted.tsx` already-correct AWS supporter colors remain unchanged
3. **Design System Export Preservation**: Verify all existing color constants remain exported with unchanged values
4. **Component Rendering Preservation**: Verify `BackgroundLayer`, `HexGridOverlay`, `GlassCard`, `AudioBadge` render identically

### Unit Tests

- Test that Scene 4b title "Thank You, AWS" uses `GD_ORANGE`
- Test that AWS supporter card borders/glow use `GD_ORANGE`
- Test that AWS supporter country/role text uses `GD_ORANGE`
- Test that `TYPOGRAPHY` object is exported with all expected keys
- Test that each `TYPOGRAPHY` value matches the expected pixel size

### Property-Based Tests

- Generate random organizer objects with `type: "aws" | "community"` and verify correct color assignment based on type
- Generate random typography scale lookups and verify all named sizes resolve to valid pixel values
- Test that for any community organizer, color values are never `GD_ORANGE` in community-specific sections

### Integration Tests

- Render Scene 4b with actual `AWS_SUPPORTERS` data and verify orange color treatment
- Render Scene 4 with actual `ORGANIZERS` data and verify purple/violet color treatment
- Verify all compositions compile and render without errors after typography scale adoption
