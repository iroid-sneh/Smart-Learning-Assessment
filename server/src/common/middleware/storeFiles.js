import multer from "multer";
import fs from "fs";
import path from "path";
/**
 * @description : file upload middleware for request.
 * @param {obj} req : request of route.
 * @param {obj} res : response of route.
 * @param {callback} next : executes the next middleware succeeding the current middleware.
 * @param {string} destination : destination.
 * @param {string} filename : filedname.
 */
const storeFiles = (destination, filename, single = "single") => async (req, res, next) => {
    const multerStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            fs.mkdirSync(destination, { recursive: true });
            cb(null, destination);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
    });

    const upload = single === "single"
        ? multer({ storage: multerStorage }).single(filename)
        : single === "fields"
            ? multer({ storage: multerStorage }).fields(filename) // Note: filename expected as array of objects in fields mode
            : multer({ storage: multerStorage }).array(filename);

    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
        next();
    });
};

export default storeFiles;
