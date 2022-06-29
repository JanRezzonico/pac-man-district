//#region Variables and constants
var username;
var room;
var public = true;
var socket = io();
var form = document.getElementById('form');
var input = document.getElementById('input');
//#endregion
//#region Onload functions

refreshRooms();
document.getElementById('togglepopup').addEventListener('click', togglePopup);
document.getElementById('createRoom').addEventListener('click', createroom);
document.getElementById('private').addEventListener('click', togglePublic);
document.getElementById('joinroom').addEventListener('click', joinRoom);
document.getElementById('refreshrooms').addEventListener('click', refreshRooms);
document.getElementById('leaveroom').addEventListener('click', leaveRoom);
document.getElementById('startgamebutton').addEventListener('click', startGame);
document.getElementById('playagain').addEventListener('click', leaveRoom);

window.addEventListener('resize', function () {
    //get all sections
    let sections = document.getElementsByTagName('section');
    //get current section
    let currentSection;
    for (const section of sections) {
        if (section.style.display != 'none') {
            currentSection = section;
            break;
        }
    }
    if (currentSection.id != 'game' && document.getElementById('error').style.display == 'none') {
        return;
    }
    if (window.innerWidth < 1300 || window.innerHeight < 850) {
        document.getElementById('game').style.display = 'none';
        document.getElementById('error').style.display = 'block';
    } else {
        document.getElementById('game').style.display = 'block';
        document.getElementById('error').style.display = 'none';
    }
});
//#endregion
//#region Socket.on
//#region Ui
socket.on('alert', function (msg) {
    showPopup(msg);
});
socket.on('player updated', function (players, owner) {
    var pacmans = document.getElementById("pacmans");
    var ghosts = document.getElementById("ghosts");
    pacmans.innerHTML = "";
    ghosts.innerHTML = "";
    for (var i = 0; i < players.length; i++) {
        var player = document.createElement("li");
        player.innerText = players[i].name;
        console.log(username, owner);
        if(players[i].name == username || username == owner){
            var button = document.createElement("button");
            button.dataset.index = i;
            button.innerText = "change role";
            button.style.float = "right";
            button.style.position = "relative";
            button.addEventListener('click', changeRole);
            player.appendChild(button);
        }
        if(players[i].isPacman){
            pacmans.appendChild(player);
        }else{
            ghosts.appendChild(player);
        }
    }
});

socket.on('public rooms', function (rooms) {
    console.log(rooms);
    let container = document.getElementById("publicrooms");
    container.innerHTML = "<tr><th>Room code</th><th>Players</th><th><input class='mfbutton' type='button' onclick='refreshRooms()' value='REFRESH'></th></tr>";
    for (let i = 0; i < rooms.length; i++) {
        let row = document.createElement("tr");
        let roomcode = document.createElement("td");
        roomcode.innerText = rooms[i].id;
        let players = document.createElement("td");
        players.innerText = rooms[i].players.length;
        let join = document.createElement("td");
        join.colSpan = "100";
        let joinbutton = document.createElement("button");
        joinbutton.innerText = "Join";
        joinbutton.classList += "mfsmallbutton";
        joinbutton.onclick = function () {
            joinRoomWithCode(rooms[i].id);
        };
        join.appendChild(joinbutton);
        row.appendChild(roomcode);
        row.appendChild(players);
        row.appendChild(join);
        container.appendChild(row);
    }
});

socket.on('scoreboard', function (obj) {
    console.log(obj);
    console.log(images);
    document.getElementById('game').style.display = "none";
    document.getElementById("scoreboard").style.display = "block";
    var table = document.getElementById('scoreboardtable');
    var tbody = document.createElement('tbody');
    for (var i = 0; i < obj.length; i++) {
        var player = document.createElement("tr");
        let name = obj[i].name;
        let points = obj[i].points + " points";
        if (obj[i].points == 1) {
            points = obj[i].points + " point";
        }
        let percentage = (obj[i].guessed / obj[i].tries * 100).toFixed(0) + "%";
        percentage += "(" + obj[i].guessed + "/" + obj[i].tries + ")";
        player.innerHTML = "<td>" + (i + 1) + "</td><td>" + name + "</td><td>" + points + "</td><td>" +
            percentage + "</td>";
        tbody.appendChild(player);
    }
    table.appendChild(tbody);
});

