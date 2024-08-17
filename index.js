/*
First time? Check out the tutorial game:
https://sprig.hackclub.com/gallery/getting_started

@title: Tetris
@author: BonzaiDev, Adrian T.
@tags: []
@addedOn: 2024-07-23
*/

// Game settings
let currentGameState;
let currentLinesAmount = 0;
let blockDropSpeed = 1; // In seconds
const blockSpawnPosition = { x: 5, y: 1 };

const tetrisTheme = tune`
201.34228187919464: E5/201.34228187919464,
201.34228187919464,
201.34228187919464: B4/201.34228187919464,
201.34228187919464: C5/201.34228187919464,
201.34228187919464: D5/201.34228187919464,
201.34228187919464,
201.34228187919464: C5/201.34228187919464,
201.34228187919464: B4/201.34228187919464,
201.34228187919464: A4/201.34228187919464,
201.34228187919464,
201.34228187919464: A4/201.34228187919464,
201.34228187919464: C5/201.34228187919464,
201.34228187919464: E5/201.34228187919464,
201.34228187919464,
201.34228187919464: D5/201.34228187919464,
201.34228187919464: C5/201.34228187919464,
201.34228187919464: B4/201.34228187919464,
201.34228187919464,
201.34228187919464: B4/201.34228187919464,
201.34228187919464: C5/201.34228187919464,
201.34228187919464: D5/201.34228187919464,
201.34228187919464,
201.34228187919464: E5/201.34228187919464,
201.34228187919464,
201.34228187919464: C5/201.34228187919464,
201.34228187919464,
201.34228187919464: A4/201.34228187919464,
201.34228187919464,
201.34228187919464: A4/201.34228187919464,
604.026845637584`;
const tetrisThemeBass = tune`
201.34228187919464: E4^201.34228187919464,
201.34228187919464: E5^201.34228187919464,
201.34228187919464: E4^201.34228187919464,
201.34228187919464: E5^201.34228187919464,
201.34228187919464: E4^201.34228187919464,
201.34228187919464: E5^201.34228187919464,
201.34228187919464: E4^201.34228187919464,
201.34228187919464: E5^201.34228187919464,
201.34228187919464: A4^201.34228187919464,
201.34228187919464: A5^201.34228187919464,
201.34228187919464: A4^201.34228187919464,
201.34228187919464: A5^201.34228187919464,
201.34228187919464: A4^201.34228187919464,
201.34228187919464: A5^201.34228187919464,
201.34228187919464: A4^201.34228187919464,
201.34228187919464: A5^201.34228187919464,
201.34228187919464: D4^201.34228187919464,
201.34228187919464: D5^201.34228187919464,
201.34228187919464: D4^201.34228187919464,
201.34228187919464: D5^201.34228187919464,
201.34228187919464: D4^201.34228187919464,
201.34228187919464: D5^201.34228187919464,
201.34228187919464: D4^201.34228187919464,
201.34228187919464: D5^201.34228187919464,
201.34228187919464: D4^201.34228187919464,
201.34228187919464: D5^201.34228187919464,
201.34228187919464: D4^201.34228187919464,
201.34228187919464: E5^201.34228187919464,
201.34228187919464: D4^201.34228187919464,
201.34228187919464: E5^201.34228187919464,
201.34228187919464: D4^201.34228187919464,
201.34228187919464: E5^201.34228187919464`;

const background = "/";
const border = "@";
const gameMap = map`
@@@@@@@@@@@@
@..........@
@..........@
@..........@
@..........@
@..........@
@..........@
@..........@
@..........@
@..........@
@..........@
@..........@
@..........@
@..........@
@..........@
@..........@
@..........@
@..........@
@..........@
@..........@
@..........@
@@@@@@@@@@@@`;

const gameStates = {
  MENU: "Menu",
  PLAYING: "Playing",
  GAME_OVER: "GameOver",
};

