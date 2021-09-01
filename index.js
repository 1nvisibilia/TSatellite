const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const multer = require("multer");
const dirTree = require("directory-tree");
const zipper = require("zip-local");
const server = express();

const oneHourInMs = 3600000;
const threeDaysInMs = 259200000;
const PORT = process.env.PORT || 9000;
// The server clears all files that are older than 3 days.
const purgeFiles = setInterval(() => {
   // Reads the database.
   fs.readdir("database", (err, subFolders) => {
      if (err) {
         console.log(err);
         return;
      }
      let currentTime = new Date();
      // Measure the life time of each file and remove the ones that are
      // older than 3 days.
      for (let i = 0; i < subFolders.length; i++) {
         let stats = fs.statSync("database/" + subFolders[i]);
         if (stats.isFile()) {
            continue;
         }
         // If older than 3 days.
         if (currentTime - stats.birthtime > threeDaysInMs) {
            // Remove the folder and all of its sub folders and files.
            fs.rmdir("database/" + subFolders[i], { recursive: true }, (err) => {
               if (err) {
                  throw err;
               }
            });
         }
      }
   });
}, oneHourInMs);

// Making the front-end folder static.
server.use(express.static("front-end"));

// Send the repository page if the folderID is valid.
server.get("/repository/:folderID", (req, res) => {
   let targetDirectory = "./database/" + req.params.folderID;
   if (fs.existsSync(targetDirectory)) {
      res.sendFile(__dirname + "/front-end/repository/index.html");
   } else {
      res.status(404);
      res.send("Resource (" + req.params.folderID + ") Not Found");
   }
});

// Configuring the file storage path and file names.
const fileStorageEngine = multer.diskStorage({
   destination: (req, file, callback) => {
      callback(null, "database/" + req.uploadDestination + "/files/");
   },
   filename: (req, file, callback) => {
      callback(null, file.originalname);
   }
});

// Create the multer middleware.
const upload = multer({ storage: fileStorageEngine });

// A middle Ware function for generating a unique ID and creates a
// folder with the ID being the name.
async function importUploadedFiles(req, res, next) {
   let randomID = crypto.randomBytes(8).toString("hex");

   // Create the directories and passes the id for multer to save the files.
   fs.mkdirSync("./database/" + randomID);
   fs.mkdirSync("./database/" + randomID + "/files");
   req.uploadDestination = randomID;
   next();
}

// Zip the folder "folderPath".
function zipFolder(folderPath, folderID) {
   // zipping a file
   zipper.zip(folderPath, (error, zipped) => {
      if (!error) {
         // compress before exporting
         zipped.compress();
         // save the zipped file to disk
         zipped.save("database/" + folderID + "/" + folderID + ".zip", (error) => {
            if (!error) {
               return "database/" + folderID + "/" + folderID + ".zip";
            }
            console.log(error);
         });
      }
   });
}

// When the user upload files from the homepage.
server.post("/upload", [importUploadedFiles, upload.array("files")], (req, res) => {
   // Create the zipped version of all files.
   zipFolder("database/" + req.uploadDestination + "/files", req.uploadDestination);

   // Create a data JSON file and saves it in the directory.
   let jsonData = JSON.stringify({
      user: req.body.user,
      uploadTime: req.body.time
   });

   // Write the data JSON file to the save directory as all the files were saved.
   fs.writeFile("./database/" + req.uploadDestination + "/info.JSON", jsonData, function (err) {
      if (err) {
         console.log(err);
      }
      res.json({
         fileURL: "/repository/" + req.uploadDestination
      });
   });
});

// When the user request all file information from the specific file page.
// directory-tree will send back a json file with all the data.
server.post("/fileInfo", upload.none(), (req, res) => {
   let fileTree = dirTree("./database/" + req.body.folderID + "/files");
   if (fileTree) {
      // If the directory exist
      fileTree.birthTime = fs.statSync("database/" + req.body.folderID).birthtime;
      res.json(fileTree);
   } else {
      // If the directory does not exist
      res.status(404);
      res.send("Error: the resource" + req.body.folderID + " does not exist");
   }
});

// Download a specific file within user's directory/sub-directory.
// The path of the file intended for download is stored in the query string.
server.get("/download", (req, res) => {
   res.download(req.query.path, (err) => {
      if (err) {
         console.log(err);
      }
   });
});

// Create a 404 page when the user attempt to access non-existing resources.
server.all("*", (req, res) => {
   res.status(404);
   res.send("Error 404: Resource Not Found");
});

// Server listens on port 9000.
server.listen(PORT, () => {
   console.log("http://localhost:" + PORT);
});
