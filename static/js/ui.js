function ui() {
    const editableText = document.getElementById('editable-text');
    const editForm = document.getElementById('edit-form');
    const editInput = document.getElementById('edit-input');

    planetName = getName();
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

    const mainButton = document.getElementById('mainButton');
    const inputContainer = document.getElementById('inputContainer');
    const textField = document.getElementById('textField');
    const submitButton = document.getElementById('load');

    mainButton.addEventListener('click', () => {
        mainButton.style.display = 'none';
        inputContainer.style.display = 'inline-block';
        textField.focus();
    });

    submitButton.addEventListener('click', async () => {
        const text = textField.value.trim();
        if (text) {
            textField.value = '';
            inputContainer.style.display = 'none';
            mainButton.style.display = 'inline-block';
            downloadWorld(text);

            
        } else {
            alert('Please enter some text before submitting.');
        }
    });

    textField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitButton.click();
        }
    });
}