const blockColours = {
  darkBlue: bitmap`
................
.25555555555557.
.55255555555557.
.52555555555557.
.55555555555557.
.55555555555557.
.55555555555557.
.55555555555557.
.55555555555557.
.55555555555557.
.55555555555557.
.55555555555557.
.55555555555557.
.55555555555557.
.77777777777775.
................`,
  blue: bitmap`
................
.25555555555555.
.52222222222227.
.52222222222227.
.52222222222227.
.52222222222227.
.52222222222227.
.52222222222227.
.52222222222227.
.52222222222227.
.52222222222227.
.52222222222227.
.52222222222227.
.52222222222227.
.77777777777775.
................`,
  cyan: bitmap`
................
.27777777777775.
.77277777777775.
.72777777777775.
.77777777777775.
.77777777777775.
.77777777777775.
.77777777777775.
.77777777777775.
.77777777777775.
.77777777777775.
.77777777777775.
.77777777777775.
.77777777777775.
.55555555555557.
................`,
};

// Classes \\
const tetrominoTypes = {
  straightTetromino: "straightTetromino",
  squareTetromino: "squareTetromino",
  tTetromino: "tTetromino",
  lTetromino: "lTetromino",
  lFlippedTetromino: "lFlippedTetromino",
  sTetromino: "sTetromino",
  sFlippedTetromino: "sFlippedTetromino",
};

const mappedSprites = [];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
class Tetromino {
  readableName = "";
  bitmapKey = "";
  bitmap = bitmap``;
  type;

  constructor(readableName) {
    // Adrian's custom code that def works
    // basically my idea was to start with the first letter of the alphabet and then go up from there
    // if the letter is already taken, then we go to the next letter and so on :D
    this.bitmapKey = alphabet[mappedSprites.length] || alphabet[mappedSprites.length - alphabet.length];
    mappedSprites.push({
      readableName: this.readableName,
      bitmapKey: this.bitmapKey
    });

    const randomNumber = Math.floor(Math.random() * 7);
    switch (randomNumber) {
      case 0:
        this.type = tetrominoTypes.straightTetromino;
        this.bitmap = blockColours.blue;
        break;
      case 1:
        this.type = tetrominoTypes.squareTetromino;
        this.bitmap = blockColours.blue;
        break;
      case 2:
        this.type = tetrominoTypes.tTetromino;
        this.bitmap = blockColours.blue;
        break;
      case 3:
        this.type = tetrominoTypes.lTetromino;
        this.bitmap = blockColours.cyan;
        break;
      case 4:
        this.type = tetrominoTypes.sTetromino;
        this.bitmap = blockColours.darkBlue;
        break;
      case 5:
        this.type = tetrominoTypes.lFlippedTetromino;
        this.bitmap = blockColours.darkBlue;
        break;
      case 6:
        this.type = tetrominoTypes.sFlippedTetromino;
        this.bitmap = blockColours.cyan;
        break;
    };
    this.readableName = `${this.type}${Date.now()}${Math.floor(Math.random()*100)}`;
    console.log(this.readableName)
    if (mappedSprites.filter(sprite => sprite.readableName == this.readableName).length > 0) {
      throw new Error(`Sprite with readable name "${this.readableName}" already exists`);
    };
  };
};

// Sprites
let newTetromino = new Tetromino();

setLegend(
  [background, bitmap`
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL`],
  [border, bitmap`
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000`],

  [newTetromino.bitmapKey, newTetromino.bitmap],
);

