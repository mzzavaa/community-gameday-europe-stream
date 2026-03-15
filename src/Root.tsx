import React from "react";
import { Composition } from "remotion";
import { GameDayPreShow } from "../00-GameDayStreamPreShow-Muted";
import { GameDayMainEvent } from "../01-GameDayStreamMainEvent-Audio";
import { GameDayGameplay } from "../02-GameDayStreamGameplay-Muted";
import { GameDayClosing } from "../03-GameDayStreamClosing-Audio";
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 0. Pre-Show (Muted): 10-min loop (play 3× for 30 min total) */}
      <Composition
        id="GameDayPreShow"
        component={GameDayPreShow}
        durationInFrames={18000}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ loopIteration: 0 }}
      />
      <Composition
        id="GameDayPreShow-Loop2"
        component={GameDayPreShow}
        durationInFrames={18000}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ loopIteration: 1 }}
      />
      <Composition
        id="GameDayPreShow-Loop3"
        component={GameDayPreShow}
        durationInFrames={18000}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ loopIteration: 2 }}
      />

      {/* 1. Main Event (Audio): 30 min live introductions */}
      <Composition
        id="GameDayMainEvent"
        component={GameDayMainEvent}
        durationInFrames={54000}
        fps={30}
        width={1280}
        height={720}
      />

      {/* 2. Gameplay (Muted): 2h muted overlay */}
      <Composition
        id="GameDayGameplay"
        component={GameDayGameplay}
        durationInFrames={216000}
        fps={30}
        width={1280}
        height={720}
      />

      {/* 3. Closing Ceremony (Audio): 15 min */}
      <Composition
        id="GameDayClosing"
        component={GameDayClosing}
        durationInFrames={27000}
        fps={30}
        width={1280}
        height={720}
      />

    </>
  );
};
