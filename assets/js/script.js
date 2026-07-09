function openPage(pageName) {
    fetch(pageName)
        .then(response => response.text())
        .then(data => {
            document.getElementById("tabContent").innerHTML = data;

            if (pageName.includes("anime.html")) {
                if(typeof initAnimePage === "function") {
                    initAnimePage();
                } else {
                    console.error("initAnimePage not loaded. Check anilist.js script order.");
                }
            }
        })
        .catch(error => console.error('Error:', error));
}

// Load home.html when loading index.html so the page wouldn't be empty
window.onload = function() {
    openPage('/pages/home.html');
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

// Dropdown menu functionality
// Open/close dropdown
const dropdownBtn = document.querySelector('.dropdown-btn');

if (dropdownBtn) {
    dropdownBtn.addEventListener('click', function(e) {
        e.stopPropagation();

        const dropdownContent = this.parentElement.querySelector('.dropdown-content');
        
        if (dropdownContent) {
            dropdownContent.classList.toggle('show');
        }
    });
}

// Handle dropdown links
const dropdownLinks = document.querySelectorAll('.dropdown-content a');

dropdownLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();

        const page = this.getAttribute('data-page');

        if(page && typeof openPage === 'function') {
            openPage(page);
        } else {
            window.location.href = this.href;
        }

        const dropdownContent = this.closest('.dropdown-content');
        if (dropdownContent) {
            dropdownContent.classList.remove('show');
        }
    });
});

// Close when clicking outside
document.addEventListener('click', function() {
    const dropdownContent = document.querySelector('.dropdown-content');
    
    if (dropdownContent) {
        dropdownContent.classList.remove('show');
    }
});