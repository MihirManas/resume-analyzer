import React, { useState, useEffect } from 'react';

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export default function TicTacToeGame() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null); // 'X', 'O', 'Draw', or null
  
  const checkWinner = (currentBoard) => {
    for (let combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return currentBoard[a];
      }
    }
    if (currentBoard.every(cell => cell !== null)) {
      return 'Draw';
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || winner || !isPlayerTurn) return;
    
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsPlayerTurn(false);
    
    const newWinner = checkWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
    }
  };

  // Computer's turn
  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const timeout = setTimeout(() => {
        const newBoard = [...board];
        
        // Basic AI: Try to win, block player, or pick random
        let moveIndex = -1;
        
        // 1. Can AI win?
        for (let combo of WINNING_COMBINATIONS) {
          const [a, b, c] = combo;
          if (newBoard[a] === 'O' && newBoard[b] === 'O' && newBoard[c] === null) moveIndex = c;
          else if (newBoard[a] === 'O' && newBoard[c] === 'O' && newBoard[b] === null) moveIndex = b;
          else if (newBoard[b] === 'O' && newBoard[c] === 'O' && newBoard[a] === null) moveIndex = a;
        }
        
        // 2. Block Player
        if (moveIndex === -1) {
          for (let combo of WINNING_COMBINATIONS) {
            const [a, b, c] = combo;
            if (newBoard[a] === 'X' && newBoard[b] === 'X' && newBoard[c] === null) moveIndex = c;
            else if (newBoard[a] === 'X' && newBoard[c] === 'X' && newBoard[b] === null) moveIndex = b;
            else if (newBoard[b] === 'X' && newBoard[c] === 'X' && newBoard[a] === null) moveIndex = a;
          }
        }
        
        // 3. Pick random
        if (moveIndex === -1) {
          const emptyIndices = newBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
          if (emptyIndices.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyIndices.length);
            moveIndex = emptyIndices[randomIndex];
          }
        }
        
        if (moveIndex !== -1) {
          newBoard[moveIndex] = 'O';
          setBoard(newBoard);
          setIsPlayerTurn(true);
          const newWinner = checkWinner(newBoard);
          if (newWinner) {
            setWinner(newWinner);
          }
        }
      }, 500); // 500ms delay for realism
      
      return () => clearTimeout(timeout);
    }
  }, [isPlayerTurn, board, winner]);

  const restartGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
  };

  return (
    <div className="w-full max-w-sm p-6 bg-black/40 border border-white/10 rounded-2xl relative overflow-hidden mb-8 shadow-inner flex flex-col items-center">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-white mb-1">Tic Tac Toe</h3>
        <p className="text-sm text-[#3B82F6]">
          {winner ? (winner === 'Draw' ? "It's a Draw!" : `${winner === 'X' ? 'You' : 'Computer'} won!`) : (isPlayerTurn ? 'Your Turn (X)' : 'Computer is thinking...')}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] aspect-square relative z-10">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            disabled={!!cell || !!winner || !isPlayerTurn}
            className={`flex items-center justify-center text-4xl font-bold rounded-xl border border-white/10 transition-all duration-200 ${
              cell ? 'bg-white/5 cursor-default' : 'bg-transparent hover:bg-white/5 cursor-pointer'
            } ${
              cell === 'X' ? 'text-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.2)]' : cell === 'O' ? 'text-red-400 shadow-[0_0_15px_rgba(248,113,113,0.2)]' : ''
            }`}
          >
            {cell}
          </button>
        ))}
      </div>

      {winner && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <h3 className="text-2xl font-black text-white mb-2 tracking-widest uppercase">
            {winner === 'Draw' ? 'Draw!' : winner === 'X' ? 'You Win!' : 'You Lose!'}
          </h3>
          <button 
            onClick={restartGame}
            className="px-6 py-3 mt-4 bg-[#3B82F6]/20 hover:bg-[#3B82F6]/40 border border-[#3B82F6] text-[#3B82F6] font-bold rounded-xl transition-all"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
