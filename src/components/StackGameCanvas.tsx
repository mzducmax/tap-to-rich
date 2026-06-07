/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Block, Debris, GameStats, TimeOfDay } from '../types';
import { audioManager } from '../utils/audio';

/** Hụt hoàn toàn — trừ penalty box; chỉ game over khi score < penalty */
export const MISS_PENALTY_BOXES = 50;

interface StackGameCanvasProps {
  timeOfDay: TimeOfDay;
  onStatsChange: (stats: GameStats) => void;
  onGameOver: (finalScore: number) => void;
  onGameReset: () => void;
  onMissPenalty?: (remainingScore: number) => void;
  isMuted: boolean;
  targetScore: number;
  /** Stop sway during survival countdown (parent syncs score + timer) */
  freezeSway?: boolean;
}

export interface StackGameCanvasHandle {
  placeBlock: () => void;
  resetGame: () => void;
  destroyTopBoxes: (count: number) => void;
  autoBuildBoxes: (count: number) => void;
  triggerAutoBuild50: () => void;
}

const BLOCK_HEIGHT =20;
const BASE_SIZE = 120;
const MOVEMENT_BOUNDS = 220; // oscillation range
// ADJUST THIS SPEED PATH VALUE TO MAKE THE BOXES MOVE FASTER OR SLOWER (e.g., 2.8)
const BASE_SPEED = 3.6;
const SPEED_INC = 0.08;
/** Frames between each help-box place and each destroy pop (same rate for both). */
const LIVE_QUEUE_FRAME_INTERVAL = 2;
/** Logic tick rate — movement/help/destroy run at this rate on every machine. */
const TARGET_FPS = 60;
const FIXED_STEP_MS = 1000 / TARGET_FPS;
const MAX_FRAME_MS = 250;

