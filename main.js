// Go through each row (A, B, C, etc.)

// For each row, go through each cell

// Based on debug and hit, decide what to display

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function showGreeting(rl, callback) {


  console.log("🎉 Welcome to Battleship CLI! 🚢");
  console.log("Choose a board size:");
  console.log("1. 4x4");
  console.log("2. 5x5");
  console.log("3. 6x6");

  rl.question("Type 4, 5, or 6 to begin: ", (size) => {
    const boardSize = parseInt(size);

    if (![4, 5, 6].includes(boardSize)) {
      console.log("❌ Invalid choice. Please enter 4, 5, or 6.");
      showGreeting(rl, callback); 
    } else {
      callback(boardSize); 
    }
  });
}
showGreeting(rl, (boardSize) => {
  const board = createEmptyBoard(boardSize);
  const turnsLeft = Math.floor(boardSize * boardSize * 0.6);

  switch (boardSize) {
    case 4:
      placeVerticalLargeShip(board);
      placeSmallShip(board);
      break;
    case 5:
      placeVerticalLargeShip(board);
      placeSmallShip(board);
      placeSmallShip(board);
      break;
    case 6:
      placeVerticalLargeShip(board);
      placeVerticalLargeShip(board);
      placeSmallShip(board);
      placeSmallShip(board);
      break;
  }

  printBoard(board, true);
  askGuess(board, rl, turnsLeft);
});


function printBoard(board, debug) {
  const output = {};

  board.forEach((row, rowIndex) => {
    const rowLabel = String.fromCharCode(65 + rowIndex); 
    output[rowLabel] = [];

    row.forEach((cell) => {
      switch (cell.type) {
        case "small":
          if (cell.hit || debug) {
            output[rowLabel].push("🟠");
          } else {
            output[rowLabel].push("-");
          }
          break;
      
        case "large":
          if (cell.hit || debug) {
            output[rowLabel].push("🔵");
          } else {
            output[rowLabel].push("-");
          }
          break;
      
        case "empty":
          if (cell.hit) {
            output[rowLabel].push("❗");
          } else {
            output[rowLabel].push("-");
          }
          break;
      
        default:
          output[rowLabel].push("?");
          break;
      }
    });
  });

  console.table(output);
}
const testBoard = [
  [
    { type: "small", hit: true },
    { type: "small", hit: false },
    { type: "empty", hit: true },
  ],
  [
    { type: "large", hit: false },
    { type: "large", hit: true },
    { type: "empty", hit: false },
  ],
];
function createEmptyBoard(size) {
  const board = [];
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      row.push({ type: "empty", hit: false });
    }
    board.push(row);
  }
  return board;
}
function placeVerticalLargeShip(board) {
  const col = Math.floor(Math.random() * 4);    
  const startRow = Math.floor(Math.random() * 2); 

  for (let i = 0; i < 3; i++) {
    board[startRow + i][col] = { type: "large", id: 1, hit: false };
  }
}
function placeSmallShip(board) {
  let placed = false;
  let tries = 0;
  const maxTries = 50;

  while (!placed && tries < maxTries) {
    tries++;
    const isVertical = Math.random() < 0.5;

    if (isVertical) {
      const col = Math.floor(Math.random() * board[0].length);
      const startRow = Math.floor(Math.random() * (board.length - 1));
      const cell1 = board[startRow][col];
      const cell2 = board[startRow + 1][col];

      if (cell1.type === "empty" && cell2.type === "empty") {
        board[startRow][col] = { type: "small", id: 2, hit: false };
        board[startRow + 1][col] = { type: "small", id: 2, hit: false };
        placed = true;
      }
    } else {
      const row = Math.floor(Math.random() * board.length);
      const startCol = Math.floor(Math.random() * (board[0].length - 1));
      const cell1 = board[row][startCol];
      const cell2 = board[row][startCol + 1];

      if (cell1.type === "empty" && cell2.type === "empty") {
        board[row][startCol] = { type: "small", id: 2, hit: false };
        board[row][startCol + 1] = { type: "small", id: 2, hit: false };
        placed = true;
      }
    }
  }

  if (!placed) {
    console.log("⚠️ Could not place small ship — not enough space!");
  }
}
function placeMultipleSmallShips(board, count) {
  for (let i = 0; i < count; i++) {
    placeSmallShip(board);
  }
}
function processGuess(input, board) {
  if (!input || input.length < 2) {
    console.log("❌ Invalid guess. Please enter something like A1.");
    return;
  }

  const rowLetter = input[0].toUpperCase();
  const colStr = input.slice(1);
  const col = parseInt(colStr);
  const row = rowLetter.charCodeAt(0) - 65;

  if (
    isNaN(col) ||
    row < 0 ||
    row >= board.length ||
    col < 0 ||
    col >= board[0].length
  ) {
    console.log("❌ Invalid guess. Please enter a valid coordinate (e.g., A1).");
    return;
  }

  const cell = board[row][col];

  if (cell.hit) {
    console.log("⏪ You already guessed that spot.");
    return;
  }

  cell.hit = true;

  if (cell.type === "empty") {
    console.log("❗ Miss!");
  } else {
    console.log("💥 Hit a", cell.type, "ship!");
  }
}
function askGuess(board, rl, turnsLeft) {
  if (turnsLeft <= 0) {
    endGame(false, rl); // ran out of guesses
    return;
  }

  rl.question(`Make a guess (e.g. A1). Turns left: ${turnsLeft} → `, (input) => {
    processGuess(input, board);
    printBoard(board, false);

    if (checkWin(board)) {
      endGame(true, rl);
    } else {
      askGuess(board, rl, turnsLeft - 1); // 🔁 one less turn
    }
  });
}
function checkWin(board) {
  for (let row of board) {
    for (let cell of row) {
      if ((cell.type === "small" || cell.type === "large") && !cell.hit) {
        return false;
      }
    }
  }
  return true;
}
function checkWin(board) {
  for (let row of board) {
    for (let cell of row) {
      if ((cell.type === "small" || cell.type === "large") && !cell.hit) {
        return false; // still some ship not hit
      }
    }
  }
  return true;
}
function endGame(won, rl) {
  if (won) {
    console.log(`
========
__   _______ _   _   _    _ _____ _   _
\\ \\ / /  _  | | | | | |  | |_   _| \\ | |
 \\ V /| | | | | | | | |  | | | |  \\| |
  \\ / | | | | | | | | |/\\| | | | | . \` |
  | | \\ \\_/ / |_| | \\  /\\  /_| |_| |\\  |
  \\_/  \\___/ \\___/   \\/  \\/ \\___/\\_| \\_/
========
🎉 YOU WON! Thanks for playing Battleship CLI!
    `);
  } else {
    console.log("💥 Game over. Thanks for playing.");
  }

  rl.close();
}











console.log("Normal mode:");
printBoard(testBoard, false);

console.log("Debug mode:");
printBoard(testBoard, true);

const board = createEmptyBoard(4);
placeVerticalLargeShip(board);
printBoard(board, true); 
placeVerticalLargeShip(board);
placeSmallShip(board);
printBoard(board, true);
askGuess(board, rl);



placeVerticalLargeShip(board);
placeMultipleSmallShips(board, 2); 
printBoard(board, true);

rl.question("Make a guess (e.g. A1): ", (input) => {
  processGuess(input, board);
  printBoard(board, false);
  rl.close();
});
