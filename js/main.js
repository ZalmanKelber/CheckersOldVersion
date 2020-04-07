import { possibleMoves, modifyPossibleMoves} from "/js/checkers.js";
import { setBoard, isTurn, nextPositionsInTurn, addToPath, narrowDownMoves } from "/js/utils.js";

var r = "r", rk = "rk", b = "b", bk = "bk", e = '';
var black = -1, red = 1;

var rules = {
    "moveFreely": false,
    "mustJump": false,
    "mustJumpAgain": true,
    "mustJumpLongest": false
}
var redCaptured = [0];
var blackCaptured = [0];
var turn = [red];

var testBoard = [[r, e, r, e, r, e, r, e],
                [e, r, e, r, e, r, e, r],
                [e, e, r, e, rk, e, r, e],
                [e, b, e, b, e, b, e, e],
                [e, e, e, e, e, e, e, e],
                [e, e, e, bk, e, b, e, e],
                [e, e, e, e, e, e, e, e],
                [e, e, e, e, e, e, e, e]];

var startingBoard = [[r, e, r, e, r, e, r, e],
                    [e, r, e, r, e, r, e, r],
                    [r, e, r, e, r, e, r, e],
                    [e, e, e, e, e, e, e, e],
                    [e, e, e, e, e, e, e, e],
                    [e, b, e, b, e, b, e, b],
                    [b, e, b, e, b, e, b, e],
                    [e, b, e, b, e, b, e, b]];

const ruleForm = document.getElementById("form");
var board = startingBoard;
var draggedItem = null;
var draggedItemClass = "";
var occupiedSquares = document.querySelectorAll(".occupied");
var unoccupied = document.querySelectorAll(".black");
var currentID;
var newPositionID;
var pathSoFar = [];
var totalPath = [];
var movesArray;
var cellsArrayBlack = document.querySelectorAll(".captured-blacks");
var cellsArrayRed = document.querySelectorAll(".captured-reds");


ruleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    rules["moveFreely"] = document.getElementById("rule1").checked;
    rules["mustJump"] = document.getElementById("rule2").checked;
    rules["mustJumpAgain"] = document.getElementById("rule3").checked;
    rules["mustJumpLongest"] = document.getElementById("rule4").checked;
    board = startingBoard;
    startGame(board, turn);
});

function startGame(board, turn) {
    setBoard(board);
    turn[0] = red;
    movesArray = modifyPossibleMoves(possibleMoves(board, turn[0]), rules);
    var occupiedSquares = document.querySelectorAll(".occupied");
    var unoccupied = document.querySelectorAll(".black");
    for (var i = 0; i < occupiedSquares.length; i++) {
        const occupied = occupiedSquares[i];
        if (isTurn(occupied, turn[0])) {
            occupied.setAttribute("draggable", true);
            occupied.addEventListener("dragstart", dragStart);
            occupied.addEventListener("dragend", dragEnd);
        }
        else {
            occupied.setAttribute("draggable", false);
        }
    }
}

function startTurn () {
    movesArray = modifyPossibleMoves(possibleMoves(board, turn[0]), rules);
    console.log(movesArray);
    if (movesArray.length === 0) {
        endGame(turn[0] * -1);
    }
    var occupiedSquares = document.querySelectorAll(".occupied");
    console.log(occupiedSquares.length);
    var unoccupied = document.querySelectorAll(".black");
    for (var i = 0; i < occupiedSquares.length; i++) {
        const occupied = occupiedSquares[i];
        if (isTurn(occupied, turn[0])) {
            var occupiedID = occupied.getAttribute('id');
            console.log(occupiedID);
            occupied.setAttribute("draggable", true);
            occupied.addEventListener("dragstart", dragStart);
            occupied.addEventListener("dragend", dragEnd);
        }
        else {
            occupied.setAttribute("draggable", false);
        }
    }
}

function continueTurn () {
    console.log("continuing turn");
    var longestMove = 0, shortestMove = 3;
    for (var i = 0; i < movesArray.length; i++) {
        if (movesArray[i].length > longestMove) {
            longestMove = movesArray[i].length;
        }
        if (movesArray[i].length < shortestMove) {
            shortestMove = movesArray[i].length;
        }
    }
    if (longestMove < 2) {
        endTurn();
    }
    if (shortestMove < 2) {
        var clickableElement = document.getElementById(newPositionID + "child");
        clickableElement.addEventListener("click", clickElement)
    }
    var occupiedSquares = document.querySelectorAll(".occupied");
    var unoccupied = document.querySelectorAll(".black");
    for (var i = 0; i < occupiedSquares.length; i++) {
        const occupied = occupiedSquares[i];
        if (isTurn(occupied, turn[0])) {
            occupied.setAttribute("draggable", true);
            occupied.addEventListener("dragstart", dragStart);
            occupied.addEventListener("dragend", dragEnd);
        }
        else {
            occupied.setAttribute("draggable", false);
        }
    }
}

function clickElement () {
    endTurn();
}

function dragStart () {
    draggedItemClass = this.className;
    this.className += " hold";
    draggedItem = this;
    setTimeout(() => (this.style.visibility="hidden"), 0);
    currentID = this.getAttribute("id");
    var nextPositionIDs = nextPositionsInTurn(movesArray, currentID);
    selectSquares(nextPositionIDs);
}

