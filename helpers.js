const imageFilter = function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|PDF|pdf|odt|ODT)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Sono concessi tutti i formati di immagini, PDF e documenti.'), false);
    }
    cb(null, true);
};
exports.imageFilter = imageFilter;