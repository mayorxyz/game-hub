// Pure game logic - no React, no UI, no input handling

export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 300;
export const PADDLE_HEIGHT = 60;
export const PADDLE_WIDTH = 10;
export const BALL_RADIUS = 6;
export const WIN_SCORE = 5;
export const BOT_SPEED = 3.5;

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export interface Paddle {
  y: number;
}

export interface GameState {
  ball: Ball;
  playerPaddle: Paddle;
  botPaddle: Paddle;
  playerScore: number;
  botScore: number;
  isRunning: boolean;
  isGameOver: boolean;
  winner: string;
}

export interface PongConfig {
  ballSpeed: number;
  paddleHeight: number;
  botSpeed: number;
}

export function createInitialState(): GameState {
  return {
    ball: {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: (Math.random() > 0.5 ? 1 : -1) * 4,
      dy: (Math.random() - 0.5) * 4,
    },
    playerPaddle: {
      y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    },
    botPaddle: {
      y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    },
    playerScore: 0,
    botScore: 0,
    isRunning: false,
    isGameOver: false,
    winner: '',
  };
}

export function updateBallPosition(ball: Ball): Ball {
  return {
    ...ball,
    x: ball.x + ball.dx,
    y: ball.y + ball.dy,
  };
}

export function checkWallCollision(ball: Ball): Ball {
  let { x, y, dx, dy } = ball;
  
  // Top/bottom walls
  if (y - BALL_RADIUS < 0 || y + BALL_RADIUS > CANVAS_HEIGHT) {
    dy = -dy;
  }
  
  return { x, y, dx, dy };
}

export function checkPaddleCollision(ball: Ball, paddleY: number, isPlayer: boolean): Ball {
  let { x, y, dx, dy } = ball;
  
  const paddleX = isPlayer ? PADDLE_WIDTH + 15 : CANVAS_WIDTH - PADDLE_WIDTH - 15;
  const movingTowardsPaddle = isPlayer ? dx < 0 : dx > 0;
  
  if (
    movingTowardsPaddle &&
    ((isPlayer && x - BALL_RADIUS < paddleX + PADDLE_WIDTH) ||
     (!isPlayer && x + BALL_RADIUS > paddleX)) &&
    y > paddleY &&
    y < paddleY + PADDLE_HEIGHT
  ) {
    // Calculate new angle based on where ball hits paddle
    const hitPosition = (y - paddleY) / PADDLE_HEIGHT;
    dx = -dx * 1.05;
    dy += (hitPosition - 0.5) * 3;
  }
  
  return { x, y, dx, dy };
}

export function checkScoring(ball: Ball, playerScore: number, botScore: number): { ball: Ball; playerScore: number; botScore: number; scored: boolean } {
  let newBall = { ...ball };
  let newPlayerScore = playerScore;
  let newBotScore = botScore;
  let scored = false;
  
  // Ball went past player (bot scores)
  if (ball.x < 0) {
    newBotScore++;
    newBall = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: 4,
      dy: (Math.random() - 0.5) * 4,
    };
    scored = true;
  }
  
  // Ball went past bot (player scores)
  if (ball.x > CANVAS_WIDTH) {
    newPlayerScore++;
    newBall = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: -4,
      dy: (Math.random() - 0.5) * 4,
    };
    scored = true;
  }
  
  return { ball: newBall, playerScore: newPlayerScore, botScore: newBotScore, scored };
}

export function updateBotPaddle(botY: number, ballY: number): number {
  const botCenter = botY + PADDLE_HEIGHT / 2;
  const diff = ballY - botCenter;
  
  let newBotY = botY;
  if (Math.abs(diff) > BOT_SPEED) {
    newBotY += Math.sign(diff) * BOT_SPEED;
  } else {
    newBotY += diff;
  }
  
  // Keep paddle within bounds
  return Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newBotY));
}

export function checkWinCondition(playerScore: number, botScore: number): { isGameOver: boolean; winner: string } {
  if (playerScore >= WIN_SCORE) {
    return { isGameOver: true, winner: 'You win! 🎉' };
  }
  if (botScore >= WIN_SCORE) {
    return { isGameOver: true, winner: 'Bot wins! 🤖' };
  }
  return { isGameOver: false, winner: '' };
}
