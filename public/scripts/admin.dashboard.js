const API_URL = "/api/v1/projects";


// Secure session same as before
const SESSION_CONFIG = {
  KEY_NAME: "auth_token",
  TIMESTAMP_KEY: "auth_ts",
  EXPIRY_MS: 30 * 60 * 1000,
};

function obfuscateToken(t) {
  return btoa(
    String.fromCharCode(...new TextEncoder().encode(t + "|" + Date.now()))
  );
}

function deobfuscateToken(o) {
  try {
    const d = atob(o);
    const b = new Uint8Array([...d].map((c) => c.charCodeAt(0)));
    const t = new TextDecoder().decode(b);
    return t.split("|")[0];
  } catch {
    return null;
  }
}

const SecureSession = {
  get(k) {
    const ts = parseInt(
      sessionStorage.getItem(SESSION_CONFIG.TIMESTAMP_KEY) || "0"
    );
    if (Date.now() - ts > SESSION_CONFIG.EXPIRY_MS) {
      this.clear();
      return null;
    }
    const o = sessionStorage.getItem(SESSION_CONFIG.KEY_NAME + "_" + k);
    return o ? deobfuscateToken(o) : null;
  },
  clear() {
    Object.keys(sessionStorage).forEach((k) => {
      if (k.startsWith(SESSION_CONFIG.KEY_NAME)) sessionStorage.removeItem(k);
    });
    sessionStorage.removeItem(SESSION_CONFIG.TIMESTAMP_KEY);
  },
};

let adminKey = SecureSession.get("admin");
if (!adminKey) {
  showMessage("Session expired or missing. Redirecting to login...", true);
  setTimeout(() => (window.location.href = "/admin-login"), 1500);
}

function logout() {
  SecureSession.clear();
  showMessage("You have been logged out successfully.", false);
  setTimeout(() => (window.location.href = "/admin-login"), 1200);
}

function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case "planning":
      return "bg-yellow-200 text-yellow-800";
    case "in-progress":
      return "bg-blue-200 text-blue-800";
    case "completed":
      return "bg-green-200 text-green-800";
    case "on-hold":
      return "bg-gray-200 text-gray-800";
    case "cancelled":
      return "bg-red-200 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}


async function changeStatus(id, newStatus) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin": adminKey },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) return showMessage("Failed to update status", true);
    loadProjects(); // refresh to update color
  } catch (err) {
    showMessage("Failed to update status", true);
  }
}

