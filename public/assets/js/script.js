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

// Sign in/logout button management
const signInButton = document.getElementById("signInButton");
const logoutButton = document.getElementById("logoutButton");
let modal = document.getElementById("signInModal");

// Initialize button visibility based on server's authentication state
async function updateAuthButtonState() {
  const token = localStorage.getItem("token");
  
  if (!token) {
    // No token, show sign in
    signInButton.style.display = 'inline-flex';
    logoutButton.style.display = 'none';
    return;
  }

  // Token exists, verify with server
  try {
    const response = await fetch("/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.ok) {
      // Server says user is authenticated
      // signInButton.style.display = 'none';
      // logoutButton.style.display = 'inline-flex';
      showLoggedIn();
    } else if (response.status === 401) {
      // Server says token is invalid, remove it
      localStorage.removeItem("token");
      showLoggedOut(); 
      // signInButton.style.display = 'inline-flex';
      // logoutButton.style.display = 'none';
      console.log("Token invalid, cleared");
    }
  } catch (error) {
    console.error("Error verifying authentication:", error);
    // On network error, default to sign in
    showLoggedOut();
    // signInButton.style.display = 'inline-flex';
    // logoutButton.style.display = 'none';
  }
}

function showLoggedIn() {
    signInButton.style.display = "none";
    logoutButton.style.display = "inline-flex";
}

function showLoggedOut() {
    signInButton.style.display = "inline-flex";
    logoutButton.style.display = "none";
}

// Call on page load
updateAuthButtonState();

function attachModalHandlers(m) {
  const closeBtn = m.querySelector('.close');
  if (closeBtn) closeBtn.addEventListener('click', () => { m.style.display = 'none'; });

  // Close when clicking outside the modal
  window.addEventListener('click', (event) => {
    if (event.target === m) {
      m.style.display = 'none';
    }
  });
}

function initializeSignInForm(m) {
  const form = m.querySelector('#signInForm');
  if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = form.querySelector('#username').value;
        const password = form.querySelector('#password').value;

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem("token", result.token);
                updateAuthButtonState();
                m.style.display = 'none';
                await getCurrentUser();
            }

        } catch (error) {
            console.error(error);
        }
    });
}

signInButton.addEventListener('click', () => {
  if (!modal) {
    fetch('/pages/signInModal.html')
      .then(response => response.text())
      .then(html => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html.trim();
        const el = wrapper.firstElementChild;
        if (el) {
          document.body.appendChild(el);
          modal = document.getElementById('signInModal');
          if (modal) {
            initializeSignInForm(modal);
            attachModalHandlers(modal);
            modal.style.display = 'block';
          }
        }
      })
      .catch(error => console.error('Error loading sign-in modal:', error));
  } else {
    modal.style.display = 'block';
  }
});

if (modal) {
  initializeSignInForm(modal);
}

// Logout functionality
logoutButton.addEventListener('click', () => {
  localStorage.removeItem("token");
  updateAuthButtonState();
  console.log("Logged out successfully");
});

async function getCurrentUser() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.log("Not logged in");
        return;
    }

    try {
        const response = await fetch("/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();
    } catch (error) {
        console.error(error);
    }
}
