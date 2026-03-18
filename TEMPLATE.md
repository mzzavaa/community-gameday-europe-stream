# LIVE WINNERS TEMPLATE — MUST UPDATE BEFORE RENDERING

> **The `03B-ClosingWinnersTemplate` composition contains PLACEHOLDER data.**
> It will render with white flags 🏳️, "TEAM NAME", and "CITY, COUNTRY" until you update it with real winner data.

## Quick Summary

- **File to edit:** `src/utils/closing.ts`
- **What to update:** The `PODIUM_TEAMS` array
- **When:** During the live stream, after final scores are in
- **Then:** Save → Remotion Studio hot-reloads → Render

## Template Data Structure

The `PODIUM_TEAMS` array holds 6 entries, ordered 1st to 6th:

```typescript
export const PODIUM_TEAMS: TeamData[] = [
  { teamName: "TEAM NAME", ugName: "REPLACE_WITH_UG_NAME", flag: "🏳️", city: "CITY, COUNTRY", score: 18500 },
  { teamName: "TEAM NAME", ugName: "REPLACE_WITH_UG_NAME", flag: "🏳️", city: "CITY, COUNTRY", score: 15200 },
  { teamName: "TEAM NAME", ugName: "REPLACE_WITH_UG_NAME", flag: "🏳️", city: "CITY, COUNTRY", score: 12800 },
  { teamName: "TEAM NAME", ugName: "REPLACE_WITH_UG_NAME", flag: "🏳️", city: "CITY, COUNTRY", score: 11500 },
  { teamName: "TEAM NAME", ugName: "REPLACE_WITH_UG_NAME", flag: "🏳️", city: "CITY, COUNTRY", score: 10200 },
  { teamName: "TEAM NAME", ugName: "REPLACE_WITH_UG_NAME", flag: "🏳️", city: "CITY, COUNTRY", score: 8900  },
];
```

Replace each field with real data from the GameDay scoring results.

## Field Reference

| Field      | Description                          | What to put                    |
|------------|--------------------------------------|--------------------------------|
| `teamName` | The team's chosen name (most prominent on screen) | The actual team name from the scoreboard |
| `ugName`   | User Group name — **must match a key in `LOGO_MAP`** | Exact UG name from `config/logos.ts` |
| `flag`     | Country flag emoji                   | The flag emoji of the UG's country |
| `city`     | City, Country label                  | The UG's city and country |
| `score`    | Final score (integer)                | The actual final score from the GameDay |

### Important: `ugName` must match exactly

The `ugName` field is used to look up the User Group logo via `LOGO_MAP` in `config/logos.ts`. If it doesn't match, no logo will be displayed.

To see all valid `ugName` values, open `config/logos.ts` and check the exported map.

## How to Update

1. Open `src/utils/closing.ts`
2. Find the `PODIUM_TEAMS` array
3. Replace all 6 placeholder entries with real winner data
4. Entries must be ordered by rank: index 0 = 1st place, index 5 = 6th place
5. Save the file — Remotion Studio will hot-reload automatically
6. Render: `npx remotion render src/index.ts 03B-ClosingWinnersTemplate`

## How to Update (Lambda / Automated)

For automated updates during the live stream, a Lambda function can:

1. Fetch final scores from the GameDay scoring API
2. Map each winning team to the `TeamData` structure above
3. Write the updated `PODIUM_TEAMS` array to `src/utils/closing.ts`
4. Trigger a Remotion render via CLI or Remotion Lambda

### Lambda Integration Points

```
Input:  GameDay Scoring API → top 6 teams with scores
Output: Updated PODIUM_TEAMS array in src/utils/closing.ts
Render: npx remotion render src/index.ts 03B-ClosingWinnersTemplate --output=out/closing-winners.mp4
```

### JSON payload format (for Lambda input)

```json
{
  "winners": [
    { "teamName": "...", "ugName": "...", "flag": "...", "city": "...", "score": 0 },
    { "teamName": "...", "ugName": "...", "flag": "...", "city": "...", "score": 0 },
    { "teamName": "...", "ugName": "...", "flag": "...", "city": "...", "score": 0 },
    { "teamName": "...", "ugName": "...", "flag": "...", "city": "...", "score": 0 },
    { "teamName": "...", "ugName": "...", "flag": "...", "city": "...", "score": 0 },
    { "teamName": "...", "ugName": "...", "flag": "...", "city": "...", "score": 0 }
  ]
}
```

## Composition Details

| Property        | Value                              |
|-----------------|------------------------------------|
| Composition ID  | `03B-ClosingWinnersTemplate`       |
| Duration        | ~9000 frames (5 minutes)           |
| FPS             | 30                                 |
| Resolution      | 1280×720                           |
| Source file     | `src/compositions/03-closing/ClosingWinnersTemplate.tsx` |

### Phase Timeline

| Phase           | Frames      | Time        | Description                              |
|-----------------|-------------|-------------|------------------------------------------|
| Shuffle         | 0 – 1799    | 0:00 – 1:00 | Animated bar scroll (all user groups)    |
| Reveal (6→1)    | 1800 – 7199 | 1:00 – 4:00 | Progressive bar chart reveal             |
| Podium          | 7200 – 7799 | 4:00 – 4:20 | Final podium card grid                   |
| Thank You       | 7800 – 8999 | 4:20 – 5:00 | Closing message + fade to black          |

## Other Compositions (Fixed — Do Not Edit)

| Composition ID              | File                                           | Notes                    |
|-----------------------------|------------------------------------------------|--------------------------|
| `03A-ClosingPreRendered`    | `src/compositions/03-closing/ClosingPreRendered.tsx`  | Pre-rendered, no changes |
| `00-InfoLoop`               | `src/compositions/00-preshow/InfoLoop.tsx`     | Fixed                    |
| `00-Countdown`              | `src/compositions/00-preshow/Countdown.tsx`    | Fixed                    |
| `01-MainEvent`              | `src/compositions/01-main-event/MainEvent.tsx` | Fixed                    |
| `02-Gameplay`               | `src/compositions/02-gameplay/Gameplay.tsx`    | Fixed                    |
