function ui() {
    const editableText = document.getElementById('editable-text');
    const editForm = document.getElementById('edit-form');
    const editInput = document.getElementById('edit-input');

    planetName = getName();
    console.log(getName());
    planetName = planetName ? planetName : 'Click to Name Planet';

    editableText.textContent = planetName;

    editableText.addEventListener('click', () => {
        editableText.style.display = 'none';
        editForm.style.display = 'block';
        editInput.value = editableText.textContent;
        if (editableText.textContent == 'Click to Name Planet')
            editInput.value = "";
        editInput.focus();
    });

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        editableText.textContent = editInput.value;
        if (editInput.value.trim() == '')
            editableText.textContent = "Click to Name Planet";
        else
            saveName(editInput.value.trim());
        editForm.style.display = 'none';
        editableText.style.display = 'block';
    });

    const save = document.getElementById('save');
    save.addEventListener('click', () => {
        saveWorld();
    });

    const load = document.getElementById('load');
    load.addEventListener('click', () => {
        downloadWorld();
    });
}