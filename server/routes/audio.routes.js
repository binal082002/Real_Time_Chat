// Serve audio file from GridFS
const { gfs } = require('../config/db'); 

app.get('/:filename', (req, res) => {
    const filename = req.params.filename;
  
    gfs.files.findOne({ filename }, (err, file) => {
      if (err || !file) {
        return res.status(404).json({ message: "Audio file not found" });
      }
  
      // Set the correct content type based on file metadata
      res.set('Content-Type', file.contentType);
      res.set('Content-Disposition', `inline; filename=${file.filename}`);
  
      // Stream the file content to the client
      const readStream = gfs.createReadStream({ filename: file.filename });
      readStream.pipe(res);
    });
  });
  