function openPage(pageName) {
    fetch(pageName)
        .then(response => response.text())
        .then(data => {
            document.getElementById("tabContent").innerHTML = data;
        })
        .catch(error => console.error('Error:', error));
}

// Load home.html when loading index.html so the page wouldn't be empty
window.onload = function() {
    openPage('home.html');
}

const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const storedTheme = localStorage.getItem("theme");

if (storedTheme == "dark" || (prefersDarkScheme.matches && !storedTheme)) {
    document.body.classList.add("dark-mode");
}

const toggleDarkModeButton = document.getElementById("toggleDarkMode");
toggleDarkModeButton.addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");
    const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("theme", theme);
});