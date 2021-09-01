// DOM elements
const [uploadBtn, login] = document.getElementById("button-wrap").getElementsByClassName("button");
const uploadPanel = document.getElementById("upload");
const deFocus = document.getElementById("de-focus");
const closeUpload = document.getElementById("close-upload");
const uploadPool = document.getElementById("upload-pool");
const fileInput = document.getElementById("file-input");
const uploadingMessage = uploadPool.getElementsByTagName("span")[0];
const uploadList = document.getElementById("upload-list");
const fileUpload = document.getElementById("file-upload");
const uploadBtnPanel = document.getElementById("upload-buttons");
const resultPanel = document.getElementById("upload-result");
const urlLink = resultPanel.getElementsByTagName("a")[0];
const [copyLink, newRepository] = resultPanel.getElementsByClassName("button");

// Files
const importedFiles = [];

function closeUploadPanel() {
   setTimeout(() => {
      uploadPanel.style.top = "0vh";
      uploadPanel.style.opacity = "0";
      deFocus.style.opacity = "0";
   }, 0);

   setTimeout(() => {
      uploadPanel.style.display = "none";
      deFocus.style.display = "none";
   }, 500);
}

function deleteFile(element) {
   let currentElement = element;
   let index = 0;
   while (currentElement.previousSibling != null) {
      currentElement = currentElement.previousSibling;
      index++;
   }

   importedFiles.splice(index, 1);
   element.remove();
   if (importedFiles.length == 0) {
      uploadingMessage.style.display = "block";
   }
}

// Convert a integer representing the size in bytes to a string representation of size with
// the appropriate unit.
function sizeToString(size) {
   if (size < 1000) {
      return size + "B";
   }
   if (size < 1000000) {
      size = Math.round(size / 10.0);
      return size / 100.0 + "KB";
   }
   size = Math.round(size / 10000.0);
   return size / 100.0 + "MB";
}

// Construct a HTML element that contains the file information and a deletion button,
// then appends this DOM elements to the uploadList element.
function appendFileIcon(fileName, fileSize) {
   let icon = document.createElement("div");
   let fileInfo = document.createElement("span");
   let deleteBtn = document.createElement("span");
   fileInfo.innerText = fileName + " (" + sizeToString(fileSize) + ")";
   deleteBtn.innerText = "✖";
   deleteBtn.classList.add("delete-icon");
   icon.classList.add("file-icon");
   deleteBtn.addEventListener("click", (event) => {
      deleteFile(event.target.parentNode);
   });

   icon.appendChild(fileInfo);
   icon.appendChild(deleteBtn);
   uploadList.appendChild(icon);
}

// postFilesToServer sends a request to the server and receives the URL for the file repository.
async function postFilesToServer(form) {
   // send the request to the server, which will be parsed by multer.
   let response = await fetch("/upload", { method: "POST", body: form });
   response = await response.json();

   // Initialize the result panel.
   uploadBtnPanel.style.display = "none";
   uploadPool.style.display = "none";
   resultPanel.style.display = "block";
   urlLink.innerText = window.location.origin + response.fileURL;
   urlLink.setAttribute("href", urlLink.innerText);
   urlLink.setAttribute("target", "_blank");

   copyLink.addEventListener("click", () => {
      navigator.clipboard.writeText(urlLink.innerText);
      copyLink.style.backgroundColor = "#90ee90";
      setTimeout(() => {
         copyLink.style.backgroundColor = "white";
      }, 200);
   });

   newRepository.addEventListener("click", () => {
      uploadBtnPanel.style.display = "flex";
      uploadPool.style.display = "block";
      resultPanel.style.display = "none";
   });

   // Clears all the Files stored in the front-end.
   importedFiles.length = 0;
   let DOMFileDeleteIcons = document.getElementsByClassName("delete-icon");
   for (let i = DOMFileDeleteIcons.length - 1; i >= 0; i--) {
      DOMFileDeleteIcons[i].click();
   }
}

function initialize() {
   uploadBtn.addEventListener("click", () => {
      if (uploadPanel.style.display != "block") {
         uploadPanel.style.display = "block";
         deFocus.style.display = "block";
         setTimeout(() => {
            uploadPanel.style.top = "10vh";
            uploadPanel.style.opacity = "1";
            deFocus.style.opacity = "0.5";
         }, 0);
      } else {
         closeUploadPanel();
      }
   });

   closeUpload.addEventListener("click", closeUploadPanel);
   deFocus.addEventListener("click", closeUploadPanel);

   fileInput.addEventListener("change", () => {
      if (fileInput.files.length > 0) {
         uploadingMessage.style.display = "none";
         // Append each file to the JS File Object array and the DOM flex list.
         for (let i = 0; i < fileInput.files.length; i++) {
            appendFileIcon(fileInput.files[i].name, fileInput.files[i].size);
            importedFiles.push(fileInput.files[i]);
         }
      }
      // Clears the files stored in the HTML file input element.
      fileInput.value = "";
   });

   // POST request to the server: sending all uploaded files.
   fileUpload.addEventListener("click", () => {
      // Construct a form data and append all files and key information.
      let form = new FormData();
      form.append("user", "Guest");
      form.append("time", Date.now());
      for (let i = 0; i < importedFiles.length; i++) {
         form.append("files", importedFiles[i]);
         // form.append("fileNames", importedFiles[i].name);
      }
      postFilesToServer(form);
   });

   login.addEventListener("click", () => {
      alert("Under Production... Coming Soon...");
   });
}

initialize();
