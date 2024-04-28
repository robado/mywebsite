function openPage(pageName) {
    fetch(pageName)
        .then(response => response.text())
        .then(data => {
            document.getElementById("tabContent").innerHTML = data;
        })
        .catch(error => console.error('Error:', error));
}
