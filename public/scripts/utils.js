// ============================================
// Configuration
// ============================================
const REFRESH_INTERVAL = 10000; // 10 seconds instead of 3

// --- Utility ---
function sanitize(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}


// ============================================
// Utility Functions
// ============================================
const safeSetHTML = (id, html) => {
  const el = document.getElementById(id);
  if (!el) return console.warn(`Missing element: ${id}`);
  el.innerHTML = html;
};

const safeSetText = (id, text) => {
  const el = document.getElementById(id);
  if (!el) return console.warn(`Missing element: ${id}`);
  el.textContent = text;
};

const safeSetClass = (id, className) => {
  const el = document.getElementById(id);
  if (!el) return console.warn(`Missing element: ${id}`);
  el.className = className;
};

// ============================================
// Status and Color Utilities
// ============================================
function getStatusColor(status) {
  const colors = {
    completed: "bg-teal-100 text-teal-800 ring-1 ring-teal-200",
    "in-progress": "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
    planning: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200",
    "on-hold": "bg-orange-100 text-orange-800 ring-1 ring-orange-200",
    cancelled: "bg-red-100 text-red-800 ring-1 ring-red-200",
  };
  return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
}

function getKpiColorClasses(key) {
  const colors = {
    total: { iconBg: "bg-teal-600", text: "text-teal-700" },
    "in-progress": { iconBg: "bg-blue-600", text: "text-blue-700" },
    completed: { iconBg: "bg-green-600", text: "text-green-700" },
    likes: { iconBg: "bg-red-600", text: "text-red-700" },
    planning: { iconBg: "bg-yellow-600", text: "text-yellow-700" },
    "hold-cancel": { iconBg: "bg-gray-600", text: "text-gray-700" },
  };
  return colors[key] || { iconBg: "bg-gray-600", text: "text-gray-700" };
}

// ============================================
// Data Processing
// ============================================
function calculateStats(projects) {
  return projects.reduce(
    (acc, p) => {
      acc.total++;
      acc.totalLikes += p.likes || p.likesCount || 0;
      acc.totalViews += p.viewsCount || 0;

      switch (p.status) {
        case "in-progress":
          acc.inProgress++;
          break;
        case "completed":
          acc.completed++;
          break;
        case "planning":
          acc.planning++;
          break;
        case "on-hold":
        case "cancelled":
          acc.onHoldCancelled++;
          break;
      }
      return acc;
    },
    {
      total: 0,
      inProgress: 0,
      completed: 0,
      planning: 0,
      onHoldCancelled: 0,
      totalLikes: 0,
      totalViews: 0,
    }
  );
}

