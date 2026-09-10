import React, { useState, useEffect, useRef } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/storage';

const W = 400, H = 300;
const PADDLE_H = 60, PADDLE_W = 10, BALL_R = 6;
const WIN_SCORE = 5;

export default function Pong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    ballX: W / 2, ballY: H / 2, dx: 4, dy: 2,
    playerY: H / 2 - PADDLE_H / 2,
    botY: H / 2 - PADDLE_H / 2,
    playerScore: 0, botScore: 0,
    running: false
  });
  const [scores, setScores] = useState({ player: 0, bot: 0 });
  const [highScore, setHS] = useState(getHighScore('pong'));
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const animRef = useRef<number>(0);

  const reset = () => {
    const s = stateRef.current;
    s.ballX = W / 2; s.ballY = H / 2;
    s.dx = (Math.random() > 0.5 ? 1 : -1) * 4;
    s.dy = (Math.random() - 0.5) * 4;
    s.playerScore = 0; s.botScore = 0;
    s.running = true;
    setScores({ player: 0, bot: 0 });
    setGameOver(false); setWinner('');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleY = H / rect.height;
      stateRef.current.playerY = Math.max(0, Math.min(H - PADDLE_H, (e.clientY - rect.top) * scaleY - PADDLE_H / 2));
    };
    const handleTouch = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleY = H / rect.height;
      stateRef.current.playerY = Math.max(0, Math.min(H - PADDLE_H, (e.touches[0].clientY - rect.top) * scaleY - PADDLE_H / 2));
    };
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('touchmove', handleTouch, { passive: true });

    const loop = () => {
      const s = stateRef.current;
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = '#374151';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);

      if (s.running) {
        s.ballX += s.dx;
        s.ballY += s.dy;

        if (s.ballY - BALL_R < 0 || s.ballY + BALL_R > H) s.dy = -s.dy;

        if (s.ballX - BALL_R < PADDLE_W + 15 && s.ballY > s.playerY && s.ballY < s.playerY + PADDLE_H && s.dx < 0) {
          s.dx = -s.dx * 1.05;
          s.dy += ((s.ballY - s.playerY) / PADDLE_H - 0.5) * 3;
        }
        if (s.ballX + BALL_R > W - PADDLE_W - 15 && s.ballY > s.botY && s.ballY < s.botY + PADDLE_H && s.dx > 0) {
          s.dx = -s.dx * 1.05;
          s.dy += ((s.ballY - s.botY) / PADDLE_H - 0.5) * 3;
        }

        if (s.ballX < 0) {
          s.botScore++;
          setScores({ player: s.playerScore, bot: s.botScore });
          s.ballX = W / 2; s.ballY = H / 2; s.dx = 4; s.dy = (Math.random() - 0.5) * 4;
        }
        if (s.ballX > W) {
          s.playerScore++;
          setScores({ player: s.playerScore, bot: s.botScore });
          setHS(h => {
            const best = Math.max(h, s.playerScore);
            setHighScore('pong', best);
            return best;
          });
          s.ballX = W / 2; s.ballY = H / 2; s.dx = -4; s.dy = (Math.random() - 0.5) * 4;
        }

        if (s.playerScore >= WIN_SCORE) { s.running = false; setGameOver(true); setWinner('You win! 🎉'); }
        if (s.botScore >= WIN_SCORE) { s.running = false; setGameOver(true); setWinner('Bot wins! 🤖'); }

        const botCenter = s.botY + PADDLE_H / 2;
        const diff = s.ballY - botCenter;
        const botSpeed = 3.5;
        if (Math.abs(diff) > botSpeed) s.botY += Math.sign(diff) * botSpeed;
        else s.botY += diff;
        s.botY = Math.max(0, Math.min(H - PADDLE_H, s.botY));
      }

      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(15, s.playerY, PADDLE_W, PADDLE_H);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(W - 15 - PADDLE_W, s.botY, PADDLE_W, PADDLE_H);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6b7280';
      ctx.font = '24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${s.playerScore}`, W / 2 - 40, 30);
      ctx.fillText(`${s.botScore}`, W / 2 + 40, 30);

      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('touchmove', handleTouch);
    };
  }, []);

  return (
    <GameLayout title="Pong" score={`${scores.player} - ${scores.bot}`} highScore={highScore} onReset={reset}>
      <div className="flex flex-col items-center gap-4">
        {gameOver && <p className="text-xl font-bold text-amber-400">{winner}</p>}
        {!stateRef.current.running && !gameOver && (
          <button onClick={reset} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-bold">Start</button>
        )}
        <canvas ref={canvasRef} width={W} height={H} className="border border-gray-700 rounded-lg max-w-full cursor-none" />
        <p className="text-gray-500 text-xs">Move mouse/finger to control paddle · First to {WIN_SCORE}</p>
      </div>
    </GameLayout>
  );
}
