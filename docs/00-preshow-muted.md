# 0. Pre-Show — `00-InfoLoop` and `00-Countdown`

## Overview

There are two pre-show compositions:

- **`00-InfoLoop`** — The main 30-minute rotating info loop. Cycles through: welcome countdown, schedule, user group map, organizer introductions, AWS community programs, speaker bio, event checklist. Runs at every participating user group location from 17:30 to 18:00 CET.
- **`00-Countdown`** — Simple countdown timer only, no content. Used in the early window before the info loop starts, or at venues that haven't set up audio yet.

Both are muted (visual-only). Attendees are still arriving and setting up during this window.

## What Attendees See (InfoLoop)

When you walk into your local User Group meetup and look at the screen, you cycle through:

1. **Welcome + Countdown** — Event title, countdown to stream start and game start
2. **Schedule** — 4-phase timeline (Pre-Show 30 min, Introductions 30 min, Gameplay 2 hr, Closing 30 min)
3. **User Group Map** — Europe map showing all 53+ participating locations
4. **Organizer Introductions** — Photos and bios of organizers and AWS Gamemasters
5. **AWS Community Programs** — AWS Heroes, User Groups, Community Builders, Cloud Clubs
6. **Speaker Bio** — Stream host introduction
7. **Event Checklist** — What to do before the stream starts (connect audio, check screen share, etc.)

## Technical Details

### InfoLoop

| Property | Value |
|----------|-------|
| Composition ID | `00-InfoLoop` |
| Duration | 54,000 frames (30 minutes at 30 fps) |
| Resolution | 1280×720 |
| FPS | 30 |
| Source file | `src/compositions/00-preshow/InfoLoop.tsx` |

### Countdown

| Property | Value |
|----------|-------|
| Composition ID | `00-Countdown` |
| Duration | 18,000 frames (10 minutes at 30 fps) |
| Resolution | 1280×720 |
| FPS | 30 |
| Source file | `src/compositions/00-preshow/Countdown.tsx` |

## Design Decisions

- **No audio** — The pre-show is a visual-only loop. Attendees are still arriving and setting up.
- **Relative durations only** — The schedule shows "30 min", "2 hours" etc. instead of clock times, because the event spans 4+ timezones.
- **Rotating content** — The InfoLoop cycles through 7+ scenes so repeat viewers don't see the same static screen.

## Rendering

```bash
npx remotion still src/index.ts 00-InfoLoop screenshots/compositions/readme-infoloop.png --frame=300
npx remotion render src/index.ts 00-InfoLoop out/00-info-loop.mp4
npx remotion render src/index.ts 00-Countdown out/00-countdown.mp4
```
