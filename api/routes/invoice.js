import express from 'express';
import InvoiceController from '../controllers/invoice';
import multer from 'multer';

const Upload = multer({ dest: 'uploads/' });

// eslint-disable-next-line new-cap
const InvoiceRouter = express.Router();

// ReceiptRouter.post('/getReceiptTextWithConfidence', Upload.single('image'), ReceiptController.getReceiptTextWithConfidence);
InvoiceRouter.post('/getInvoiceText', InvoiceController.getInvoiceText);
// InvoiceRouter.post('/getInvoice', Upload.single('image'),InvoiceController.getInvoice);
InvoiceRouter.post('/getInvoice', InvoiceController.getInvoice);

export default InvoiceRouter;