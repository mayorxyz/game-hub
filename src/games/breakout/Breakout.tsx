import React, { useState, useEffect, useRef } from 'react';
import { getHighScore, setHighScore } from '../../lib/persistence';
const W=400,H=500,PW=80,PH=12,BR=8,BRICK_ROWS=5,BRICK_COLS=8,BW=W/BRICK_COLS-4,BH=20;
const COLORS=['#ef4444','#f97316','#eab308','#22c55e','#3b82f6'];
interface Brick{x:number;y:number;alive:boolean;color:string}
function createBricks():Brick[]{const b:Brick[]=[];for(let r=0;r<BRICK_ROWS;r++)for(let c=0;c<BRICK_COLS;c++)b.push({x:c*(BW+4)+2,y:r*(BH+4)+40,alive:true,color:COLORS[r]});return b}
export default function Breakout(){const canvasRef=useRef<HTMLCanvasElement>(null);const s=useRef({bx:W/2,by:H-50,dx:3,dy:-3,px:W/2-PW/2,bricks:createBricks(),running:false,score:0});const[score,setScore]=useState(0);const[over,setOver]=useState(false);const[won,setWon]=useState(false);const[highScore,setHighScoreState]=useState(getHighScore('breakout'));const anim=useRef<number>(0);
const reset=()=>{const st=s.current;st.bx=W/2;st.by=H-50;st.dx=3;st.dy=-3;st.px=W/2-PW/2;st.bricks=createBricks();st.running=true;st.score=0;setScore(0);setOver(false);setWon(false)};
useEffect(()=>{const c=canvasRef.current;if(!c)return;const ctx=c.getContext('2d')!;const mm=(e:MouseEvent)=>{const r=c.getBoundingClientRect();s.current.px=Math.max(0,Math.min(W-PW,e.clientX-r.left-PW/2))};c.addEventListener('mousemove',mm);
const loop=()=>{const st=s.current;ctx.fillStyle='#111827';ctx.fillRect(0,0,W,H);if(st.running){st.bx+=st.dx;st.by+=st.dy;if(st.bx-BR<0||st.bx+BR>W)st.dx=-st.dx;if(st.by-BR<0)st.dy=-st.dy;if(st.by+BR>H){st.running=false;setOver(true)}if(st.by+BR>H-30&&st.by+BR<H-18&&st.bx>st.px&&st.bx<st.px+PW){st.dy=-Math.abs(st.dy);st.dx=((st.bx-st.px)/PW-0.5)*6}for(const b of st.bricks){if(!b.alive)continue;if(st.bx+BR>b.x&&st.bx-BR<b.x+BW&&st.by+BR>b.y&&st.by-BR<b.y+BH){b.alive=false;st.dy=-st.dy;st.score+=10;setScore(st.score)}}if(st.bricks.every(b=>!b.alive)){st.running=false;setWon(true)}}for(const b of st.bricks)if(b.alive){ctx.fillStyle=b.color;ctx.fillRect(b.x,b.y,BW,BH)}ctx.fillStyle='#8b5cf6';ctx.fillRect(st.px,H-30,PW,PH);ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.arc(st.bx,st.by,BR,0,Math.PI*2);ctx.fill();anim.current=requestAnimationFrame(loop)};anim.current=requestAnimationFrame(loop);return()=>{cancelAnimationFrame(anim.current);c.removeEventListener('mousemove',mm)}},[]);
useEffect(() => {
    if (over && score > 0) {
      const currentHigh = getHighScore('breakout');
      if (score > currentHigh) {
        setHighScore('breakout', score);
        setHighScoreState(score);
      }
    }
  }, [over, score]);

  return(<div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4"><h1 className="text-3xl font-bold mb-4">Breakout</h1><div className="mb-2 flex gap-6"><p>Score: {score}</p><p>Best: {highScore}</p></div>{over&&<p className="text-red-400 mb-2">Game Over!</p>}{won&&<p className="text-green-400 mb-2">🎉 You Win!</p>}<button onClick={reset} className="px-6 py-3 bg-purple-600 rounded-lg mb-4">{over||won?'Play Again':'Start'}</button><canvas ref={canvasRef} width={W} height={H} className="border border-gray-700 rounded-lg" /></div>)}
