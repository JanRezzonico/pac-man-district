function setDefault(){
    windowSize = Math.min(window.innerHeight, window.innerWidth) - MARGIN*2;
    cellSize = windowSize / GRID_SIZE;
    pelletSize = cellSize / 8;
    playFieldX = (window.innerWidth-cellSize*GRID_SIZE)/2;
    playFieldY = (window.innerHeight-cellSize*GRID_SIZE)/2;

    //actual game
    playField.style.width = windowSize + "px";
    playField.style.height = windowSize + "px";
    playField.style.left = playFieldX + "px";
    playField.style.top = playFieldY + "px";

    pacman.children[0].style.width = cellSize + "px";
    pacman.children[0].style.height = cellSize + "px";

    blinky.children[0].style.width = cellSize + "px";
    blinky.children[0].style.height = cellSize + "px";

    //header
    var pacImg = "<img src='img/pac-man.png' style='";
    pacImg += "width:" + cellSize + "px;";
    pacImg += "height:" + cellSize + "px;'>";
    lives.innerHTML = "LIVES:\n<span></span>x"+pacImg;
    lives.style.left = playFieldX + "px";
    lives.style.top = playFieldY-cellSize*2 + "px";
    lives.style.fontSize = cellSize + "px";

    highscore.innerHTML = "HIGHSCORE:\n<span></span>";
    highscore.style.width = cellSize*4 + "px";
    highscore.style.left = playFieldX+windowSize/2-parseInt(highscore.style.width)/2 + "px";
    highscore.style.top = playFieldY-cellSize*2 + "px";
    highscore.style.fontSize = cellSize + "px";
    
    points.innerHTML = "POINTS:\n<span></span>";
    points.style.width = cellSize*3 + "px";
    points.style.left = playFieldX+windowSize-parseInt(points.style.width) + "px";
    points.style.top = playFieldY-cellSize*2 + "px";
    points.style.fontSize = cellSize + "px";

    lives.children[0].innerHTML = nLives;
    highscore.children[0].innerHTML = nHighscore;
    points.children[0].innerHTML = nPoints;

    //footer
    wasd.innerHTML = "MOVEMENT:<br>WASD or ↑←↓→";
    wasd.style.left = playFieldX + "px";
    wasd.style.top = playFieldY + "px";
    wasd.style.width = cellSize*6 + "px";
    wasd.style.fontSize = cellSize + "px";
    
    esc.innerHTML = "PAUSE:\nESC";
    esc.style.width = cellSize*3 + "px";
    esc.style.left = playFieldX+windowSize-parseInt(esc.style.width) + "px";
    esc.style.top = playFieldY + "px";
    esc.style.fontSize = cellSize + "px";

    //buttons
    retry.style.fontSize = windowSize/7 + "px";
    retry.style.width = windowSize/2 + "px";
    retry.style.height = windowSize/6 + "px";
    retry.style.left = playFieldX + windowSize/4 + "px"
    retry.style.top = playFieldY + windowSize/2-parseInt(retry.style.height)/2 + "px"

    pause.style.fontSize = windowSize/7 + "px";
    pause.style.width = windowSize/2 + "px";
    pause.style.height = windowSize/6 + "px";
    pause.style.left = playFieldX + windowSize/4 + "px"
    pause.style.top = playFieldY + windowSize/2-parseInt(retry.style.height)/2 + "px"

}

function setWalls(){
    gridWalls = [];
    gridWalls.length = GRID_SIZE;
    for (var i = 0; i < gridWalls.length; i++) {
        gridWalls[i] = [];
        gridWalls[i].length = GRID_SIZE;
    }

    for (var i = 0; i < gridWalls.length; i++) {
        for (var j = 0; j < gridWalls[i].length; j++) {
            var rnd = Math.random();
            if(rnd < WALL_PCT){
                gridWalls[i][j] = true;
                getGrid();
                visit(grid, getGridY(pacmanY), getGridX(pacmanX), 0);
                for (var k = 0; k < grid.length; k++) {
                    for (var l = 0; l < grid[k].length; l++) {
                        if(grid[k][l] == INVALID){
                            gridWalls[i][j] = false;
                        }
                    }
                }
            }else{
                gridWalls[i][j] = false;
            }
        }
    }
}

function getGrid(){
    grid.length = GRID_SIZE;
    for (var i = 0; i < grid.length; i++) {
        grid[i] = [];
        grid[i].length = GRID_SIZE;
    }
    
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[i].length; j++) {
            if(gridWalls[i][j]){
                grid[i][j] = WALL;
            }else{
                grid[i][j] = INVALID;
            }
        }
    }
    visit(grid, getGridY(pacmanY), getGridX(pacmanX), 0);
}

