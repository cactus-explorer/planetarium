function saveWorld() {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const request = new Request("/", {
        method: "POST",
        headers: {
            "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({ file: getFile() }),
    });
    fetch(request);
}

async function downloadWorld(name) {
    fetch("/?w=" + name)
        .then((response) => {
            const mainButton = document.getElementById('mainButton');
            if (response.ok) {
                response.json().then((json) => loadWorld(json));
                mainButton.innerText = "Loaded";
            }
            else
                mainButton.innerText = "Does Not Exist";
        });
}