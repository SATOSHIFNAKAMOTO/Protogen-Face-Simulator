const canvas = document.getElementById('protogenCanvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');

const WIDTH = 900;
const HEIGHT = 700;
const LED_SIZE = 16;
const MATRIX_SIZE = 8;
const GAP = 2;
const PANEL_GAP = 4;
const NOSE_GAP = 20;

canvas.width = WIDTH;
canvas.height = HEIGHT;

const RED = 'rgb(255, 0, 0)';
const DARK_RED = 'rgb(60, 0, 0)';

let eye = Array(2).fill().map(() => Array(MATRIX_SIZE).fill().map(() => Array(MATRIX_SIZE).fill(false)));
let nose = Array(MATRIX_SIZE).fill().map(() => Array(MATRIX_SIZE).fill(false));
let mouth = Array(4).fill().map(() => Array(MATRIX_SIZE).fill().map(() => Array(MATRIX_SIZE).fill(false)));

function drawMatrix(matrix, x, y) {
    for (let i = 0; i < MATRIX_SIZE; i++) {
        for (let j = 0; j < MATRIX_SIZE; j++) {
            ctx.fillStyle = matrix[i][j] ? RED : DARK_RED;
            ctx.beginPath();
            ctx.arc(x + j*(LED_SIZE+GAP) + LED_SIZE/2, y + i*(LED_SIZE+GAP) + LED_SIZE/2, LED_SIZE/2, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const matrixWidth = MATRIX_SIZE * (LED_SIZE + GAP);

    // Eye
    drawMatrix(eye[0], 50, 50);
    drawMatrix(eye[1], 50 + matrixWidth + PANEL_GAP, 50);

    // Nose
    const noseX = 50 + 3 * (matrixWidth + PANEL_GAP) + NOSE_GAP;
    drawMatrix(nose, noseX, 50);

    // Mouth
    const mouthY = HEIGHT - 150 - matrixWidth;
    for (let i = 0; i < 4; i++) {
        drawMatrix(mouth[i], 50 + i * (matrixWidth + PANEL_GAP), mouthY);
    }
}

function getLedFromPos(x, y) {
    const matrixWidth = MATRIX_SIZE * (LED_SIZE + GAP);

    // Check eye panels
    if (50 <= y && y < 50 + matrixWidth) {
        if (50 <= x && x < 50 + matrixWidth) {
            return {matrix: eye[0], i: Math.floor((y - 50) / (LED_SIZE + GAP)), j: Math.floor((x - 50) / (LED_SIZE + GAP))};
        } else if (50 + matrixWidth + PANEL_GAP <= x && x < 50 + 2*matrixWidth + PANEL_GAP) {
            return {matrix: eye[1], i: Math.floor((y - 50) / (LED_SIZE + GAP)), j: Math.floor((x - (50 + matrixWidth + PANEL_GAP)) / (LED_SIZE + GAP))};
        }
    }

    // Check nose panel
    const noseX = 50 + 3 * (matrixWidth + PANEL_GAP) + NOSE_GAP;
    if (50 <= y && y < 50 + matrixWidth && noseX <= x && x < noseX + matrixWidth) {
        return {matrix: nose, i: Math.floor((y - 50) / (LED_SIZE + GAP)), j: Math.floor((x - noseX) / (LED_SIZE + GAP))};
    }

    // Check mouth panels
    const mouthY = HEIGHT - 150 - matrixWidth;
    if (mouthY <= y && y < mouthY + matrixWidth) {
        for (let i = 0; i < 4; i++) {
            const panelX = 50 + i * (matrixWidth + PANEL_GAP);
            if (panelX <= x && x < panelX + matrixWidth) {
                return {matrix: mouth[i], i: Math.floor((y - mouthY) / (LED_SIZE + GAP)), j: Math.floor((x - panelX) / (LED_SIZE + GAP))};
            }
        }
    }

    return null;
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const led = getLedFromPos(x, y);
    if (led) {
        led.matrix[led.i][led.j] = !led.matrix[led.i][led.j];
        draw();
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (e.buttons !== 1) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const led = getLedFromPos(x, y);
    if (led) {
        led.matrix[led.i][led.j] = true;
        draw();
    }
});

clearBtn.addEventListener('click', () => {
    eye = Array(2).fill().map(() => Array(MATRIX_SIZE).fill().map(() => Array(MATRIX_SIZE).fill(false)));
    nose = Array(MATRIX_SIZE).fill().map(() => Array(MATRIX_SIZE).fill(false));
    mouth = Array(4).fill().map(() => Array(MATRIX_SIZE).fill().map(() => Array(MATRIX_SIZE).fill(false)));
    draw();
});

exportBtn.addEventListener('click', () => {
    const data = JSON.stringify({eye, nose, mouth});
    const blob = new Blob([data], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'protogen_face_data.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

draw();