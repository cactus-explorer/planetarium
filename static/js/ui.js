function ui() {
    const editableText = document.getElementById('editable-text');
    const editForm = document.getElementById('edit-form');
    const editInput = document.getElementById('edit-input');
    
    if (loadedName)
        planetName = loadedName;
    else if (getName())
        planetName = getName();
    else
        planetName = 'Click to Name Planet';

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

    popup()
}
function popup() {
    const overlayBtn = document.getElementById('overlayBtn');
    const overlay = document.getElementById('overlay');
    const closeBtn = document.getElementById('closeBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageIndicator = document.getElementById('pageIndicator');
    const pageContent = document.getElementById('pageContent');
    let currentPage = 1;
    totalPages = 3;

    function updatePageButtons() {
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    }

    async function fetchPageContent(pageNum) {
        pageContent.innerHTML = '<p class="loading">Loading content...</p>';
        try {
            const response = await fetch(`/api/page/${pageNum}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const jsonObject = await response.json();
            pageContent.innerHTML = '';
            totalPages = jsonObject.pages;
            for (data of jsonObject.list) {
                li = document.createElement("li");
                a = document.createElement("a");
                a.setAttribute('href', "/" + data);
                a.innerHTML = (data + "\n");
                li.append(a);

                pageContent.append(li);
            }
        } catch (error) {
            console.error('Error fetching page content:', error);
            pageContent.innerHTML = '<p>Error loading content. Please try again.</p>';
        }
        updatePageButtons();
    }

    overlayBtn.addEventListener('click', function () {
        overlay.style.display = 'block';
        fetchPageContent(1);
    });

    closeBtn.addEventListener('click', function () {
        overlay.style.display = 'none';
    });

    overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
            overlay.style.display = 'none';
        }
    });

    prevBtn.addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            fetchPageContent(currentPage);
        }
    });

    nextBtn.addEventListener('click', function () {
        if (currentPage < totalPages) {
            currentPage++;
            fetchPageContent(currentPage);
        }
    });
}