function selectSquares (nextPositionIDs) {
    var unoccupiedList = document.querySelectorAll(".black");
    for (const empty of unoccupiedList) {
        var emptyID = empty.getAttribute("id");
        var legalMove = false;
        for (var i = 0; i < nextPositionIDs.length; i++) {
            if (emptyID === nextPositionIDs[i]) {
                legalMove = true;
            }
        }
        if (legalMove) {
            empty.addEventListener("dragover", dragOver);
            empty.addEventListener("dragenter", dragEnter);
            empty.addEventListener("dragleave", dragLeave);
            empty.addEventListener("drop", dragDrop);
        }
    }
}


function dragEnd () {
    this.classList.remove("hold");
    setTimeout(function () {
        draggedItem.style.visibility="visible";
        draggedItem = null;
        var unoccupiedList = document.querySelectorAll(".black");
        for (const empty of unoccupiedList) {
            empty.removeEventListener("dragover", dragOver);
            empty.removeEventListener("dragenter", dragEnter);
            empty.removeEventListener("dragleave", dragLeave);
            empty.removeEventListener("drop", dragDrop);
        }
    }, 0);
}

function dragOver (e) {
    e.preventDefault();
}

function dragEnter (e) {
    e.preventDefault();
    this.className += " hover";
}

function dragLeave () {
    this.className = "square black";
}

function dragDrop () {
    this.className = "square black";
    newPositionID = this.getAttribute("id");
    draggedItem.className = draggedItemClass;
    draggedItem.setAttribute("id", newPositionID + "child");
    this.append(draggedItem);
    pathSoFar = [];
    addToPath(pathSoFar, currentID, newPositionID);
    addToPath(totalPath, currentID, newPositionID);
    movesArray = narrowDownMoves(pathSoFar, movesArray);
    if (pathSoFar.length === 3) {
        capturePiece(pathSoFar[1]);
    }
    else {
        endTurn();
    }
    continueTurn();
}

function endTurn () {
    console.log("end of turn");
    if (totalPath.length > 0) {
        var pieceType = board[totalPath[0][0]][totalPath[0][1]];
        for (var i = 0; i < totalPath.length - 1; i++) {
            var x = totalPath[i][0];
            var y = totalPath[i][1];
            board[x][y] = "";
        }
        var landingx = totalPath[totalPath.length - 1][0];
        var landingy = totalPath[totalPath.length - 1][1];
        board[landingx][landingy] = pieceType;
        if (landingx === board.length - 1 && pieceType === "r" && redCaptured[0] >= 1) {
            makeKing(landingx, landingy);
        }
        if (landingx === 0 && pieceType === "b" && blackCaptured[0] >= 1) {
            makeKing(landingx, landingy);
        }
    }
    totalPath = [];
    turn[0] *= -1;
    startTurn();
}

function endGame (winner) {
    if (winner === 1) {
        console.log("RED WINS");
    }
    else {
        console.log("BLACK WINS");
    }
}

function capturePiece (position) {
    var pieceID = String(position[0]) + String(position[1]) + "child";
    var capturedPiece = document.getElementById(pieceID);
    var capturedClass = capturedPiece.className;
    capturedPiece.remove();
    var pieceColor;
    var pieceQuantity;
    if (capturedClass === "occupied r" || capturedClass === "occupied b") {
        pieceQuantity = 1;
    }
    else {
        pieceQuantity = 2;
    }
    if (capturedClass === "occupied r" || capturedClass === "occupied rk") {
        pieceColor = 1;
        redCaptured[0] += pieceQuantity;
        console.log(redCaptured);
    }
    else {
        pieceColor = -1;
        blackCaptured[0] += pieceQuantity;
        console.log(blackCaptured);
    }

    var cellsArray = [];
    var type = "b";
    if (pieceColor === 1) {
        cellsArray = cellsArrayRed;
        type = "r";
    }
    else {
        cellsArray = cellsArrayBlack;
        type = "b";
    } 

    for (var i = 0; i < pieceQuantity; i++) {
        var newPiece = document.createElement("div");
        newPiece.className = "unoccupied " + type;
        newPiece.draggable = "true";
        var emptyCells = [];
        for (var j = 0; j < cellsArray.length; j++) {
            var cellElement = cellsArray[j];
            if (! cellElement.firstElementChild) {
                emptyCells.push(cellElement);
            }
        }
        if (pieceColor === -1) {
            emptyCells[0].appendChild(newPiece);
        }   
        else {
            emptyCells[emptyCells.length - 1].appendChild(newPiece);
        }
    }
    if (redCaptured[0] === 12) {
        endGame(-1);
    }
    if (blackCaptured[0] === 12) {
        endGame(1);
    }
}

function makeKing (x, y) {
    console.log("function called");
    var kingID = String(x) + String(y) + "child";
    var kingElement = document.getElementById(kingID);
    kingElement.className += "k";
    var cellsArray;
    if (turn[0] === 1) {
        cellsArray = cellsArrayRed;
        redCaptured[0] -= 1;
        board[x][y] = "rk";
    }
    else {
        cellsArray = cellsArrayBlack;
        blackCaptured[0] -= 1;
        board[x][y] = "bk";
    }
    var occupiedCells = [];
        for (var j = 0; j < cellsArray.length; j++) {
            var cellElement = cellsArray[j];
            if (cellElement.firstElementChild) {
                occupiedCells.push(cellElement.firstElementChild);
            }
        }
    var elementToRemove = occupiedCells[0];
    elementToRemove.remove();
}