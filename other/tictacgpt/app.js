const squares = document.querySelectorAll('.square');
let currentPlayer = 'X';
let moves = 0;
const playerDisplay = document.querySelector('#player-display');

for (const square of squares) {
  square.addEventListener('click', function (event) {
    if (event.target.textContent === '') {
      event.target.textContent = currentPlayer;
      moves++;
      if (checkWin(currentPlayer)) {
        displayWinScreen(currentPlayer);
      } else if (moves === 9) {
        displayDrawScreen();
      } else {
        switchPlayer();
      }
    }
  });
}

function switchPlayer() {
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  playerDisplay.textContent = `Player ${currentPlayer}'s Turn`;
}

function checkWin(player) {
  const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const condition of winConditions) {
    if (
      squares[condition[0]].textContent === player &&
      squares[condition[1]].textContent === player &&
      squares[condition[2]].textContent === player
    ) {
      return true;
    }
  }

  return false;
}

function displayWinScreen(player) {
  const winScreen = document.createElement('div');
  winScreen.innerHTML = `
    <p>Player ${player} wins!</p>
    <button id="play-again-button">Play Again</button>
  `;
  winScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  winScreen.style.color = 'white';
  winScreen.style.position = 'fixed';
  winScreen.style.top = 0;
  winScreen.style.left = 0;
  winScreen.style.bottom = 0;
  winScreen.style.right = 0;
  winScreen.style.display = 'flex';
  winScreen.style.flexDirection = 'column';
  winScreen.style.justifyContent = 'center';
  winScreen.style.alignItems = 'center';

  document.body.appendChild(winScreen);

  const playAgainButton = document.querySelector('#play-again-button');
  playAgainButton.addEventListener('click', function () {
    for (const square of squares) {
      square.textContent = '';
    }
    winScreen.remove();
    moves = 0;
    currentPlayer = 'X';
    playerDisplay.textContent = `Player ${currentPlayer}'s Turn`;
  });
}

function displayDrawScreen() {
  const drawScreen = document.createElement('div');
  drawScreen.innerHTML = `
    <p>It's a draw!</p>
    <button id="play-again-button">Play Again</button>
    `;
    drawScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    drawScreen.style.color = 'white';
    drawScreen.style.position = 'fixed';
    drawScreen.style.top = 0;
    drawScreen.style.left = 0;
    drawScreen.style.bottom = 0;
    drawScreen.style.right = 0;
    drawScreen.style.display = 'flex';
    drawScreen.style.flexDirection = 'column';
    drawScreen.style.justifyContent = 'center';
    drawScreen.style.alignItems = 'center';
  
    document.body.appendChild(drawScreen);
  
    const playAgainButton = document.querySelector('#play-again-button');
    playAgainButton.addEventListener('click', function () {
      for (const square of squares) {
        square.textContent = '';
      }
      drawScreen.remove();
      moves = 0;
      currentPlayer = 'X';
      playerDisplay.textContent = `Player ${currentPlayer}'s Turn`;
    });
  }
  