import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GRAVITY,
  JUMP_VELOCITY,
  PIPE_WIDTH,
  PIPE_GAP,
  BIRD_X,
  BIRD_RADIUS,
  PIPE_SPEED,
  GameState,
  createInitialState,
  updateBird,
  jump as jumpBird,
  updatePipes,
  checkPipeCollision,
  checkBoundaryCollision,
} from './FlappyBird';
import { useKeyboardControls, useTouchControls } from './FlappyBird.controls';

export default function FlappyBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('flappy-bird'));
  const gameStateRef = useRef(gameState);
  const animationFrameRef = useRef<number>(0);

  // Keep ref in sync
  gameStateRef.current = gameState;

  // Input controls
  const handleJump = useCallback(() => {
    if (gameStateRef.current.isRunning && !gameStateRef.current.isGameOver) {
      setGameState(prev => ({
        ...prev,
        bird: jumpBird(prev.bird, JUMP_VELOCITY),
      }));
    }
  }, []);

  useKeyboardControls(handleJump, gameState.isRunning && !gameState.isGameOver);
  useTouchControls(canvasRef, handleJump);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const state = gameStateRef.current;

      // Clear canvas
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (state.isRunning && !state.isGameOver) {
        // Update bird
        let newBird = updateBird(state.bird, GRAVITY);

        // Update pipes
        const newPipes = updatePipes(state.pipes, PIPE_SPEED, state.frame + 1);

        // Check pipe collision
        const pipeResult = checkPipeCollision(newBird, newPipes);
        const newPipesWithScore = pipeResult.updatedPipes;
        const scoreIncrement = pipeResult.scoreIncrement;

        // Check boundary collision
        const boundaryCollision = checkBoundaryCollision(newBird);
        const isGameOver = pipeResult.collision || boundaryCollision;

        // Update state
        const newState: GameState = {
          ...state,
          bird: newBird,
          pipes: newPipesWithScore,
          score: state.score + scoreIncrement,
          frame: state.frame + 1,
          isGameOver,
          isRunning: !isGameOver,
        };

        setGameState(newState);
        gameStateRef.current = newState;

        // Update high score
        if (isGameOver && newState.score > 0) {
          const currentHigh = getHighScore('flappy-bird');
          if (newState.score > currentHigh) {
            setHighScore('flappy-bird', newState.score);
            setHighScoreState(newState.score);
          }
        }
      }

      // Render pipes
      ctx.fillStyle = '#22c55e';
      state.pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topH);
        ctx.fillRect(pipe.x, pipe.topH + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - pipe.topH - PIPE_GAP);
      });

      // Render bird
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(BIRD_X, state.bird.y, BIRD_RADIUS, 0, Math.PI * 2);
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
  }, []);

  const start = useCallback(() => {
    setGameState(prev => ({ ...prev, isRunning: true }));
  }, []);

  return (
    <GameLayout
      title="Flappy Bird"
      score={gameState.score}
      highScore={highScore}
      onReset={reset}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {gameState.isGameOver && <p className="text-red-400">Game Over!</p>}
        {!gameState.isRunning && !gameState.isGameOver && (
          <button
            onClick={start}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg"
          >
            Start
          </button>
        )}
        {gameState.isGameOver && (
          <button
            onClick={reset}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg"
          >
            Play Again
          </button>
        )}
        
        {/* Responsive Canvas */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-[2/3]">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="absolute inset-0 w-full h-full border border-gray-700 rounded-lg cursor-pointer touch-none"
            style={{ touchAction: 'none' }}
          />
        </div>
        
        <p className="text-gray-500 text-xs">Tap or Space to flap</p>
      </div>
    </GameLayout>
  );
}
