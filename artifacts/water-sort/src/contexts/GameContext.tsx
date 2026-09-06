import { showRewardedAd } from "@/lib/admanager";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from "react";

import {
  GameState,
  initGameState,
  selectTube as selectTubeLogic,
  undoMove,
  findHint,
  HintMove,
  canPour,
  isStuck,
  clearPourAnimation,
} from "@/lib/gameLogic";

import {
  getLevel,
  TOTAL_LEVELS,
  calcStars,
} from "@/lib/levelGenerator";

import {
  loadProgress,
  saveProgress,
  completeLevel,
  Progress,
  loadStats,
  updateStats,
  unlockAchievement,
  markAchievementSeen,
  checkDailyReward,
  loadDailyState,
  claimDailyReward,
  isChestLevel,
  claimChest,
  hasUnclaimedChest,
  ChestReward,
  loadCosmetics,
  CosmeticsState,
  loadChallenges,
  ChallengeState,
  completeDailyChallenge,
  completeWeeklyChallenge,
} from "@/lib/storage";

import {
  checkAchievements,
  getAchievementById,
} from "@/lib/achievements";

import { SFX } from "@/lib/soundManager";
import { Haptics } from "@/lib/hapticManager";
import { recordTubeSorted, loadPlayerProfile } from "@/lib/leaderboardManager";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Screen =
  | "menu"
  | "levels"
  | "game"
  | "achievements"
  | "settings"
  | "stats"
  | "shop"
  | "challenges"
  | "profile"
  | "collection"
  | "leaderboard";

export interface PendingAchievement {
  id: string;
  title: string;
  icon: string;
}

interface AppState {
  screen: Screen;

  currentLevel: number;

  gameState: GameState | null;

  originalTubes: string[][] | null;

  progress: Progress;

  cosmetics: CosmeticsState;

  challenges: ChallengeState;

  hintsUsedThisLevel: number;

  undosUsedThisLevel: number;

  consecutiveNoHint: number;

  pendingAchievements: PendingAchievement[];

  hintMove: HintMove | null;

  hintExpiry: number;

  isAnimating: boolean;

  levelCompleteVisible: boolean;

  levelIsStuck: boolean;

  dailyRewardAvailable: boolean;

  dailyStreak: number;

  elapsedSeconds: number;

  timerRunning: boolean;

