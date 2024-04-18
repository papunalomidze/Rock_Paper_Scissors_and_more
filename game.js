const crypto = require('crypto');
const readline = require('readline');

function generateKey() {
    return crypto.randomBytes(32).toString('hex');
}

function generateComputerMove(moves) {
    return Math.floor(Math.random() * moves.length);
}

function calculateHMAC(key, move) {
    return crypto.createHmac('sha256', key).update(move).digest('hex');
}

function determineResult(userIndex, computerIndex, numMoves) {
    if (userIndex === computerIndex) {
        return "It's a draw!";
    }
    const half = Math.floor(numMoves / 2);
    if ((userIndex < computerIndex && (computerIndex - userIndex) <= half) ||
        (userIndex > computerIndex && (userIndex - computerIndex) > half)) {
        return "You win!";
    } else {
        return "Computer wins!";
    }
}

function generateHelpTable(moves) {
    const table = [];
    const maxLengths = [];

    const headerRow = ["PC\\User"];
    moves.forEach(move => headerRow.push(move));
    table.push(headerRow);

    const movesMaxLength = Math.max(...moves.map(move => move.length));
    const maxLength = Math.max(headerRow[0].length, movesMaxLength);

    headerRow.forEach(() => maxLengths.push(maxLength));

    // Table
    moves.forEach((move, i) => {
        const row = [move];
        moves.forEach((_, j) => {
            let result = "";
            if (i === j) {
                result = 'Draw';
            } else if ((j - i + moves.length) % moves.length <= Math.floor(moves.length / 2)) {
                result = 'Win';
            } else {
                result = 'Lose';
            }
            row.push(result);
        });

        while (row.length < headerRow.length) {
            row.push('');
        }

        table.push(row);
    });

    const paddedTable = table.map(row => row.map((cell, index) => cell.padEnd(maxLengths[index])));

    return { table: paddedTable, maxLength };
}

function displayHelpTable(moves) {
    const { table, maxLength } = generateHelpTable(moves);

    console.log("\nMove vs. PC\\User:");
    console.log("+" + ("-".repeat(maxLength) + "+").repeat(moves.length + 1));

    table.forEach(row => {
        console.log("|" + row.join('|') + "|");
        console.log("+" + ("-".repeat(maxLength) + "+").repeat(moves.length + 1));
    });
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function displayMoves(moves) {
    console.log("Available moves:");
    moves.forEach((move, index) => console.log(`${index + 1} - ${move}`));
    console.log("0 - exit");
    console.log("? - help");
}

function getUserInput(callback) {
    rl.question("Enter your move: ", (userInput) => {
        callback(userInput);
    });
}

function handleUserInput(userInput, moves, key, computerMoveIndex) {
    if (userInput === "?") {
        displayHelpTable(moves);
        playGame();
        return;
    }

    const userMoveIndex = parseFloat(userInput);
    if (isNaN(userMoveIndex) || !Number.isInteger(userMoveIndex)) {
        console.log("Invalid move. Please enter a valid number.");
        playGame();
        return;
    }

    if (userMoveIndex === 0) {
        rl.close();
        process.exit(0);
    } else if (userMoveIndex < 0 || userMoveIndex > moves.length) {
        console.log("Invalid move. Please try again.");
        playGame();
        return;
    } else {
        const userMove = moves[userMoveIndex - 1];
        const result = determineResult(userMoveIndex - 1, computerMoveIndex, moves.length);
        console.log("------");
        console.log("HMAC key: " + key);
        console.log("Your move: " + userMove);
        console.log("Computer move: " + moves[computerMoveIndex]);
        console.log(result);
        console.log("HMAC: " + calculateHMAC(key, moves[computerMoveIndex]));
        console.log("------");
        playGame();
    }
}

function playGame() {
    const moves = process.argv.slice(2);
    if (moves.length % 2 === 0 || moves.length < 3 || new Set(moves).size !== moves.length) {
        console.log("Invalid arguments. Please provide an odd number of non-repeating strings.");
        process.exit(1);
    }

    const key = generateKey();
    const computerMoveIndex = generateComputerMove(moves);

    displayMoves(moves);

    getUserInput((userInput) => {
        handleUserInput(userInput, moves, key, computerMoveIndex);
    });
}

playGame();
