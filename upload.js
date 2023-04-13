import multer from 'multer';
import path from 'path'
import fs from 'fs'

const APP_ROOT = path.join(__dirname, './api/uploads');

const fileFilter = (req, file, cb) => {
  if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype == 'image/jpg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(APP_ROOT)) {
      fs.mkdirSync(APP_ROOT, { recursive: true })
    }
    cb(null, `${APP_ROOT}`);
  },
  filename: async (req, file, cb) => {
    const name = (new Date() / 1000).toFixed(0).toString();
    const extension = path.extname(file.originalname).replace('.', '').toLowerCase();
    file.name = `${name}.${extension}`;
    cb(null, `${name}.${extension}`);
  }
});

const uploadFile = multer({ storage, fileFilter, limits: 1024 });
module.exports = uploadFile;