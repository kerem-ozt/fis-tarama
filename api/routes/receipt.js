import express from 'express';
import ReceiptController from '../controllers/receipt';

// eslint-disable-next-line new-cap
const ReceiptRouter = express.Router();

// ReceiptRouter.post('/getReceiptTextWithConfidence', Upload.single('image'), ReceiptController.getReceiptTextWithConfidence);
ReceiptRouter.post('/getReceiptText', ReceiptController.getReceiptText);
ReceiptRouter.post('/getReceiptSumPrice', ReceiptController.getReceiptSumPrice);

export default ReceiptRouter;