import express from 'express';
import ReceiptController from '../controllers/receipt';
import Upload from '../../upload';


// eslint-disable-next-line new-cap
const ReceiptRouter = express.Router();

// ReceiptRouter.post('/getReceiptText', upload.single('image'), ReceiptController.getReceiptText);
// // eslint-disable-next-line max-len
// ReceiptRouter.post('/getReceiptTextWithConfidence', upload.single('image'), ReceiptController.getReceiptTextWithConfidence);
ReceiptRouter.post('/getReceiptSumPrice', ReceiptController.getReceiptSumPrice);

export default ReceiptRouter;