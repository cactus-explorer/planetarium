let isStuck = false;
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();


// Set up the scene, camera, and renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);


const strucHolder = new THREE.Group();
const group = new THREE.Group();
let size = .04;
group.scale.set(size, size, size);
scene.add(group);

  // Create textures
  const baseTextureSize = 1024;
  const spotsTextureSize = 512;
  const baseCanvas = document.createElement('canvas');
  baseCanvas.width = baseCanvas.height = baseTextureSize;
const baseCtx = baseCanvas.getContext('2d');

  // Create a spots texture
  const spotsCanvas = document.createElement('canvas');
  spotsCanvas.width = spotsCanvas.height = spotsTextureSize;
const spotsCtx = spotsCanvas.getContext('2d', { willReadFrequently: true });
  spotsCtx.fillStyle = 'rgba(0, 0, 0, 0)';
  spotsCtx.fillRect(0, 0, spotsTextureSize, spotsTextureSize);


const loadedTex = document.getElementById('loadedTex');
if (loadedTex) {
    const ctx = spotsCanvas.getContext("2d");
    ctx.drawImage(loadedTex, 0, 0);
}
else if (getImg()) {
    const ctx = spotsCanvas.getContext("2d");
    var img = new Image();
    img.src = getImg();
    ctx.drawImage(img, 0, 0);
}
const spotsTexture = new THREE.CanvasTexture(spotsCanvas);
spotsTexture.needsUpdate = true;
saveImg(spotsCanvas);

  // Create a sphere geometry and materials
  const geometry = new THREE.SphereGeometry(1, 64, 64);
const baseMaterial = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(planetTex) });
  const spotsMaterial = new THREE.MeshBasicMaterial({
    map: spotsTexture,
    transparent: true,
      blending: THREE.NormalBlending 
  });

  // Create the sphere meshes and add them to the scene
  const baseSphere = new THREE.Mesh(geometry, baseMaterial);
  const spotsSphere = new THREE.Mesh(geometry, spotsMaterial);
  const sphereGroup = new THREE.Group();
  sphereGroup.add(baseSphere);
sphereGroup.add(spotsSphere);
sphereGroup.add(strucHolder);
  scene.add(sphereGroup);

  // Position the camera
  camera.position.z = 2;

  // Animation loop
  let rotationSpeed = 1;
  function animate() {
    requestAnimationFrame(animate);

    // Rotate the sphere group

      updateFollowingCube();

      sphereGroup.rotation.y += 0.0005 * rotationSpeed;

    renderer.render(scene, camera);
  }


clear();

if (loadedStruct) {
    if (loadedStruct != "empty")
        restore(JSON.parse(loadedStruct));
} else
    localRestore();

