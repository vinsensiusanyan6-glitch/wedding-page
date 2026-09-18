```javascript
document.addEventListener("DOMContentLoaded", () => {
    const loginView = document.getElementById("loginView");
    const dashboardView = document.getElementById("dashboardView");
    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");
    const logoutBtn = document.getElementById("logoutBtn");

    const ADMIN_USER = "anyanadmin";
    const ADMIN_PASSWORD = "anyan96";
    const LOGIN_KEY = "wedding_admin_logged_in";

    function showLogin() {
        if (loginView) loginView.hidden = false;
        if (dashboardView) dashboardView.hidden = true;
        if (loginError) {
            loginError.textContent = "";
            loginError.hidden = true;
        }
    }

    function showDashboard() {
        if (loginView) loginView.hidden = true;
        if (dashboardView) dashboardView.hidden = false;

        loadPhotos();
    }

    function isLoggedIn() {
        return sessionStorage.getItem(LOGIN_KEY) === "true";
    }

    if (isLoggedIn()) {
        showDashboard();
    } else {
        showLogin();
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const usernameInput = loginForm.querySelector(
                'input[name="username"], #username'
            );

            const passwordInput = loginForm.querySelector(
                'input[name="password"], #password'
            );

            const username = usernameInput
                ? usernameInput.value.trim()
                : "";

            const password = passwordInput
                ? passwordInput.value
                : "";

            if (
                username === ADMIN_USER &&
                password === ADMIN_PASSWORD
            ) {
                sessionStorage.setItem(LOGIN_KEY, "true");

                if (loginError) {
                    loginError.textContent = "";
                    loginError.hidden = true;
                }

                showDashboard();
            } else {
                if (loginError) {
                    loginError.textContent =
                        "Username atau password salah.";
                    loginError.hidden = false;
                }
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            sessionStorage.removeItem(LOGIN_KEY);
            showLogin();
        });
    }

    async function loadPhotos() {
        const slots = [
            "groom",
            "bride",
            "photo01",
            "photo02",
            "photo03",
            "photo04",
            "photo05",
            "photo06"
        ];

        for (const slot of slots) {
            const preview = document.querySelector(
                `[data-preview="${slot}"], #preview-${slot}`
            );

            if (!preview) continue;

            const image = new Image();

            image.onload = () => {
                preview.src = image.src;
                preview.hidden = false;
            };

            image.onerror = () => {
                preview.hidden = true;
            };

            image.src =
                `../assets/images/${slot}.jpg?t=${Date.now()}`;
        }
    }
});
```
