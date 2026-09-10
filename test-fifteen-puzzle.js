// Test script for 15 Puzzle solvability
const SIZE = 4;

function isSolvable(a) {
  let inv = 0;
  const f = a.filter(v => v !== 0);
  for (let i = 0; i < f.length; i++) {
    for (let j = i + 1; j < f.length; j++) {
      if (f[i] > f[j]) inv++;
    }
  }
  const blankIdx = a.indexOf(0);
  const rowFromTop = Math.floor(blankIdx / SIZE);
  const rowFromBottom = SIZE - 1 - rowFromTop;
  return (inv + rowFromBottom) % 2 === 1;
}

// Test cases
const tests = [
  {
    name: 'Solved 4x4 board',
    board: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0],
    expected: true
  },
  {
    name: 'Classic unsolvable (14-15 swap)',
    board: [1,2,3,4,5,6,7,8,9,10,11,12,13,15,14,0],
    expected: false
  },
  {
    name: 'Simple solvable (one move from solved)',
    board: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,0,15],
    expected: true
  },
  {
    name: 'Another solvable configuration',
    board: [1,2,3,4,5,6,7,8,9,10,11,0,13,14,15,12],
    expected: true
  },
  {
    name: 'Blank in top-left, solvable',
    board: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    expected: true
  }
];

console.log('=== 15 Puzzle Solvability Tests ===\n');

tests.forEach((test, i) => {
  const result = isSolvable(test.board);
  const pass = result === test.expected;
  console.log(`Test ${i + 1}: ${test.name}`);
  console.log(`  Board: [${test.board.join(',')}]`);
  console.log(`  Expected: ${test.expected}`);
  console.log(`  Actual: ${result}`);
  console.log(`  Status: ${pass ? '✅ PASS' : '❌ FAIL'}`);
  console.log();
});

// Generate random reachable states by making legal moves from solved state
console.log('=== Random Reachable States (100 tests) ===\n');

function makeRandomMoves(board, numMoves) {
  const b = [...board];
  for (let i = 0; i < numMoves; i++) {
    const blankIdx = b.indexOf(0);
    const row = Math.floor(blankIdx / SIZE);
    const col = blankIdx % SIZE;
    
    const possibleMoves = [];
    if (row > 0) possibleMoves.push(blankIdx - SIZE);
    if (row < SIZE - 1) possibleMoves.push(blankIdx + SIZE);
    if (col > 0) possibleMoves.push(blankIdx - 1);
    if (col < SIZE - 1) possibleMoves.push(blankIdx + 1);
    
    const moveIdx = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    [b[blankIdx], b[moveIdx]] = [b[moveIdx], b[blankIdx]];
  }
  return b;
}

let reachablePass = 0;
let reachableFail = 0;

for (let i = 0; i < 100; i++) {
  const solved = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0];
  const reachable = makeRandomMoves(solved, Math.floor(Math.random() * 50) + 10);
  const result = isSolvable(reachable);
  
  if (result) {
    reachablePass++;
  } else {
    reachableFail++;
    console.log(`FAIL: Reachable state marked as unsolvable`);
    console.log(`  Board: [${reachable.join(',')}]`);
  }
}

console.log(`\nReachable states: ${reachablePass} pass, ${reachableFail} fail`);

// Generate random unreachable states by swapping two non-blank tiles
console.log('\n=== Random Unreachable States (100 tests) ===\n');

let unreachablePass = 0;
let unreachableFail = 0;

for (let i = 0; i < 100; i++) {
  const solved = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0];
  const unreachable = [...solved];
  
  // Swap two non-blank tiles (changes parity, makes it unsolvable)
  const nonBlankIndices = [];
  for (let j = 0; j < 16; j++) {
    if (unreachable[j] !== 0) nonBlankIndices.push(j);
  }
  
  const idx1 = nonBlankIndices[Math.floor(Math.random() * nonBlankIndices.length)];
  let idx2 = idx1;
  while (idx2 === idx1) {
    idx2 = nonBlankIndices[Math.floor(Math.random() * nonBlankIndices.length)];
  }
  
  [unreachable[idx1], unreachable[idx2]] = [unreachable[idx2], unreachable[idx1]];
  
  const result = isSolvable(unreachable);
  
  if (!result) {
    unreachablePass++;
  } else {
    unreachableFail++;
    console.log(`FAIL: Unreachable state marked as solvable`);
    console.log(`  Board: [${unreachable.join(',')}]`);
  }
}

console.log(`\nUnreachable states: ${unreachablePass} pass, ${unreachableFail} fail`);

console.log('\n=== Summary ===');
const allTestsPassed = tests.every(t => isSolvable(t.board) === t.expected);
console.log(`Manual tests: ${allTestsPassed ? '✅ ALL PASS' : '❌ SOME FAILED'}`);
console.log(`Reachable states: ${reachableFail === 0 ? '✅ ALL PASS' : '❌ SOME FAILED'}`);
console.log(`Unreachable states: ${unreachableFail === 0 ? '✅ ALL PASS' : '❌ SOME FAILED'}`);