  pendingChest: ChestReward | null;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | {
      type: "NAVIGATE";
      screen: Screen;
    }
  | {
      type: "START_LEVEL";
      levelId: number;
    }
  | {
      type: "SELECT_TUBE";
      idx: number;
    }
  | {
      type: "SET_ANIMATING";
      value: boolean;
    }
  | {
      type: "UNDO";
    }
  | {
      type: "RESTART";
    }
  | {
      type: "SHOW_HINT";
    }
  | {
      type: "CLEAR_HINT";
    }
  | {
      type: "LEVEL_COMPLETE_SHOWN";
    }
  | {
      type: "NEXT_LEVEL";
    }
  | {
      type: "DISMISS_ACHIEVEMENT";
      id: string;
    }
  | {
      type: "SYNC_PROGRESS";
      progress: Progress;
    }
  | {
      type: "CLAIM_DAILY_REWARD";
    }
  | {
      type: "ADD_ACHIEVEMENT";
      achievement: PendingAchievement;
    }
  | {
      type: "DAILY_REWARD_CHECK";
      available: boolean;
      streak: number;
    }
  | {
      type: "TICK_TIMER";
    }
  | {
      type: "PAUSE_TIMER";
    }
  | {
      type: "RESUME_TIMER";
    }
  | {
      type: "SET_CHEST";
      chest: ChestReward | null;
    }
  | {
      type: "SET_STUCK";
      stuck: boolean;
    }
  | {
      type: "SYNC_COSMETICS";
      cosmetics: CosmeticsState;
    }
  | {
      type: "SYNC_CHALLENGES";
      challenges: ChallengeState;
    };

// ─── Initial State ────────────────────────────────────────────────────────────

function getInitialState(): AppState {
  const progress = loadProgress();

  const cosmetics = loadCosmetics();

  const challenges = loadChallenges();

  const daily = loadDailyState();

  let dailyInfo = checkDailyReward();
  if (dailyInfo.available) {
    const claimed = claimDailyReward();
    daily.streak = claimed.streak;
    dailyInfo = { available: false, streak: claimed.streak };
  }

  return {
    screen: "menu",

    currentLevel: 1,

    gameState: null,

    originalTubes: null,

    progress,

    cosmetics,

    challenges,

    hintsUsedThisLevel: 0,

    undosUsedThisLevel: 0,

    consecutiveNoHint: 0,

    pendingAchievements: [],

    hintMove: null,

    hintExpiry: 0,

    isAnimating: false,

    levelCompleteVisible: false,

    levelIsStuck: false,

    dailyRewardAvailable: dailyInfo.available,

    dailyStreak: daily.streak,

    elapsedSeconds: 0,

    timerRunning: false,

    pendingChest: null,
  };
}

// ─── Start Level ──────────────────────────────────────────────────────────────

function startLevelState(
  state: AppState,
  levelId: number,
): AppState {
  if (
    levelId >
    state.progress.maxUnlockedLevel
  ) {
    return state;
  }

  const level = getLevel(levelId);

  const gs = initGameState(
    levelId,
    level.tubes as any,
  );

  return {
    ...state,

    screen: "game",

    currentLevel: levelId,

    gameState: gs,

    originalTubes:
      level.tubes as any,

    hintsUsedThisLevel: 0,

    undosUsedThisLevel: 0,

    hintMove: null,

    hintExpiry: 0,

    isAnimating: false,

    levelCompleteVisible: false,

    levelIsStuck: false,

    elapsedSeconds: 0,

    timerRunning: true,

    pendingChest: null,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(
  state: AppState,
  action: Action,
): AppState {
  switch (action.type) {
    // ────────────────────────────────────────────────────────────────────────
    case "NAVIGATE":
      return {
        ...state,

        screen: action.screen,

        timerRunning:
          action.screen === "game" &&
          !!state.gameState &&
          !state.gameState.isComplete,
      };

    // ────────────────────────────────────────────────────────────────────────
    case "START_LEVEL":
      return startLevelState(
        state,
        action.levelId,
      );

    // ────────────────────────────────────────────────────────────────────────
    case "SELECT_TUBE": {
      if (
        !state.gameState ||
        state.gameState.isComplete
      ) {
        return state;
      }

      const next =
        selectTubeLogic(
          state.gameState,
          action.idx,
        );

      return {
        ...state,

        gameState: next,

        hintMove: null,

        hintExpiry: 0,

        isAnimating:
          !!next.pourAnimating,
      };
    }

    // ────────────────────────────────────────────────────────────────────────
    case "SET_ANIMATING": {
  const nextGameState =
    !action.value && state.gameState
      ? clearPourAnimation(state.gameState)
      : state.gameState;

  return {
    ...state,

    gameState: nextGameState,

    isAnimating: action.value,
  };
    }

    // ────────────────────────────────────────────────────────────────────────
    case "UNDO": {
      if (
        !state.gameState ||
        state.gameState.history.length === 0
      ) {
        return state;
      }

      return {
        ...state,

        gameState:
          undoMove(
            state.gameState,
          ),

        hintMove: null,

        hintExpiry: 0,

        undosUsedThisLevel:
          state.undosUsedThisLevel + 1,

        levelIsStuck: false,

        isAnimating: false,
      };
    }

    // ────────────────────────────────────────────────────────────────────────
    case "RESTART": {
      if (
        !state.originalTubes
      ) {
        return state;
      }

      const gs =
        initGameState(
          state.currentLevel,
          state.originalTubes as any,
        );

      return {
        ...state,

        gameState: gs,

        hintMove: null,

        hintExpiry: 0,

        hintsUsedThisLevel: 0,

        undosUsedThisLevel: 0,

        elapsedSeconds: 0,

        timerRunning: true,

        levelIsStuck: false,

        levelCompleteVisible:
          false,

        isAnimating: false,

        pendingChest: null,
      };
    }

    // ────────────────────────────────────────────────────────────────────────
    case "SHOW_HINT": {
      if (
        !state.gameState ||
        state.gameState.isComplete
      ) {
        return state;
      }

      const hint =
        findHint(
          state.gameState,
        );

      if (!hint) {
        return state;
      }

      return {
        ...state,

        hintMove: hint,

        // Hint immediately visible
        hintExpiry:
          Date.now() + 2500,

        hintsUsedThisLevel:
          state.hintsUsedThisLevel + 1,
      };
    }

    // ────────────────────────────────────────────────────────────────────────
    case "CLEAR_HINT":
      return {
        ...state,

        hintMove: null,

        hintExpiry: 0,
      };

    // ────────────────────────────────────────────────────────────────────────
    case "LEVEL_COMPLETE_SHOWN":
      return {
        ...state,

        levelCompleteVisible:
          true,

        timerRunning: false,

        isAnimating: false,
      };

    // ────────────────────────────────────────────────────────────────────────
    case "NEXT_LEVEL": {
      if (
        state.currentLevel >=
        TOTAL_LEVELS
      ) {
        return {
          ...state,

          levelCompleteVisible:
            true,

          timerRunning: false,

          isAnimating: false,
        };
      }

      const nextLevel =
        state.currentLevel + 1;

      return startLevelState(
        {
          ...state,

          pendingChest: null,
        },
        nextLevel,
      );
    }

    // ────────────────────────────────────────────────────────────────────────
    case "DISMISS_ACHIEVEMENT":
      return {
        ...state,

        pendingAchievements:
          state.pendingAchievements.filter(
            (a) =>
              a.id !== action.id,
          ),
      };

    // ────────────────────────────────────────────────────────────────────────
    case "SYNC_PROGRESS":
      return {
        ...state,

        progress:
          action.progress,
      };

    // ────────────────────────────────────────────────────────────────────────
    case "ADD_ACHIEVEMENT":
      return {
        ...state,

        pendingAchievements: [
          ...state.pendingAchievements,
          action.achievement,
        ],
      };

    // ────────────────────────────────────────────────────────────────────────
    case "CLAIM_DAILY_REWARD": {
      const result =
        claimDailyReward();

      return {
        ...state,

        dailyRewardAvailable:
          false,

        dailyStreak:
          result.streak,
      };
    }

    // ────────────────────────────────────────────────────────────────────────
    case "DAILY_REWARD_CHECK":
      return {
        ...state,

        dailyRewardAvailable:
          action.available,

        dailyStreak:
          action.streak,
      };

    // ────────────────────────────────────────────────────────────────────────
    case "TICK_TIMER":
      return state.timerRunning
        ? {
            ...state,

            elapsedSeconds:
              state.elapsedSeconds +
              1,
          }
        : state;

    // ────────────────────────────────────────────────────────────────────────
    case "PAUSE_TIMER":
      return {
        ...state,

        timerRunning: false,
      };

    // ────────────────────────────────────────────────────────────────────────
    case "RESUME_TIMER":
      return state.gameState &&
        !state.gameState.isComplete
        ? {
            ...state,

            timerRunning: true,
          }
        : state;

    // ────────────────────────────────────────────────────────────────────────
    case "SET_CHEST":
      return {
        ...state,

        pendingChest:
          action.chest,
      };

    // ────────────────────────────────────────────────────────────────────────
    case "SET_STUCK":
      return {
        ...state,

        levelIsStuck:
          action.stuck,
      };

    // ────────────────────────────────────────────────────────────────────────
    case "SYNC_COSMETICS":
      return {
        ...state,

        cosmetics:
          action.cosmetics,
      };

    // ────────────────────────────────────────────────────────────────────────
    case "SYNC_CHALLENGES":
      return {
        ...state,

        challenges:
          action.challenges,
      };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface GameContextValue {
  state: AppState;

  navigate: (
    screen: Screen,
  ) => void;

  startLevel: (
    levelId: number,
  ) => void;

  handleTubeSelect: (
    idx: number,
  ) => void;

  handleUndo: () => void;

  handleRestart: () => void;

  handleHint: () => void;

  handleSkip: () => void;

  handleNextLevel: () => void;

  dismissAchievement: (
    id: string,
  ) => void;

  claimDaily: () => void;

  claimPendingChest: () => void;

  pauseTimer: () => void;

  resumeTimer: () => void;

  refreshCosmetics: () => void;

  refreshChallenges: () => void;
}

const GameContext =
  createContext<GameContextValue | null>(
    null,
  );

// ─── Provider ─────────────────────────────────────────────────────────────────

export function GameProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] =
    useReducer(
      reducer,
      undefined,
      getInitialState,
    );

  const stateRef =
    useRef(state);

  stateRef.current = state;

  // 🔒 GLOBAL AD LOCK
  // Prevents Hint/Skip from opening multiple ads.
  const adShowingRef =
    useRef(false);

  // ── Timer ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const id = setInterval(() => {
      dispatch({
        type: "TICK_TIMER",
      });
    }, 1000);

    return () =>
      clearInterval(id);
  }, []);

  // ── Pour Animation ─────────────────────────────────────────────────────────

  useEffect(() => {
    const gs =
      state.gameState;

    if (!gs?.pourAnimating) {
      return undefined;
    }

    const id = setTimeout(() => {
      dispatch({
        type: "SET_ANIMATING",
        value: false,
      });

      const cur =
        stateRef.current
          .gameState;

      if (cur) {
        // Record tube completion with anti-cheat duplicate protection
        cur.tubes.forEach((t) => {
          if (
            t.colors.length === 4 &&
            t.colors.every((c) => c === t.colors[0])
          ) {
            const sig = `tube-${t.id}-${t.colors[0]}`;
            if (recordTubeSorted(cur.levelId, sig)) {
              Haptics.tubeComplete();
              SFX.tubeComplete();
            }
          }
        });

        if (
          !cur.isComplete &&
          isStuck(cur)
        ) {
          dispatch({
            type: "SET_STUCK",
            stuck: true,
          });
        }
      }
    }, 850);

    return () =>
      clearTimeout(id);
  }, [
    state.gameState?.pourAnimating,
  ]);

  // ── Hint Auto Clear ────────────────────────────────────────────────────────

  useEffect(() => {
    if (
      state.hintExpiry <= 0
    ) {
      return undefined;
    }

    const ms = Math.max(
      0,
      state.hintExpiry -
        Date.now(),
    );

    const id = setTimeout(() => {
      dispatch({
        type: "CLEAR_HINT",
      });
    }, ms);

    return () =>
      clearTimeout(id);
  }, [
    state.hintExpiry,
  ]);

  // ── Level Completion ───────────────────────────────────────────────────────

  const prevComplete =
    useRef(false);

  useEffect(() => {
    const gs =
      state.gameState;

    if (!gs) {
      return;
    }

    if (
      gs.isComplete &&
      !prevComplete.current
    ) {
      prevComplete.current =
        true;

      SFX.complete();

      const level =
        getLevel(
          gs.levelId,
        );

      const stars =
        calcStars(
          level.parMoves,
          gs.moveCount,
        );

      const newProgress =
        completeLevel(
          gs.levelId,
          gs.moveCount,
          stars,
          stateRef.current
            .elapsedSeconds,
          state.progress,
        );

      const noHintThisLevel =
        stateRef.current
          .hintsUsedThisLevel ===
        0;

      const newNoHintStreak =
        noHintThisLevel
          ? stateRef.current
              .consecutiveNoHint +
            1
          : 0;

      const currentStats =
        loadStats();

      const wasAlreadyCompleted =
        !!stateRef.current
          .progress.levels[
          gs.levelId
        ]?.completed;

      const newWinStreak =
        wasAlreadyCompleted
          ? currentStats.currentWinStreak
          : currentStats.currentWinStreak +
            1;

      updateStats({
        totalLevelsCompleted:
          1,

        totalMoves:
          gs.moveCount,

        playTimeSeconds:
          stateRef.current
            .elapsedSeconds,

        perfectLevels:
          stars === 3
            ? 1
            : 0,

        currentWinStreak:
          newWinStreak,

        bestWinStreak:
          Math.max(
            currentStats.bestWinStreak,
            newWinStreak,
          ),

        fastestLevel:
          stateRef.current
            .elapsedSeconds,

        noHintStreak:
          newNoHintStreak,

        bestNoHintStreak:
          newNoHintStreak,
      });

      dispatch({
        type: "SYNC_PROGRESS",
        progress:
          newProgress,
      });

      // ── Challenges ────────────────────────────────────────────────────────

      const challenges =
        stateRef.current
          .challenges;

      if (
        gs.levelId ===
          challenges.dailyChallengeLevelId &&
        !challenges.dailyChallengeCompleted
      ) {
        completeDailyChallenge();
      }

      if (
        challenges.weeklyChallengeIds.includes(
          gs.levelId,
        )
      ) {
        completeWeeklyChallenge(
          gs.levelId,
        );
      }

      // ── Achievements ──────────────────────────────────────────────────────

      const stats =
        loadStats();

      const daily =
        loadDailyState();

      const totalPerfect =
        Object.values(
          newProgress.levels,
        ).filter(
          (l) =>
            l.stars === 3,
        ).length;

      const profile = loadPlayerProfile();
      const achievementIds =
        checkAchievements(
          stats,
          daily.streak,
          totalPerfect,
          stateRef.current
            .hintsUsedThisLevel ===
            0,
          gs.moveCount,
          newNoHintStreak,
          profile.totalTubesSorted
        );

      achievementIds.forEach(
        (id) => {
          const did =
            unlockAchievement(
              id,
            );

          if (!did) {
            return;
          }

          const def =
            getAchievementById(
              id,
            );

          if (!def) {
            return;
          }

          SFX.achievement();

          dispatch({
            type:
              "ADD_ACHIEVEMENT",

            achievement: {
              id,

              title:
                def.title,

              icon:
                def.icon,
            },
          });
        },
      );

      // ── Chest: Automatically claimed without disruptive popup ───────────────
      if (
        isChestLevel(
          gs.levelId,
        ) &&
        hasUnclaimedChest(
          gs.levelId,
        )
      ) {
        claimChest(gs.levelId);
      }

      // ── Complete UI ────────────────────────────────────────────────────────

      setTimeout(() => {
        dispatch({
          type:
            "LEVEL_COMPLETE_SHOWN",
        });
      }, 700);
    }

    if (!gs.isComplete) {
      prevComplete.current =
        false;
    }
  }, [
    state.gameState?.isComplete,
  ]);

  // ─── Public API ───────────────────────────────────────────────────────────

  const navigate =
    useCallback(
      (screen: Screen) => {
        dispatch({
          type: "NAVIGATE",
          screen,
        });
      },
      [],
    );

  // ── Start Level ────────────────────────────────────────────────────────────

  const startLevel =
    useCallback(
      (levelId: number) => {
        const progress =
          stateRef.current
            .progress;

        if (
          levelId >
          progress.maxUnlockedLevel
        ) {
          SFX.invalid();
          return;
        }

        SFX.levelStart();

        dispatch({
          type: "START_LEVEL",
          levelId,
        });
      },
      [],
    );

  // ── Tube Select ────────────────────────────────────────────────────────────

  const handleTubeSelect =
    useCallback(
      (idx: number) => {
        const {
          gameState,
          isAnimating,
        } =
          stateRef.current;

        if (
          !gameState ||
          isAnimating ||
          gameState.isComplete
        ) {
          return;
        }

        const {
          selectedTube,
          tubes,
        } = gameState;

        if (
          selectedTube !== null &&
          selectedTube !== idx
        ) {
          if (
            canPour(
              tubes[
                selectedTube
              ],
              tubes[idx],
            )
          ) {
            SFX.pour();

            updateStats({
              totalPours: 1,
            });
          } else if (
            !tubes[idx]
              .colors.length
          ) {
            SFX.invalid();
          } else {
            SFX.select();
          }
        } else if (
          selectedTube === null
        ) {
          if (
            !tubes[idx]
              .colors.length
          ) {
            SFX.invalid();
          } else {
            SFX.select();
          }
        } else {
          SFX.deselect();
        }

        dispatch({
          type: "SELECT_TUBE",
          idx,
        });
      },
      [],
    );

  // ── Undo ────────────────────────────────────────────────────────────────────

  const handleUndo =
    useCallback(
      () => {
        const cur = stateRef.current;
        if (
          !cur.gameState ||
          cur.gameState.history.length === 0
        ) {
          return;
        }

        SFX.undo();
        updateStats({
          totalUndosUsed: 1,
        });
        dispatch({
          type: "UNDO",
        });
      },
      [],
    );

  // ── Restart ─────────────────────────────────────────────────────────────────

  const handleRestart =
    useCallback(
      () => {
        SFX.tap();

        dispatch({
          type: "RESTART",
        });
      },
      [],
    );

  // ── Hint ────────────────────────────────────────────────────────────────────

  const handleHint =
    useCallback(
      () => {
        const current =
          stateRef.current;

        if (
          !current.gameState ||
          current.gameState.isComplete
        ) {
          return;
        }

        SFX.hint();
        dispatch({
          type: "SHOW_HINT",
        });
      },
      [],
    );

  // ── Skip ────────────────────────────────────────────────────────────────────

  const handleSkip =
    useCallback(
      () => {
        const current =
          stateRef.current;

        if (
          !current.gameState ||
          current.gameState.isComplete
        ) {
          return;
        }

        if (
          current.currentLevel >=
          TOTAL_LEVELS
        ) {
          return;
        }

        // 💎 VIP Bypass: Instant skip without ads
        const isVip =
          typeof window !== "undefined" &&
          localStorage.getItem("ws2_is_premium") === "true";

        if (isVip) {
          const latest = stateRef.current;
          const nextLevel = Math.min(
            TOTAL_LEVELS,
            latest.currentLevel + 1,
          );

          const nextProgress = {
            ...latest.progress,
            maxUnlockedLevel: Math.max(
              latest.progress.maxUnlockedLevel,
              nextLevel,
            ),
          };

          saveProgress(nextProgress);
          dispatch({
            type: "SYNC_PROGRESS",
            progress: nextProgress,
          });
          dispatch({
            type: "NEXT_LEVEL",
          });
          return;
        }

        // 🔒 Stop duplicate ads
        if (
          adShowingRef.current
        ) {
          console.log(
            "[Game] Ad already showing",
          );
          return;
        }

        adShowingRef.current =
          true;

        showRewardedAd(
          "skip",

          // ✅ Reward received
          () => {
            adShowingRef.current =
              false;

            const latest =
              stateRef.current;

            if (
              !latest.gameState ||
              latest.gameState.isComplete
            ) {
              return;
            }

            const nextLevel =
              Math.min(
                TOTAL_LEVELS,
                latest.currentLevel +
                  1,
              );

            const nextProgress = {
              ...latest.progress,

              maxUnlockedLevel:
                Math.max(
                  latest.progress
                    .maxUnlockedLevel,
                  nextLevel,
                ),
            };

            saveProgress(
              nextProgress,
            );

            dispatch({
              type:
                "SYNC_PROGRESS",
              progress:
                nextProgress,
            });

            dispatch({
              type:
                "NEXT_LEVEL",
            });
          },

          // ❌ Ad failed
          () => {
            adShowingRef.current =
              false;

            console.log(
              "[Game] Skip ad failed",
            );

            SFX.invalid();
          },
        );
      },
      [],
    );

  // ── Next Level ──────────────────────────────────────────────────────────────

  const handleNextLevel =
    useCallback(
      () => {
        dispatch({
          type:
            "NEXT_LEVEL",
        });
      },
      [],
    );

  // ── Achievement ─────────────────────────────────────────────────────────────

  const dismissAchievement =
    useCallback(
      (id: string) => {
        markAchievementSeen(
          id,
        );

        dispatch({
          type:
            "DISMISS_ACHIEVEMENT",
          id,
        });
      },
      [],
    );

  // ── Daily Reward ────────────────────────────────────────────────────────────

  const claimDaily =
    useCallback(
      () => {
        SFX.dailyReward();

        dispatch({
          type:
            "CLAIM_DAILY_REWARD",
        });
      },
      [],
    );

  // ── Chest ───────────────────────────────────────────────────────────────────

  const claimPendingChest =
    useCallback(
      () => {
        dispatch({
          type: "SET_CHEST",
          chest: null,
        });
      },
      [],
    );

  // ── Timer ───────────────────────────────────────────────────────────────────

  const pauseTimer =
    useCallback(
      () => {
        dispatch({
          type:
            "PAUSE_TIMER",
        });
      },
      [],
    );

  const resumeTimer =
    useCallback(
      () => {
        dispatch({
          type:
            "RESUME_TIMER",
        });
      },
      [],
    );

  // ── Cosmetics ───────────────────────────────────────────────────────────────

  const refreshCosmetics =
    useCallback(
      () => {
        dispatch({
          type:
            "SYNC_COSMETICS",

          cosmetics:
            loadCosmetics(),
        });
      },
      [],
    );

  // ── Challenges ──────────────────────────────────────────────────────────────

  const refreshChallenges =
    useCallback(
      () => {
        dispatch({
          type:
            "SYNC_CHALLENGES",

          challenges:
            loadChallenges(),
        });
      },
      [],
    );

  // ─── Provider ──────────────────────────────────────────────────────────────

  return (
    <GameContext.Provider
      value={{
        state,

        navigate,

        startLevel,

        handleTubeSelect,

        handleUndo,

        handleRestart,

        handleHint,

        handleSkip,

        handleNextLevel,

        dismissAchievement,

        claimDaily,

        claimPendingChest,

        pauseTimer,

        resumeTimer,

        refreshCosmetics,

        refreshChallenges,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGame(): GameContextValue {
  const ctx =
    useContext(GameContext);

  if (!ctx) {
    throw new Error(
      "useGame must be used inside GameProvider",
    );
  }

  return ctx;
}