async function loadProjects() {
  const list = document.getElementById("project-list");
  list.innerHTML = "<p class='text-gray-500'>Loading...</p>";

  const dashboardLoading = document.getElementById("dashboard-loading");
  if (dashboardLoading) dashboardLoading.classList.add("hidden");

  try {
    const res = await fetch(API_URL);
    const json = await res.json();
    const data = json.data || [];
    list.innerHTML = "";

    if (data.length === 0) {
      list.innerHTML = "<p class='text-gray-500'>No projects found.</p>";
      return;
    }

    data.forEach((p) => {
      const card = document.createElement("div");

      const safeTitle = sanitize(p.title);
      const safeDesc = sanitize(p.description);
      const safeCat = sanitize(p.category);
      const safeStat = sanitize(p.status);
      const safeLikes = p.likesCount || 0;
      const createdAt = new Date(p.createdAt).toLocaleDateString();

      card.innerHTML = `
<div class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex flex-col justify-between h-full">

  <!-- Title and Description -->
  <h3 class="text-xl font-bold mb-2 text-gray-900 line-clamp-2">${safeTitle}</h3>
  <p class="text-gray-700 text-sm mb-2 line-clamp-3">${safeDesc}</p>

  <!-- Metadata: Created & Category -->
  <div class="flex items-center justify-between text-xs text-gray-500 mb-3 border-b pb-2">
    <span>Created: ${createdAt}</span>
    <span>Category: <span class="font-medium text-gray-600">${safeCat}</span></span>
  </div>

  <!-- Views and Links -->
  <div class="flex justify-between items-center mb-4">
    <!-- Views Count (Eye Icon) -->
    <div class="text-sm text-gray-500 flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500 fill-current" viewBox="0 0 20 20">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
      </svg>
      <span class="font-semibold" id="views-${p._id}">${p.viewsCount || 0} Views</span>
    </div>

    <!-- Links -->
    <div class="flex gap-4">
      ${p.liveUrl ? `<button onclick="handleProjectLinkClick('${p._id}', '${p.liveUrl}')" class="text-sm font-medium text-blue-600 hover:text-blue-800 transition duration-150">Live Demo</button>` : ""}
      ${p.codeUrl ? `<button onclick="handleProjectLinkClick('${p._id}', '${p.codeUrl}')" class="text-sm font-medium text-green-600 hover:text-green-800 transition duration-150">View Code</button>` : ""}
    </div>
  </div>

  <!-- Footer: Status, Likes, Actions -->
  <div class="border-t pt-4 flex items-center justify-between mt-auto">
    <!-- Status Pill -->
    <div class="inline-block px-3 py-0.5 text-xs font-bold rounded-full ${getStatusColor(p.status)} shadow-sm">
      ${safeStat}
    </div>

    <div class="flex items-center gap-4">
      <!-- Likes -->
      <div class="flex items-center gap-1 text-red-500 text-sm" title="Likes">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 fill-current" viewBox="0 0 20 20">
          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
        </svg>
        <span class="font-semibold">${safeLikes}</span>
      </div>

      <!-- Actions -->
      <div class="flex space-x-1">
        <button title="Edit Project" 
                onclick='openModal(${JSON.stringify(p)})'
                class="p-1 rounded-full text-yellow-600 hover:bg-yellow-100 transition duration-150">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button title="Delete Project" 
                onclick="deleteProject('${p._id}')"
                class="p-1 rounded-full text-red-600 hover:bg-red-100 transition duration-150">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</div>
`;

      list.appendChild(card);
    });
  } catch (err) {
    list.innerHTML = `<p class="text-red-500">Failed to load projects.</p>`;
  }
}



// --- Dashboard Loading ---
function showDashboardLoading() {
  const dashboardView = document.getElementById("dashboard-view");
  const dashboardLoading = document.getElementById("dashboard-loading");

  if (!dashboardView || !dashboardLoading) {
    console.error("Dashboard elements not found in DOM");
    return;
  }

  dashboardView.classList.remove("hidden");        // show dashboard
  dashboardLoading.classList.remove("hidden");     // show loading
}

// --- Hide Dashboard Loading ---
function hideDashboardLoading() {
  const dashboardLoading = document.getElementById("dashboard-loading");
  if (dashboardLoading) dashboardLoading.classList.add("hidden");
}

// --- Render Projects in Dashboard ---
async function loadDashboardProjects() {
  const recentProjectsList = document.getElementById("recent-projects-list");
  if (!recentProjectsList) return;

  recentProjectsList.innerHTML = `<p class="text-gray-500 text-center py-6 animate-pulse">Loading projects...</p>`;

  try {
    const res = await fetch(API_URL);
    const json = await res.json();
    const data = json.data || [];

    if (data.length === 0) {
      recentProjectsList.innerHTML = "<p class='text-gray-500 text-center py-6'>No projects found.</p>";
      hideDashboardLoading();
      return;
    }

    recentProjectsList.innerHTML = ""; // clear placeholder

    data.forEach((p) => {
      const card = document.createElement("div");
      card.className = "py-2";

      card.innerHTML = `
        <p class="font-semibold">${sanitize(p.title)}</p>
        <p class="text-gray-500 text-sm line-clamp-2">${sanitize(p.description)}</p>
      `;

      recentProjectsList.appendChild(card);
    });

    hideDashboardLoading();
  } catch (err) {
    recentProjectsList.innerHTML = `<p class="text-red-500 text-center py-6">Failed to load projects</p>`;
    hideDashboardLoading();
  }
}

