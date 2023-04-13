/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
const vision = require('@google-cloud/vision');
const path = require('path');
const multer = require('multer');
import fs from 'fs';
const APP_ROOT = path.join(__dirname, '../..');

class ReceiptService {

	static async getReceiptText(req, res) {
		try {
			const tempPath = req.file.path;
			
			let dir = './api/uploads';

			if (!fs.existsSync(dir)){
				fs.mkdirSync(dir, { recursive: true });
			}

			const targetPath = path.join(__dirname, `../uploads/image_${(new Date().toJSON()
				.replace(/[-:]/g, '_')
				.replace(/\./g, '_'))}.png`);

			fs.rename(tempPath, targetPath, err => {
				if (err) {
					return err; 
				}
			});

			const client = new vision.ImageAnnotatorClient(
				{
					keyFilename: `${APP_ROOT}${path.sep}vision-api-key.json`
				}
			);
			const  [ result ] = await client.documentTextDetection(`${targetPath}`);
			const fullTextAnnotation = result.fullTextAnnotation;
			fs.unlinkSync(targetPath);
			return fullTextAnnotation.text;
		}
		catch (err) {
			return err;
		}
	}

	static async getReceiptTextWithConfidence(req, res) {
		try {
			const tempPath = req.file.path;

			let dir = './api/uploads';

			if (!fs.existsSync(dir)){
				fs.mkdirSync(dir, { recursive: true });
			}

			const targetPath = path.join(__dirname, `../uploads/image_${(new Date().toJSON()
				.replace(/[-:]/g, '_')
				.replace(/\./g, '_'))}.png`);
			
			fs.rename(tempPath, targetPath, err => {
				if (err) {
					return err;
				}
			});

			const client = new vision.ImageAnnotatorClient(
				{
					keyFilename: `${APP_ROOT}${path.sep}vision-api-key.json`
				}
			);
			const  [ result ] = await client.documentTextDetection(`${targetPath}`);
			const fullTextAnnotation = result.fullTextAnnotation;
            
			let receipt = {};

			fullTextAnnotation.pages.forEach(page => {
				page.blocks.forEach(block => {
					block.paragraphs.forEach(paragraph => {
						paragraph.words.forEach(word => {
							const wordText = word.symbols.map(s => s.text).join('');
							receipt[wordText] = {
								confidence: word.confidence
							};
						});
					});
				});
			});
			fs.unlinkSync(targetPath);
			return receipt;
		}
		catch (err) {
			return err;
		}
	}