// Load saved surface value
if (loadedSurface) {
    baseMaterial.map = new THREE.TextureLoader()
        .load(texDir + "/planet" + loadedSurface + ".jpg");
    baseMaterial.needsUpdate = true;
}
else if (getSurface()) {
    baseMaterial.map = new THREE.TextureLoader()
        .load(texDir + "/planet" + getSurface() + ".jpg");
    baseMaterial.needsUpdate = true;
}

  animate();


  // Handle window resizing
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Display spots texture in the menu
  const menuCanvas = document.getElementById('spotTexture');
  menuCanvas.width = menuCanvas.height = 200;
  const menuCtx = menuCanvas.getContext('2d');

  function updateMenuCanvas() {
    menuCtx.clearRect(0, 0, 200, 200);
    menuCtx.drawImage(spotsCanvas, 0, 0, 200, 200);
  }

  updateMenuCanvas();

  // Toggle spots visibility
  const toggleButton = document.getElementById('toggleSpots');
  toggleButton.addEventListener('click', () => {
    spotsSphere.visible = !spotsSphere.visible;
    toggleButton.textContent = spotsSphere.visible ? 'Hide Paint' : 'Show Paint';
  });

  // Clear spots
  const clearButton = document.getElementById('clearSpots');
  clearButton.addEventListener('click', () => {
    addToUndoStack();
    spotsCtx.clearRect(0, 0, spotsTextureSize, spotsTextureSize);
    updateMenuCanvas();
    spotsTexture.needsUpdate = true;
    redoStack = [];
    updateUndoRedoButtons();
  });

  // Painting functionality
  let isDrawing = false;
  const brushSizeInput = document.getElementById('brushSize');
  const opacityInput = document.getElementById('opacity');
  const colorPicker = document.getElementById('colorPicker');
  let currentTool = 'paint';

  menuCanvas.addEventListener('mousedown', startDrawing);
  menuCanvas.addEventListener('mousemove', draw);
  menuCanvas.addEventListener('mouseup', stopDrawing);
  menuCanvas.addEventListener('mouseout', stopDrawing);

  function startDrawing(e) {
    isDrawing = true;
    addToUndoStack();
    draw(e);
  }

  function draw(e) {
    if (!isDrawing) return;
    const rect = menuCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (spotsTextureSize / 200);
    const y = (e.clientY - rect.top) * (spotsTextureSize / 200);
    const radius = brushSizeInput.value * (spotsTextureSize / 200);
    const opacity = opacityInput.value / 100;

    if (currentTool === 'paint') {
      const color = hexToRgb(colorPicker.value);
      const gradient = spotsCtx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`);
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
      spotsCtx.fillStyle = gradient;
    } else { // erase
      spotsCtx.fillStyle = 'rgba(0, 0, 0, 1)';
      spotsCtx.globalCompositeOperation = 'destination-out';
    }

    spotsCtx.beginPath();
    spotsCtx.arc(x, y, radius, 0, Math.PI * 2);
    spotsCtx.fill();

    if (currentTool === 'erase') {
      spotsCtx.globalCompositeOperation = 'source-over';
    }

    updateMenuCanvas();
      spotsTexture.needsUpdate = true;
      saveImg(spotsCanvas);
  }

  function stopDrawing() {
    isDrawing = false;
    redoStack = [];
    updateUndoRedoButtons();
  }

  // Tool selection
  const paintTool = document.getElementById('paintTool');
  const eraseTool = document.getElementById('eraseTool');

  paintTool.addEventListener('click', () => {
    currentTool = 'paint';
    paintTool.classList.add('active-tool');
    eraseTool.classList.remove('active-tool');
  });

  eraseTool.addEventListener('click', () => {
    currentTool = 'erase';
    eraseTool.classList.add('active-tool');
    paintTool.classList.remove('active-tool');
  });

  // Helper function to convert hex color to RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

// Texture switching functionality
  const textureSelect = document.getElementById('textureSelect');
  textureSelect.addEventListener('input', (e) => {
    baseMaterial.map = new THREE.TextureLoader()
        .load(texDir + "/planet" + parseFloat(e.target.value) + ".jpg");
      baseMaterial.needsUpdate = true;
      saveSurface(parseFloat(e.target.value));
  });

  // Menu tabs functionality
  const tabButtons = document.querySelectorAll('.tab-button');
  const menuPages = document.querySelectorAll('.menu-page');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      
      tabButtons.forEach(btn => btn.classList.remove('active'));
      menuPages.forEach(page => page.classList.remove('active'));

      button.classList.add('active');
      document.getElementById(`${tabName}Page`).classList.add('active');
    });
  });

  // Rotation speed control
  const rotationSpeedInput = document.getElementById('rotationSpeed');
  rotationSpeedInput.addEventListener('input', (e) => {
    rotationSpeed = parseFloat(e.target.value);
  });

  // Undo and Redo functionality
  undoStack = [];
  redoStack = [];
  const maxUndoSteps = 20;

  function addToUndoStack() {
    const imageData = spotsCtx.getImageData(0, 0, spotsTextureSize, spotsTextureSize);
    undoStack.push(imageData);
    if (undoStack.length > maxUndoSteps) {
      undoStack.shift();
    }
    updateUndoRedoButtons();
  }

  const undoButton = document.getElementById('undoButton');
  undoButton.addEventListener('click', () => {
    if (undoStack.length > 0) {
      const currentState = spotsCtx.getImageData(0, 0, spotsTextureSize, spotsTextureSize);
      redoStack.push(currentState);
      
      const previousState = undoStack.pop();
      spotsCtx.putImageData(previousState, 0, 0);
      updateMenuCanvas();
      spotsTexture.needsUpdate = true;
      updateUndoRedoButtons();
    }
  });

  const redoButton = document.getElementById('redoButton');
  redoButton.addEventListener('click', () => {
    if (redoStack.length > 0) {
      const currentState = spotsCtx.getImageData(0, 0, spotsTextureSize, spotsTextureSize);
      undoStack.push(currentState);
      
      const nextState = redoStack.pop();
      spotsCtx.putImageData(nextState, 0, 0);
      updateMenuCanvas();
      spotsTexture.needsUpdate = true;
      updateUndoRedoButtons();
    }
  });

  function updateUndoRedoButtons() {
    undoButton.disabled = undoStack.length === 0;
    redoButton.disabled = redoStack.length === 0;
  }

  // Initial undo state
  addToUndoStack();
  updateUndoRedoButtons();

  // Click and drag rotation
  let isDragging = false;
  let previousMousePosition = {
    x: 0,
    y: 0
  };

  renderer.domElement.addEventListener('mousedown', (e) => {
    isDragging = true;
  });

  renderer.domElement.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };

        sphereGroup.rotation.y += deltaMove.x * 0.01;
        sphereGroup.rotation.x += deltaMove.y * 0.01;

        // Rotate skybox with sphere
        skybox.rotation.y += deltaMove.x * 0.01;
        skybox.rotation.x += deltaMove.y * 0.01;

        sphereGroup.rotation.x = Math.max(-Math.PI / 2, Math.min(sphereGroup.rotation.x, Math.PI / 2));
        skybox.rotation.x = Math.max(-Math.PI / 2, Math.min(skybox.rotation.x, Math.PI / 2));
    }

    previousMousePosition = {
      x: e.offsetX,
      y: e.offsetY
    };
  });

  renderer.domElement.addEventListener('mouseup', (e) => {
    isDragging = false;
  });

  renderer.domElement.addEventListener('mouseleave', (e) => {
    isDragging = false;
  });

  // Dummy buttons functionality
  const dummyButtons = document.querySelectorAll('[id^="dummyButton"]');
  dummyButtons.forEach(button => {
    button.addEventListener('click', () => {
      alert(`You clicked ${button.textContent}!`);
    });
  });

// Pixel Art Canvas functionality
const pixelArtCanvases = [
    document.getElementById('pixelArtCanvas1'),
    document.getElementById('pixelArtCanvas2'),
    document.getElementById('pixelArtCanvas3')
];
const pixelSize = 5;

pixelArtCanvases.forEach(canvas => {
    for (let i = 0; i < pixelSize * pixelSize; i++) {
        const pixel = document.createElement('div');
        pixel.classList.add('pixel');
        canvas.appendChild(pixel);
    }
});

let currentPixelColor = '#7393B3';
let currentPixelTool = 'paint';

const pixelColorPicker = document.getElementById('pixelColorPicker');
pixelColorPicker.addEventListener('change', (e) => {
    currentPixelColor = e.target.value;
});

pixelArtCanvases.forEach(canvas => {
    canvas.addEventListener('mousedown', startPainting);
    canvas.addEventListener('mousemove', paint);
});
document.addEventListener('mouseup', stopPainting);

let isPainting = false;

function startPainting(e) {
    isPainting = true;
    paint(e);
}

function stopPainting() {
    isPainting = false;
}

function paint(e) {
    if (!isPainting) return;
    if (e.target.classList.contains('pixel')) {
        if (currentPixelTool === 'paint') {
            e.target.style.backgroundColor = currentPixelColor;
        } else if (currentPixelTool === 'erase') {
            e.target.style.backgroundColor = 'transparent';
        }
        updateVoxels();
    }
}

const pixelPaintTool = document.getElementById('pixelPaintTool');
const pixelEraseTool = document.getElementById('pixelEraseTool');

pixelPaintTool.addEventListener('click', () => {
    currentPixelTool = 'paint';
    pixelPaintTool.classList.add('active-tool');
    pixelEraseTool.classList.remove('active-tool');
});

pixelEraseTool.addEventListener('click', () => {
    currentPixelTool = 'erase';
    pixelEraseTool.classList.add('active-tool');
    pixelPaintTool.classList.remove('active-tool');
});

const clearPixelArtButton = document.getElementById('clearPixelArt');
clearPixelArtButton.addEventListener('click', () => {
    pixelArtCanvases.forEach(canvas => {
        const pixels = canvas.getElementsByClassName('pixel');
        for (let i = 0; i < pixels.length; i++) {
            pixels[i].style.backgroundColor = 'transparent';
        }
    });
    updateVoxels();
});

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);


function createVoxel(x, y, z, color) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({ color: color });
    const voxel = new THREE.Mesh(geometry, material);
    voxel.position.set(x - 2, 2 - y, z - 1);
    return voxel;
}

function updateVoxels() {
    group.clear();
    pixelArtCanvases.forEach((canvas, z) => {
        const pixels = canvas.getElementsByClassName('pixel');
        for (let i = 0; i < pixels.length; i++) {
            const color = pixels[i].style.backgroundColor;
            if (color && color !== 'transparent') {
                const x = i % pixelSize;
                const y = Math.floor(i / pixelSize);
                const voxel = createVoxel(x, y, z, color);
                group.add(voxel);
            }
        }
    });
}

// Create and add skybox
const skyboxGeometry = new THREE.SphereGeometry(1000, 32, 32);
const skyboxMaterials = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(skyboxTex)
});
skyboxGeometry.scale(-1, 1, 1); // invert the geometry on the x-axis so that all of the faces point inward
skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
scene.add(skybox);


function updateFollowingCube() {
    if (!isStuck) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(sphereGroup);

        if (intersects.length > 0) {
            group.position.copy(intersects[0].point);
            group.translateY(size * 2.5);
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

document.addEventListener('mousemove', onMouseMove, false);
function onMouseMove(event) {
    // Update mouse position for raycaster
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}


//document.getElementById('cubeSize').addEventListener('input', updateCubeSize);
function updateCubeSize(event) {
    const size = parseFloat(event.target.value);
    group.scale.set(size, size, size);
}

function onClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(sphereGroup);
    const intersectCube = raycaster.intersectObject(group, true);

    if (intersects.length > 0 && group.children.length > 0) {

        let newGroup = group.clone(true);
        newGroup.isStuck = true;
        strucHolder.add(newGroup);
        let coords = sphereGroup.worldToLocal(intersects[0].point);
        newGroup.position.copy(coords);
        log(coords);
        newGroup.lookAt(new THREE.Vector3(0, 0, 0));
        newGroup.rotateX(-Math.PI / 2);
        newGroup.translateY(size * 2.5);

    }
}


document.addEventListener('click', onClick, false);

function clear() {
    for (var i = strucHolder.children.length - 1; i >= 0; i--) {
        obj = strucHolder.children[i];
        strucHolder.remove(obj);
    }
}

ui();

function onScroll(event) {
    const zoomSpeed = 0.1;
    camera.position.z += event.deltaY * zoomSpeed * 0.01;

    // Clamp the camera position to avoid zooming too close or too far
    camera.position.z = Math.max(1.5, Math.min(camera.position.z, 2));
}
document.addEventListener('wheel', onScroll, false);

// Download spots texture
const downloadButton = document.getElementById('downloadSpots');
downloadButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'spots_texture.png';
    link.href = spotsCanvas.toDataURL('image/png');
    link.click();
});