// --- Initialize Dashboard ---
function initDashboard() {
  showDashboardLoading();
  loadDashboardProjects();
}


// Call on page load
document.addEventListener("DOMContentLoaded", () => {
  initDashboard();       // Load dashboard
   // Load Projects View cards
});








//  <button onclick='openModal(${JSON.stringify(p)})'
async function createProject() {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value.trim();
  const liveUrl = document.getElementById("liveUrl").value.trim();
  const codeUrl = document.getElementById("codeUrl").value.trim();

  // Validate required fields
  if (!title) {
    showMessage("Title is required", true);
    return;
  }

  if (!category) {
    showMessage("Category is required", true);
    return;
  }
  // Validate description length (minimum 10 characters)
  if (!description || description.length < 10) {
    showMessage("Description must be at least 10 characters long", true);
    return;
  }

  // Validate URLs if provided
  if (liveUrl && !isValidUrl(liveUrl)) {
    return showMessage(
      "Invalid live URL format (must start with http:// or https://)",
      true
    );
  }
  if (codeUrl && !isValidUrl(codeUrl)) {
    return showMessage(
      "Invalid code URL format (must start with http:// or https://)",
      true
    );
  }

  // Prepare the payload
  const payload = {
    title,
    description,
    category,
    liveUrl,
    codeUrl,
  };

  // Remove empty strings (backend might reject them)
  Object.keys(payload).forEach((key) => {
    if (payload[key] === "") {
      delete payload[key];
    }
  });

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin": adminKey,
      },
      body: JSON.stringify(payload),
    });

    let data = {};
    try {
      data = await res.json();
    } catch (jsonError) {}

    if (res.ok) {
      showMessage("✓ Project created!", false);
      // Clear fields
      document.getElementById("title").value = "";
      document.getElementById("description").value = "";
      document.getElementById("category").value = "";
      document.getElementById("liveUrl").value = "";
      document.getElementById("codeUrl").value = "";
      loadProjects();
    } else {
      const errorMsg =
        data.message || data.error || res.statusText || "Unknown error";
      showMessage(`Failed: ${errorMsg}`, true);
    }
  } catch (err) {
    showMessage("Network error: " + err.message, true);
  }
}

async function deleteProject(id) {
  if (!confirm("Delete this project?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { "x-admin": adminKey },
    });

    if (res.ok) {
      showMessage("✓ Project deleted!", false);
      loadProjects();
    } else {
      const data = await res.json().catch(() => ({}));
      showMessage(`Failed to delete: ${data.message || res.statusText}`, true);
    }
  } catch (err) {
    showMessage("Network error: " + err.message, true);
  }
}
async function updateProject(id) {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value.trim();
  const liveUrl = document.getElementById("liveUrl").value.trim();
  const codeUrl = document.getElementById("codeUrl").value.trim();

  // Validate required fields
  // Validate required fields
  if (!title) {
    showMessage("Title is required", true);
    return;
  }

  if (!category) {
    showMessage("Category is required", true);
    return;
  }

  // Validate description length (minimum 10 characters)
  if (!description || description.length < 10) {
    showMessage("Description must be at least 10 characters long", true);
    return;
  }

  // Validate URLs if provided
  if (liveUrl && !isValidUrl(liveUrl)) {
    return showMessage(
      "Invalid live URL format (must start with http:// or https://)",
      true
    );
  }
  if (codeUrl && !isValidUrl(codeUrl)) {
    return showMessage(
      "Invalid code URL format (must start with http:// or https://)",
      true
    );
  }

  // Prepare the payload
  const payload = {
    title,
    description,
    category,
    liveUrl,
    codeUrl,
  };

  // Remove empty strings (backend might reject them)
  Object.keys(payload).forEach((key) => {
    if (payload[key] === "") {
      delete payload[key];
    }
  });

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin": adminKey,
      },
      body: JSON.stringify(payload),
    });

    let data = {};
    try {
      data = await res.json();
    } catch (jsonError) {}

    if (res.ok) {
      showMessage("✓ Project updated!", false);
      closeModal();
      loadProjects();
    } else {
      const errorMsg =
        data.message || data.error || res.statusText || "Unknown error";
      showMessage(`Failed to update: ${errorMsg}`, true);
    }
  } catch (err) {
    showMessage("Network error: " + err.message, true);
  }
}

