// admin.dashboard.js


let API_URL, VERIFY_URL;

(async function() {
  const res = await fetch('/api/v1/config');
  const config = await res.json();
  API_URL = config.API_URL;
  VERIFY_URL = config.VERIFY_URL;
  
  console.log('Loaded URLs:', { API_URL, VERIFY_URL });
})();


// const VERIFY_URL = "/api/v1/verify-admin";
// const VERIFY_URL = '/api/v1/config'
// console.log(VERIFY_URL.VERIFY_URL);




// Simple obfuscation helpers
function obfuscateToken(token) {
  return btoa(
    String.fromCharCode(...new TextEncoder().encode(token + "|" + Date.now()))
  );
}

function deobfuscateToken(obfuscated) {
  try {
    const decoded = atob(obfuscated);
    const bytes = new Uint8Array([...decoded].map((c) => c.charCodeAt(0)));
    const text = new TextDecoder().decode(bytes);
    return text.split("|")[0];
  } catch {
    return null;
  }
}

// Secure session handler
const SESSION_CONFIG = {
  KEY_NAME: "auth_token",
  TIMESTAMP_KEY: "auth_ts",
  EXPIRY_MS: 30 * 60 * 1000, // 30 min
};

const SecureSession = {
  set(key, value) {
    const obf = obfuscateToken(value);
    sessionStorage.setItem(SESSION_CONFIG.KEY_NAME + "_" + key, obf);
    sessionStorage.setItem(SESSION_CONFIG.TIMESTAMP_KEY, Date.now().toString());
  },
  get(key) {
    const timestamp = parseInt(
      sessionStorage.getItem(SESSION_CONFIG.TIMESTAMP_KEY) || "0"
    );
    if (Date.now() - timestamp > SESSION_CONFIG.EXPIRY_MS) {
      this.clear();
      return null;
    }
    const obf = sessionStorage.getItem(SESSION_CONFIG.KEY_NAME + "_" + key);
    return obf ? deobfuscateToken(obf) : null;
  },
  clear() {
    Object.keys(sessionStorage).forEach((k) => {
      if (k.startsWith(SESSION_CONFIG.KEY_NAME)) sessionStorage.removeItem(k);
    });
    sessionStorage.removeItem(SESSION_CONFIG.TIMESTAMP_KEY);
  },
};

document.getElementById("loginBtn").addEventListener("click", async () => {
  const key = document.getElementById("adminKeyInput").value.trim();
  // const errorMsg = document.getElementById("errorMsg");

  if (!key) {
    // errorMsg.textContent = "Admin key is required.";
    // errorMsg.classList.remove("hidden");
    showMessage("Admin key is required.", true);

    return;
  }

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Invalid key");

    SecureSession.set("admin", key);
    setTimeout(() => (window.location.href = "/admin-dashboard"), 700);

    showMessage("Login successful! Redirecting...", false);
    // errorMsg.textContent = "Login successful! Redirecting...";
    // errorMsg.classList.remove("hidden");
    // errorMsg.classList.remove("text-red-600");
    // errorMsg.classList.add("text-green-700");
  } catch (err) {
    // errorMsg.textContent = err.message || "Login failed.";
    // errorMsg.classList.remove("hidden");
    showMessage(`${err.message || "Login failed."}`, true);
  }
});
