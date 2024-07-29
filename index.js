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
const blockSpawnPosition = {x: 6, y: 0};

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

// Classes
const TetrominoTypes = {
  // Names based on wikipedia: https://en.wikipedia.org/wiki/Tetromino
  straightTetromino: "straightTetromino",
  squareTetromino: "squareTetromino",
  tTetromino: "tTetromino",
  lTetromino: "lTetromino",
  skewTetromino: "skewTetromino",
};

class Tetromino {
  constructor(bitmapKey, type) {
    this.bitmapKey = bitmapKey;
    this.type = type;  
  };  
};

// Functions
function SpawnTetromino(tetromino) {
  switch (tetromino.type) {
    case TetrominoTypes.straightTetromino:
      for (let ySpawn = 0; ySpawn < 4; ySpawn++)
        addSprite(blockSpawnPosition.x, blockSpawnPosition.y + ySpawn, tetromino.bitmapKey);
      break
      
    case TetrominoTypes.squareTetromino:
      for (let xSpawn = 0; xSpawn < 2; xSpawn++) {
        for (let ySpawn = 0; ySpawn < 2; ySpawn++) {
          addSprite(blockSpawnPosition.x + xSpawn, blockSpawnPosition.y + ySpawn, tetromino.bitmapKey);
        };
      };
      break

    case TetrominoTypes.tTetromino:
      addSprite(blockSpawnPosition.x + 1, blockSpawnPosition.y + 1, tetromino.bitmapKey);
      for (let xSpawn = 0; xSpawn < 3; xSpawn++) 
        addSprite(blockSpawnPosition.x + xSpawn, blockSpawnPosition.y, tetromino.bitmapKey);
  
    case TetrominoTypes.lTetromino:
      for (let ySpawn = 0; ySpawn < 3; ySpawn++)
        addSprite(blockSpawnPosition.x, blockSpawnPosition.y + ySpawn, tetromino.bitmapKey);
      addSprite(blockSpawnPosition.x + 1, blockSpawnPosition.y + 2, tetromino.bitmapKey);
      break
  
    case TetrominoTypes.skewTetromino:
      for (let xSpawn = 0; xSpawn < 2; xSpawn++) {
        addSprite(blockSpawnPosition.x + xSpawn, blockSpawnPosition.y, tetromino.bitmapKey);
      };

      for (let xSpawn = 0; xSpawn < 2; xSpawn++) {
        addSprite(blockSpawnPosition.x + xSpawn - 1, blockSpawnPosition.y + 1, tetromino.bitmapKey);
      };
      break
  }; 
}

// Sprites
const newTetromino = new Tetromino("b", TetrominoTypes.lTetromino);

setLegend(
  [ newTetromino.bitmapKey, bitmap`
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
L111111111111111`]
);

// Game logic
SpawnTetromino(newTetromino)

setInterval(function() {
  if (getAll(newTetromino.bitmapKey).every(block => block.y < height() - 1)) {
    getAll(newTetromino.bitmapKey).forEach(function(block) {
      block.y += 1;
    });
  };
}, blockDropSpeed * 1000); 

// Inputs
onInput("w", () => {
  console.log("rotating");
});

onInput("s", () => {
  console.log("down");
});

onInput("a", () => {
  console.log("left");
});

onInput("d", () => {
  console.log("right");
});
