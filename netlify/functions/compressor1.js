const multer = require('multer');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage }).single('file');

exports.handler = async (event, context) => {
    return new Promise((resolve, reject) => {
        upload(event, context, (err) => {
            if (err) {
                reject({
                    statusCode: 500,
                    body: 'Error during file upload.',
                });
                return;
            }

            const file = event.file;
            if (!file) {
                reject({
                    statusCode: 400,
                    body: 'No file uploaded.',
                });
                return;
            }

            const compressedFilePath = path.join(__dirname, 'uploads', `${file.filename}.gz`);

            // Compress the uploaded file
            const readStream = fs.createReadStream(file.path);
            const writeStream = fs.createWriteStream(compressedFilePath);
            const gzip = zlib.createGzip();

            readStream
                .pipe(gzip)
                .pipe(writeStream)
                .on('finish', () => {
                    // Return the compressed file as a response
                    resolve({
                        statusCode: 200,
                        body: JSON.stringify({
                            message: 'File compressed successfully!',
                            fileUrl: `/uploads/${file.filename}.gz`,
                        }),
                    });

                    // Clean up original file after processing
                    fs.unlinkSync(file.path);
                    fs.unlinkSync(compressedFilePath);
                })
                .on('error', (error) => {
                    reject({
                        statusCode: 500,
                        body: 'Error during compression.',
                    });
                });
        });
    });
};