	static async getReceiptSumPrice(req, res) {
		try {
			var base64Data = req.body.base64.replace(/^data:image\/png;base64,/, "");
			const filename = (new Date() / 1000).toFixed(0).toString();

			const targetPath = `${APP_ROOT}/api/uploads/`;

			const filePath = `${targetPath}${filename}.png`;

			if (!fs.existsSync(targetPath)) {
				fs.mkdirSync(targetPath, { recursive: true })
			}

			fs.writeFile(`${targetPath}${filename}.png`, base64Data, 'base64', function(err) {
				if (err) {
					return err;
				}
			});

			const client = new vision.ImageAnnotatorClient(
				{
					keyFilename: `${APP_ROOT}${path.sep}vision-api-key.json`
				}
			);

			const  [ result ] = await client.documentTextDetection(filePath);
			const fullTextAnnotation = result.fullTextAnnotation;

			let sum_vertices = [];
			let sum_confidence;
			let kdv_vertices = [];
			let kdv_confidence;
			let all_vertices = [];

			fullTextAnnotation.pages.forEach(page => {
				page.blocks.forEach(block => {
					block.paragraphs.forEach(paragraph => {
						paragraph.words.forEach(word => {
							const wordText = word.symbols.map(s => s.text).join('');
							if (wordText === 'TOPLAM' || wordText === 'TOP') {
								sum_confidence = word.confidence;
								word.boundingBox.vertices.forEach(v => {
									sum_vertices.push(v);
									all_vertices.push({x: -5000, y: -5000});
								});
							}
							else if (wordText === 'KDV' || wordText === 'TOPKDV') {
								kdv_confidence = word.confidence;
								word.boundingBox.vertices.forEach(v => {
									kdv_vertices.push(v);
									all_vertices.push({x: -5000, y: -5000});
								});
							}
							else if (wordText === '*' || wordText === '.' || wordText === '+' || wordText === ',') {
								word.boundingBox.vertices.forEach(() => {
									all_vertices.push({x: -5000, y: -5000});
								});
							}
							else {
								word.boundingBox.vertices.forEach(v => {
									all_vertices.push(v);
								});
							}
						});
					});
				});
			});

			sum_vertices = sum_vertices.slice(-4);
			
			let sum_vertices_flag = false;
			let kdv_vertices_flag = false;

			if (sum_vertices.length === 0) {
				sum_vertices = [
					{ x: 0, y: 0 },
					{ x: 0, y: 0 },
					{ x: 0, y: 0 },
					{ x: 0, y: 0 }
				];
				sum_vertices_flag = true;
			}

			if (kdv_vertices.length === 0) {
				kdv_vertices = [
					{ x: 0, y: 0 },
					{ x: 0, y: 0 },
					{ x: 0, y: 0 },
					{ x: 0, y: 0 }
				];
				kdv_vertices_flag = true;
			}

			let sum_start_center = {x: (sum_vertices[0].x + sum_vertices[3].x) / 2, y: (sum_vertices[0].y + sum_vertices[3].y) / 2};
			let sum_end_center = {x: (sum_vertices[1].x + sum_vertices[2].x) / 2, y: (sum_vertices[1].y + sum_vertices[2].y) / 2};

			let kdv_start_center = {x: (kdv_vertices[0].x + kdv_vertices[3].x) / 2, y: (kdv_vertices[0].y + kdv_vertices[3].y) / 2};
			let kdv_end_center = {x: (kdv_vertices[1].x + kdv_vertices[2].x) / 2, y: (kdv_vertices[1].y + kdv_vertices[2].y) / 2};

			let a = sum_end_center.y - sum_start_center.y;
			let b = sum_start_center.x - sum_end_center.x;
			let c = sum_start_center.y * sum_end_center.x - sum_start_center.x * sum_end_center.y;
			let distances = [];

			let a_for_kdv = kdv_end_center.y - kdv_start_center.y;
			let b_for_kdv = kdv_start_center.x - kdv_end_center.x;
			let c_for_kdv = kdv_start_center.y * kdv_end_center.x - kdv_start_center.x * kdv_end_center.y;
			let distances_for_kdv = [];

			let word_centers = [];

			for (let i = 0;i < all_vertices.length;i=i+4) {
				let cntr = { x: (all_vertices[i].x + all_vertices[i+1].x + all_vertices[i+2].x + all_vertices[i+3].x) / 4
					, y: (all_vertices[i].y + all_vertices[i+1].y + all_vertices[i+2].y + all_vertices[i+3].y) / 4 };
				word_centers.push(cntr);
			}

			for (let i = 0;i < word_centers.length;i++) {
				let h = Math.abs(a * word_centers[i].x + b * word_centers[i].y + c) / Math.sqrt(a * a + b * b);
				distances.push(h);
				let h_for_kdv = Math.abs(a_for_kdv * word_centers[i].x + b_for_kdv * word_centers[i].y + c_for_kdv) / Math.sqrt(a_for_kdv * a_for_kdv + b_for_kdv * b_for_kdv);
				distances_for_kdv.push(h_for_kdv);
			}

			let closest_for_sum = distances.reduce(function(prev, curr) {
				return (Math.abs(curr - 0) < Math.abs(prev - 0) ? curr : prev);
			});

			let closest_for_kdv = distances_for_kdv.reduce(function(prev, curr) {
				return (Math.abs(curr - 0) < Math.abs(prev - 0) ? curr : prev);
			});

			let sum_index = distances.indexOf(closest_for_sum)+1;
			let kdv_index = distances_for_kdv.indexOf(closest_for_kdv)+1;

			let l = 0;
			let receipt_sum;
			let receipt_kdv;
	
			fullTextAnnotation.pages.forEach(page => {
				page.blocks.forEach(block => {
					block.paragraphs.forEach(paragraph => {
						paragraph.words.forEach(word => {
							const wordText = word.symbols.map(s => s.text).join('');
							l = l + 1;
							if (l === sum_index) {
								receipt_sum	= wordText;
							}
							else if (l === kdv_index) {
								receipt_kdv = wordText;
							}
						});
					});
				});
			});

			fs.unlinkSync(filePath);
			
			if (kdv_vertices_flag) {
				return {receipt_sum};
			}
			else if (sum_vertices_flag) {
				return {receipt_kdv};
			}
			else {
				return {receipt_sum, receipt_kdv};
			}
		}
		catch (err) {
			console.log(err);
		}
	}
    
}

export default ReceiptService;