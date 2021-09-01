// DOM elements
const fileTable = document.getElementById("table");
const repositoryID = document.getElementById("repoID");
const downloadAll = document.getElementById("download-all");
const lifeTime = document.getElementById("time-left");

// Folder ID
const folderID = (() => {
   let urlSections = window.location.pathname.split("/");
   return urlSections.pop();
})();

// Current Depth Level/Base File Directory
const baseDirectory = ["/"];

// Folder Data is the nested JSON data-strcture that contains all information
// about the files and files in all the nested sub-directories.
let folderData = undefined;

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

// This function takes in the file name and download it from the server to the user.
async function downLoadFile(element, fileName) {
   element.src = "../images/loading.gif";
   let strBaseDirectory = baseDirectory.join("");
   let downloadLink = document.createElement("a");

   downloadLink.setAttribute("href", "/download?path=database/" + folderID + "/files" + strBaseDirectory + fileName);
   downloadLink.click();
   element.src = "../images/download.png";
}

// Map all the file data onto the html page.
function MapFileData() {
   let timeLeft = new Date(Date.parse(folderData.birthTime) + 259200000);
   lifeTime.innerText = "This Repository Will Be Deleted On: " +
      timeLeft.toLocaleDateString() + ", " + timeLeft.toLocaleTimeString() + ", Local Time";

   repositoryID.innerText = "Repository ID: " + folderID;

   let dataRow, filename, download, fileSize = null;
   for (let i = 0; i < folderData.children.length; i++) {
      dataRow = document.createElement("tr");
      filename = document.createElement("td");
      download = document.createElement("td");
      fileSize = document.createElement("td");

      filename.innerText = folderData.children[i].name;
      download.innerHTML = "<img src=\"../images/download.png\">";
      fileSize.innerText = sizeToString(folderData.children[i].size);

      download.addEventListener("click", (e) => {
         downLoadFile(e.target, e.target.parentNode.previousSibling.innerText);
      });

      dataRow.appendChild(filename);
      dataRow.appendChild(download);
      dataRow.appendChild(fileSize);
      fileTable.appendChild(dataRow);
   }
}

// Received a recursive JSON structure representing the information of the file/sub files. 
async function fetchFileInfo() {
   // Create the form data containing the folderID.
   let form = new FormData();
   form.append("folderID", folderID);

   // Fetch to the server and parse the response.
   let response = await fetch("/fileInfo", { method: "POST", body: form });
   response = await response.json();

   folderData = response;
   MapFileData();
}

function initialize() {
   fetchFileInfo();

   // When the user want to download everthing as a zip.
   downloadAll.addEventListener("click", () => {
      let downloadLink = document.createElement("a");
      downloadLink.setAttribute("href", "/download?path=database/" + folderID + "/" + folderID + ".zip");
      downloadLink.click();
   });
}

initialize();
