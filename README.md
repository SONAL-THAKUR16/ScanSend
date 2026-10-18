
# 📲 ScanSend — QR File Sharing
A simple and user-friendly web application for sharing files using **QR codes and shareable links**. ScanSend aims to make file sharing convenient with a clean interface, user authentication, and upload progress tracking.

## ✨ Features

- 📤 **File Upload:** Upload files for sharing.
- 📱 **QR Code Generation:** Generate QR codes for shared files.
- 🔗 **Shareable Links:** Share files using generated URLs.
- 📥 **File Receiving:** Access shared files through their links.
- 🔐 **User Authentication:** Login and sign-up interface.
- 📂 **Recent Files:** View recently shared files.
- 🌙 **Dark & Light Mode:** Switch between visual themes.
- 📋 **Copy Link:** Copy sharing links with ease.
- 📊 **Upload Progress:** Track the progress of file uploads.
- 📱 **Responsive Design:** User interface designed for different screen sizes.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Web page structure |
| CSS3 | Styling and responsive design |
| JavaScript | Frontend functionality |
| Node.js | Server-side runtime |
| Express.js | Backend framework |
| QRCode.js | QR code generation |
| Git & GitHub | Version control and collaboration |
| Render | Application deployment |

## 📁 Project Structure

```text
ScanSend/
├── public/
│   ├── index.html       # Main application page
│   ├── style.css        # Styling and themes
│   ├── app.js           # Frontend application logic
│   ├── receive.html     # File receiving page
│   └── receive.js       # Receiving page logic
├── uploads/             # Uploaded files (ignored by Git)
├── server.js            # Express server
├── package.json         # Project configuration
├── package-lock.json    # Dependency lock file
├── .gitignore           # Ignored files and folders
└── README.md            # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/SONAL-THAKUR16/ScanSend.git
```
### 2. Navigate to the Project Directory

```bash
cd ScanSend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Application

```bash
npm start
```
### 5. Open in Your Browser
Visit:

```text
https://scansend.onrender.com
```

Make sure the port matches the configuration in your server.

## ⚙️ How It Works
1. Create an account or log in.
2. Navigate to the file-sharing section.
3. Select and upload a file.
4. Generate a QR code and shareable link.
5. Share the link or scan the QR code on another device.
6. Open the link to access the shared file.

## 🌐 Live Demo
**Live Website:** https://scansend.onrender.com

## 🔒 Security & Privacy
- Never commit passwords, API keys, or `.env` files to GitHub.
- Validate uploaded files and restrict unsafe file types.
- Apply appropriate authentication and file-access controls.
- Configure upload size limits and secure file storage.
- Avoid storing sensitive or confidential files on an untrusted deployment.

## 🎯 Project Objective
ScanSend aims to simplify file sharing by combining QR codes, shareable links, and a responsive web interface in one convenient application.

## 👨‍💻 Author
**Sonal Thakur**
