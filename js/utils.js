export function setBoard (board) {
    var types = ["r", "b", "rk", "bk"];
    for (var typeCounter = 0; typeCounter < types.length; typeCounter++) {
        var type = types[typeCounter];
        var typeIDs = []
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board.length; j++) {
                if (board[i][j] === type) {
                    var newID = i.toString() + j.toString();
                    typeIDs.push(newID);
                }
            }
        }
        for (var i = 0; i < typeIDs.length; i++) {
            var newPiece = document.createElement("div");
            newPiece.className = "occupied " + type;
            newPiece.draggable = "true";
            var parent = document.getElementById(typeIDs[i]);
            newPiece.setAttribute("id", typeIDs[i] + "child");
            parent.appendChild(newPiece);
        }
    }
}
export function nextPositionsInTurn(movesArray, currentID) {
    var numericID = parseInt(currentID.slice(0, 2));
    var y = numericID % 10;
    var x = (numericID - (numericID % 10)) / 10;
    var positions = [];
    for (var i = 0; i < movesArray.length; i++) {
        if (movesArray[i][0][0] === x && movesArray[i][0][1] === y && movesArray[i].length > 1) {
            if (movesArray[i].length > 2) {
                positions.push(movesArray[i][2]);
            }
            else {
                positions.push(movesArray[i][1]);
            }
        }
    }
    var positionIDs = []
    for (var i = 0; i < positions.length; i++) {
        var newID = String(positions[i][0]) + String(positions[i][1]);
        positionIDs.push(newID);
    }
    return positionIDs;
}

export function isTurn (piece, turn) {
    var type = piece.className;
    if (turn === 1) {
        return (type === "occupied r" || type === "occupied rk");
    }
    else {
        return (type === "occupied b" || type === "occupied bk");
    }
}

export function addToPath (pathArray, firstID, secondID) {
    var firstNumericID = parseInt(firstID.slice(0, 2));
    var firsty = firstNumericID % 10;
    var firstx = (firstNumericID - (firstNumericID % 10)) / 10;
    var secondNumericID = parseInt(secondID.slice(0, 2));
    var secondy = secondNumericID % 10;
    var secondx = (secondNumericID - (secondNumericID % 10)) / 10;
    pathArray.push([firstx, firsty]);
    if (secondx - firstx === 2 || secondx - firstx === -2) {
        var thirdx = (firstx + secondx) / 2;
        var thirdy = (firsty + secondy) / 2;
        pathArray.push([thirdx, thirdy]);
    }
    pathArray.push([secondx, secondy]);
}

export function narrowDownMoves (path, moves) {
    if (path.length < 3) {
        return [];
    }
    var newMoves = []
    for (var i = 0; i < moves.length; i++) {
        if (moves[i].length >= path.length) {
            var samePath = true;
            for (var j = 0; j < path.length; j++) {
                if (moves[i][j][0] != path[j][0] || moves[i][j][1] != path[j][1]) {
                    samePath = false;
                }
            }
            if (samePath) {
                var modifiedMove = [];
                for (var j = path.length - 1; j < moves[i].length; j++) {
                    modifiedMove.push([moves[i][j][0], moves[i][j][1]]);
                }
                newMoves.push(modifiedMove);
            }
        }
    }
    return newMoves;
}
