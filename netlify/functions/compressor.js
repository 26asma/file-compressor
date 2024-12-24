const express = require('express');
const multer = require('multer');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; 

// Serve static files (for HTML form)
app.use(express.static('public'));

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Handle file upload and compression
app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    const compressedFilePath = `${file.path}.gz`;

    // Compress the file
    const readStream = fs.createReadStream(file.path);
    const writeStream = fs.createWriteStream(compressedFilePath);
    const gzip = zlib.createGzip();

    readStream
        .pipe(gzip)
        .pipe(writeStream)
        .on('finish', () => {
            // Send the compressed file back to the user
            res.download(compressedFilePath, `${file.originalname}.gz`, (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                }

                // Clean up temporary files
                fs.unlinkSync(file.path); // Original file
                fs.unlinkSync(compressedFilePath); // Compressed file
            });
        })
        .on('error', (err) => {
            console.error('Error during compression:', err);
            res.status(500).send('Error during file compression.');
        });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
