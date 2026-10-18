const $ = id => document.getElementById(id);

let authMode = "login";
let selectedFile = null;

// Theme
document.documentElement.dataset.theme =
  localStorage.getItem("qfs-theme") || "dark";

function updateTheme() {
  $("themeBtn").textContent =
    document.documentElement.dataset.theme === "dark"
      ? "☀️ Light mode" : "🌙 Dark mode";
}

updateTheme();

$("themeBtn").onclick = () => {
  const next =
    document.documentElement.dataset.theme === "dark"
      ? "light" : "dark";

  document.documentElement.dataset.theme = next;
  localStorage.setItem("qfs-theme", next);
  updateTheme();
};

// DEMO ONLY: browser-stored accounts are not secure.
// Use server-side authentication before production deployment.
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem("qfs-users") || "[]");
  } catch {
    return [];
  }
}

function setAuthMode(mode) {
  authMode = mode;
  const signup = mode === "signup";

  $("nameBox").classList.toggle("hidden", !signup);
  $("name").required = signup;
  $("loginTab").classList.toggle("active", !signup);
  $("signupTab").classList.toggle("active", signup);

  $("authTitle").textContent =
    signup ? "Create your account" : "Welcome back";

  $("authDesc").textContent =
    signup ? "Join QR File Share." : "Log in to continue.";

  $("authSubmit").textContent =
    signup ? "Create account" : "Login";

  $("authMessage").textContent = "";
}

$("loginTab").onclick = () => setAuthMode("login");
$("signupTab").onclick = () => setAuthMode("signup");

function showDashboard(user) {
  $("auth").classList.add("hidden");
  $("dashboard").classList.remove("hidden");
  $("welcomeText").textContent =
    "Signed in as " + (user.name || user.email);
  refreshFiles();
}

function showAuth() {
  $("dashboard").classList.add("hidden");
  $("auth").classList.remove("hidden");
}

$("authForm").onsubmit = event => {
  event.preventDefault();

  const name = $("name").value.trim();
  const email = $("email").value.trim().toLowerCase();
  const password = $("password").value;
  const message = $("authMessage");
  const users = getUsers();

  if (password.length < 6) {
    message.textContent = "Use at least 6 characters.";
    return;
  }

  if (authMode === "signup") {
    if (users.some(user => user.email === email)) {
      message.textContent = "Account exists. Please log in.";
      return;
    }

    users.push({ name, email, password });
    localStorage.setItem("qfs-users", JSON.stringify(users));
  } else {
    const found = users.find(
      user => user.email === email && user.password === password
    );

    if (!found) {
      message.textContent = "Incorrect login details.";
      return;
    }
  }

  localStorage.setItem("qfs-session", email);
  $("password").value = "";

  const user = getUsers().find(user => user.email === email);
  showDashboard(user);
};

$("logout").onclick = () => {
  localStorage.removeItem("qfs-session");
  $("authForm").reset();
  setAuthMode("login");
  showAuth();
};

// Restore the demo login on reload
const sessionEmail = localStorage.getItem("qfs-session");
if (sessionEmail) {
  const user = getUsers().find(user => user.email === sessionEmail);
  if (user) showDashboard(user);
  else localStorage.removeItem("qfs-session");
}

// Send / receive tabs
function showView(view) {
  const sending = view === "send";
  $("sendView").classList.toggle("hidden", !sending);
  $("receiveView").classList.toggle("hidden", sending);
  $("sendTab").classList.toggle("active", sending);
  $("receiveTab").classList.toggle("active", !sending);
}

$("sendTab").onclick = () => showView("send");
$("receiveTab").onclick = () => showView("receive");

// Select file
$("fileInput").onchange = () => {
  selectedFile = $("fileInput").files[0] || null;

  $("fileName").textContent = selectedFile
    ? `${selectedFile.name} (${formatBytes(selectedFile.size)})`
    : "";
};

