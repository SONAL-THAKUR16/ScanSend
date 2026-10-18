const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");
const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, "public");
const UPLOADS = path.join(__dirname, "uploads");

fs.mkdirSync(UPLOADS, { recursive: true });

app.use(express.static(PUBLIC));
app.use(express.json());

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS),

  filename: (_req, file, cb) => {
    const id = crypto.randomBytes(16).toString("hex");
    const name = path.basename(file.originalname)
      .replace(/[^\w.\- ()]/g, "_")
      .slice(0, 140);

    cb(null, `${id}__${name}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }
});

function findFile(id) {
  if (!/^[a-f0-9]{32}$/.test(id)) return null;

  const name = fs.readdirSync(UPLOADS)
    .find(file => file.startsWith(id + "__"));

  if (!name) return null;

  const filePath = path.join(UPLOADS, name);

  return {
    id,
    path: filePath,
    name: name.slice(34),
    size: fs.statSync(filePath).size
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/upload", (req, res) => {
  upload.single("file")(req, res, err => {
    if (err) {
      return res.status(400).json({
        error: err.code === "LIMIT_FILE_SIZE"
          ? "Maximum file size is 500 MB."
          : err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "Please select a file."
      });
    }

    const id = req.file.filename.split("__")[0];

    res.json({
      ok: true,
      id,
      name: req.file.filename.slice(34),
      size: req.file.size,
      shareUrl: `/receive.html?id=${id}`,
      downloadUrl: `/api/files/${id}`
    });
  });
});

app.get("/api/files", (_req, res) => {
  const files = fs.readdirSync(UPLOADS)
    .map(name => findFile(name.split("__")[0]))
    .filter(Boolean)
    .reverse()
    .map(file => ({
      id: file.id,
      name: file.name,
      size: file.size
    }));

  res.json({ files });
});

app.get("/api/file-info/:id", (req, res) => {
  const file = findFile(req.params.id);

  if (!file) {
    return res.status(404).json({
      error: "File not found."
    });
  }

  res.json({
    id: file.id,
    name: file.name,
    size: file.size,
    downloadUrl: `/api/files/${file.id}`
  });
});

app.get("/api/files/:id", (req, res) => {
  const file = findFile(req.params.id);

  if (!file) {
    return res.status(404).send("File not found.");
  }

  res.download(file.path, file.name);
});

app.delete("/api/files/:id", (req, res) => {
  const file = findFile(req.params.id);

  if (!file) {
    return res.status(404).json({
      error: "File not found."
    });
  }

  fs.unlinkSync(file.path);
  res.json({ ok: true });
});

function getAddresses() {
  const addresses = [];

  for (const list of Object.values(os.networkInterfaces())) {
    for (const item of list || []) {
      if (item.family === "IPv4" && !item.internal) {
        addresses.push(item.address);
      }
    }
  }

  return addresses;
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`QR File Share: http://localhost:${PORT}`);

  for (const ip of getAddresses()) {
    console.log(`Same Wi-Fi: http://${ip}:${PORT}`);
  }

  console.log("Keep this terminal open during transfers.");
});