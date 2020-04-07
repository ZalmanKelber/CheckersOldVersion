//takes a board and returns an array all possible moves, each one being an array showing 
//the checker's starting, middle and ending positions
export function possibleMoves (board, color) {
    var pieces = [] //each piece is an array with three entries: row, column and a boolean isKing
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (color === -1) {
                if (board[i][j] === 'b') {
                    pieces.push([i, j, false]);
                }
                if (board[i][j] === 'bk') {
                    pieces.push([i, j, true]);
                }
            }
            if (color === 1) {
                if (board[i][j] === 'r') {
                    pieces.push([i, j, false]);
                }
                if (board[i][j] === 'rk') {
                    pieces.push([i, j, true]);
                }
            }
        }
    }
    var moves = [];
    for (var i = 0; i < pieces.length; i++) {
        var movesForPiece = findMoves(board, color, pieces[i]);
        movesForPiece.forEach(move => moves.push(move));
        }
    moves.sort;
    return moves;
}

function onBoard(position, boardSize) {
    var onBoard = position[0] >= 0 && position[0] < boardSize && position[1] >= 0 && position[1] < boardSize;
    return onBoard;
}

function findMoves (board, color, piece, captured=[]) {
    var moves = new Array()

    var up = 1, down = -1, left = 1, right = -1;
    var directionOptions = [[up, left], [up, right]];
    if (piece[2]) {
        directionOptions = [[up, left], [up, right], [down, left], [down, right]];
    }
    var startPosition = [piece[0], piece[1]];
    //remove piece from the board temporarily so that we can possibly revisit the space
    var holdPiece = board[startPosition[0]][startPosition[1]];
    board[startPosition[0]][startPosition[1]] = '';
    var adjacent = [];
    //find moves for pieces that are either kings or not kings
    for (var directionCounter = 0; directionCounter < directionOptions.length; directionCounter++) {
        adjacent = [piece[0] + 1 * color * directionOptions[directionCounter][0], piece[1] + directionOptions[directionCounter][1]];
        if (onBoard(adjacent, board.length)) {
            if (board[adjacent[0]][adjacent[1]] === '') {
                var nextMove = [startPosition, adjacent];
                moves.push(nextMove);
            }
            if (doesntContain(captured, adjacent) && ((color === -1 && (board[adjacent[0]][adjacent[1]] === 'r' || board[adjacent[0]][adjacent[1]] === 'rk'))
            || (color === 1 && (board[adjacent[0]][adjacent[1]] === 'b' || board[adjacent[0]][adjacent[1]] === 'bk')))) {
                var landingPosition = [piece[0] + 2 * directionOptions[directionCounter][0] * color, piece[1] + 2 * directionOptions[directionCounter][1]];
                if (onBoard(landingPosition, board.length) && board[landingPosition[0]][landingPosition[1]] === '') {
                    var nextMove = [startPosition, adjacent, landingPosition];
                    moves.push(nextMove);
                    var nextCaptured = []
                    for (var i = 0; i < captured.length; i++) {
                        nextCaptured.push(captured[i])
                    }
                    nextCaptured.push(adjacent)
                    var travelingPiece = [landingPosition[0], landingPosition[1], piece[2]];
                    var otherJumps = findMoves(board, color, travelingPiece, nextCaptured);
                    for (var i = 0; i < otherJumps.length; i++) {
                        if (otherJumps[i].length > 2) {
                            var newMove = [startPosition, adjacent];
                            for (let j = 0; j < otherJumps[i].length; j++) {
                                newMove.push(otherJumps[i][j])
                            }
                            moves.push(newMove);
                        }
                    } 
                }
            }
        }
    }   
    board[startPosition[0]][startPosition[1]] = holdPiece;
    return moves;
}

function doesntContain (listOfPositions, position) {
    var contains = false;
    for (var i = 0; i < listOfPositions.length; i++) {
        if (listOfPositions[i][0] === position[0] && listOfPositions[i][1] === position[1]) {
            contains = true
        }
    }
    return ! contains
}

export function modifyPossibleMoves (moves, rules) {
    if (rules["moveFreely"]) {
        return moves;
    }
    var modifiedMoves = []
    var longestMove = 0;
    for (var i = 0; i < moves.length; i++) {
        if (moves[i].length > longestMove) {
            longestMove = moves[i].length;
        }
    }
    if (longestMove === 2) {
        return moves;
    }
    if (rules["mustJumpLongest"]) {
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].length === longestMove) {
                modifiedMoves.push(moves[i]);
            }
        }
        return modifiedMoves;
    }
    if (rules["mustJump"]) {
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].length > 2) {
                modifiedMoves.push(moves[i]);
            }
        }
           return modifiedMoves;
    }
    else {
        for (var i = 0; i < moves.length - 1; i++) {
            if (moves[i].length < moves[i + 1].length) {
                if ((!isSubset(moves[i], moves[i + 1])) && moves[i].length > 2) {
                    modifiedMoves.push(moves[i]);
                }
            }
            else if (moves[i].length > 2) {
                modifiedMoves.push(moves[i]);
            }
        }
        modifiedMoves.push(moves[moves.length - 1]);
        return modifiedMoves;
    }

}

function isSubset(move1, move2) {
    var isSubset = true;
    for (var i = 0; i < move1.length; i++) {
        if (move1[i][0] != move2[i][0] || move1[i][1] != move2[i][1]) {
            isSubset = false;
        }
    }
    return isSubset;
}


