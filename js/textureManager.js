// Create initial texture
const textureSize = 4096;
const canvas2 = document.getElementById('textureCanvas');
canvas2.width = textureSize;
canvas2.height = textureSize;
const ctx = canvas2.getContext('2d');
const img = '';

const image = new Image();
image.src = "http://localhost:8000/textures/planet.jpg";

ctx.drawImage(image, 0, 0, textureSize, textureSize );

const texture = new THREE.CanvasTexture(canvas2);

const material = new THREE.MeshBasicMaterial({ map: texture });

// Set up painting
const textureCanvas = document.getElementById('textureCanvas');
const textureCtx = textureCanvas.getContext('2d');
textureCtx.drawImage(canvas2, 0, 0);

const colorPicker = document.getElementById('texColorPicker');
const brushSize = document.getElementById('brushSize');

let painting = false;

textureCanvas.addEventListener('mousedown', startPainting);
textureCanvas.addEventListener('mouseup', stopPainting);
textureCanvas.addEventListener('mousemove', paint);

function startPainting(e) {
    painting = true;
    paint(e);
}

function stopPainting() {
    painting = false;
}

function paint(e) {
    // Exit function if not painting
    if (!painting) return;

    // Get canvas bounds and calculate x and y coordinates
    const rect = textureCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas2.getBoundingClientRect().width * canvas2.width;
    const y = (e.clientY - rect.top) / canvas2.getBoundingClientRect().width * canvas2.width;
    console.log(canvas2.getBoundingClientRect().width, canvas2.width);

    // Set brush color and draw a circle
    ctx.fillStyle = colorPicker.value;
    ctx.beginPath();
    ctx.arc(x, y, brushSize.value, 0, Math.PI * 2);
    ctx.fill();

    // Update texture
    textureCtx.drawImage(canvas2, 0, 0, textureSize, textureSize);
    texture.needsUpdate = true;
}