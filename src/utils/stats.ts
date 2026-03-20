/**
 * Stats resolver — maps StatType keys to display values.
 *
 * Imported by InfoLoop, MainEvent, and ClosingPreRendered so that DISPLAY_STATS
 * from participants.ts drives all "By the Numbers" sections automatically.
 */

import { TIMEZONE_COUNT, EDITION, GAMEPLAY_HOURS } from "../../config/event";
import { USER_GROUPS, COUNTRIES, type StatType } from "../../config/participants";

export interface StatItem {
  /** Display string (e.g. "57", "1st") */
  v: string;
  /** Numeric value for count-up animations */
  n: number;
  /** Short label */
  l: string;
  /** Sub-label / description */
  sub: string;
  /** Suffix appended in count-up (e.g. "+", "st", "") */
  suffix: string;
}

const STAT_DEFS: Record<StatType, StatItem> = {
  "user-groups":    { v: String(USER_GROUPS.length), n: USER_GROUPS.length, l: "User Groups",      sub: "Cities across Europe",       suffix: "+" },
  "countries":      { v: String(COUNTRIES.length),   n: COUNTRIES.length,   l: "Countries",         sub: "From Iceland to Turkey",     suffix: "+" },
  "timezones":      { v: String(TIMEZONE_COUNT),     n: TIMEZONE_COUNT,     l: "Timezones",         sub: "UTC+0 through UTC+3",        suffix: "+" },
  "edition":        { v: EDITION,                    n: 1,                  l: "Edition",           sub: "History being made today",   suffix: "st" },
  "gameplay-hours": { v: String(GAMEPLAY_HOURS),     n: GAMEPLAY_HOURS,     l: "Hours of Gameplay", sub: "Non-stop community action",  suffix: "" },
};

export function resolveStats(types: StatType[]): StatItem[] {
  return types.map((t) => STAT_DEFS[t]);
}
