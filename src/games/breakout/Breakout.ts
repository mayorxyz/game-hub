// Pure game logic - no React, no UI, no input handling

export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 500;
export const PADDLE_WIDTH = 80;
export const PADDLE_HEIGHT = 12;
export const BALL_RADIUS = 8;
export const BRICK_ROWS = 5;
export const BRICK_COLS = 8;
export const BRICK_WIDTH = CANVAS_WIDTH / BRICK_COLS - 4;
export const BRICK_HEIGHT = 20;
export const PADDLE_Y = CANVAS_HEIGHT - 30;

export const BRICK_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

export interface Brick {
  x: number;
  y: number;
  alive: boolean;
  color: string;
}

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export interface GameState {
  ball: Ball;
  paddleX: number;
  bricks: Brick[];
  isRunning: boolean;
  isGameOver: boolean;
  isWon: boolean;
  score: number;
}

export interface BreakoutConfig {
  ballSpeed: number;
  paddleWidth: number;
}

export function createBricks(rows: number = BRICK_ROWS): Brick[] {
  const bricks: Brick[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({
        x: c * (BRICK_WIDTH + 4) + 2,
        y: r * (BRICK_HEIGHT + 4) + 40,
        alive: true,
        color: BRICK_COLORS[r % BRICK_COLORS.length],
      });
    }
  }
  return bricks;
}

export function createInitialState(speedMultiplier: number = 1, rows: number = BRICK_ROWS): GameState {
  const speed = 3 * speedMultiplier;
  return {
    ball: {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      dx: speed,
      dy: -speed,
    },
    paddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    bricks: createBricks(rows),
    isRunning: false,
    isGameOver: false,
    isWon: false,
    score: 0,
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
  
  // Left/right walls
  if (x - BALL_RADIUS < 0 || x + BALL_RADIUS > CANVAS_WIDTH) {
    dx = -dx;
  }
  
  // Top wall
  if (y - BALL_RADIUS < 0) {
    dy = -dy;
  }
  
  return { x, y, dx, dy };
}

export function checkPaddleCollision(ball: Ball, paddleX: number): Ball {
  const { x, y, dx, dy } = ball;
  
  // Check if ball hits paddle
  if (
    y + BALL_RADIUS > PADDLE_Y &&
    y + BALL_RADIUS < PADDLE_Y + PADDLE_HEIGHT &&
    x > paddleX &&
    x < paddleX + PADDLE_WIDTH
  ) {
    // Calculate new angle based on where ball hits paddle
    const hitPosition = (x - paddleX) / PADDLE_WIDTH;
    const newDx = (hitPosition - 0.5) * 6;
    const newDy = -Math.abs(dy);
    
    return { x, y, dx: newDx, dy: newDy };
  }
  
  return ball;
}

export function checkBrickCollision(ball: Ball, bricks: Brick[]): { ball: Ball; bricks: Brick[]; hit: boolean } {
  let newBall = { ...ball };
  let newBricks = [...bricks];
  let hit = false;
  
  for (let i = 0; i < newBricks.length; i++) {
    const brick = newBricks[i];
    if (!brick.alive) continue;
    
    // Check collision
    if (
      newBall.x + BALL_RADIUS > brick.x &&
      newBall.x - BALL_RADIUS < brick.x + BRICK_WIDTH &&
      newBall.y + BALL_RADIUS > brick.y &&
      newBall.y - BALL_RADIUS < brick.y + BRICK_HEIGHT
    ) {
      newBricks[i] = { ...brick, alive: false };
      newBall = { ...newBall, dy: -newBall.dy };
      hit = true;
      break; // Only hit one brick per frame
    }
  }
  
  return { ball: newBall, bricks: newBricks, hit };
}

export function checkGameOver(ball: Ball): boolean {
  return ball.y + BALL_RADIUS > CANVAS_HEIGHT;
}

export function checkWin(bricks: Brick[]): boolean {
  return bricks.every(brick => !brick.alive);
}
