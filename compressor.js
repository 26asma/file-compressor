const fs = require('fs');
const zlib = require('zlib'); // Module for compression

// File paths
const inputFile = 'input.txt'; // The file to compress
const compressedFile = 'input.txt.gz'; // The compressed output file

// Create read and write streams
const readStream = fs.createReadStream(inputFile); // Read input file
const writeStream = fs.createWriteStream(compressedFile); // Write compressed data

// Create a gzip transform stream
const gzip = zlib.createGzip();

// Pipe the streams
readStream
    .pipe(gzip) // Compress the data
    .pipe(writeStream) // Write compressed data to a file
    .on('finish', () => {
        console.log(`File successfully compressed to ${compressedFile}`);
    });

// Handle errors
readStream.on('error', (err) => console.error('Read Error:', err.message));
writeStream.on('error', (err) => console.error('Write Error:', err.message));
