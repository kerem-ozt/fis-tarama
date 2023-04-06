/* eslint-disable no-unused-vars */
const vision = require('@google-cloud/vision');
const path = require('path');
const multer = require('multer');
import fs from 'fs';

class ReceiptService {

	static async getReceiptText(req, res) {
		try {
			const tempPath = req.file.path;
			const targetPath = path.join(__dirname, `../uploads/image_${(new Date().toJSON()
				.replace(/[-:]/g, '_')
				.replace(/\./g, '_'))}.png`);

			fs.rename(tempPath, targetPath, err => {
				if (err) {
					return err; 
				}
			});

			const client = new vision.ImageAnnotatorClient();
			const  [ result ] = await client.documentTextDetection(`${targetPath}`);
			const fullTextAnnotation = result.fullTextAnnotation;
			return fullTextAnnotation.text;
		}
		catch (err) {
			return err;
		}
	}

	static async getReceiptTextWithConfidence(req, res) {
		try {
			const tempPath = req.file.path;
			const targetPath = path.join(__dirname, `../uploads/image_${(new Date().toJSON()
				.replace(/[-:]/g, '_')
				.replace(/\./g, '_'))}.png`);
			
			fs.rename(tempPath, targetPath, err => {
				if (err) {
					return err;
				}
			});

			const client = new vision.ImageAnnotatorClient();
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
			return receipt;
		}
		catch (err) {
			return err;
		}
	}

	static async getReceiptSumPrice(req, res) {
		try {
			const tempPath = req.file.path;
			const targetPath = path.join(__dirname, `../uploads/image_${(new Date().toJSON()
				.replace(/[-:]/g, '_')
				.replace(/\./g, '_'))}.png`);
        
			fs.rename(tempPath, targetPath, err => {
				if (err) { 
					console.log(err); 
				}
			});

			const client = new vision.ImageAnnotatorClient();
			const  [ result ] = await client.documentTextDetection(`${targetPath}`);
			const fullTextAnnotation = result.fullTextAnnotation;

			let sum_y_vertices = [];
			let sum_confidence;
			let all_y_vertices = [];

			fullTextAnnotation.pages.forEach(page => {
				page.blocks.forEach(block => {
					block.paragraphs.forEach(paragraph => {
						paragraph.words.forEach(word => {
							const wordText = word.symbols.map(s => s.text).join('');
							if (wordText === 'TOPLAM' || wordText === 'TOP') {
								sum_confidence = word.confidence;
								word.boundingBox.vertices.forEach(v => {
									sum_y_vertices.push(v.y);
									all_y_vertices.push(-5000);
								});
							}
							else if (wordText === '*') {
								word.boundingBox.vertices.forEach(() => {
									all_y_vertices.push(-5000);
								});
							}
							else {
								word.boundingBox.vertices.forEach(v => {
									all_y_vertices.push(v.y);
								});
							}
						});
					});
				});
			});

			const grouped_vertices = all_y_vertices.reduce((acc, curr, i) => {
				if (i % 4 === 0) {
					acc.push([ curr ]);
				}
				else {
					acc[acc.length - 1].push(curr);
				}
				return acc;
			}, []);
        
			let arr = [];

			for (let i = 0;i < grouped_vertices.length;i++) {
				arr.push(getDifference(grouped_vertices[i], sum_y_vertices));
			}

			let closest = arr.reduce(function(prev, curr) {
				return (Math.abs(curr - 0) < Math.abs(prev - 0) ? curr : prev);
			});

			let index_of_value = arr.indexOf(closest)+1;

			let l = 0;
			let receipt_sum;

			fullTextAnnotation.pages.forEach(page => {
				page.blocks.forEach(block => {
					block.paragraphs.forEach(paragraph => {
						paragraph.words.forEach(word => {
							const wordText = word.symbols.map(s => s.text).join('');
							l = l + 1;
							if (l === index_of_value) {
								receipt_sum = wordText;
							}
						});
					});
				});
			});

			// eslint-disable-next-line no-inner-declarations
			function getDifference(a, b) {
				return (((a[0]-b[0]) + (a[1]-b[1]) + (a[2]-b[2]) + (a[3]-b[3])) / 4);
			}

			return receipt_sum;
		}
		catch (err) {
			console.log(err);
		}
	}
    
}

export default ReceiptService;