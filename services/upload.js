const fs = require('fs');
const path = require('path');

const UploadService = {
  uploadProfilePhoto: (temporaryPath, userId, callback) => {
    fs.readFile(temporaryPath, (err, data) => {
      fs.writeFile(
        path.join(__dirname, `../public/images/profile/${userId}.jpg`),
        data
      );

      callback();
    });
  }
};

module.exports = UploadService;