function getInverseGrid(){
    inverseGrid.length = GRID_SIZE;
    for (var i = 0; i < inverseGrid.length; i++) {
        inverseGrid[i] = [];
        inverseGrid[i].length = GRID_SIZE;
    }
    
    for (var i = 0; i < inverseGrid.length; i++) {
        for (var j = 0; j < inverseGrid[i].length; j++) {
            if(gridWalls[i][j]){
                inverseGrid[i][j] = WALL;
            }else{
                inverseGrid[i][j] = INVALID;
            }
        }
    }
    var maxRow = grid.map(function(row){ return Math.max.apply(Math, row); });
    var max = Math.max(...maxRow);
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[i].length; j++) {
            if(grid[i][j] == max){
                visit(inverseGrid, i, j, 0);
                
            }
        }
    }

    //add aura around pac to scare ghost away
    placeAura(inverseGrid, getGridY(pacmanY), getGridX(pacmanX));
}

function placeAura(tempGrid, row, col){
    for (var i = row-PAC_AURA_DIST; i < row+PAC_AURA_DIST+1; i++) {
        for (var j = col-PAC_AURA_DIST; j < col+PAC_AURA_DIST+1; j++) {
            if(i < tempGrid.length && i >= 0 && j < tempGrid[0].length && j >= 0 && tempGrid[i][j] != WALL){
                tempGrid[i][j] = PAC_AURA;
            }
        }
    }
}

function placeObjects(){
    //blinky start position
    pellets = 0;
    do{
        blinkyX = Math.floor(Math.random() * (GRID_SIZE-1 - BLINKY_FROM_PAC)) + BLINKY_FROM_PAC;
        blinkyY = Math.floor(Math.random() * (GRID_SIZE-1 - BLINKY_FROM_PAC)) + BLINKY_FROM_PAC;
    }while(gridWalls[blinkyY][blinkyX]);

    for (var i = 0; i < GRID_SIZE; i++) {
        for (var j = 0; j < GRID_SIZE; j++) {
            if(j == blinkyX && i == blinkyY){
                blinky.style.left = cellSize * blinkyX + "px";
                blinky.style.top = cellSize * blinkyY + "px";
            }
            
            if(!gridWalls[i][j]){
                //center pellet
                var y = (i * cellSize) + cellSize / 2 - pelletSize / 2;
                var x = (j * cellSize) + cellSize / 2 - pelletSize / 2;
                
                //if it's corned place a super pellet
                if(
                    !(j == 0 && i == 0) && (
                    (j-1 < 0 || gridWalls[i][j-1] == true) &&
                    (i-1 < 0 || gridWalls[i-1][j] == true) &&
                    (j+1 > GRID_SIZE-1 || gridWalls[i][j+1] == true) ||
                    (j-1 < 0 || gridWalls[i][j-1] == true) &&
                    (i+1 > GRID_SIZE-1 || gridWalls[i+1][j] == true) &&
                    (j+1 > GRID_SIZE-1 || gridWalls[i][j+1] == true) ||
                    (j-1 < 0 || gridWalls[i][j-1] == true) &&
                    (i-1 < 0 || gridWalls[i-1][j] == true) &&
                    (i+1 > GRID_SIZE-1 || gridWalls[i+1][j] == true) ||
                    (j+1 > GRID_SIZE-1 || gridWalls[i][j+1] == true) &&
                    (i-1 < 0 || gridWalls[i-1][j] == true) &&
                    (i+1 > GRID_SIZE-1 || gridWalls[i+1][j] == true)
                    )
                ){
                    placeSuperPellet(x, y);
                    //add check for super pellet
                    //if eaten ghost moves opposite
                }else{
                    placePellet(x, y);
                }
            }else {
                var y = i * cellSize;
                var x = j * cellSize;
                placeWall(x, y);
            }
            
        }
    }
    checkPacEatPellet();
}

//manhattan distance algorithm
function visit(tempGrid, row, col, dist){
    if(row < tempGrid.length && row >= 0 && col < tempGrid[0].length && col >= 0){
        if(
            (tempGrid[row][col] > dist && tempGrid[row][col] != WALL) || 
            tempGrid[row][col] == INVALID
        ){
            tempGrid[row][col] = dist;
            visit(tempGrid, row, col-1,dist+1);
            visit(tempGrid, row-1, col,dist+1);
            visit(tempGrid, row, col+1,dist+1);
            visit(tempGrid, row+1, col,dist+1);
        }
    }
}



function placePellet(x, y) {
    //create pellet
    var temp = document.createElement("div");
    temp.setAttribute("class", "pellet");
    pellets++;

    //place on play field
    playField.appendChild(temp);
    temp.style.left = x + "px";
    temp.style.top = y + "px";
    temp.style.width = pelletSize + "px";
    temp.style.height = pelletSize + "px";
}

