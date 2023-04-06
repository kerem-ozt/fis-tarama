import express from 'express';
import ReceiptController from '../controllers/receipt';
import multer from 'multer';

// eslint-disable-next-line new-cap
const ReceiptRouter = express.Router();

const upload = multer({ dest: 'uploads/',
	fileFilter: function (req, file, cb) {
		if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg') {
			return cb(new Error('Only png, jpg and jpeg images are allowed!'));
		}
		cb(null, true);
	}
});
ReceiptRouter.post('/getReceiptText', upload.single('image'), ReceiptController.getReceiptText);
// eslint-disable-next-line max-len
ReceiptRouter.post('/getReceiptTextWithConfidence', upload.single('image'), ReceiptController.getReceiptTextWithConfidence);
ReceiptRouter.post('/getReceiptSumPrice', upload.single('image'), ReceiptController.getReceiptSumPrice);

export default ReceiptRouter;