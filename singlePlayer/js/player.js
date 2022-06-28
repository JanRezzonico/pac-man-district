//keyboard commands
(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

//when key is let go
function onKeyUp(event) {
    var keyCode = event.keyCode;
    var preX = pacmanX;
    var preY = pacmanY;

    if(keyCode == 27){
        youPause();
    }

    if(!isPaused){
        switch (keyCode) {
            case 39: //left arrow
            case 68: //d
                pacmanX += cellSize
                pacman.style.left = pacmanX + "px";
                pacman.children[0].style.transform = "rotate(0deg)";
                break;
            case 40: //down arrow
            case 83: //s
                pacmanY += cellSize;
                pacman.style.top = pacmanY + "px";
                pacman.children[0].style.transform = "rotate(90deg)";
                break;
            case 37: //left arrow
            case 65: //a
                pacmanX -= cellSize
                pacman.style.left = pacmanX + "px";
                pacman.children[0].style.transform = "rotate(180deg)";
                break;
            case 38: //up arrow
            case 87: //w
                pacmanY -= cellSize;
                pacman.style.top = pacmanY + "px";
                pacman.children[0].style.transform = "rotate(270deg)";
                break;
            case 32: //space bar
                isScared = true;
                console.table(grid);
                console.table(inverseGrid);
                //to be continued...
        }

        //do all the checks
        checkPacInPlayField();
        checkPacDontTouchWall(preX, preY);
        checkPacEatPellet();
        checkPacEatSuperPellet();

        //pac goes in contact with blinky
        if(getGridX(pacmanX) == blinkyX && getGridY(pacmanY) == blinkyY){ 
            if(isScared){
                youEatGhost();
            }else{
                youLose();
            }
        }

        //set distance to pacman in grid
        getGrid();
        getInverseGrid();
    }
}

function checkPacEatPellet(){
    var pelletsTemp = document.getElementsByClassName("pellet");
    for(var i = 0; i < pelletsTemp.length; i++){
        var pelletX = parseInt(pelletsTemp[i].style.left, 10);
        var pelletY = parseInt(pelletsTemp[i].style.top, 10);
        var pacX = parseInt(pacmanX + cellSize / 2 - pelletSize / 2, 10);
        var pacY = parseInt(pacmanY + cellSize / 2 - pelletSize / 2, 10);
        
        if(pacX == pelletX && pacY == pelletY){
            playField.removeChild(pelletsTemp[i]);
            nPoints++;
            currentPoints++;
        }
    }
    points.children[0].innerHTML = nPoints;

    //you win
    if(currentPoints == pellets){
        youWin();
    }
}

function checkPacEatSuperPellet(){
    var pelletsTemp = document.getElementsByClassName("superPellet");
    for(var i = 0; i < pelletsTemp.length; i++){
        var pelletX = parseInt(pelletsTemp[i].style.left, 10);
        var pelletY = parseInt(pelletsTemp[i].style.top, 10);
        var pacX = parseInt(pacmanX + cellSize / 2 - pelletSize, 10);
        var pacY = parseInt(pacmanY + cellSize / 2 - pelletSize, 10);
        
        if(pacX == pelletX && pacY == pelletY){
            playField.removeChild(pelletsTemp[i]);
            nPoints += 5;
            currentPoints += 5;
            if(!isScared && !isBlinkyEaten){
                isScared = true;
                blinkyImage = "img/ghostScared.gif";
                blinky.children[0].src = blinkyImage;
                setTimeout(notScaredBlinky, 5000);
            }
        }
    }
    points.children[0].innerHTML = nPoints;
    console.log(currentPoints + "/"+ pellets);
    //you win
    if(currentPoints == pellets){
        youWin();
    }
}

function checkPacInPlayField(){
    if(getGridX(pacmanX) < 0){
        pacmanX += cellSize
        pacman.style.left = pacmanX + "px";
    }else if(getGridY(pacmanY) < 0){
        pacmanY += cellSize;
        pacman.style.top = pacmanY + "px";
    }else if(getGridX(pacmanX) >= GRID_SIZE){
        pacmanX -= cellSize
        pacman.style.left = pacmanX + "px";
    }else if(getGridY(pacmanY) >= GRID_SIZE){
        pacmanY -= cellSize;
        pacman.style.top = pacmanY + "px";
    }
}

function checkPacDontTouchWall(preX, preY){
    var isOk = true;
    for (var i = 0; i < gridWalls.length; i++) {
        for (var j = 0; j < gridWalls[i].length; j++) {
            if(gridWalls[getGridY(pacmanY)][getGridX(pacmanX)]){
                isOk = false;
            }
        }
    }
    if(!isOk){
        pacmanX = preX;
        pacmanY = preY;
        pacman.style.left = pacmanX + "px";
        pacman.style.top = pacmanY + "px";
    }
}

function resetPacman(){
    pacmanX = 0;
    pacmanY = 0;
    pacman.style.left = pacmanX + "px";
    pacman.style.top = pacmanY + "px";
    pacman.children[0].src = "img/pac-man.gif";
}

function youEatGhost(){
    clearTimeout(runScared);
    isBlinkyEaten = true;
    blinkyImage = "img/eyesLeft.png";
    blinky.children[0].src = blinkyImage;
    clearInterval(blinkyBoogie);
    blinkyBoogie = setInterval(moveBlinky, BLINKY_SPEED/4);
    runScared = setTimeout(notScaredBlinky, 5000);
}