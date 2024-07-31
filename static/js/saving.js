function log(coords) {
    if (coords == null)
        return;

    let structures = [];
    structures = JSON.parse(localStorage.getItem("structures"))
    if (structures == null)
        structures = [];
    let structure = {coords:coords, group:group};
    structures[structures.length] = structure;
    localStorage.setItem("structures", JSON.stringify(structures));
}

function localRestore() {
    restore(JSON.parse(localStorage.getItem("structures")));
}

function restore(structures) {
    if (structures == null)
        return;

    loader = new THREE.ObjectLoader();

    for (structure of structures) {
        newObj = loader.parse(structure.group);
        strucHolder.add(newObj);
        newObj.position.copy(structure.coords);
        newObj.lookAt(new THREE.Vector3(0, 0, 0));
        newObj.rotateX(-Math.PI / 2);
        newObj.translateY(2.5 * size);
    }
}

function saveName(title) {
    localStorage.setItem("title", title);
}

function getName() {
    return localStorage.getItem("title");
}

function getFile() {
    const file = {};
    file.name = getName();
    file.structures = localStorage.getItem("structures");
    return file;
}

function loadWorld(file) {
    localStorage.setItem("structures", file.structures);
    localStorage.setItem("title", file.name);
    // TODO: clear();
    document.getElementById('editable-text').textContent = file.name;
    localRestore();
}

function saveImg(canvas) {
    var dataURL = canvas.toDataURL("image/png");
    replaced = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    localStorage.setItem("imgData", replaced);
}

function getImg() {
    return "data:image/png;base64," + localStorage.getItem('imgData');
}
function saveSurface(value) {
    localStorage.setItem("surface", value);
}
function getSurface() {
    return localStorage.getItem("surface");
}
