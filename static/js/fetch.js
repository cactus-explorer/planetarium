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

async function downloadWorld() {
    response = await fetch("/?w=" + getName());
    response.json().then((value) => { loadWorld(value) });
}