// ============================================
// Dashboard Rendering Functions
// ============================================
function renderKPICards(stats) {
  const kpis = [
    {
      name: "Total Projects",
      value: stats.total,
      colorKey: "total",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10m0-10l-4-2m4 2l4-2m0 0l-4 2m0-2v10M12 21l8-4-8-4-8 4 8 4zM12 3l8 4-8 4-8-4 8-4z"/></svg>`,
    },
    {
      name: "In Progress",
      value: stats.inProgress,
      colorKey: "in-progress",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    },
    {
      name: "Completed",
      value: stats.completed,
      colorKey: "completed",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    },
    {
      name: "Total Likes",
      value: stats.totalLikes,
      colorKey: "likes",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`,
    },
  ];

  const html = kpis
    .map((kpi) => {
      const { iconBg, text } = getKpiColorClasses(kpi.colorKey);
      return `
      <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center justify-between transition duration-300 hover:scale-[1.02]">
        <div>
          <p class="text-sm text-gray-500 font-medium">${kpi.name}</p>
          <p class="text-3xl font-bold mt-1 ${text}">${kpi.value}</p>
        </div>
        <div class="p-3 rounded-full ${iconBg} bg-opacity-10 ${text}">
          ${kpi.icon}
        </div>
      </div>
    `;
    })
    .join("");

  safeSetHTML("dashboard-kpis", html);
}

function renderStatusDistribution(stats) {
  const total = stats.total || 1;

  const distribution = [
    { status: "Completed", count: stats.completed, color: "bg-teal-600" },
    { status: "In Progress", count: stats.inProgress, color: "bg-blue-600" },
    { status: "Planning", count: stats.planning, color: "bg-yellow-600" },
    { status: "On Hold/Cancelled", count: stats.onHoldCancelled, color: "bg-red-600" },
  ].filter((item) => item.count > 0);

  if (distribution.length === 0) {
    return '<p class="text-gray-500 p-4">No projects yet to display distribution.</p>';
  }

  const segments = distribution
    .map((item) => {
      const width = ((item.count / total) * 100).toFixed(2);
      return `<div title="${item.status}: ${width}%" class="h-full ${item.color} transition-all duration-700" style="width:${width}%;"></div>`;
    })
    .join("");

  const legend = distribution
    .map(
      (item) => `
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 ${item.color} rounded-full"></span>
      <span class="text-sm text-gray-700">${item.status} (${item.count})</span>
    </div>
  `
    )
    .join("");

  return `
    <div class="p-6 bg-white rounded-xl shadow-lg border border-gray-100 h-full">
      <h3 class="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
        Status Distribution (${total} Total)
      </h3>
      <div class="h-6 w-full flex rounded-lg overflow-hidden mb-4 border border-gray-300">
        ${segments}
      </div>
      <div class="flex flex-wrap gap-x-6 gap-y-3">
        ${legend}
      </div>
    </div>
  `;
}

function renderRecentProjects(projects) {
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const html = recentProjects
    .map((p) => {
      const displayStatus = (p.status || "")
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      const statusColor = getStatusColor(p.status);

      return `
      <div class="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
        <div class="flex items-center gap-4">
          <span class="text-gray-900 font-medium truncate max-w-[150px]">${p.title || p.name}</span>
          <div class="inline-block px-2 py-0.5 text-xs font-bold rounded-full ${statusColor}">${displayStatus}</div>
        </div>
        <span class="text-sm text-gray-500">${new Date(p.createdAt).toLocaleDateString()}</span>
      </div>
    `;
    })
    .join("") || '<p class="text-gray-500 p-4">No recent projects found.</p>';

  safeSetHTML("recent-projects-list", html);
}

// ============================================
// Main Dashboard Update Function
// ============================================
async function refreshDashboard() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`API returned ${res.status}`);

    const json = await res.json();
    const projects = json.data || [];

    // Calculate statistics
    const stats = calculateStats(projects);

    // Update all dashboard sections
    renderKPICards(stats);
    safeSetHTML("status-distribution", renderStatusDistribution(stats));
    renderRecentProjects(projects);

    // Clear any error messages
    clearErrorMessage();
  } catch (err) {
    console.error("Error updating dashboard:", err);
    showErrorMessage("Failed to load dashboard data. Retrying...");
  }
}

// ============================================
// Error Handling
// ============================================
function showErrorMessage(message) {
  const errorDiv = document.getElementById("error-message");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.remove("hidden");
  }
}

function clearErrorMessage() {
  const errorDiv = document.getElementById("error-message");
  if (errorDiv) {
    errorDiv.classList.add("hidden");
  }
}

// ============================================
// View Switching Logic
// ============================================
function showView(viewId) {
  const views = ["dashboard", "projects", "settings"];
  const navItems = {
    dashboard: document.getElementById("nav-dashboard"),
    projects: document.getElementById("nav-projects"),
    settings: document.getElementById("nav-settings"),
  };
  const headerTitleElement = document.querySelector("#mainHeader h1");
  const addProjectBtn = document.getElementById("add-project-btn");

  // Hide all views & reset nav styles
  views.forEach((id) => {
    const viewElement = document.getElementById(id + "-view");
    if (viewElement) viewElement.classList.add("hidden");

    const navElement = navItems[id];
    if (navElement) {
      navElement.classList.remove(
        "bg-teal-100",
        "text-teal-600",
        "font-bold",
        "border-l-4",
        "border-teal-600"
      );
      navElement.classList.add("hover:bg-teal-50", "hover:text-teal-700");
    }
  });

  // Show selected view
  const activeView = document.getElementById(viewId + "-view");
  if (activeView) {
    activeView.classList.remove("hidden");
    activeView.classList.add("block");
  }

  // Activate nav tab
  const activeNav = navItems[viewId];
  if (activeNav) {
    activeNav.classList.remove("hover:bg-teal-50", "hover:text-teal-700");
    activeNav.classList.add(
      "bg-teal-100",
      "text-teal-600",
      "font-bold",
      "border-l-4",
      "border-teal-600"
    );
  }

  // Update header title
  if (headerTitleElement) {
    const displayTitle =
      viewId.charAt(0).toUpperCase() +
      viewId.slice(1) +
      (viewId === "dashboard" ? " Summary" : "");
    headerTitleElement.textContent = displayTitle;
  }

  // Show "Add Project" button only in Projects view
  if (addProjectBtn) {
    addProjectBtn.classList.toggle("hidden", viewId !== "projects");
  }

  // Render content when switching views
  if (viewId === "dashboard") {
    refreshDashboard();
  }
}

// ============================================
// Sidebar Control
// ============================================
function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const mainHeader = document.getElementById("mainHeader");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const collapseBtn = document.getElementById("collapseBtn");

  function toggleMobileMenu() {
    sidebar.classList.toggle("-translate-x-full");
  }

  function toggleDesktopCollapse() {
    const isCollapsed = sidebar.classList.toggle("w-64");
    sidebar.classList.toggle("w-20");

    mainContent.classList.toggle("md:ml-64");
    mainContent.classList.toggle("md:ml-20");

    mainHeader.classList.toggle("md:left-64");
    mainHeader.classList.toggle("md:w-[calc(100%-16rem)]");
    mainHeader.classList.toggle("md:left-20");
    mainHeader.classList.toggle("md:w-[calc(100%-5rem)]");

    sidebar.querySelectorAll(".nav-item span, button:not(#collapseBtn)").forEach((el) => {
      el.classList.toggle("hidden");
    });

    sidebar.querySelector("div.font-bold span").classList.toggle("hidden");

    collapseBtn
      .querySelector("svg path")
      .setAttribute(
        "d",
        isCollapsed ? "M4 6h16M4 12h8m-8 6h16" : "M13 5l7 7-7 7M5 12h14"
      );
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleMobileMenu);
  }
  if (collapseBtn) {
    collapseBtn.addEventListener("click", toggleDesktopCollapse);
  }

  if (window.innerWidth >= 768) {
    sidebar.classList.remove("-translate-x-full");
  }
}

// ============================================
// Auto-refresh with Visibility API
// ============================================
let refreshInterval;

function startAutoRefresh() {
  refreshInterval = setInterval(refreshDashboard, REFRESH_INTERVAL);
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
}

// Only refresh when tab is visible
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopAutoRefresh();
  } else {
    refreshDashboard();
    startAutoRefresh();
  }
});

// ============================================
// Initialization
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  initSidebar();
  showView("dashboard");
  refreshDashboard();
  startAutoRefresh();
});

// Export functions for use in HTML
window.showView = showView;