export const StackGameCanvas = forwardRef<StackGameCanvasHandle, StackGameCanvasProps>(
  (
    { timeOfDay, onStatsChange, onGameOver, onGameReset, onMissPenalty, isMuted, targetScore, freezeSway = false },
    ref,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const targetScoreRef = useRef(targetScore);
    const freezeSwayRef = useRef(freezeSway);
    targetScoreRef.current = targetScore;
    freezeSwayRef.current = freezeSway;

    // Game state tracking inside refs for 60fps sync without triggering react re-renders
    const stateRef = useRef({
      blocks: [] as Block[],
      debris: [] as Debris[],
      score: 0,
      highScore: Number(localStorage.getItem('stack_high_score') || 0),
      perfectStreak: 0,
      currentLevel: 0,

      // Active moving block
      activeBlock: {
        x: 0,
        z: 0,
        width: BASE_SIZE,
        depth: BASE_SIZE,
        y: BLOCK_HEIGHT,
        hue: 200,
      },
      moveDirection: 1, // 1 or -1
      moveAxis: 'x' as 'x' | 'z', // Alternates between x and z
      isPlacing: false,
      gameOver: false,

      // Scrolling camera
      cameraY: 0,
      targetCameraY: 0,

      // Auto building simulation state
      isAutoBuilding: false,
      autoBuildCount: 0,
      autoBuildDelayTicks: 0,

      // Destruction cascade state
      destructionQueueRemaining: 0,
      destructionDelayTicks: 0,
    });

    const [isGameOverState, setIsGameOverState] = useState(false);
    const [scoreDisplay, setScoreDisplay] = useState(0);
    const [perfectCombo, setPerfectCombo] = useState<{ show: boolean; count: number; x: number }>({ show: false, count: 0, x: 0 });
    const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Reset everything
    const doResetGame = () => {
      // Clear perfect combo indicator
      if (comboTimeoutRef.current) {
        clearTimeout(comboTimeoutRef.current);
      }
      setPerfectCombo({ show: false, count: 0, x: 0 });

      const startHue = Math.floor(Math.random() * 360);
      const initialStack: Block[] = [
        {
          id: 'base',
          x: 0,
          z: 0,
          width: BASE_SIZE,
          depth: BASE_SIZE,
          y: 0,
          hue: startHue,
        },
      ];

      stateRef.current = {
        blocks: initialStack,
        debris: [],
        score: 0,
        highScore: Number(localStorage.getItem('stack_high_score') || 0),
        perfectStreak: 0,
        currentLevel: 1,
        activeBlock: {
          x: -MOVEMENT_BOUNDS,
          z: 0,
          width: BASE_SIZE,
          depth: BASE_SIZE,
          y: BLOCK_HEIGHT,
          hue: (startHue + 15) % 360,
        },
        moveDirection: 1,
        moveAxis: 'x',
        isPlacing: false,
        gameOver: false,
        cameraY: -100,
        targetCameraY: 0,
        isAutoBuilding: false,
        autoBuildCount: 0,
        autoBuildDelayTicks: 0,
        destructionQueueRemaining: 0,
        destructionDelayTicks: 0,
      };

      setIsGameOverState(false);
      setScoreDisplay(0);
      onGameReset();
      updateReactStats();
    };

    // Calculate current stats and emit to parent
    const updateReactStats = () => {
      const s = stateRef.current;
      onStatsChange({
        score: s.score,
        highScore: s.highScore,
        perfectStreak: s.perfectStreak,
        totalBoxesStacked: s.blocks.length,
      });
      setScoreDisplay(s.score);
    };

    const triggerComboPop = (count: number) => {
      if (comboTimeoutRef.current) {
        clearTimeout(comboTimeoutRef.current);
      }
      setPerfectCombo({ show: true, count, x: Math.random() });
      comboTimeoutRef.current = setTimeout(() => {
        setPerfectCombo({ show: false, count: 0, x: 0 });
      }, 750); // Fast popup dismiss (originally 1400ms)
    };

    // Slice / Cut off box logic
    const doPlaceBlock = () => {
      const s = stateRef.current;
      if (s.gameOver || s.isPlacing || s.destructionQueueRemaining > 0) return;
      if (s.score >= targetScoreRef.current || freezeSwayRef.current) {
        return;
      }

      s.isPlacing = true;
      const prev = s.blocks[s.blocks.length - 1];
      const active = s.activeBlock;

      let perfectSnap = false;
      let isSuccess = false;

      // Color dynamics for next box (gradient logic cycling hue)
      const nextHue = (active.hue + 12) % 360;

      if (s.moveAxis === 'x') {
        const diff = active.x - prev.x;
        const tolerance = 14.5; // Super generous snapping tolerance (originally 4.5)

        if (Math.abs(diff) < tolerance) {
          // PERFECT! Snap directly to previous position
          perfectSnap = true;
          isSuccess = true;
          active.x = prev.x;
          active.width = prev.width;
          active.depth = prev.depth;
        } else {
          // Partial overlap
          const minX = Math.max(prev.x - prev.width / 2, active.x - active.width / 2);
          const maxX = Math.min(prev.x + prev.width / 2, active.x + active.width / 2);
          const overlapWidth = maxX - minX;

          if (overlapWidth > 0) {
            isSuccess = true;
            const overlapCenterX = (minX + maxX) / 2;

            // Generate debris on sliced part
            const debrisWidth = active.width - overlapWidth;
            let debrisCenterX = 0;
            if (active.x > prev.x) {
              // sliced to the right
              debrisCenterX = maxX + debrisWidth / 2;
            } else {
              // sliced to the left
              debrisCenterX = minX - debrisWidth / 2;
            }

            // Push debris
            s.debris.push({
              id: 'deb_' + Date.now() + '_' + Math.random(),
              x: debrisCenterX,
              z: active.z,
              width: debrisWidth,
              depth: active.depth,
              y: active.y,
              hue: active.hue,
              vx: (active.x > prev.x ? 1.5 : -1.5) + (Math.random() - 0.5) * 0.5,
              vy: 2.0,
              vz: (Math.random() - 0.5) * 0.5,
              alpha: 1.0,
            });

            // Crop the active block size and reposition
            active.width = overlapWidth;
            active.x = overlapCenterX;
          }
        }
      } else {
        // Z axis movement
        const diff = active.z - prev.z;
        const tolerance = 14.5; // Super generous snapping tolerance (originally 4.5)

        if (Math.abs(diff) < tolerance) {
          perfectSnap = true;
          isSuccess = true;
          active.z = prev.z;
          active.width = prev.width;
          active.depth = prev.depth;
        } else {
          const minZ = Math.max(prev.z - prev.depth / 2, active.z - active.depth / 2);
          const maxZ = Math.min(prev.z + prev.depth / 2, active.z + active.depth / 2);
          const overlapDepth = maxZ - minZ;

          if (overlapDepth > 0) {
            isSuccess = true;
            const overlapCenterZ = (minZ + maxZ) / 2;

            // Generate debris along Z axis
            const debrisDepth = active.depth - overlapDepth;
            let debrisCenterZ = 0;
            if (active.z > prev.z) {
              debrisCenterZ = maxZ + debrisDepth / 2;
            } else {
              debrisCenterZ = minZ - debrisDepth / 2;
            }

            // Push debris
            s.debris.push({
              id: 'deb_' + Date.now() + '_' + Math.random(),
              x: active.x,
              z: debrisCenterZ,
              width: active.width,
              depth: debrisDepth,
              y: active.y,
              hue: active.hue,
              vx: (Math.random() - 0.5) * 0.5,
              vy: 2.0,
              vz: (active.z > prev.z ? 1.5 : -1.5) + (Math.random() - 0.5) * 0.5,
              alpha: 1.0,
            });

            active.depth = overlapDepth;
            active.z = overlapCenterZ;
          }
        }
      }

      if (isSuccess) {
        // Handle successfully stacked block
        const newBlock: Block = {
          id: 'blk_' + s.currentLevel,
          x: active.x,
          z: active.z,
          width: active.width,
          depth: active.depth,
          y: active.y,
          hue: active.hue,
        };

        s.blocks.push(newBlock);

        // Gorgeous placement effects: spawn sparkling stars & rings bursting directly from this newly added block!
        const sparkleCount = perfectSnap ? 28 : 16;
        for (let j = 0; j < sparkleCount; j++) {
          s.debris.push({
            id: 'magic_spark_manual_' + j + '_' + Date.now() + '_' + Math.random(),
            x: active.x + (Math.random() - 0.5) * active.width,
            z: active.z + (Math.random() - 0.5) * active.depth,
            y: active.y + BLOCK_HEIGHT,
            width: 0,
            depth: 0,
            hue: active.hue,
            vx: (Math.random() - 0.5) * (perfectSnap ? 8 : 5),
            vy: (perfectSnap ? 6 : 4) + Math.random() * 5,
            vz: (Math.random() - 0.5) * (perfectSnap ? 8 : 5),
            alpha: 1.0,
            isSparkle: true,
            sparkleSize: (perfectSnap ? 7.5 : 5) + Math.random() * 6,
            sparkleColor: perfectSnap 
              ? `hsl(${(active.hue + 45) % 360}, 100%, 82%)`
              : `hsl(${active.hue}, 100%, 75%)`,
            sparkleShape: perfectSnap ? (Math.random() > 0.35 ? 'star' : 'ring') : 'star',
          });
        }

        // Add 3 beautiful expanding ring ripples as requested for awesome success visuals
        for (let r = 0; r < 3; r++) {
          s.debris.push({
            id: 'success_ring_' + r + '_' + Date.now() + '_' + Math.random(),
            x: active.x,
            z: active.z,
            y: active.y + BLOCK_HEIGHT,
            width: 0,
            depth: 0,
            hue: active.hue,
            vx: 0,
            vy: 0.1 * r,
            vz: 0,
            alpha: 1.0,
            isSparkle: true,
            sparkleSize: (20 + r * 20) * 1.5,
            sparkleColor: `hsla(${(active.hue + r * 30) % 360}, 100%, 78%, 0.85)`,
            sparkleShape: 'ring',
          });
        }

        // Score modifiers - Score is directly equal to the stacked box count!
        if (perfectSnap) {
          s.perfectStreak += 1;
          s.score = s.blocks.length - 1;
          audioManager.playPerfectChime(s.perfectStreak);
          triggerComboPop(s.perfectStreak);

          // Fun combo mechanic: if 5 perfects in a row, expand the box size slightly to reward players!
          if (s.perfectStreak >= 5) {
            const expandAmount = 6;
            // Expand size but capped at BASE_SIZE
            newBlock.width = Math.min(BASE_SIZE, newBlock.width + expandAmount);
            newBlock.depth = Math.min(BASE_SIZE, newBlock.depth + expandAmount);
          }
        } else {
          s.perfectStreak = 0;
          if (comboTimeoutRef.current) {
            clearTimeout(comboTimeoutRef.current);
          }
          setPerfectCombo({ show: false, count: 0, x: 0 });
          s.score = s.blocks.length - 1;
          audioManager.playPop();
        }

        // Higher high scores updates
        if (s.score > s.highScore) {
          s.highScore = s.score;
          localStorage.setItem('stack_high_score', String(s.highScore));
        }

        // Setup next Level
        s.currentLevel += 1;
        const nextAxis = s.moveAxis === 'x' ? 'z' : 'x';
        
        // Spawn next moving block off-screen and alternating start direction
        const startOffset = -MOVEMENT_BOUNDS;

        s.activeBlock = {
          x: nextAxis === 'x' ? startOffset : active.x,
          z: nextAxis === 'z' ? startOffset : active.z,
          width: newBlock.width,
          depth: newBlock.depth,
          y: s.currentLevel * BLOCK_HEIGHT,
          hue: nextHue,
        };

        s.moveAxis = nextAxis;
        s.moveDirection = 1;
        s.targetCameraY = (s.currentLevel - 3) * BLOCK_HEIGHT; // Smoothly slide camera slightly below focus level

        updateReactStats();
        s.isPlacing = false;
      } else {
        // FAIL / COMPLETELY MISSES — trừ 50 box nếu đủ; không đủ 50 mới thua
        s.isAutoBuilding = false;
        audioManager.playMiss();

        s.debris.push({
          id: 'fail_chunk_' + Date.now(),
          x: active.x,
          z: active.z,
          width: active.width,
          depth: active.depth,
          y: active.y,
          hue: active.hue,
          vx: s.moveAxis === 'x' ? s.moveDirection * 3.5 : 0,
          vy: 0.5,
          vz: s.moveAxis === 'z' ? s.moveDirection * 3.5 : 0,
          alpha: 1.0,
        });

        const currentScore = s.blocks.length - 1;

        if (currentScore < MISS_PENALTY_BOXES) {
          s.gameOver = true;
          setIsGameOverState(true);
          onGameOver(s.score);
        } else {
          s.perfectStreak = 0;
          if (comboTimeoutRef.current) {
            clearTimeout(comboTimeoutRef.current);
          }
          setPerfectCombo({ show: false, count: 0, x: 0 });

          doDestroyTopBoxes(MISS_PENALTY_BOXES);
          s.isPlacing = false;
          onMissPenalty?.(currentScore - MISS_PENALTY_BOXES);
        }
      }
    };

    // Bulk destruction — queues independently from auto-build (can run in parallel).
    const doDestroyTopBoxes = (count: number) => {
      const s = stateRef.current;
      if (s.gameOver || s.blocks.length <= 1) return;

      s.isPlacing = false;
      const wasIdle = (s.destructionQueueRemaining || 0) === 0;
      s.destructionQueueRemaining = (s.destructionQueueRemaining || 0) + count;
      if (wasIdle) {
        s.destructionDelayTicks = LIVE_QUEUE_FRAME_INTERVAL;
      }
    };

    const doAutoBuildBoxes = (count: number) => {
      const safeCount = Math.max(1, Math.floor(count));
      const s = stateRef.current;
      if (s.gameOver) {
        doResetGame();
      }
      if (s.score >= targetScoreRef.current || freezeSwayRef.current) return;
      const wasIdle = !s.isAutoBuilding || (s.autoBuildCount || 0) === 0;
      s.isAutoBuilding = true;
      s.autoBuildCount = (s.autoBuildCount || 0) + safeCount;
      if (wasIdle) {
        s.autoBuildDelayTicks = LIVE_QUEUE_FRAME_INTERVAL;
      }
    };

    // Trigger automated Bot placing 50 boxes
    const doTriggerAutoBuild50 = () => {
      doAutoBuildBoxes(50);
    };

    // Expose methods to parent components via forwardRef
    useImperativeHandle(ref, () => ({
      placeBlock: doPlaceBlock,
      resetGame: doResetGame,
      destroyTopBoxes: doDestroyTopBoxes,
      autoBuildBoxes: doAutoBuildBoxes,
      triggerAutoBuild50: doTriggerAutoBuild50,
    }));

    // Infinite canvas loop
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationId: number;

      const resizeCanvas = () => {
        const container = containerRef.current;
        if (!container || !canvas) return;

        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
      };

      // Create standard resilient ResizeObserver to track container dimension shifts
      let resizeObserver: ResizeObserver | null = null;
      if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(() => {
          resizeCanvas();
        });
        if (containerRef.current) {
          resizeObserver.observe(containerRef.current);
        }
      }

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // Fixed 60Hz simulation + render every display frame (120Hz monitors stay same game speed)
      let lastFrameTime = performance.now();
      let timeAccumulator = 0;

      const fixedUpdate = () => {
        const s = stateRef.current;

        // 1. UPDATE SPEEDS & POSITIONS — freeze only during survival (parent freezeSway)
        if (!s.gameOver && !freezeSwayRef.current) {
          const speed = BASE_SPEED;

          if (s.moveAxis === 'x') {
            s.activeBlock.x += speed * s.moveDirection;
            if (s.activeBlock.x > MOVEMENT_BOUNDS) {
              s.activeBlock.x = MOVEMENT_BOUNDS;
              s.moveDirection = -1;
            } else if (s.activeBlock.x < -MOVEMENT_BOUNDS) {
              s.activeBlock.x = -MOVEMENT_BOUNDS;
              s.moveDirection = 1;
            }
          } else {
            s.activeBlock.z += speed * s.moveDirection;
            if (s.activeBlock.z > MOVEMENT_BOUNDS) {
              s.activeBlock.z = MOVEMENT_BOUNDS;
              s.moveDirection = -1;
            } else if (s.activeBlock.z < -MOVEMENT_BOUNDS) {
              s.activeBlock.z = -MOVEMENT_BOUNDS;
              s.moveDirection = 1;
            }
          }
        }

        if (!s.gameOver) {
          // Automated Super-Fast Stacking logic (+50 directly upward!)
          if (s.isAutoBuilding && s.autoBuildCount > 0) {
            if (s.score >= targetScoreRef.current || freezeSwayRef.current) {
              s.isAutoBuilding = false;
              s.autoBuildCount = 0;
            } else {
              s.autoBuildDelayTicks -= 1;

              if (s.autoBuildDelayTicks <= 0) {
                s.autoBuildDelayTicks = LIVE_QUEUE_FRAME_INTERVAL;

                const prev = s.blocks[s.blocks.length - 1];
                const active = s.activeBlock;

                // Direct Snap - Place directly stacked on top!
                active.x = prev.x;
                active.z = prev.z;
                active.width = prev.width;
                active.depth = prev.depth;

                const nextHue = (active.hue + 12) % 360;
                const newBlock: Block = {
                  id: 'blk_' + s.currentLevel,
                  x: active.x,
                  z: active.z,
                  width: active.width,
                  depth: active.depth,
                  y: active.y,
                  hue: active.hue,
                };

                s.blocks.push(newBlock);

                // Perfect Score counts for super-fast build
                s.perfectStreak += 1;
                s.score = s.blocks.length - 1;
                audioManager.playPerfectChime(Math.min(5, 1 + (s.perfectStreak % 5)));

                // Spawn gorgeous sparkling stars & rings bursting directly from this newly added block!
                for (let j = 0; j < 12; j++) {
                  s.debris.push({
                    id: 'magic_spark_' + j + '_' + Date.now() + '_' + Math.random(),
                    x: active.x + (Math.random() - 0.5) * active.width,
                    z: active.z + (Math.random() - 0.5) * active.depth,
                    y: active.y + BLOCK_HEIGHT,
                    width: 0,
                    depth: 0,
                    hue: active.hue,
                    vx: (Math.random() - 0.5) * 5,
                    vy: 3 + Math.random() * 4,
                    vz: (Math.random() - 0.5) * 5,
                    alpha: 1.0,
                    isSparkle: true,
                    sparkleSize: 4 + Math.random() * 6,
                    sparkleColor: `hsl(${(active.hue + 30) % 360}, 100%, 75%)`,
                    sparkleShape: Math.random() > 0.4 ? 'star' : 'ring',
                  });
                }

                if (s.score > s.highScore) {
                  s.highScore = s.score;
                  localStorage.setItem('stack_high_score', String(s.highScore));
                }

                s.currentLevel += 1;
                const nextAxis = s.moveAxis === 'x' ? 'z' : 'x';
                const startOffset = -MOVEMENT_BOUNDS;

                s.activeBlock = {
                  x: nextAxis === 'x' ? startOffset : active.x,
                  z: nextAxis === 'z' ? startOffset : active.z,
                  width: newBlock.width,
                  depth: newBlock.depth,
                  y: s.currentLevel * BLOCK_HEIGHT,
                  hue: nextHue,
                };

                s.moveAxis = nextAxis;
                s.moveDirection = 1;
                s.targetCameraY = (s.currentLevel - 3) * BLOCK_HEIGHT;

                updateReactStats();
                s.autoBuildCount -= 1;
                if (s.autoBuildCount <= 0) {
                  s.isAutoBuilding = false;
                }
              }
            }
          }

          // Cascading box destruction logic block (-2 / -25 box step-demolition)
          if (s.destructionQueueRemaining > 0) {
            s.destructionDelayTicks -= 1;
            if (s.destructionDelayTicks <= 0) {
              s.destructionDelayTicks = LIVE_QUEUE_FRAME_INTERVAL;

              if (s.blocks.length > 1) {
                const blk = s.blocks.pop();
                s.destructionQueueRemaining -= 1;
                audioManager.playPop(); // crisp shatter feedback sound

                if (blk) {
                  // Shatter chunks
                  for (let k = 0; k < 6; k++) {
                    s.debris.push({
                      id: 'crumbs_' + k + '_' + Date.now() + '_' + Math.random(),
                      x: blk.x + (Math.random() - 0.5) * blk.width,
                      z: blk.z + (Math.random() - 0.5) * blk.depth,
                      width: blk.width * 0.2,
                      depth: blk.depth * 0.2,
                      y: blk.y + BLOCK_HEIGHT / 2,
                      hue: blk.hue,
                      vx: (Math.random() - 0.5) * 8,
                      vy: 3 + Math.random() * 5,
                      vz: (Math.random() - 0.5) * 8,
                      alpha: 1.0,
                    });
                  }
                  // Beautiful spark details falling off
                  for (let sIdx = 0; sIdx < 8; sIdx++) {
                    s.debris.push({
                      id: 'shatter_spark_' + sIdx + '_' + Date.now(),
                      x: blk.x + (Math.random() - 0.5) * blk.width,
                      z: blk.z + (Math.random() - 0.5) * blk.depth,
                      y: blk.y + BLOCK_HEIGHT / 2,
                      width: 0,
                      depth: 0,
                      hue: blk.hue,
                      vx: (Math.random() - 0.5) * 6,
                      vy: 1 + Math.random() * 5,
                      vz: (Math.random() - 0.5) * 6,
                      alpha: 1.0,
                      isSparkle: true,
                      sparkleSize: 3 + Math.random() * 4,
                      sparkleColor: `hsl(${blk.hue}, 100%, 75%)`,
                      sparkleShape: 'star',
                    });
                  }
                }

                // Re-align stack markers
                const topBlock = s.blocks[s.blocks.length - 1];
                s.currentLevel = s.blocks.length;

                const nextHue = (topBlock.hue + 12) % 360;
                s.activeBlock = {
                  x: s.moveAxis === 'x' ? -MOVEMENT_BOUNDS : topBlock.x,
                  z: s.moveAxis === 'z' ? -MOVEMENT_BOUNDS : topBlock.z,
                  width: topBlock.width,
                  depth: topBlock.depth,
                  y: s.currentLevel * BLOCK_HEIGHT,
                  hue: nextHue,
                };

                s.score = s.blocks.length - 1;
                s.perfectStreak = 0;
                s.targetCameraY = (s.currentLevel - 3) * BLOCK_HEIGHT;
                updateReactStats();
              } else {
                s.destructionQueueRemaining = 0;
              }

              if (s.destructionQueueRemaining <= 0) {
                s.isPlacing = false;
              }
            }
          }
        }

        // 2. UPDATE PHYSICAL DEBRIS PARTICLES
        s.debris.forEach((deb) => {
          deb.x += deb.vx;
          deb.y += deb.vy;
          deb.z += deb.vz;
          deb.vy -= 0.55; // gravity pulling down
          deb.alpha -= 0.016; // soft fadeout
        });

        // Filter out fully dissolved debris
        s.debris = s.debris.filter((deb) => deb.alpha > 0 && deb.y > -200);

        // 3. INTERPOLATE CAMERA POSITION (Lerp)
        s.cameraY = s.cameraY * 0.9 + s.targetCameraY * 0.1;
      };

      const render = () => {
        const s = stateRef.current;
        const cw = canvas.width / (window.devicePixelRatio || 1);
        const ch = canvas.height / (window.devicePixelRatio || 1);

        // 4. DRAW GRAPHICS
        ctx.clearRect(0, 0, cw, ch);

        // Projection mapping
        const transform = (wx: number, wy: number, wz: number) => {
          // Standard isometric angles
          const scale = 1.15;
          const isoX = (wx - wz) * Math.cos(Math.PI / 6) * scale;
          // Subtracted raw height (wy) and offset camera position (s.cameraY)
          const isoY = (wx + wz) * Math.sin(Math.PI / 6) * scale - wy + s.cameraY;
          return {
            x: cw / 2 + isoX,
            y: ch * 0.65 + isoY,
          };
        };

        const drawPolygon = (pts: { x: number; y: number }[], fillStyle: string, strokeStyle: string) => {
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.closePath();
          ctx.fillStyle = fillStyle;
          ctx.fill();
          ctx.strokeStyle = strokeStyle;
          ctx.lineWidth = 2.0;
          ctx.stroke();
        };

        const renderBlockAndShading = (
          blkX: number,
          blkY: number,
          blkZ: number,
          w: number,
          d: number,
          h: number,
          hue: number,
          alpha: number = 1.0
        ) => {
          const topColor = `hsla(${hue}, 88%, 56%, ${alpha})`;
          const rightFaceColor = `hsla(${hue}, 78%, 40%, ${alpha})`;
          const leftFaceColor = `hsla(${hue}, 72%, 28%, ${alpha})`;
          const strokeColor = `rgba(10, 10, 10, ${alpha * 0.9})`;

          const x1 = blkX - w / 2;
          const x2 = blkX + w / 2;
          const z1 = blkZ - d / 2;
          const z2 = blkZ + d / 2;

          // Top Face corners
          const t1 = transform(x1, blkY + h, z1);
          const t2 = transform(x2, blkY + h, z1);
          const t3 = transform(x2, blkY + h, z2);
          const t4 = transform(x1, blkY + h, z2);

          // Bottom Face corners
          const b2 = transform(x2, blkY, z1);
          const b3 = transform(x2, blkY, z2);
          const b4 = transform(x1, blkY, z2);

          // Render bottom-front faces first, then top head
          // 1. Left Front
          drawPolygon([t4, t3, b3, b4], leftFaceColor, strokeColor);
          // 2. Right Front
          drawPolygon([t3, t2, b2, b3], rightFaceColor, strokeColor);
          // 3. Top surface
          drawPolygon([t1, t2, t3, t4], topColor, strokeColor);
        };

        // Render Stack Blocks (Optimized: skip drawing blocks too far down offscreen to save GPU render time)
        s.blocks.forEach((blk, idx) => {
          // Basic culling check: if block Y is too far below the camera window, paint it faster or fade
          const renderIdx = s.currentLevel - idx;
          if (renderIdx > 18) {
            // Draw a subtle translucent fade for ancient foundation blocks to look volumetric
            const alphaMul = Math.max(0, 1 - (renderIdx - 18) / 6);
            if (alphaMul > 0) {
              renderBlockAndShading(blk.x, blk.y, blk.z, blk.width, blk.depth, BLOCK_HEIGHT, blk.hue, alphaMul);
            }
          } else {
            renderBlockAndShading(blk.x, blk.y, blk.z, blk.width, blk.depth, BLOCK_HEIGHT, blk.hue, 1.0);
          }
        });

        // Render physically falling sliced chunks & magical special effects sparkles
        s.debris.forEach((deb) => {
          if (deb.isSparkle) {
            const pos = transform(deb.x, deb.y, deb.z);
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, deb.alpha));
            ctx.fillStyle = deb.sparkleColor || '#facc15';
            ctx.shadowBlur = 10;
            ctx.shadowColor = deb.sparkleColor || '#facc15';
            const size = deb.sparkleSize || 5;

            if (deb.sparkleShape === 'star') {
              ctx.beginPath();
              const px = pos.x;
              const py = pos.y;
              for (let i = 0; i < 5; i++) {
                ctx.lineTo(px + Math.cos((18 + i * 72) * Math.PI / 180) * size, py - Math.sin((18 + i * 72) * Math.PI / 180) * size);
                ctx.lineTo(px + Math.cos((54 + i * 72) * Math.PI / 180) * (size / 2.5), py - Math.sin((54 + i * 72) * Math.PI / 180) * (size / 2.5));
              }
              ctx.closePath();
              ctx.fill();
            } else if (deb.sparkleShape === 'ring') {
              ctx.beginPath();
              ctx.arc(pos.x, pos.y, size * (2.2 - deb.alpha), 0, Math.PI * 2);
              ctx.strokeStyle = deb.sparkleColor || '#ec4899';
              ctx.lineWidth = 2.5;
              ctx.stroke();
            } else {
              ctx.beginPath();
              ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          } else {
            renderBlockAndShading(deb.x, deb.y, deb.z, deb.width, deb.depth, BLOCK_HEIGHT, deb.hue, deb.alpha);
          }
        });

        // Render Active oscillating placing block
        if (!s.gameOver) {
          renderBlockAndShading(
            s.activeBlock.x,
            s.activeBlock.y,
            s.activeBlock.z,
            s.activeBlock.width,
            s.activeBlock.depth,
            BLOCK_HEIGHT,
            s.activeBlock.hue,
            1.0
          );
        }
      };

      const loop = (now: number) => {
        let frameDelta = now - lastFrameTime;
        if (!Number.isFinite(frameDelta) || frameDelta < 0) {
          frameDelta = FIXED_STEP_MS;
        }
        if (frameDelta > MAX_FRAME_MS) {
          frameDelta = MAX_FRAME_MS;
        }
        lastFrameTime = now;
        timeAccumulator += frameDelta;

        while (timeAccumulator >= FIXED_STEP_MS) {
          fixedUpdate();
          timeAccumulator -= FIXED_STEP_MS;
        }

        render();
        animationId = requestAnimationFrame(loop);
      };

      animationId = requestAnimationFrame(loop);

      return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', resizeCanvas);
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      };
    }, []);

    // Set first initial stack base on loading mount
    useEffect(() => {
      doResetGame();
    }, []);

    return (
      <div 
        ref={containerRef} 
        className="w-full h-full relative cursor-pointer overflow-hidden rounded-2xl select-none"
        onClick={() => {
          if (stateRef.current.gameOver) {
            doResetGame();
          } else if (
            !stateRef.current.isAutoBuilding &&
            !freezeSwayRef.current &&
            stateRef.current.score < targetScoreRef.current
          ) {
            doPlaceBlock();
          }
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full bg-transparent" />

        {/* Ambient Overlay for Dusk/Night cycles in Canvas */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-all duration-1000 ${
            timeOfDay === 'night' 
              ? 'bg-indigo-950/10 mix-blend-multiply' 
              : timeOfDay === 'sunset'
              ? 'bg-orange-500/10 mix-blend-color-burn'
              : 'bg-transparent'
          }`} 
        />

        {/* Perfect combo streak flash notification */}
        {perfectCombo.show && !isGameOverState && (
          <div key={perfectCombo.x} className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10 select-none animate-bounce flex flex-col items-center">
            <div className="bg-slate-900/60 backdrop-blur-md border border-yellow-400/30 px-6 py-2.5 rounded-2xl shadow-[0_8px_32px_rgba(253,224,71,0.25)] flex items-center gap-2">
              <span className="text-yellow-300 animate-pulse text-lg">✨</span>
              <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent font-black text-2xl md:text-3xl tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase">
                PERFECT
              </span>
              <span className="text-pink-400 bg-pink-950/70 border border-pink-500/30 font-black text-xs px-2.5 py-0.5 rounded-full shadow-inner">
                x{perfectCombo.count}
              </span>
              <span className="text-yellow-300 animate-pulse text-lg">✨</span>
            </div>
          </div>
        )}

        {/* Game Over HUD modal */}
        {isGameOverState && (
          <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-sm flex flex-col justify-center items-center p-6 text-center select-all cursor-default z-20">
            <div className="bg-white border-4 border-indigo-900 p-8 rounded-3xl max-w-sm w-full shadow-[0_10px_0_#1e1b4b] scale-100 transition-all text-indigo-950">
              <span className="text-yellow-400 text-6xl block mb-2 drop-shadow-md animate-bounce">👑</span>
              <h2 className="text-3xl font-black tracking-tight font-heading text-indigo-900 uppercase">GAME OVER</h2>
              <p className="text-indigo-950/70 text-xs font-bold tracking-widest uppercase mt-1 mb-6">Your sublime tower has collapsed!</p>
 
              <div className="mb-6">
                <div className="bg-blue-50 p-4 rounded-2xl border-2 border-indigo-900 shadow-[0_4px_0_#1e1b4b]">
                  <span className="text-[10px] font-bold text-indigo-950/60 block tracking-widest uppercase mb-1">SCORE ACHIEVED</span>
                  <span className="text-4xl font-black text-emerald-600 block leading-tight">{scoreDisplay} BLOCKS</span>
                </div>
              </div>
 
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  doResetGame();
                }}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-indigo-950 border-2 border-indigo-900 font-extrabold uppercase tracking-wide py-4 px-6 rounded-2xl shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-none transition-all active:scale-95 duration-100 text-base flex items-center justify-center gap-2"
              >
                <span>PLAY AGAIN</span>
                <span>🔄</span>
              </button>
            </div>
          </div>
        )}
 
        {/* Floating click prompt on starting screens */}
        {!isGameOverState && stateRef.current.blocks.length === 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-indigo-950 border-2 border-indigo-900 select-none py-2 px-6 rounded-full text-xs font-extrabold tracking-wide animate-pulse uppercase flex items-center gap-2 pointer-events-none shadow-[0_4px_0_#b45309]">
            <span>👆 Tap anywhere or press Any Key to Drop Block</span>
          </div>
        )}
      </div>
    );
  }
);

StackGameCanvas.displayName = 'StackGameCanvas';
