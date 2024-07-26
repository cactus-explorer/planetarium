function testPost() {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const request = new Request("/", {
        method: "POST",
        headers: {
            "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({ your_name: "example" }),
    });
    fetch(request);
}