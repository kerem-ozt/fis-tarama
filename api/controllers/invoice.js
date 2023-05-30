import InvoiceService from "../services/invoice";

class InvoiceController {
	
    /**
	 * @swagger
	 * @route POST /invoice/getInvoice
	 * @summary endpoint for get invoice
	 * @group Invoice
	 * @consumes multipart/form-data
	 * @param {file} image.formData
	 * @returns {object} 200 - Sum price of receipt
	 * @returns {Error} default - Internal server error
	 *
	 * @typedef Invoice
	 *
	 */

	static async getInvoiceText(req, res) {
		try {
			const text = await InvoiceService.getInvoiceText(req, res);
			res.status(200).json({ type: true, message: 'Success', data: text });
		}
		catch (err) {
			res.status(500).json({ type: false, message: err.message });
		}
	}

	/**
	 * @swagger
	 * @route POST /invoice/getInvoice
	 * @summary endpoint for get invoice
	 * @group Invoice
	 * @consumes multipart/form-data
	 * @param {file} image.formData
	 * @returns {object} 200 - Sum price of receipt
	 * @returns {Error} default - Internal server error
	 *
	 * @typedef Invoice
	 *
	 */

	static async getInvoice(req, res) {
		try {
			const text = await InvoiceService.getInvoice(req, res);
			res.status(200).json({ type: true, message: 'Success', data: text });
		}
		catch (err) {
			res.status(500).json({ type: false, message: err.message });
		}
	}

}

export default InvoiceController;