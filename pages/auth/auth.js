// ── Tab switching ────────────────────────────────────────
function switchTab(tab) {
  const isLogin = tab === "login";

  document.getElementById("form-login").classList.toggle("hidden", !isLogin);
  document.getElementById("form-signup").classList.toggle("hidden", isLogin);
  document.getElementById("btn-login").classList.toggle("active", isLogin);
  document.getElementById("btn-signup").classList.toggle("active", !isLogin);

  clearForm("login");
  clearForm("signup");
}

// ── Password visibility ──────────────────────────────────
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  btn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");

  // Swap icon: open eye ↔ crossed eye
  btn.querySelector(".eye-icon").innerHTML = isHidden
    ? `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
       <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
       <line x1="1" y1="1" x2="23" y2="23"/>`
    : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
       <circle cx="12" cy="12" r="3"/>`;
}

// ── Validation helpers ───────────────────────────────────
function setFieldError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (message) {
    input.classList.add("error");
    error.textContent = message;
  } else {
    input.classList.remove("error");
    error.textContent = "";
  }
}

function clearFieldError(inputId, errorId) {
  setFieldError(inputId, errorId, "");
}

function showAlert(alertId, type, message) {
  const alert = document.getElementById(alertId);
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
}

function hideAlert(alertId) {
  const alert = document.getElementById(alertId);
  alert.className = "alert hidden";
  alert.textContent = "";
}

function setLoading(formPrefix, loading) {
  const btn = document.getElementById(`${formPrefix}-submit`);
  const text = btn.querySelector(".btn-text");
  const spinner = btn.querySelector(".btn-spinner");
  btn.disabled = loading;
  text.classList.toggle("hidden", loading);
  spinner.classList.toggle("hidden", !loading);
}

function clearForm(formPrefix) {
  hideAlert(`${formPrefix}-alert`);
  if (formPrefix === "login") {
    clearFieldError("login-email", "login-email-error");
    clearFieldError("login-password", "login-password-error");
    document.getElementById("form-login").reset();
  } else {
    clearFieldError("signup-firstname", "signup-firstname-error");
    clearFieldError("signup-lastname", "signup-lastname-error");
    clearFieldError("signup-email", "signup-email-error");
    clearFieldError("signup-password", "signup-password-error");
    document.getElementById("form-signup").reset();
  }
}

// ── Login ────────────────────────────────────────────────
document.getElementById("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideAlert("login-alert");

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  // Client-side validation
  let valid = true;

  if (!email) {
    setFieldError("login-email", "login-email-error", "Email is required.");
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError(
      "login-email",
      "login-email-error",
      "Enter a valid email address.",
    );
    valid = false;
  } else {
    clearFieldError("login-email", "login-email-error");
  }

  if (!password) {
    setFieldError(
      "login-password",
      "login-password-error",
      "Password is required.",
    );
    valid = false;
  } else {
    clearFieldError("login-password", "login-password-error");
  }

  if (!valid) return;

  setLoading("login", true);

  try {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => null);

    if (res.ok) {
      // Store JWT however your app needs it
      const token = data?.token ?? data;
      localStorage.setItem("token", token);
      showAlert(
        "login-alert",
        "success",
        "Logged in successfully. Redirecting…",
      );
      window.location.href = "../../pages/dashboard/dashboard.html";
    } else if (res.status === 404) {
      showAlert(
        "login-alert",
        "error",
        data || "No account found with this email.",
      );
    } else if (res.status === 401) {
      showAlert(
        "login-alert",
        "error",
        data || "Incorrect password. Please try again.",
      );
    } else {
      showAlert(
        "login-alert",
        "error",
        "Something went wrong. Please try again later.",
      );
    }
  } catch {
    showAlert(
      "login-alert",
      "error",
      "Unable to reach the server. Check your connection.",
    );
  } finally {
    setLoading("login", false);
  }
});

// ── Signup ───────────────────────────────────────────────
document.getElementById("form-signup").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideAlert("signup-alert");

  const firstName = document.getElementById("signup-firstname").value.trim();
  const lastName = document.getElementById("signup-lastname").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  // Client-side validation
  let valid = true;

  if (!firstName) {
    setFieldError(
      "signup-firstname",
      "signup-firstname-error",
      "First name is required.",
    );
    valid = false;
  } else {
    clearFieldError("signup-firstname", "signup-firstname-error");
  }

  if (!lastName) {
    setFieldError(
      "signup-lastname",
      "signup-lastname-error",
      "Last name is required.",
    );
    valid = false;
  } else {
    clearFieldError("signup-lastname", "signup-lastname-error");
  }

  if (!email) {
    setFieldError("signup-email", "signup-email-error", "Email is required.");
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError(
      "signup-email",
      "signup-email-error",
      "Enter a valid email address.",
    );
    valid = false;
  } else {
    clearFieldError("signup-email", "signup-email-error");
  }

  if (!password) {
    setFieldError(
      "signup-password",
      "signup-password-error",
      "Password is required.",
    );
    valid = false;
  } else if (password.length < 8) {
    setFieldError(
      "signup-password",
      "signup-password-error",
      "Password must be at least 8 characters.",
    );
    valid = false;
  } else {
    clearFieldError("signup-password", "signup-password-error");
  }

  if (!valid) return;

  setLoading("signup", true);

  try {
    const res = await apiFetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    const data = await res.json().catch(() => null);

    if (res.status === 201) {
      showAlert(
        "signup-alert",
        "success",
        "Account created! You can now log in.",
      );
      document.getElementById("form-signup").reset();
      // Auto-switch to login after a beat
      setTimeout(() => switchTab("login"), 1500);
    } else if (res.status === 409) {
      showAlert(
        "signup-alert",
        "error",
        data || "An account with this email already exists.",
      );
    } else {
      showAlert(
        "signup-alert",
        "error",
        "Something went wrong. Please try again later.",
      );
    }
  } catch {
    showAlert(
      "signup-alert",
      "error",
      "Unable to reach the server. Check your connection.",
    );
  } finally {
    setLoading("signup", false);
  }
});

// ── Clear field errors on input ──────────────────────────
[
  "login-email",
  "login-password",
  "signup-firstname",
  "signup-lastname",
  "signup-email",
  "signup-password",
].forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("input", () => {
    el.classList.remove("error");
    const errEl = document.getElementById(`${id}-error`);
    if (errEl) errEl.textContent = "";
  });
});
