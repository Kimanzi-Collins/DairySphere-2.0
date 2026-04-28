const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || 'uploads/farmers';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // farmer_F0001_1720000000000.jpg
        const farmerId  = req.params.id || 'unknown';
        const timestamp = Date.now();
        const ext       = path.extname(file.originalname).toLowerCase();
        cb(null, `farmer_${farmerId}_${timestamp}${ext}`);
    }
});

// File filter — images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extValid  = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimeValid = allowedTypes.test(file.mimetype);

    if (extValid && mimeValid) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpg, png, webp) are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024
    }
});

module.exports = upload;