// Functions
function spawnTetromino(tetromino) {
  switch (tetromino.type) {
    case tetrominoTypes.straightTetromino:
      for (let ySpawn = 0; ySpawn < 4; ySpawn++)
        addSprite(blockSpawnPosition.x, blockSpawnPosition.y + ySpawn, tetromino.bitmapKey);
      break;

    case tetrominoTypes.squareTetromino:
      for (let xSpawn = 0; xSpawn < 2; xSpawn++) {
        for (let ySpawn = 0; ySpawn < 2; ySpawn++) {
          addSprite(blockSpawnPosition.x + xSpawn, blockSpawnPosition.y + ySpawn, tetromino.bitmapKey);
        };
      };
      break;

    case tetrominoTypes.tTetromino:
      addSprite(blockSpawnPosition.x + 1, blockSpawnPosition.y + 1, tetromino.bitmapKey);
      for (let xSpawn = 0; xSpawn < 3; xSpawn++)
        addSprite(blockSpawnPosition.x + xSpawn, blockSpawnPosition.y, tetromino.bitmapKey);
      break;

    case tetrominoTypes.lTetromino:
      for (let ySpawn = 0; ySpawn < 3; ySpawn++)
        addSprite(blockSpawnPosition.x, blockSpawnPosition.y + ySpawn, tetromino.bitmapKey);
      addSprite(blockSpawnPosition.x + 1, blockSpawnPosition.y + 2, tetromino.bitmapKey);
      break;

    case tetrominoTypes.sTetromino:
      for (let xSpawn = 0; xSpawn < 2; xSpawn++) {
        addSprite(blockSpawnPosition.x + xSpawn, blockSpawnPosition.y, tetromino.bitmapKey);
      };

      for (let xSpawn = 0; xSpawn < 2; xSpawn++) {
        addSprite(blockSpawnPosition.x + xSpawn - 1, blockSpawnPosition.y + 1, tetromino.bitmapKey);
      };
      break;
    case tetrominoTypes.lFlippedTetromino:
      for (let ySpawn = 0; ySpawn < 3; ySpawn++)
        addSprite(blockSpawnPosition.x, blockSpawnPosition.y + ySpawn, tetromino.bitmapKey);
      addSprite(blockSpawnPosition.x - 1, blockSpawnPosition.y + 2, tetromino.bitmapKey);
      break;
    case tetrominoTypes.sFlippedTetromino:
      for (let xSpawn = 0; xSpawn < 2; xSpawn++) {
        addSprite(blockSpawnPosition.x + xSpawn - 1, blockSpawnPosition.y, tetromino.bitmapKey);
      };

      for (let xSpawn = 0; xSpawn < 2; xSpawn++) {
        addSprite(blockSpawnPosition.x + xSpawn, blockSpawnPosition.y + 1, tetromino.bitmapKey);
      };
      break;
  };
}

function isTetrominoCollidingX(tetromino, direction) { // Function to determine if theres blocks surrounding tetromino. Custom collisions
  let colliding = false;
  getAll(tetromino.bitmapKey).forEach(function(tetrominoBlock) {
    const surroundingBlocks = getTile(tetrominoBlock.x + direction, tetrominoBlock.y);
    surroundingBlocks.forEach(function(block) {
      if (surroundingBlocks.length > 0 && block.type != tetromino.bitmapKey)
        colliding = true;
    });
  });

  if (colliding)
    return true;
  else
    return false;
};

function isTetrominoCollidingY(tetromino) { // Function to determine if theres blocks surrounding tetromino. Custom collisions
  let colliding = false;
  getAll(tetromino.bitmapKey).forEach(function(tetrominoBlock) {
    const blocksUnderTetromino = getTile(tetrominoBlock.x, tetrominoBlock.y + 1);
    blocksUnderTetromino.forEach(function(blockUnderTetromino) {
      if (blocksUnderTetromino.length > 0 && blockUnderTetromino.type != tetromino.bitmapKey)
        colliding = true;
    });
  });

  return colliding;
};


function rotateTetromino(tetromino, originIndex, upperLeftBlockIndex) {
  let finalPosition;
  let canRotate = false;

  const destinations = [];
  const tetrominoBlocks = getAll(tetromino.bitmapKey);
  const origin = tetrominoBlocks[originIndex];

  tetrominoBlocks.splice(tetrominoBlocks.indexOf(origin), 1);
  tetrominoBlocks.forEach(function(block) {
    const relativeX = block.x - origin.x;
    const relativeY = block.y - origin.y;
    finalPosition = { x: origin.x - relativeY, y: origin.y + relativeX };

    const tile = getTile(finalPosition.x, finalPosition.y)
    destinations.push(finalPosition)
  });

  destinations.forEach(function(position) {
    const tile = getTile(position.x, position.y);
    if (tile.length > 0) {
      if (tile[0].type != tetromino.bitmapKey)
        destinations.splice(position, 1);
    };
  });

  if (destinations.length == 3) {
    tetrominoBlocks.forEach(function(block) {
      const relativeX = block.x - origin.x;
      const relativeY = block.y - origin.y;
      finalPosition = { x: origin.x - relativeY, y: origin.y + relativeX };

      block.x = finalPosition.x;
      block.y = finalPosition.y;
    });
  };
}

