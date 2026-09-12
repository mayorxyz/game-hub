import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import { playSound } from '../../lib/sound';
import { useGameResult } from '../../hooks/useGameResult';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_RADIUS,
  WIN_SCORE,
  BOT_SPEED,
  GameState,
  createInitialState,
  updateBallPosition,
  checkWallCollision,
  checkPaddleCollision,
  checkScoring,
  updateBotPaddle,
  checkWinCondition,
} from './Pong';
import { useMouseControls, useTouchControls } from './Pong.controls';
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings } from '../../lib/difficulty';

const BASE_BALL_SPEED = 4;

export default function Pong() {
  const { difficulty } = useDifficulty();
  const difficultySettings = getDifficultySettings(difficulty);
  const ballSpeed = BASE_BALL_SPEED * difficultySettings.speedMultiplier;
  const botSpeed = BOT_SPEED * difficultySettings.complexityMultiplier;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(ballSpeed));
  const [highScore, setHighScoreState] = useState(getHighScore('pong'));
  const { record } = useGameResult('pong');
  const gameStateRef = useRef(gameState);
  const playerPaddleYRef = useRef(gameState.playerPaddle.y);
  const animationFrameRef = useRef<number>(0);
  const ballSpeedRef = useRef(ballSpeed);
  ballSpeedRef.current = ballSpeed;
  const botSpeedRef = useRef(botSpeed);
  botSpeedRef.current = botSpeed;

  // Keep refs in sync
  gameStateRef.current = gameState;
  playerPaddleYRef.current = gameState.playerPaddle.y;

  // Input controls
  useMouseControls(canvasRef, playerPaddleYRef);
  useTouchControls(canvasRef, playerPaddleYRef);

  // Sync paddle position from ref to state
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (playerPaddleYRef.current !== gameStateRef.current.playerPaddle.y) {
        setGameState(prev => ({
          ...prev,
          playerPaddle: { ...prev.playerPaddle, y: playerPaddleYRef.current },
        }));
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

      // Draw center line
      ctx.strokeStyle = '#374151';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      if (state.isRunning && !state.isGameOver) {
        // Update ball
        let newBall = updateBallPosition(state.ball);
        
        // Check collisions
        newBall = checkWallCollision(newBall);
        newBall = checkPaddleCollision(newBall, state.playerPaddle.y, true);
        newBall = checkPaddleCollision(newBall, state.botPaddle.y, false);
        
        // Check scoring
        const scoreResult = checkScoring(newBall, state.playerScore, state.botScore, ballSpeedRef.current);
        if (scoreResult.playerScore !== state.playerScore || scoreResult.botScore !== state.botScore) playSound('click');
        newBall = scoreResult.ball;
        
        // Update bot paddle
        const newBotY = updateBotPaddle(state.botPaddle.y, newBall.y, botSpeedRef.current);
        
        // Check win condition
        const winResult = checkWinCondition(scoreResult.playerScore, scoreResult.botScore);
        
        // Update state
        const newState: GameState = {
          ...state,
          ball: newBall,
          botPaddle: { y: newBotY },
          playerScore: scoreResult.playerScore,
          botScore: scoreResult.botScore,
          isGameOver: winResult.isGameOver,
          isRunning: !winResult.isGameOver,
          winner: winResult.winner,
        };

        setGameState(newState);
        gameStateRef.current = newState;

        // Update high score
        if (scoreResult.scored && scoreResult.playerScore > state.playerScore) {
          const currentHigh = getHighScore('pong');
          if (scoreResult.playerScore > currentHigh) {
            setHighScore('pong', scoreResult.playerScore);
            setHighScoreState(scoreResult.playerScore);
          }
        }
      }

      // Render paddles
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(15, state.playerPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(CANVAS_WIDTH - 15 - PADDLE_WIDTH, state.botPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
      
      // Render ball
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      
      // Render scores
      ctx.fillStyle = '#6b7280';
      ctx.font = '24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${state.playerScore}`, CANVAS_WIDTH / 2 - 40, 30);
      ctx.fillText(`${state.botScore}`, CANVAS_WIDTH / 2 + 40, 30);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

    useEffect(() => {
    if (gameState.isGameOver) {
      record({ won: gameState.winner.includes('You win'), score: gameState.playerScore });
    }
  }, [gameState.isGameOver]);

  const reset = useCallback(() => {
    const newState = createInitialState(ballSpeed);
    newState.isRunning = true;
    setGameState(newState);
    gameStateRef.current = newState;
    playerPaddleYRef.current = newState.playerPaddle.y;
  }, [ballSpeed]);

  const start = useCallback(() => {
    setGameState(prev => ({ ...prev, isRunning: true }));
  }, []);

  return (
    <GameLayout
      title="Pong"
      showDifficulty
      score={`${gameState.playerScore} - ${gameState.botScore}`}
      highScore={highScore}
      onReset={reset}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {gameState.isGameOver && (
          <p className="text-xl font-bold text-amber-400">{gameState.winner}</p>
        )}
        {!gameState.isRunning && !gameState.isGameOver && (
          <button
            onClick={start}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg font-bold"
          >
            Start
          </button>
        )}
        {gameState.isGameOver && (
          <button
            onClick={reset}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg font-bold"
          >
            Play Again
          </button>
        )}
        
        {/* Responsive Canvas */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-[4/3]">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="absolute inset-0 w-full h-full border border-gray-700 rounded-lg cursor-none touch-none"
            style={{ touchAction: 'none' }}
          />
        </div>
        <p className="text-gray-500 text-xs">Move mouse/finger to control paddle · First to {WIN_SCORE}</p>
      </div>
    </GameLayout>
  );
}
