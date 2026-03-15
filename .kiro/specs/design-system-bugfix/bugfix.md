# Bugfix Requirements Document

## Introduction

The GameDay design system has two bugs affecting visual consistency across all compositions:

1. **AWS organizer color mismatch**: AWS supporters/organizers are displayed in purple (`GD_ACCENT` / `#c084fc`) instead of orange (`GD_ORANGE` / `#f97316`). The organizer data model already distinguishes `type: "community"` from `type: "aws"`, but the closing ceremony's "Thank You, AWS" section (Scene 4b in `03-GameDayStreamClosing-Audio.tsx`) ignores this field and hardcodes `GD_ACCENT` for all AWS supporter text, card borders, and glow effects.

2. **Inconsistent typography scale**: There is no standardized typography system. Font sizes are ad-hoc across all compositions (13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 28, 36, 42, 48, 52, 56, 64, 72, 80, 104px), making the design inconsistent and hard to maintain. A proper h1–h6 + paragraph scale should be defined in `shared/GameDayDesignSystem.tsx` and adopted across compositions.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN an organizer has `type: "aws"` AND is rendered in the closing ceremony Scene 4b ("Thank You, AWS") THEN the system uses `GD_ACCENT` (#c084fc, purple) for the section title "Thank You, AWS", card border/glow colors, and the supporter's country/role text color

1.2 WHEN an organizer has `type: "aws"` AND is rendered in the closing ceremony Scene 4b THEN the supporter card's `boxShadow` and `border` use `GD_ACCENT` instead of `GD_ORANGE`, making AWS supporters visually indistinguishable from community organizers in color treatment

1.3 WHEN any composition renders text THEN the system uses dozens of ad-hoc font sizes (13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 28, 36, 42, 48, 52, 56, 64, 72, 80, 104px) with no standardized typography scale defined in the design system

1.4 WHEN a developer needs to add or modify text in any composition THEN there is no reference typography scale to follow, leading to further inconsistency

### Expected Behavior (Correct)

2.1 WHEN an organizer has `type: "aws"` AND is rendered in the closing ceremony Scene 4b THEN the system SHALL use `GD_ORANGE` (#f97316) for the section title "Thank You, AWS", card border/glow colors, and the supporter's country/role text color

2.2 WHEN an organizer has `type: "aws"` AND is rendered in the closing ceremony Scene 4b THEN the supporter card's `boxShadow` and `border` SHALL use `GD_ORANGE` so AWS supporters are visually distinct from community organizers

2.3 WHEN the design system is referenced for typography THEN it SHALL export a standardized typography scale with named sizes (e.g., h1 through h6, plus body/caption/label sizes) in `shared/GameDayDesignSystem.tsx`

2.4 WHEN any composition renders text THEN it SHALL use the standardized typography scale values from the design system instead of ad-hoc pixel values

### Unchanged Behavior (Regression Prevention)

3.1 WHEN an organizer has `type: "community"` AND is rendered in the closing ceremony Scene 4 (community organizers section) THEN the system SHALL CONTINUE TO use `GD_ACCENT`/`GD_VIOLET`/`GD_PURPLE` for card glow and text colors

3.2 WHEN an organizer has `type: "community"` AND is rendered in `04-GameDayStreamPreShowInfo-Muted.tsx` organizers section THEN the system SHALL CONTINUE TO use `GD_ACCENT` for the role text and `GD_PURPLE` for the card border

3.3 WHEN the design system exports existing color constants (`GD_DARK`, `GD_PURPLE`, `GD_VIOLET`, `GD_PINK`, `GD_ACCENT`, `GD_ORANGE`, `GD_GOLD`) THEN the system SHALL CONTINUE TO export them with unchanged values

3.4 WHEN existing components (`BackgroundLayer`, `HexGridOverlay`, `GlassCard`, `AudioBadge`) are used THEN they SHALL CONTINUE TO render identically

3.5 WHEN the `04-GameDayStreamPreShowInfo-Muted.tsx` organizers section renders AWS supporters THEN it SHALL CONTINUE TO use `GD_ORANGE` for the border and role text (this file already correctly differentiates by `type`)
