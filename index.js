/*
First time? Check out the tutorial game:
https://sprig.hackclub.com/gallery/getting_started

@title: Tetris
@author: BonzaiDev, Adrian T.
@tags: []
@addedOn: 2024-07-23
*/

// Game settings
let blockDropSpeed = 1; // In seconds
const blockSpawnPosition = { x: 6, y: 0 };

const gameMap = map`
.............
.............
.............
.............
.............
.............
.............
.............
.............
.............
.............
.............
.............`;
setMap(gameMap)

// Classes \\
const mappedSprites = [];
class MappedSprite {
  alphabet = "abcdefghijklmnopqrstuvwxyz";
  readableName = "";
  bitmapKey = "";
  bitmap = bitmap``;

  constructor(readableName) {
    this.readableName = readableName;

    if (mappedSprites.filter(sprite => sprite.readableName === this.readableName).length > 0) {
      throw new Error(`Sprite with readable name ${this.readableName} already exists`);
    };

    // Adrian's custom code that def works
    // basically my idea was to start with the first letter of the alphabet and then go up from there
    // if the letter is already taken, then we go to the next letter and so on :D
    this.bitmapKey = this.alphabet[mappedSprites.length] || this.alphabet[mappedSprites.length - this.alphabet.length];
    mappedSprites.push({
      readableName: this.readableName,
      bitmapKey: this.bitmapKey
    });
  };

  setBitmap(bitmap) {
    this.bitmap = bitmap;
    return this;
  };
}

const tetrominoTypes = {
  // Names based on wikipedia: https://en.wikipedia.org/wiki/Tetromino
  straightTetromino: "straightTetromino",
  squareTetromino: "squareTetromino",
  tTetromino: "tTetromino",
  lTetromino: "lTetromino",
  sTetromino: "sTetromino",
};

class Tetromino extends MappedSprite {
  constructor(type) {
    super(type);
    this.type = type;
  };
};

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
  };
  console.log(mappedSprites);
}

function moveBlock(direction) { // Direction is a int. -x for left and x for right
  if (getAll(newTetromino.bitmapKey).every(block => block.x < width() - 1)) {
    getAll(newTetromino.bitmapKey).forEach(function(block) {
      block.x += direction;
    });
  };
};

function moveBlockDown() {
  if (getAll(newTetromino.bitmapKey).every(block => block.y < height() - 1)) {
    getAll(newTetromino.bitmapKey).forEach(function(block) {
      block.y += 1;
    });
  };
};

function rotateTetromino(tetromino, originIndex, upperLeftBlockIndex) {
  const tetrominoBlocks = getAll(tetromino.bitmapKey);
  const origin = tetrominoBlocks[originIndex];
  const upperLeftBlock = tetrominoBlocks[upperLeftBlockIndex];

  tetrominoBlocks.splice(tetrominoBlocks.indexOf(origin), 1);

  tetrominoBlocks.forEach(function(block) {
    const relativeX = block.x - origin.x;
    const relativeY = block.y - origin.y;

    block.x = origin.x - relativeY;
    block.y = origin.y + relativeX;
  });
};

// Sprites
const newTetromino = new Tetromino(tetrominoTypes.sTetromino).setBitmap(`
111111111111111L
0LLLLLLLLLLLLLL1
0LLLLLLLLLLLLLL1
0LLLLLLLLLLLLLL1
0LLLLLLLLLLLLLL1
0LLLLLLLLLLLLLL1
0LLLLLLLLLLLLLL1
0LLLLLLLLLLLLLL1
0LLLLLLLLLLLLLL1
0LLLLLLLLLLLLLL1
0LLLLLLLLLLLLLL1
0LLLLLLLLLLLLLL1
0LLLLLLLLLLLLLL1
0LLLLLLLLLLLLLL1
0LLLLLLLLLLLLLL1
L111111111111111`)

setLegend(
  [newTetromino.bitmapKey, newTetromino.bitmap],
);

// Game logic \\
spawnTetromino(newTetromino);

setInterval(async () => {
  const oldY = getAll(newTetromino.bitmapKey).y;
  moveBlockDown();
  if (newTetromino.y == getAll(newTetromino.bitmapKey).y) {
    //spawnTetromino(newTetromino2);
  }
}, blockDropSpeed * 1000);

setInterval(async () => {
  keyQueue.shift();
}, 250)

// Inputs
let isHoldingDown;
const keyQueue = [];

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
  };
  
  addToKeyQueue("w");
});

onInput("s", () => {
  addToKeyQueue("s");
  moveBlockDown();
});

onInput("a", () => {
  addToKeyQueue("a");
  moveBlock(-1);
});

onInput("d", () => {
  addToKeyQueue("d");
  moveBlock(1);
});

function addToKeyQueue(key) {
  keyQueue.push({ key, ts: Date.now() });
  //console.log(keyQueue);
}

afterInput(() => {
  if (isHoldingDown) {
    isHoldingDown = !isHoldingDown;
    blockDropSpeed *= blockDropSpeedMultiplier;
  };
})