async function saveProject(id = null) {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value.trim();
  const liveUrl = document.getElementById("liveUrl").value.trim();
  const codeUrl = document.getElementById("codeUrl").value.trim();
  const status = document.getElementById("status").value;

  // Validate required fields
  // Validate required fields
  if (!title) {
    showMessage("Title is required", true);
    return;
  }

  if (!category) {
    showMessage("Category is required", true);
    return;
  }
  // Validate URLs if provided
  if (liveUrl && !isValidUrl(liveUrl)) {
    return showMessage(
      "Invalid live URL format (must start with http:// or https://)",
      true
    );
  }
  if (codeUrl && !isValidUrl(codeUrl)) {
    return showMessage(
      "Invalid code URL format (must start with http:// or https://)",
      true
    );
  }

  // Validate description length (minimum 10 characters)
  if (!description || description.length < 10) {
    return showMessage("Description must be at least 10 characters long", true);
  }

  // Prepare the payload
  const payload = {
    title,
    description,
    category,
    liveUrl,
    codeUrl,
    status,
  };

  // Remove empty strings (backend might reject them)
  Object.keys(payload).forEach((key) => {
    if (payload[key] === "") {
      delete payload[key];
    }
  });

  try {
    const res = await fetch(id ? `${API_URL}/${id}` : API_URL, {
      method: id ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin": adminKey,
      },
      body: JSON.stringify(payload),
    });

    let data = {};
    try {
      data = await res.json();
    } catch (jsonError) {}

    if (res.ok) {
      showMessage(`✓ Project ${id ? "updated" : "created"}!`, false);
      closeModal();
      loadProjects();
    } else {
      const errorMsg =
        data.message || data.error || res.statusText || "Unknown error";
      showMessage(`Failed: ${errorMsg}`, true);
    }
  } catch (err) {
    showMessage("Network error: " + err.message, true);
  }
}

async function handleProjectLinkClick(projectId, url) {
  // Open the link in a new tab
  window.open(url, "_blank");

  try {
    // Increment views on backend
    const res = await fetch(`${API_URL}/${projectId}/view`, { method: "POST" });
    const data = await res.json();

    if (res.ok) {
      // Update views count display in card
      const viewsElem = document.getElementById(`views-${projectId}`);
      if (viewsElem) viewsElem.textContent = data.viewsCount;
    }
  } catch (err) {}
}

let editingId = null; // track currently editing project

function openModal(project = null) {
  const modal = document.getElementById("modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.classList.add("overflow-hidden"); // disable page scroll

  const modalTitle = document.getElementById("modalTitle");
  const saveBtn = document.getElementById("saveBtn");

  // Populate fields or reset
  document.getElementById("title").value = project?.title || "";
  document.getElementById("description").value = project?.description || "";
  document.getElementById("category").value = project?.category || "";
  document.getElementById("liveUrl").value = project?.liveUrl || "";
  document.getElementById("codeUrl").value = project?.codeUrl || "";
  document.getElementById("status").value = project?.status || "planning";

  if (project) {
    modalTitle.textContent = "Edit Project";
    saveBtn.textContent = "Update";
    saveBtn.onclick = () => saveProject(project._id); // use generic saveProject
    editingId = project._id;
  } else {
    modalTitle.textContent = "Add Project";
    saveBtn.textContent = "Save";
    saveBtn.onclick = () => saveProject(); // new project
    editingId = null;
  }
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.classList.remove("overflow-hidden"); // restore scroll
}

showDashboardLoading();
loadProjects();
