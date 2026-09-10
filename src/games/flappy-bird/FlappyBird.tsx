import React, { useState, useEffect, useRef } from 'react';
import { getHighScore, setHighScore } from '../../lib/persistence';
import GameLayout from '../../components/ui/GameLayout';
import TouchControlContainer from '../../components/ui/controls/TouchControlContainer';
const W=320,H=480,G=0.5,J=-8,PW=50,GAP=130;interface Pipe{x:number;topH:number;passed:boolean}
export default function FlappyBird(){const c=useRef<HTMLCanvasElement>(null);const s=useRef({by:H/2,v:0,pipes:[] as Pipe[],score:0,running:false,frame:0});const[score,setScore]=useState(0);const[over,setOver]=useState(false);const[highScore,setHighScoreState]=useState(getHighScore('flappy-bird'));const a=useRef<number>(0);
const reset=()=>{const st=s.current;st.by=H/2;st.v=0;st.pipes=[];st.score=0;st.running=true;st.frame=0;setScore(0);setOver(false)};const jump=()=>{if(s.current.running)s.current.v=J};
useEffect(()=>{const cv=c.current;if(!cv)return;const ctx=cv.getContext('2d')!;const hk=(e:KeyboardEvent)=>{if(e.code==='Space'){e.preventDefault();jump()}};window.addEventListener('keydown',hk);const loop=()=>{const st=s.current;ctx.fillStyle='#1e293b';ctx.fillRect(0,0,W,H);if(st.running){st.v+=G;st.by+=st.v;st.frame++;if(st.frame%90===0)st.pipes.push({x:W,topH:50+Math.random()*(H-GAP-100),passed:false});for(const p of st.pipes){p.x-=3;if(!p.passed&&p.x+PW<60){p.passed=true;st.score++;setScore(st.score)}}st.pipes=st.pipes.filter(p=>p.x>-PW);if(st.by<0||st.by>H-20){st.running=false;setOver(true)}for(const p of st.pipes)if(60+15>p.x&&60-15<p.x+PW)if(st.by-15<p.topH||st.by+15>p.topH+GAP){st.running=false;setOver(true)}}ctx.fillStyle='#22c55e';for(const p of st.pipes){ctx.fillRect(p.x,0,PW,p.topH);ctx.fillRect(p.x,p.topH+GAP,PW,H-p.topH-GAP)}ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.arc(60,st.by,15,0,Math.PI*2);ctx.fill();a.current=requestAnimationFrame(loop)};a.current=requestAnimationFrame(loop);return()=>{cancelAnimationFrame(a.current);window.removeEventListener('keydown',hk)}},[]);
useEffect(() => {
    if (over && score > 0) {
      const currentHigh = getHighScore('flappy-bird');
      if (score > currentHigh) {
        setHighScore('flappy-bird', score);
        setHighScoreState(score);
      }
    }
  }, [over, score]);

  return(
    <GameLayout title="Flappy Bird" score={score} highScore={highScore} onReset={reset}>
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {over&&<p className="text-red-400">Game Over!</p>}
        <button onClick={reset} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg">{over?'Play Again':'Start'}</button>
        
        {/* Responsive Canvas */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-[2/3]">
          <canvas 
            ref={c} 
            width={W} 
            height={H} 
            className="absolute inset-0 w-full h-full border border-gray-700 rounded-lg cursor-pointer touch-none"
            onClick={jump}
            onTouchStart={(e) => { e.preventDefault(); jump(); }}
            style={{ touchAction: 'none' }}
          />
        </div>
        
        <p className="text-gray-500 text-xs">Tap or Space to flap</p>
      </div>
    </GameLayout>
  )}
