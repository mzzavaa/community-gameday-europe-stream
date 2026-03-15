---
inclusion: auto
description: "Visual QA rules for testing Remotion compositions with Playwright MCP browser after each implementation task"
---

# Visual QA — Remotion Studio Testing with Playwright MCP Browser

## Mandatory Visual Verification

After implementing each task that changes visual output in a Remotion composition, you MUST:

1. Start Remotion Studio locally: `npx remotion studio` (use controlBashProcess to start in background)
2. Open the composition in the Playwright MCP browser (navigate to `http://localhost:3000`)
3. Select the correct composition from the sidebar
4. Seek to key frames (start, middle, transitions, end) and take screenshots
5. Verify visually that:
   - Logos are displayed at their actual aspect ratio (NOT cropped into circles unless explicitly designed that way)
   - Country flags are visible for each user group
   - Text is not overlapping other elements
   - Animations are smooth and elements don't clip or overflow unexpectedly
   - Z-index layering is correct (no elements hidden behind others unintentionally)
   - Colors match the design system palette
   - The overall composition looks professional and exciting
6. Show screenshots to the user for confirmation before marking a task complete

## Key Frames to Check

For any composition, always screenshot at minimum:
- Frame 0 (start)
- 25% through
- 50% through
- Any phase transition frames (e.g., carousel → podium)
- 75% through
- Final frames

## Remotion Studio Navigation

- Use the Playwright MCP browser to interact with Remotion Studio
- Use the frame scrubber or input field to seek to specific frames
- Use the composition selector dropdown to switch between compositions
- Take screenshots using `mcp_playwright_browser_take_screenshot`

## Remotion MCP Documentation

Use `mcp_remotion_documentation_remotion_documentation` to look up Remotion APIs, components, and best practices when implementing animations and compositions.

## Quality Standard

Think like a world-class creative director for community experiences. Every frame should be:
- Visually exciting and share-worthy (people will photograph/film the screen)
- Professional and polished
- Emotionally engaging (building excitement, suspense, celebration)
- Technically correct (no visual glitches, proper timing)
