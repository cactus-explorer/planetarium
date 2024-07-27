window.addEventListener('load', function () {


// Create initial texture
const textureSize = 4096;
const textureCanvas = document.getElementById('textureCanvas');
textureCanvas.width = textureSize;
textureCanvas.height = textureSize;
const ctx = textureCanvas.getContext('2d');

const image = new Image();
    image.src = planetTex;

ctx.drawImage(image, 0, 0, textureSize, textureSize );

const texture = new THREE.CanvasTexture(textureCanvas);

material = new THREE.MeshBasicMaterial({ map: texture });

// Set up painting
const textureCtx = textureCanvas.getContext('2d');
    textureCtx.drawImage(textureCanvas, 0, 0);

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
    const x = (e.clientX - rect.left) / textureCanvas.getBoundingClientRect().width * textureCanvas.width;
    const y = (e.clientY - rect.top) / textureCanvas.getBoundingClientRect().width * textureCanvas.width;

    // Set brush color and draw a circle
    ctx.fillStyle = colorPicker.value;
    ctx.beginPath();
    ctx.arc(x, y, brushSize.value, 0, Math.PI * 2);
    ctx.fill();

    // Update texture
    textureCtx.drawImage(textureCanvas, 0, 0, textureSize, textureSize);
    texture.needsUpdate = true;
    }
})