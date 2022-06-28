function moveBlinky(){
    var north = WALL;
    var west = WALL;
    var south = WALL;
    var east = WALL;
    var ghostGrid = grid;
    if(isScared){
        ghostGrid = inverseGrid;
    }


    //assign if the positions are in the field
    if(blinkyY > 0){
        north = ghostGrid[blinkyY-1][blinkyX];
    }
    
    if(blinkyX > 0){
        west = ghostGrid[blinkyY][blinkyX-1];
    }

    if(blinkyY < GRID_SIZE-1){
        south = ghostGrid[blinkyY+1][blinkyX];
    }

    if(blinkyX < GRID_SIZE-1){
        east = ghostGrid[blinkyY][blinkyX+1];
    }

    //positions which are walls or invalid
    var avoid = GRID_SIZE*1000;

    if(north == WALL || north == PAC_AURA){
        north = Math.abs(north*avoid);
    }
    
    if(west == WALL || west == PAC_AURA){
        west = Math.abs(west*avoid);
    }
    
    if(south == WALL || south == PAC_AURA){
        south = Math.abs(south*avoid);
    }
    
    if(east == WALL || east == PAC_AURA){
        east = Math.abs(east*avoid);
    }

    console.log(north + "N, " + west + "W, " + south + "S, " + east + "E");
    if(north <= west && north <= east && north <= south){
        if(isBlinkyEaten){
            blinkyImage = "img/eyesUp.png";
        }else{
            blinkyImage = "img/blinkyUp.gif";
        }
        blinkyY--;
    }else if(west <= north && west <= east && west <= south){
        if(isBlinkyEaten){
            blinkyImage = "img/eyesLeft.png";
        }else{
            blinkyImage = "img/blinkyLeft.gif";
        }
        blinkyX--;
    }else if(east <= west && east <= north && east <= south){
        if(isBlinkyEaten){
            blinkyImage = "img/eyesRight.png";
        }else{
            blinkyImage = "img/blinkyRight.gif";
        }
        blinkyX++;
    }else{
        if(isBlinkyEaten){
            blinkyImage = "img/eyesDown.png";
        }else{
            blinkyImage = "img/blinkyDown.gif";
        }
        blinkyY++;
    }
    
    if(isScared && !isBlinkyEaten){
        blinkyImage = "img/ghostScared.gif";
    }
    blinky.children[0].src = blinkyImage;

    blinky.style.left = cellSize * blinkyX + "px";
    blinky.style.top = cellSize * blinkyY + "px";

    //pac goes in contact with blinky
    if(getGridX(pacmanX) == blinkyX && getGridY(pacmanY) == blinkyY && !isScared){ 
        youLose();
    }
}

function notScaredBlinky(){
    isBlinkyEaten = false;
    isScared = false;
    blinkyImage = "img/blinkyLeft.gif";
    blinky.children[0].src = blinkyImage;
    clearInterval(blinkyBoogie);
    blinkyBoogie = setInterval(moveBlinky, BLINKY_SPEED);
}