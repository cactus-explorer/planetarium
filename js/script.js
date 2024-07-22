// Create initial texture
const textureSize = 4096;
const canvas2 = document.getElementById('textureCanvas');
canvas2.width = textureSize;
canvas2.height = textureSize;
const ctx = canvas2.getContext('2d');
const img = '';

const image = new Image(); // Using optional size for image

// Load an image of intrinsic size 300x227 in CSS pixels
image.src = "http://localhost:8000/textures/planet.jpg";

ctx.drawImage(image, 0, 0, textureSize, textureSize );

// ctx.scale(32, 32);

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



let scene, camera, renderer, sphere, followingCube, skybox;
let isDragging = false;
let isStuck = false;
let previousMousePosition = {
    x: 0,
    y: 0
};
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let size = .1;
let rotationSpeed = 1;

const group = new THREE.Group();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement).id = "PlanetCanvas";

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    // const material = new THREE.MeshBasicMaterial({
    //     map: new THREE.TextureLoader().load('http://localhost:8000/textures/planet.jpg'),
    // });
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    const followingGeometry = new THREE.BoxGeometry(size, size, size);
    const followingMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffbf
    });
    followingCube = new THREE.Mesh(followingGeometry, followingMaterial);
    scene.add(group);

    camera.position.z = 2;

    // Create and add skybox
    const skyboxGeometry = new THREE.SphereGeometry(1000, 32, 32);
    const skyboxMaterials = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('http://localhost:8000/textures/skybox.jpg')
    });
    skyboxGeometry.scale(-1, 1, 1); // invert the geometry on the x-axis so that all of the faces point inward
    skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
    scene.add(skybox);

    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mouseup', onMouseUp, false);
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('click', onClick, false);
    document.addEventListener('wheel', onScroll, false);

    // Options panel event listeners
    document.getElementById('sphereColor').addEventListener('input', updateSphereColor);
    document.getElementById('rotationSpeed').addEventListener('input', updateRotationSpeed);
    document.getElementById('cubeSize').addEventListener('input', updateCubeSize);
    document.getElementById('colorPicker').addEventListener('input', (event) => {
        currentColor = event.target.value;
    });
    drawButton = document.getElementById('draw')
    drawButton.addEventListener('click', () => {
        eraseMode = false;
        eraseButton.classList.remove('active');
        drawButton.classList.add('active');
    });
    eraseButton = document.getElementById('erase');
    eraseButton.addEventListener('click', () => {
        eraseMode = true;
        drawButton.classList.remove('active');
        eraseButton.classList.add('active');
    });
}

function onMouseDown(event) {
    if (event.target.id == "PlanetCanvas")
        isDragging = true;
}

function onMouseUp(event) {
    isDragging = false;
}

function onScroll(event) {
    const zoomSpeed = 0.1;
    camera.position.z += event.deltaY * zoomSpeed * 0.01;

    // Clamp the camera position to avoid zooming too close or too far
    camera.position.z = Math.max(1, Math.min(camera.position.z, 2));
}

function onMouseMove(event) {
    if (isDragging) {
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };

        sphere.rotation.y += deltaMove.x * 0.01;
        sphere.rotation.x += deltaMove.y * 0.01;

        // Rotate skybox with sphere
        skybox.rotation.y += deltaMove.x * 0.01;
        skybox.rotation.x += deltaMove.y * 0.01;

        sphere.rotation.x = Math.max(-Math.PI / 2, Math.min(sphere.rotation.x, Math.PI / 2));
        skybox.rotation.x = Math.max(-Math.PI / 2, Math.min(skybox.rotation.x, Math.PI / 2));
    }

    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };

    // Update mouse position for raycaster
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(sphere);
    const intersectCube = raycaster.intersectObject(group, true);

    if (!isStuck && intersects.length > 0 && !isStuck && group.children.length > 0) {
        
            let newGroup = group.clone(true);
            newGroup.isStuck = true;
            sphere.add(newGroup);
            newGroup.position.copy(sphere.worldToLocal(intersects[0].point));
            newGroup.lookAt(new THREE.Vector3(0, 0, 0));
            newGroup.rotateX(-Math.PI / 2);
            newGroup.translateY(.7 * size);
            console.log(size);
        
    } else if (intersectCube.length > 0 && isStuck) {
        isStuck = false;
        scene.add(group);
        group.position.copy(intersects[0].point);
    }
}



