import ReceiptService from '../services/receipt';

class ReceiptController {
	
	/**
	 * @swagger
	 * @route POST /receipt/getReceiptText
	 * @summary endpoint for get receipt words with confidence
	 * @group Receipt
	 * @consumes multipart/form-data
	 * @param {file} image.formData
	 * @returns {object} 200 - Sum price of receipt
	 * @returns {Error} default - Internal server error
	 *
	 * @typedef Receipt
	 *
	 */

	static async getReceiptText(req, res) {
		try {
			const text = await ReceiptService.getReceiptText(req, res);
			res.status(200).json({ type: true, message: 'Success', data: text });
		}
		catch (err) {
			res.status(500).json({ type: false, message: err.message });
		}
	}

	/**
	 * @swagger
	 * @route POST /receipt/getReceiptTextWithConfidence
	 * @summary endpoint for get receipt words with confidence
	 * @group Receipt
	 * @consumes multipart/form-data
	 * @param {file} image.formData
	 * @returns {object} 200 - Sum price of receipt
	 * @returns {Error} default - Internal server error
	 *
	 * @typedef Receipt
	 *
	 */

	static async getReceiptTextWithConfidence(req, res) {
		try {
			const text = await ReceiptService.getReceiptTextWithConfidence(req, res);
			res.status(200).json({ type: true, message: 'Success', data: text });
		}
		catch (err) {
			res.status(500).json({ type: false, message: err.message });
		}
	}

	/**
	 * @swagger
	 * @route POST /receipt/getReceiptSumPrice
	 * @summary endpoint for get receipt sum price
	 * @group Receipt
	 * @consumes multipart/form-data
	 * @param {file} image.formData
	 * @returns {object} 200 - Sum price of receipt
	 * @returns {Error} default - Internal server error
	 *
	 * @typedef Receipt
	 *
	 */

	static async getReceiptSumPrice(req, res) {
		try {
			const text = await ReceiptService.getReceiptSumPrice(req, res);
			res.status(200).json({ type: true, message: 'Success', data: text });
		}
		catch (err) {
			res.status(500).json({ type: false, message: err.message });
		}
	}

}

export default ReceiptController;