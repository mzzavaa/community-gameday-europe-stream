# GameDay Web Player

A web-based player that runs the AWS Community GameDay Europe stream compositions directly in the browser using the [Remotion Player](https://remotion.dev/docs/player). It auto-switches between compositions based on the event schedule — no manual intervention needed during the live stream.

## Why This Exists

Instead of pre-rendering MP4 files and manually switching between them, this player:

- Renders Remotion compositions **live in the browser** at full resolution (1280×720)
- **Auto-switches** between Pre-Show → Main Event → Gameplay → Closing based on CET time
- Provides **manual override controls** for the stream operator (toggle with `Esc`)
- Can be **screen-shared via Zoom** to all 53+ User Group locations simultaneously
- Gives every Zoom participant a **crisp, full-resolution** video feed

## Quick Start

```bash
cd web-player
npm install
npm run dev
```

Open `http://localhost:5173` in Chrome. You'll see the current composition based on the schedule, or a countdown if the event hasn't started yet.

### Manual Override

Press `Esc` to show/hide operator controls. Click any segment button to force-switch to that composition. Click "Auto" to return to schedule-based switching.

## Configuring the Schedule

Edit `src/schedule.ts` to set the event date and times:

```ts
export const EVENT_DATE = "2025-06-14";

export const SCHEDULE = [
  { id: "preshow",   start: "17:30", label: "Pre-Show (Muted)" },
  { id: "mainevent", start: "18:00", label: "Main Event (Audio)" },
  { id: "gameplay",  start: "18:30", label: "Gameplay (Muted)" },
  { id: "closing",   start: "20:30", label: "Closing Ceremony (Audio)" },
  { id: "end",       start: "21:00", label: "Stream Ended" },
];
```

---

## How to Share This in Zoom (Step-by-Step)

This is the most important part. Follow these steps exactly to get the best video quality for all participants.

### Option A: Screen Share with "Optimize for Video Clip" (Recommended)

This gives you **1080p screen share quality** — the highest Zoom supports.

1. **Start the web player** in Chrome: `npm run dev`, open `http://localhost:5173`
2. **Make Chrome fullscreen**: Press `F11` (or `Cmd+Ctrl+F` on Mac)
3. **Hide the operator controls**: Press `Esc` so only the video is visible
4. **In Zoom**, click the green **Share Screen** button in the meeting toolbar
5. In the share dialog:
   - Select the **Chrome window** showing the player
   - ✅ Check **"Share sound"** at the bottom-left (critical for audio compositions)
   - ✅ Check **"Optimize for video clip"** at the bottom-left
6. Click **Share**

> **Why "Optimize for video clip"?** Without it, Zoom treats your screen as static content and sends it at low frame rate, causing stuttering. With it enabled, Zoom prioritizes smooth video playback by dynamically adjusting compression and bandwidth. It drops resolution from 1080p to 720p but the motion is smooth.
>
> **Official Zoom guide**: [Optimizing a shared video in full screen](https://support.zoom.com/hc?id=zm_kb&sysparm_article=KB0068426)

### Option B: Share as Video File (for pre-rendered MP4s)

If you pre-render the compositions to MP4 first, Zoom has a built-in video player:

1. **Pre-render**: `npx remotion render GameDayPreShow out/preshow.mp4` (from the parent project)
2. In Zoom, click **Share Screen**
3. Click the **Advanced** tab at the top
4. Select **"Video"**
5. Click **Share**, then select your MP4 file

> **Official Zoom guide**: [Sharing a recorded video with sound during your meeting](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064733)

### Zoom Settings to Check Before the Event

Open Zoom **Settings → Video** and verify:

- **HD video**: ✅ Enabled
- **Original ratio**: ✅ Enabled (prevents Zoom from cropping)

Open Zoom **Settings → Share Screen** and verify:

- **Window size when screen sharing**: "Maintain current size"

> **Zoom video settings guide**: [How to share video and update video settings](https://alamocolleges.screenstepslive.com/a/1175251-how-to-share-video-and-update-video-settings)

### Tips for Maximum Quality

1. **Use a wired ethernet connection** — WiFi introduces packet loss that degrades video quality
2. **Close other apps** — Zoom + Chrome need CPU for smooth playback
3. **Use Chrome** — Best performance for Remotion Player rendering
4. **Test beforehand** — Run through the full flow with a test Zoom call
5. **Disable Zoom virtual backgrounds** — They consume GPU that's better used for the stream
6. **Set Zoom to Gallery View** — Participants should use Gallery View so the shared screen is maximized

### What Participants See

When you screen-share with "Optimize for video clip" + "Share sound":
- Participants see the composition at **up to 720p** with smooth motion
- Audio from the Main Event and Closing compositions plays through Zoom directly (not through your microphone)
- The stream looks identical at every User Group location

---

## Architecture

```
web-player/
├── index.html              # Entry point
├── package.json            # Dependencies (Vite + Remotion Player)
├── vite.config.ts          # Vite config with alias to parent compositions
├── tsconfig.json           # TypeScript config
└── src/
    ├── main.tsx            # React mount
    ├── App.tsx             # Player + schedule logic + operator controls
    └── schedule.ts         # Event date, times, composition metadata
```

The player imports compositions directly from the parent project (`../00-GameDayStreamPreShow-Muted.tsx`, etc.) via a Vite alias. No code duplication.

## Deployment

For local use (recommended for the stream operator):
```bash
npm run dev
```

To build a static site you can host anywhere:
```bash
npm run build
npm run preview  # test the build locally
```

The `dist/` folder can be deployed to Vercel, Netlify, or any static host. This gives you a URL that other UG leaders could open as a backup.