function animate() {
    requestAnimationFrame(animate);

    updateFollowingCube();

    sphere.rotation.y += 0.0005 * rotationSpeed;

    renderer.render(scene, camera);
}

function updateSphereColor(event) {
    sphere.material.color.setHex(event.target.value.replace("#", "0x"));
}

function updateRotationSpeed(event) {
    rotationSpeed = parseFloat(event.target.value);
}

function updateCubeSize(event) {
    const size = parseFloat(event.target.value);
    group.scale.set(size, size, size);
}

init();
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


const pixelSize = 20;  // Increased pixel size for better visibility
const gridSize = 5;    // Changed to 5x5 grid

// Initialize grids
let grids = [
    Array(gridSize).fill().map(() => Array(gridSize).fill('#000000')),
    Array(gridSize).fill().map(() => Array(gridSize).fill('#000000')),
    Array(gridSize).fill().map(() => Array(gridSize).fill('#000000'))
];

// Initialize color picker
let currentColor = '#ffffff';

// Draw grid function
function drawGrid(canvas, grid) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            ctx.fillStyle = grid[i][j];
            ctx.fillRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize);
            ctx.strokeRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize);
        }
    }
}

// Handle click events on the canvases
function addClickListener(canvas, gridIndex) {
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / pixelSize);
        const y = Math.floor((event.clientY - rect.top) / pixelSize);
        if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
            grids[gridIndex][x][y] = eraseMode ? '#000000' : currentColor;  // Set pixel to white if erasing, otherwise current color
            drawGrid(canvas, grids[gridIndex]);
            generate3DModel();  // Update 3D model immediately
        }
    });
}

// Set up canvases
const canvases = [
    document.getElementById('pixelCanvas1'),
    document.getElementById('pixelCanvas2'),
    document.getElementById('pixelCanvas3')
];

canvases.forEach((canvas, index) => {
    drawGrid(canvas, grids[index]);
    addClickListener(canvas, index);
});

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

let animationId;



// Generate 3D model from pixel grids
function generate3DModel() {
    group.clear();
    // scene.add(ambientLight);
    // scene.add(directionalLight);
    
    const geometry = new THREE.BoxGeometry(.03, .03, .03);

    for (let z = 0; z < 3; z++) {
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                const color = grids[z][x][y];
                if (color !== '#000000') {
                    const material = new THREE.MeshPhongMaterial({ color: color });
                    const cube = new THREE.Mesh(geometry, material);
                    cube.position.set(scale(x - gridSize/2 + 0.5), scale(-y + gridSize/2 - 0.5), scale(-z + 1));
                    
                    scene.remove(group);
                    group.add(cube);
                    scene.add(group);
                }
            }
        }
    }
}

// Add eraseMode variable
let eraseMode = false;

// Initial 3D model generation
generate3DModel();

function scale(num) {
    return num * .03;
}

function updateFollowingCube() {
    if (!isStuck) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(sphere);

        if (intersects.length > 0) {
            group.position.copy(intersects[0].point);
            group.translateY(.07);
        } else {
            // If not intersecting, project the cube onto a plane
            const planeNormal = new THREE.Vector3(0, 0, 1);
            const planeConstant = (-1 / camera.position.z) + .3; // Distance from origin
            const plane = new THREE.Plane(planeNormal, planeConstant);
            const targetPoint = new THREE.Vector3();
            raycaster.ray.intersectPlane(plane, targetPoint);
            group.position.copy(targetPoint);
        }
    }

    // Make the cube face away from the center
    group.lookAt(new THREE.Vector3(0, 0, 0));
    group.rotateX(-Math.PI / 2); // Rotate 180 degrees to face outward
}