socket.on('game started', function () {
    document.getElementById('startgamebutton').style.display = 'none';
});
//#endregion
//#region Room management
socket.on('created room', function (roomId) {
    console.log("created room " + roomId);
    socket.emit('join room', roomId, username);
});
socket.on('room joined', function (roomId, owner) {
    room = roomId;
    console.log("joined room " + roomId);
    document.getElementById("login").style.display = "none";
    document.getElementById("lobby").style.display = "block";
    document.getElementById("room").innerText = "Room: " + roomId;
    document.getElementById("host").innerText = "Host: " + owner;
});
socket.on('room destroyed', function () {
    window.location.reload();
});

socket.on('disconnect', function () {
    leaveRoom();
});
//#endregion

//#region Ingame UI functions
function leaveRoom() {
    socket.emit('leave room', room);
    window.location.reload();
}

function destroyRoom() {
    socket.emit('destroy room', room);
}

function startGame() {
    socket.emit('start game', room);
}

function sendWordChoice(index) {
    document.getElementById('choosewordcontainer').style.visibility = 'hidden';
    socket.emit('get drawer', room);
    dontDraw = false;
    socket.emit('word picked', room, parseInt(index));
}
//#endregion
//#region Popup
function togglePopup(message) {
    let $slider = document.getElementById('slider');
    let isOpen = $slider.classList.contains('slide-in');
    //console.log($slider.classList);
    if (!message) {
        message = "";
    }
    document.getElementById('popupmessage').innerText = message;
    if (isOpen) {
        $slider.removeAttribute('class', 'slide-in');
        $slider.setAttribute('class', 'slide-out');
    } else {
        $slider.removeAttribute('class', 'slide-out');
        $slider.setAttribute('class', 'slide-in');
    }
    return !isOpen;
}
async function showPopup(message) {
    if (togglePopup(message)) {
        await sleep(1500);
        togglePopup(message);
        return;
    }
    await sleep(1000);
    togglePopup(message);
    await sleep(1500);
    togglePopup(message);
}
//#endregion
//#region Window and device functions
//if user is on a mobile device, disable log in
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    document.getElementById('login').style.display = 'none';
    document.getElementById('mobile').style.display = 'block';
}
//on resize if screen is smaller than 1060px, hide current section and show error
window.addEventListener('resize', function () {
    //get all sections
    let sections = document.getElementsByTagName('section');
    //get current section
    let currentSection;
    for (const section of sections) {
        if (section.style.display != 'none') {
            currentSection = section;
            break;
        }
    }
    if (currentSection.id != 'game' && document.getElementById('error').style.display == 'none') {
        return;
    }
    if (window.innerWidth < 1300 || window.innerHeight < 850) {
        document.getElementById('game').style.display = 'none';
        document.getElementById('error').style.display = 'block';
    } else {
        document.getElementById('game').style.display = 'block';
        document.getElementById('error').style.display = 'none';
    }
});
//#endregion
//#region Login section functions$
function changeRole(){
    socket.emit("change role",username ,this.dataset.index, room);
}

function togglePublic() {
    if (public) {
        public = false;
        document.getElementById('private').value = 'PRIVATE';
    } else {
        public = true;
        document.getElementById('private').value = 'PUBLIC';
    }
    console.log(public);
}

function createroom() {
    var usernamein = document.forms["login"]["username"].value;
    if (usernamein == "" || usernamein == null || usernamein.length > 20 || (/^\s*$/.test(usernamein))) {
        showPopup("Fill with valid username username");
        return;
    }
    username = usernamein;
    document.getElementById('startgamebutton').style.display = "block";
    console.log("room is " + public);
    socket.emit('new room', username, public);
}

function refreshRooms() {
    socket.emit('get public rooms');
}

function joinRoomWithCode(supposedRoom) {
    var usernamein = document.forms["login"]["username"].value;
    var roomcodein = supposedRoom;
    if (usernamein == "" || roomcodein == "" || usernamein == null || roomcodein == null) {
        showPopup("Please fill in all fields");
        return;
    }
    username = usernamein;
    room = roomcodein;
    socket.emit('join room', String(room), username);
}
function joinRoom(){
    var usernamein = document.forms["login"]["username"].value;
    var roomcodein = document.forms["login"]["roomcode"].value;
    if (usernamein == "" || roomcodein == "" || usernamein == null || roomcodein == null) {
        showPopup("Please fill in all fields");
        return;
    }
    username = usernamein;
    room = roomcodein;
    socket.emit('join room', String(room), username);
}
//#endregion
//#region Generic functions
async function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    });
}
//#endregion