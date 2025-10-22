// --- DOM Message Handler ---
function showMessage(msg, isError = false) {
  let msgBox = document.getElementById("sessionMsg");
  
  if (!msgBox) {
    msgBox = document.createElement("div");
    msgBox.id = "sessionMsg";
    msgBox.className = "fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-md text-sm font-medium z-50 transition-all duration-300";
    document.body.appendChild(msgBox);
  }

  msgBox.textContent = msg;
  msgBox.className =
    "fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-md text-sm font-medium z-50 " +
    (isError ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800");

  // Auto fade out
  setTimeout(() => {
    msgBox.style.opacity = "0";
    msgBox.style.transition = "opacity 0.5s";
    setTimeout(() => msgBox.remove(), 500);
  }, 2500);
}

const isValidUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};