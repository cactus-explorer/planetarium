window.addEventListener('load', function () {
  
const pixelSize = 20;
const gridSize = 5;

    let grids = [
        Array(gridSize).fill().map(() => Array(gridSize)),
        Array(gridSize).fill().map(() => Array(gridSize)),
        Array(gridSize).fill().map(() => Array(gridSize))
    ];

let currentColor = '#7393B3';
let eraseMode = false;

//function drawGrid(canvas, grid) {
//    const ctx = canvas.getContext('2d');
//    ctx.clearRect(0, 0, canvas.width, canvas.height);
//    for (let i = 0; i < gridSize; i++) {
//        for (let j = 0; j < gridSize; j++) {
//            ctx.fillStyle = grid[i][j];
//            ctx.fillRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize);
//            ctx.strokeRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize);
//        }
//    }
//}

function addClickListener(canvas, gridIndex) {
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / pixelSize);
        const y = Math.floor((event.clientY - rect.top) / pixelSize);
        if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
            grids[gridIndex][x][y] = eraseMode ? '#000000' : currentColor;  // Set pixel to white if erasing, otherwise current color
            //drawGrid(canvas, grids[gridIndex]);
            generate3DModel();  // Update 3D model immediately
        }
    });
}

const canvases = [
    document.getElementById('pixelArtCanvas1'),
    document.getElementById('pixelArtCanvas2'),
    document.getElementById('pixelArtCanvas3')
];

canvases.forEach((canvas, index) => {
    //drawGrid(canvas, grids[index]);
    addClickListener(canvas, index);
});

function generate3DModel() {
    //group.clear();
    
    const geometry = new THREE.BoxGeometry(.03, .03, .03);

    for (let z = 0; z < 3; z++) {
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                const color = grids[z][x][y];
                if (color !== '#000000') {
                    const material = new THREE.MeshPhongMaterial({ color: color });
                    const cube = new THREE.Mesh(geometry, material);
                    cube.position.set((x - gridSize/2 + 0.5) * .03, (-y + gridSize/2 - 0.5) * .03, (-z + 1) * .03);
                    
                    //scene.remove(group);
                    //group.add(cube);
                    //scene.add(group);
                }
            }
        }
    }
}

function scale(num) {
    return num * .03;
}

// Initial 3D model generation
    generate3DModel();
})