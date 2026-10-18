const params = new URLSearchParams(location.search);
const id = params.get("id");

const details = document.getElementById("fileDetails");
const download = document.getElementById("downloadBtn");
const error = document.getElementById("error");

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

async function loadFile() {
  if (!id) {
    details.textContent = "Invalid share link.";
    error.textContent = "Ask the sender to create a new QR code.";
    return;
  }

  try {
    const response = await fetch(
      "/api/file-info/" + encodeURIComponent(id)
    );

    const file = await response.json();

    if (!response.ok) {
      throw new Error(file.error || "File not found.");
    }

    details.replaceChildren();

    const name = document.createElement("strong");
    name.textContent = file.name;

    const size = document.createElement("p");
    size.className = "muted";
    size.textContent = formatBytes(file.size);

    details.append(name, size);

    download.href = file.downloadUrl;
    download.classList.remove("disabled");
  } catch (err) {
    details.textContent = "Could not load this file.";
    error.textContent = err.message;
  }
}

loadFile();