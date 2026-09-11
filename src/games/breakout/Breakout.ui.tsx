import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_RADIUS,
  BRICK_WIDTH,
  BRICK_HEIGHT,
  PADDLE_Y,
  GameState,
  createInitialState,
  updateBallPosition,
  checkWallCollision,
  checkPaddleCollision,
  checkBrickCollision,
  checkGameOver,
  checkWin,
} from './Breakout';
import { useMouseControls, useTouchControls } from './Breakout.controls';

export default function Breakout() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('breakout'));
  const gameStateRef = useRef(gameState);
  const paddleXRef = useRef(gameState.paddleX);
  const animationFrameRef = useRef<number>(0);

  // Keep refs in sync
  gameStateRef.current = gameState;
  paddleXRef.current = gameState.paddleX;

  // Input controls
  useMouseControls(canvasRef, paddleXRef);
  useTouchControls(canvasRef, paddleXRef);

  // Sync paddle position from ref to state
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (paddleXRef.current !== gameStateRef.current.paddleX) {
        setGameState(prev => ({ ...prev, paddleX: paddleXRef.current }));
      }
    }, 16); // ~60fps
    return () => clearInterval(syncInterval);
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const state = gameStateRef.current;

      // Clear canvas
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (state.isRunning && !state.isGameOver && !state.isWon) {
        // Update ball position
        let newBall = updateBallPosition(state.ball);
        
        // Check collisions
        newBall = checkWallCollision(newBall);
        newBall = checkPaddleCollision(newBall, state.paddleX);
        
        const brickResult = checkBrickCollision(newBall, state.bricks);
        newBall = brickResult.ball;
        
        const newBricks = brickResult.bricks;
        const scoreIncrement = brickResult.hit ? 10 : 0;

        // Check game over
        const isGameOver = checkGameOver(newBall);
        const isWon = checkWin(newBricks);

        // Update state
        const newState: GameState = {
          ...state,
          ball: newBall,
          bricks: newBricks,
          score: state.score + scoreIncrement,
          isGameOver,
          isWon,
          isRunning: !isGameOver && !isWon,
        };

        setGameState(newState);
        gameStateRef.current = newState;

        // Update high score
        if (isGameOver && newState.score > 0) {
          const currentHigh = getHighScore('breakout');
          if (newState.score > currentHigh) {
            setHighScore('breakout', newState.score);
            setHighScoreState(newState.score);
          }
        }
      }

      // Render bricks
      state.bricks.forEach(brick => {
        if (brick.alive) {
          ctx.fillStyle = brick.color;
          ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
        }
      });

      // Render paddle
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(state.paddleX, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Render ball
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const reset = useCallback(() => {
    const newState = createInitialState();
    newState.isRunning = true;
    setGameState(newState);
    gameStateRef.current = newState;
    paddleXRef.current = newState.paddleX;
  }, []);

  const start = useCallback(() => {
    setGameState(prev => ({ ...prev, isRunning: true }));
  }, []);

  return (
    <GameLayout
      title="Breakout"
      score={gameState.score}
      highScore={highScore}
      onReset={reset}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {gameState.isGameOver && <p className="text-red-400">Game Over!</p>}
        {gameState.isWon && <p className="text-green-400">🎉 You Win!</p>}
        {!gameState.isRunning && !gameState.isGameOver && !gameState.isWon && (
          <button
            onClick={start}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg"
          >
            Start
          </button>
        )}
        {(gameState.isGameOver || gameState.isWon) && (
          <button
            onClick={reset}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg"
          >
            Play Again
          </button>
        )}
        
        {/* Responsive Canvas */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-[4/5]">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="absolute inset-0 w-full h-full border border-gray-700 rounded-lg touch-none"
            style={{ touchAction: 'none' }}
          />
        </div>
      </div>
    </GameLayout>
  );
}