// Upload actual file to Node server
$("uploadBtn").onclick = () => {
  if (!selectedFile) {
    alert("Please choose a file first.");
    return;
  }

  if (selectedFile.size > 500 * 1024 * 1024) {
    alert("Maximum file size is 500 MB.");
    return;
  }

  $("uploadBtn").disabled = true;
  $("uploadBtn").textContent = "Uploading…";
  $("progressWrap").classList.remove("hidden");
  $("sendResult").classList.add("hidden");

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/upload");

  xhr.upload.onprogress = event => {
    if (!event.lengthComputable) return;

    const percent = Math.round(event.loaded / event.total * 100);

    $("progressPct").textContent = percent + "%";
    $("progressBar").style.width = percent + "%";
    $("progressText").textContent =
      percent === 100 ? "Preparing link…" : "Uploading file…";
  };

  xhr.onload = () => {
    $("uploadBtn").disabled = false;
    $("uploadBtn").textContent = "Upload and create QR →";

    let result;
    try {
      result = JSON.parse(xhr.responseText);
    } catch {
      alert("Unexpected server response.");
      return;
    }

    if (xhr.status < 200 || xhr.status >= 300) {
      alert(result.error || "Upload failed.");
      return;
    }

    const url = new URL(result.shareUrl, location.href).href;

    $("shareUrl").textContent = url;
    $("sendResult").classList.remove("hidden");
    $("progressPct").textContent = "100%";
    $("progressBar").style.width = "100%";
    $("progressText").textContent = "Upload complete";

    $("qr").replaceChildren();

    if (typeof QRCode === "undefined") {
      $("qr").textContent =
        "QR library unavailable. Copy the share link instead.";
    } else {
      new QRCode($("qr"), {
        text: url,
        width: 220,
        height: 220,
        colorDark: "#101114",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
    }

    refreshFiles();
  };

  xhr.onerror = () => {
    $("uploadBtn").disabled = false;
    $("uploadBtn").textContent = "Upload and create QR →";
    alert("Network error. Check that the server is running.");
  };

  const data = new FormData();
  data.append("file", selectedFile);
  xhr.send(data);
};

// Copy share link
$("copyLink").onclick = async () => {
  const url = $("shareUrl").textContent;

  try {
    await navigator.clipboard.writeText(url);
    $("copyLink").textContent = "Copied!";
  } catch {
    prompt("Copy this share link:", url);
  }
};

// Open a pasted share link
$("openLinkBtn").onclick = () => {
  const raw = $("receiveLink").value.trim();

  if (!raw) {
    alert("Paste a share link first.");
    return;
  }

  try {
    const url = new URL(raw, location.href);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error();
    }

    location.href = url.href;
  } catch {
    alert("Enter a valid HTTP or HTTPS share link.");
  }
};

$("receiveLink").onkeydown = event => {
  if (event.key === "Enter") $("openLinkBtn").click();
};

// Recent files
async function refreshFiles() {
  const list = $("fileList");
  list.textContent = "Loading files…";

  try {
    const response = await fetch("/api/files");
    if (!response.ok) throw new Error();

    const data = await response.json();
    list.replaceChildren();

    if (!data.files.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "No files uploaded yet.";
      list.appendChild(empty);
      return;
    }

    data.files.forEach(file => {
      const row = document.createElement("div");
      row.className = "fileRow";

      const info = document.createElement("div");
      const name = document.createElement("strong");
      const size = document.createElement("small");

      name.textContent = file.name;
      size.textContent = formatBytes(file.size);
      info.append(name, size);

      const link = document.createElement("a");
      link.className = "outline";
      link.href = "/api/files/" + encodeURIComponent(file.id);
      link.textContent = "Download";

      row.append(info, link);
      list.appendChild(row);
    });
  } catch {
    list.textContent = "Could not load files. Is the server running?";
  }
}

$("refreshFiles").onclick = refreshFiles;

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";

  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;

  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }

  return value.toFixed(1) + " " + units[i];
}