function placeSuperPellet(x, y) {
    //create pellet
    var temp = document.createElement("div");
    temp.setAttribute("class", "superPellet");
    pellets += 5;

    //place on play field
    playField.appendChild(temp);
    temp.style.left = x-pelletSize/2 + "px";
    temp.style.top = y-pelletSize/2 + "px";
    temp.style.width = pelletSize*2 + "px";
    temp.style.height = pelletSize*2 + "px";
}

function placeWall(x, y) {
    //create wall
    var temp = document.createElement("div");
    temp.setAttribute("class", "wall");

    //place on play field
    playField.appendChild(temp);
    temp.style.left = x + "px";
    temp.style.top = y + "px";
    temp.style.width = cellSize + "px";
    temp.style.height = cellSize + "px";
}

function getGridX(x){
    return Math.round(x/cellSize, 10);
}

function getGridY(y){
    return Math.round(y/cellSize, 10);
}

function resetPlayfield(){
    var allWalls = document.getElementsByClassName("wall");
    for(var i = allWalls.length-1; i >= 0; i--){
        playField.removeChild(allWalls[i]);
    }

    var allPellets = document.getElementsByClassName("pellet");
    for(var i = allPellets.length-1; i >= 0; i--){
        playField.removeChild(allPellets[i]);
    }

    var allSPellets = document.getElementsByClassName("superPellet");
    for(var i = allSPellets.length-1; i >= 0; i--){
        playField.removeChild(allSPellets[i]);
    }

    setWalls();
    placeObjects();
}

function youRetry(){
    clearInterval(blinkyBoogie);
    window.removeEventListener("keyup", onKeyUp);

    retry.innerHTML = "RETRY";
    retry.style.visibility = "hidden";

    //reset points
    nPoints = 0;
    currentPoints = 0;
    points.children[0].innerHTML = nPoints;
    
    //reset lives
    nLives = LIVES_GAINED;
    lives.children[0].innerHTML = nLives;

    resetPacman();

    resetPlayfield();

    blinkyBoogie = setInterval(moveBlinky, BLINKY_SPEED);
    window.addEventListener("keyup", onKeyUp, false);
}

function youWin(){
    currentPoints = 0;
    clearInterval(blinkyBoogie);
    window.removeEventListener("keyup", onKeyUp);

    //add lives
    nLives += LIVES_GAINED;
    lives.children[0].innerHTML = nLives;

    resetPacman();

    resetPlayfield();

    blinkyBoogie = setInterval(moveBlinky, BLINKY_SPEED);
    window.addEventListener("keyup", onKeyUp, false);
}

function youLose(){
    clearTimeout(pacDied);
    clearInterval(blinkyBoogie);
    pacman.children[0].src = "img/pac-manDeath.gif";
    pacman.children[0].style.transform = "rotate(0deg)";
    pacDied = setTimeout(youActuallyLose, 1600);
}

function youActuallyLose(){
    nLives--;
    lives.children[0].innerHTML = nLives;

    resetPacman();

    //reset blinky start position
    do{
        blinkyX = Math.floor(Math.random() * (GRID_SIZE-1 - BLINKY_FROM_PAC)) + BLINKY_FROM_PAC;
        blinkyY = Math.floor(Math.random() * (GRID_SIZE-1 - BLINKY_FROM_PAC)) + BLINKY_FROM_PAC;
    }while(gridWalls[blinkyY][blinkyX]);

    for (var i = 0; i < GRID_SIZE; i++) {
        for (var j = 0; j < GRID_SIZE; j++) {
            if(j == blinkyX && i == blinkyY){
                blinky.style.left = cellSize * blinkyX + "px";
                blinky.style.top = cellSize * blinkyY + "px";
            }
        }
    }

    blinkyBoogie = setInterval(moveBlinky, BLINKY_SPEED);

    if(nLives == 0){
        clearInterval(blinkyBoogie);
        window.removeEventListener("keyup", onKeyUp);
        retry.style.visibility = "visible"; 
        setHighscore();
    }
}

function setHighscore(){
    nHighscore = nPoints;

    if(nHighscore > localStorage.getItem("highscore")){
        localStorage.setItem("highscore", nHighscore);
        highscore.children[0].innerHTML = nHighscore;
    }
}

function youPause(){
    isPaused = !isPaused;
    if(isPaused){
        clearInterval(blinkyBoogie);
        clearInterval(blinkyBoogie);
        clearInterval(blinkyBoogie);
        clearInterval(blinkyBoogie);
        clearInterval(blinkyBoogie);
        clearInterval(blinkyBoogie);
        pause.style.visibility = "visible";
    }else{
        if(!isBlinkyEaten){
            blinkyBoogie = setInterval(moveBlinky, BLINKY_SPEED);
        }else{
            blinkyBoogie = setInterval(moveBlinky, BLINKY_SPEED/4);
        }
        
        pause.style.visibility = "hidden";
    }
}