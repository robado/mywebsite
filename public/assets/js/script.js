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
    signInButton.style.display = 'inline-flex';
    logoutButton.style.display = 'none';
    return;
  }

  try {
    const response = await fetch("/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.ok) {
      showLoggedIn();
    } else if (response.status === 401) {
      localStorage.removeItem("token");
      showLoggedOut(); 
      console.log("Token invalid, cleared");
    }
  } catch (error) {
    console.error("Error verifying authentication:", error);
    showLoggedOut();
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

// Logout
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
