// Get canvas element and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20; // Size of each snake segment and food
let snake = [];
snake[0] = { x: 9 * box, y: 10 * box }; // Initial position of the snake

let direction = ""; // Initial direction (empty until game starts)
let food = {
    x: Math.floor(Math.random() * 19) * box + box, // Random position for food within 20 to 380 range
    y: Math.floor(Math.random() * 17 + 3) * box // Random position for food within 60 to 380 range
};

let score = 0;
let level = 1;
let levels = [
    { speed: 100, foodInterval: 1000 },  // Level 1
    { speed: 90, foodInterval: 900 },   // Level 2 (faster snake, quicker food)
    { speed: 80, foodInterval: 800 },   // Level 3
    { speed: 70, foodInterval: 700 },   // Level 4
    { speed: 60, foodInterval: 600 },   // Level 5
    { speed: 50, foodInterval: 500 },   // Level 6
    { speed: 40, foodInterval: 400 },   // Level 7
    { speed: 30, foodInterval: 300 },   // Level 8
    { speed: 20, foodInterval: 200 },   // Level 9
    { speed: 10, foodInterval: 100 }    // Level 10
];

const gameOverMessage = document.getElementById("gameOverMessage");
const scoreDisplay = document.getElementById("score");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const pauseButton = document.getElementById("pauseButton");
const colorOptions = document.querySelectorAll(".color-option");

let gameInterval;
let paused = false;
let snakeColor = "green"; // Default snake color

// Load the mouse image
const mouseImage = new Image();
mouseImage.src = 'C:\\Users\\Viktoria\\Downloads\\Мышь_2-removebg-preview (1).png';

// Load game over sound
const gameOverSound = document.getElementById("gameOverSound");
const eatingSound = document.getElementById("eatingSound");

// Event listeners for color options
colorOptions.forEach(option => {
    option.addEventListener("click", function() {
        snakeColor = this.getAttribute("data-color");
    });
});

// Event listener for level selector
const levelButtons = document.querySelectorAll(".level");
levelButtons.forEach(button => {
    button.addEventListener("click", function() {
        level = parseInt(this.getAttribute("data-level"));
        startGame();
    });
});

// Event listener for start button
startButton.addEventListener("click", startGame);

// Event listener for restart button
restartButton.addEventListener("click", restartGame);

// Event listener for pause button
pauseButton.addEventListener("click", togglePause);

// Function to start the game
function startGame() {
    direction = "RIGHT"; // Initial direction set to right
    snake = [{ x: 9 * box, y: 10 * box }]; // Reset snake position
    score = 0; // Reset score
    scoreDisplay.textContent = "Score: " + score;

    // Generate new food position
    generateFood();

    // Start game loop
    gameInterval = setInterval(draw, levels[level - 1].speed);

    // Remove event listener for start button after game starts
    startButton.removeEventListener("click", startGame);
}

// Function to restart the game
function restartGame() {
    // Clear game interval
    clearInterval(gameInterval);

    // Reset direction and snake position
    direction = "RIGHT";
    snake = [{ x: 9 * box, y: 10 * box }];

    // Reset score and update display
    score = 0;
    scoreDisplay.textContent = "Score: " + score;

    // Generate new food position
    generateFood();

    // Start game loop again
    gameInterval = setInterval(draw, levels[level - 1].speed);

    // Remove event listener for start button after game starts
    startButton.removeEventListener("click", startGame);
}

// Function to toggle pause/unpause
function togglePause() {
    paused = !paused;
    if (paused) {
        clearInterval(gameInterval); // Stop the game loop
        pauseButton.textContent = "Resume Game";
    } else {
        gameInterval = setInterval(draw, levels[level - 1].speed); // Resume the game loop
        pauseButton.textContent = "Pause Game";
    }
}

// Function to handle keyboard input
document.addEventListener("keydown", setDirection);

function setDirection(event) {
    // Adjust direction based on arrow key presses, ensuring snake doesn't reverse
    if (event.key === "ArrowUp" && direction !== "DOWN") {
        direction = "UP";
    } else if (event.key === "ArrowDown" && direction !== "UP") {
        direction = "DOWN";
    } else if (event.key === "ArrowLeft" && direction !== "RIGHT") {
        direction = "LEFT";
    } else if (event.key === "ArrowRight" && direction !== "LEFT") {
        direction = "RIGHT";
    }
}

// Function to check collision
function collision(head, array) {
    // Check if the snake collides with itself or walls
    for (let i = 1; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) {
            return true; // Collision with itself
        }
    }
    return head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height;
}

// Function to generate food
function generateFood() {
    // Generate new food position
    food = {
        x: Math.floor(Math.random() * 19) * box + box,
        y: Math.floor(Math.random() * 17 + 3) * box
    };
}

// Function to handle snake eating food
function eatFood() {
    // Check if snake eats the food
    if (snake[0].x === food.x && snake[0].y === food.y) {
        // Increase score
        score++;
        scoreDisplay.textContent = "Score: " + score;

        gameOverSound.currentTime = 0; // Rewind sound to start
        eatingSound.play(); 

        // Generate new food position
        generateFood();
        return true;
    }
    return false;
}

// Main draw function
function draw() {
    // Update snake position based on the current direction
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    switch (direction) {
        case "UP":
            snakeY -= box;
            break;
        case "DOWN":
            snakeY += box;
            break;
        case "LEFT":
            snakeX -= box;
            break;
        case "RIGHT":
            snakeX += box;
            break;
    }

    // Create new head of the snake
    const newHead = { x: snakeX, y: snakeY };

    // Check for collision with walls or itself
    if (collision(newHead, snake)) {
        clearInterval(gameInterval);
        gameOverSound.play(); // Play game over sound

        // Show game over message
        gameOverMessage.style.display = "block";
        gameOverMessage.textContent = "Game Over!";

        // Add event listener back for start button after game over
        startButton.addEventListener("click", startGame);
        return;
    }

    // Move snake by adding new head
    snake.unshift(newHead);

    // Check if snake eats food
    if (eatFood()) {
        // Snake grows, so no need to remove the last segment
    } else {
        snake.pop(); // Remove the last segment of the snake
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? snakeColor : "white";
        ctx.fillRect(segment.x, segment.y, box, box);
        ctx.strokeStyle = "red";
        ctx.strokeRect(segment.x, segment.y, box, box);
    });

    // Draw food (mouse image)
    const mouseSize = box + 20; // Increase size by 5 pixels
    ctx.drawImage(mouseImage, food.x, food.y, mouseSize, mouseSize); // Draw with increased size
}
