// Pure game logic - no React, no UI, no input handling

export const CANVAS_WIDTH = 320;
export const CANVAS_HEIGHT = 480;
export const GRAVITY = 0.5;
export const JUMP_VELOCITY = -8;
export const PIPE_WIDTH = 50;
export const PIPE_GAP = 130;
export const BIRD_X = 60;
export const BIRD_RADIUS = 15;
export const PIPE_SPEED = 3;
export const PIPE_SPAWN_INTERVAL = 90; // frames

export interface Pipe {
  x: number;
  topH: number;
  passed: boolean;
}

export interface Bird {
  y: number;
  velocity: number;
}

export interface GameState {
  bird: Bird;
  pipes: Pipe[];
  score: number;
  isRunning: boolean;
  isGameOver: boolean;
  frame: number;
}

export interface FlappyBirdConfig {
  gravity: number;
  jumpVelocity: number;
  pipeSpeed: number;
  pipeGap: number;
}

export function createInitialState(): GameState {
  return {
    bird: {
      y: CANVAS_HEIGHT / 2,
      velocity: 0,
    },
    pipes: [],
    score: 0,
    isRunning: false,
    isGameOver: false,
    frame: 0,
  };
}

export function updateBird(bird: Bird, gravity: number): Bird {
  const newVelocity = bird.velocity + gravity;
  const newY = bird.y + newVelocity;
  return {
    y: newY,
    velocity: newVelocity,
  };
}

export function jump(bird: Bird, jumpVelocity: number): Bird {
  return {
    ...bird,
    velocity: jumpVelocity,
  };
}

export function updatePipes(pipes: Pipe[], pipeSpeed: number, frame: number): Pipe[] {
  // Move pipes
  let updatedPipes = pipes.map(pipe => ({
    ...pipe,
    x: pipe.x - pipeSpeed,
  }));

  // Remove off-screen pipes
  updatedPipes = updatedPipes.filter(pipe => pipe.x > -PIPE_WIDTH);

  // Spawn new pipe
  if (frame % PIPE_SPAWN_INTERVAL === 0) {
    const topH = 50 + Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100);
    updatedPipes.push({
      x: CANVAS_WIDTH,
      topH,
      passed: false,
    });
  }

  return updatedPipes;
}

export function checkPipeCollision(bird: Bird, pipes: Pipe[]): { collision: boolean; updatedPipes: Pipe[]; scoreIncrement: number } {
  let scoreIncrement = 0;
  const updatedPipes = pipes.map(pipe => {
    // Check if bird passed pipe
    if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X) {
      scoreIncrement++;
      return { ...pipe, passed: true };
    }
    return pipe;
  });

  // Check collision
  const collision = updatedPipes.some(pipe => {
    const birdLeft = BIRD_X - BIRD_RADIUS;
    const birdRight = BIRD_X + BIRD_RADIUS;
    const birdTop = bird.y - BIRD_RADIUS;
    const birdBottom = bird.y + BIRD_RADIUS;

    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + PIPE_WIDTH;

    // Check if bird is within pipe's x range
    if (birdRight > pipeLeft && birdLeft < pipeRight) {
      // Check if bird hits top or bottom pipe
      if (birdTop < pipe.topH || birdBottom > pipe.topH + PIPE_GAP) {
        return true;
      }
    }
    return false;
  });

  return { collision, updatedPipes, scoreIncrement };
}

export function checkBoundaryCollision(bird: Bird): boolean {
  return bird.y < 0 || bird.y > CANVAS_HEIGHT - 20;
}
