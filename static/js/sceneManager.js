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

const structureHolder = new THREE.Group();
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
        map: new THREE.TextureLoader().load(skyboxTex)
    });
/*    const skyboxMaterials = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
*/
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

    clear();

    if (loadedStruct) {
        if (loadedStruct != "empty")
            restore(JSON.parse(loadedStruct));
    } else
        localRestore();
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
        let coords = sphere.worldToLocal(intersects[0].point);
        newGroup.position.copy(coords);
        log(coords);
        newGroup.lookAt(new THREE.Vector3(0, 0, 0));
        newGroup.rotateX(-Math.PI / 2);
        newGroup.translateY(.7 * size);

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
function clear() {
    for (var i = sphere.children.length - 1; i >= 0; i--) {
        obj = sphere.children[i];
        sphere.remove(obj);
    }
}