function moveBlock(direction) { // Direction is a int. -x for left and x for right
  if (getAll(newTetromino.bitmapKey).every(block => block.y !== height() - 1) && !isTetrominoCollidingX(newTetromino, direction)) {
    if (direction == 1 && getAll(newTetromino.bitmapKey).every(block => block.x < width() - 1)) {
      getAll(newTetromino.bitmapKey).forEach(function(block) {
        block.x += 1;
      });
    } else if (direction == -1 && getAll(newTetromino.bitmapKey).every(block => block.x !== 0)) {
      getAll(newTetromino.bitmapKey).forEach(function(block) {
        block.x -= 1;
      });
    };
  };
};

function moveBlockDown() {
  if (currentGameState != gameStates.PLAYING) {
    addText("GAME", { x: 8, y: 5, color: color`3` })
    addText("OVER", { x: 8, y: 7, color: color`3` })
    return;
  };

  if (!isTetrominoCollidingY(newTetromino) && getAll(newTetromino.bitmapKey).every(block => block.y < height() - 1)) {
    getAll(newTetromino.bitmapKey).forEach(function(block) {
      block.y += 1;
    });
  } else {
    const nextTetromino = new Tetromino();
    newTetromino = nextTetromino;
    setLegend(
      [background, bitmap`
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL
LLLLLLLLLLLLLLLL`],
      [border, bitmap`
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000`],
      [newTetromino.bitmapKey, newTetromino.bitmap],
      [nextTetromino.bitmapKey, nextTetromino.bitmap],
    );

    spawnTetromino(newTetromino);

    for (let y = height() - 2; y >= 1; y--) {
      let isFirstRowFilled = true;
      const blocksToRemove = [];
      for (let x = 1; x < width() - 1; x++) {
        if (isTetrominoCollidingY(newTetromino))
          isFirstRowFilled = false;

        const tile = getTile(x, y);
        if (tile.length > 0)
          blocksToRemove.push({ x, y });
      };

      if (!isFirstRowFilled)
        currentGameState = gameStates.GAME_OVER; // MAKE IT BETTER

      if (blocksToRemove.length == width() - 2) {
        blocksToRemove.forEach(function(block) {
          clearTile(block.x, block.y);
        });

        for (let yToRemove = blocksToRemove[0].y - 1; yToRemove >= 1; yToRemove--) {
          for (let x = 1; x < width() - 1; x++) {
            getTile(x, yToRemove).forEach(function(block) {
              block.y++;
              if (y < 19)
                y++;
            });
          };
        };

        currentLinesAmount++;
        addText(currentLinesAmount.toString().padStart(3, "0"), { x: 1, y: 2, color: color`L` })
      };
    };
  };
};

// Game logic \\
currentGameState = gameStates.PLAYING;

addText("LINES", { x: 1, y: 1, color: color`2` })
addText("000", { x: 1, y: 2, color: color`L` })

addText("SCORE", { x: 14, y: 1, color: color`2` })
addText("000000", { x: 14, y: 2, color: color`L` })

setMap(gameMap);
setBackground(background);
playTune(tetrisTheme, Infinity);
playTune(tetrisThemeBass, Infinity);

spawnTetromino(newTetromino);

setInterval(async () => {
  moveBlockDown();
}, blockDropSpeed * 1000);

// Inputs
onInput("w", () => {
  switch (newTetromino.type) {
    case tetrominoTypes.straightTetromino:
      rotateTetromino(newTetromino, 1, 0);
      break;
    case tetrominoTypes.tTetromino:
      rotateTetromino(newTetromino, 2, 1);
      break;
    case tetrominoTypes.lTetromino:
      rotateTetromino(newTetromino, 1, 0);
      break;
    case tetrominoTypes.sTetromino:
      rotateTetromino(newTetromino, 3, 0);
      break;
    case tetrominoTypes.lFlippedTetromino:
      rotateTetromino(newTetromino, 1, 0);
      break;
    case tetrominoTypes.sFlippedTetromino:
      rotateTetromino(newTetromino, 2, 0);
      break;
  };
});

onInput("s", () => {
  moveBlockDown();
});

onInput("a", () => {
  moveBlock(-1);
});

onInput("d", () => {
  moveBlock(1);
});