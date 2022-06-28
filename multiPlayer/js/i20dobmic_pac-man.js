//change game settings
const GRID_SIZE = 20;
const WALL_PCT = 0.3; //wall percentage
const BLINKY_SPEED = 500;
const BLINKY_FROM_PAC = 10; //minimum distance blinky spawns from pacman
const LIVES_GAINED = 3; //lives gained when you win
const PAC_AURA_DIST = 2; //distance from where the ghost runs if scared

//variables
const MARGIN = 110;
const PAC_AURA = -0.5;
const INVALID = -1;
const WALL = -2;
const BLINKY = -3;
var nLives = LIVES_GAINED;
var pellets = 0;
var nPoints = 0;
var currentPoints = 0;
var nHighscore = localStorage.getItem("highscore");
var playField = document.getElementById("playField");
var pacman = document.getElementById("pacman");
var blinky = document.getElementById("blinky");
var lives = document.getElementById("lives");
var highscore = document.getElementById("highscore");
var points = document.getElementById("points");
var retry = document.getElementById("retry");
var pause = document.getElementById("pause");
var wasd = document.getElementById("wasd");
var esc = document.getElementById("esc");
var cellSize;
var pelletSize;
var playFieldX;
var playFieldY;
var pacmanX = 0;
var pacmanY = 0;
var blinkyX = -1;
var blinkyY = -1;
var windowSize;
var grid = [];
var inverseGrid = [];
var gridWalls = [];
var isPaused = false;
var isScared = false;
var isBlinkyEaten = false;
var blinkyImage;
var runScared;
var pacDied;


//set default sizes and positions
setDefault();

//set walls 
setWalls();

//place pellets and walls
placeObjects();

//move blinky towards pacman
var blinkyBoogie;

