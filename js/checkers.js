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

export function arrayDeepCopy (arr) {
    var newArray = [];
    if (!Array.isArray(arr)) {
        return arr;
    }
    for (var i = 0; i < arr.length; i++) {
        newArray.push(arrayDeepCopy(arr[i]));
    }
    return newArray;
}

export function arrayDeepEqual (arr1, arr2) {
    if (!Array.isArray(arr1)) {
        return arr1 === arr2;
    }
    if (!Array.isArray(arr2)) {
        return false;
    }
    if (arr1.length != arr2.length) {
        return false;
    }
    else {
        for (var i = 0; i < arr1.length; i++) {
            if (!arrayDeepEqual(arr1[i], arr2[i])) {
                return false;
            }
        }
        return true;
    }
}

function totalOnBoard (board, color) {
    var total = 0;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if ((board[i][j] === "r" && color === 1) || (board[i][j] === "b" && color === -1)) {
                total++;
            }
            if ((board[i][j] === "rk" && color === 1) || (board[i][j] === "bk" && color === -1)) {
                total += 2;
            }
        }
    }
    return total;
}

export function score (board, color) {
    var score = totalOnBoard(board, color) - totalOnBoard(board, color * -1);
    if (possibleMoves(board, color).length === 0) {
        score = -13;
    }
    if (possibleMoves(board, color * -1).length === 0) {
        score = 13;
    }
    return score;
}

export function updateBoard (board, move) {
    var newBoard = arrayDeepCopy(board);
    var pieceType = board[move[0][0]][move[0][1]];
    for (var i = 0; i < move.length - 1; i++) {
        newBoard[move[i][0]][move[i][1]] = "";
    }
    newBoard[move[move.length - 1][0]][move[move.length - 1][1]] = pieceType;
    if (pieceType === "r" && move[move.length - 1][0] === newBoard.length - 1 && totalOnBoard(newBoard, 1) < 12) {
        newBoard[move[move.length - 1][0]][move[move.length - 1][1]] = "rk";
    }
    if (pieceType === "b" && move[move.length - 1][0] === 0 && totalOnBoard(newBoard, -1) < 12) {
        newBoard[move[move.length - 1][0]][move[move.length - 1][1]] = "bk";
    }
    return newBoard;
}

export function bestMove (movesArrayForFunction, board, rules, turn) {
    var boardCopy = arrayDeepCopy(board);
    var numberOfTurns = 5;
    var turnClone = turn;
    for (var i = 0; i < movesArrayForFunction.length; i++) {
        movesArrayForFunction[i] = [movesArrayForFunction[i], updateBoard(boardCopy, movesArrayForFunction[i])];
    }
    for (var i = 0; i < numberOfTurns - 1; i++) {
        turnClone *= -1;
        var nextMovesArray = [];
        for (var j = 0; j < movesArrayForFunction.length; j++) {
            var nextBoard = arrayDeepCopy(movesArrayForFunction[j][movesArrayForFunction[j].length - 1])
            var nextBoardMovesArray = modifyPossibleMoves(possibleMoves(nextBoard, turnClone), rules);
            if (nextBoardMovesArray.length === 0) {
                nextBoardMovesArray = [[0, 0], [0, 0]];
            }
            for (var k = 0; k < nextBoardMovesArray.length; k++) {
                var nextMove = arrayDeepCopy(nextBoardMovesArray[k]);
                var moveSequence = arrayDeepCopy(movesArrayForFunction[j]);
                moveSequence.push(nextMove);
                moveSequence.push(updateBoard(nextBoard, nextMove));
                nextMovesArray.push(moveSequence);
            }
        }
        movesArrayForFunction = arrayDeepCopy(nextMovesArray);
        console.log(movesArrayForFunction.length);
    }
    var movesArrayWithScores = []
    for (var i = 0; i < movesArrayForFunction.length; i++) {
        movesArrayWithScores.push([movesArrayForFunction[i], score(movesArrayForFunction[i][movesArrayForFunction[i].length - 1], turn)])
    }
    for (var i = numberOfTurns - 2; i >= 0; i--) {
        movesArrayWithScores.push([0]);
        var index = i * 2;
        var narrowerPossibleMoves = [];
        var leaderMoveSequence = movesArrayWithScores[0];
        var moveSequenceBundle = [];
        for (var j = 0; j < movesArrayWithScores.length; j++) {
            var moveSequence = movesArrayWithScores[j];
            var equalPath = true;
            for (var k = 0; k <= index; k += 2) {
                if (!arrayDeepEqual(moveSequence[0][index], leaderMoveSequence[0][index])) {
                    equalPath = false;
                }
            }
            if (equalPath) {
                moveSequenceBundle.push(moveSequence);
            }
            else {
                var pertinentMoveSequence = moveSequenceBundle[0];
                var pertinentScore = moveSequenceBundle[0][1];
                for (var k = 1; k < moveSequenceBundle.length; k++) {
                    if ((moveSequenceBundle[k][1] < pertinentScore && i % 2 === 0) || (moveSequenceBundle[k][1] > pertinentScore && i % 2 === 1)) {
                        pertinentScore = moveSequenceBundle[k][1];
                        pertinentMoveSequence = moveSequenceBundle[k]
                    }
                }
                narrowerPossibleMoves.push(pertinentMoveSequence);
                leaderMoveSequence = movesArrayWithScores[j];
                moveSequenceBundle = [];
                moveSequenceBundle.push(movesArrayWithScores[j]);
            }
        }
    movesArrayWithScores = narrowerPossibleMoves; 
    }
    var bestMove = movesArrayWithScores[0][0][0];
    var bestPertinentScore = movesArrayWithScores[0][1];
    for (var i = 0; i < movesArrayWithScores.length; i++) {
        if (movesArrayWithScores[i][1] > bestPertinentScore) {
            bestPertinentScore = movesArrayWithScores[i][1];
            bestMove = movesArrayWithScores[i][0][0];
        }
    }
    console.log("best score:");
    console.log(bestPertinentScore);
    console.log("best move:");
    console.log(bestMove);
    var bestMoveCopy = arrayDeepCopy(bestMove);
    return bestMoveCopy;
}


