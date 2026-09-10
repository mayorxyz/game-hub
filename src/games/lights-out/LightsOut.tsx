import React, { useState, useEffect } from 'react';
import { getHighScore, setHighScore } from '../../lib/persistence';
import GameLayout from '../../components/ui/GameLayout';
const S=5;type B=number[][];
function toggle(b:B,r:number,c:number){const n=b.map(row=>[...row]);const f=(r:number,c:number)=>{if(r>=0&&r<S&&c>=0&&c<S)n[r][c]=n[r][c]?0:1};f(r,c);f(r-1,c);f(r+1,c);f(r,c-1);f(r,c+1);return n}
function createPuzzle():B{const b:B=Array.from({length:S},()=>Array(S).fill(0));for(let i=0;i<8;i++){const r=Math.floor(Math.random()*S),c=Math.floor(Math.random()*S);const f=toggle(b,r,c);for(let ri=0;ri<S;ri++)for(let ci=0;ci<S;ci++)b[ri][ci]=f[ri][ci]}return b}
export default function LightsOut(){const[board,setBoard]=useState<B>(createPuzzle);const[moves,setMoves]=useState(0);const[won,setWon]=useState(board.every(row=>row.every(v=>v===0)));const storedBest=getHighScore('lights-out');const[bestMoves,setBestMoves]=useState<number>(storedBest>0?10000-storedBest:Infinity);const handleClick=(r:number,c:number)=>{if(won)return;const nb=toggle(board,r,c);setBoard(nb);setMoves(m=>m+1);if(nb.every(row=>row.every(v=>v===0)))setWon(true)};const reset=()=>{setBoard(createPuzzle());setMoves(0);setWon(false)};useEffect(()=>{if(won&&moves<bestMoves){setBestMoves(moves);setHighScore('lights-out',10000-moves)}},[won,moves,bestMoves]);
return(
    <GameLayout title="Lights Out" score={`${moves} moves`} highScore={bestMoves!==Infinity?bestMoves:undefined} onReset={reset}>
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {won&&<p className="text-green-400">🎉 All lights out!</p>}
        
        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div className="absolute inset-0 grid gap-2 p-2" style={{gridTemplateColumns:`repeat(${S},1fr)`,gridTemplateRows:`repeat(${S},1fr)`}}>
            {board.flat().map((v,i)=>{
              const r=Math.floor(i/S),c=i%S;
              return(
                <button 
                  key={i} 
                  onClick={()=>handleClick(r,c)} 
                  className={`rounded-lg transition-all touch-none ${v?'bg-yellow-400 shadow-lg shadow-yellow-400/50':'bg-gray-700 hover:bg-gray-600'}`}
                  style={{ touchAction: 'manipulation' }}
                />
              )
            })}
          </div>
        </div>
        
        <p className="text-gray-500 text-xs">Turn off all the lights</p>
      </div>
    </GameLayout>
  )}
