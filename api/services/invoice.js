/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
const vision = require('@google-cloud/vision');
const path = require('path');
import fs from 'fs';
const APP_ROOT = path.join(__dirname, '../..');

class InvoiceService {

    static async getInvoiceText(req, res) {
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
			fs.unlinkSync(filePath);
			return fullTextAnnotation.text;
		}
		catch (err) {
			return err;
		}
	}

	static async getInvoice(req, res) {
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

            const yearPattern = /\b\d{2}(\.|\/|\-)\d{2}(\.|\/|\-)\d{4}\b/;
			const timePattern = /\b(?:[01]\d|2[0-3]):[0-5]\d\b/;

            let i = 0;

			const lettersRegex = /^[A-Z]{3}$/;
			const regex = /^20\d{11}$/;
			const pricePattern = /^(?:\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?)$/;
			let yuzde = 0;

			let kdv_oran;
			let kdv_fiyat;

			let lines = [];
			let currentLine = []; 
			let for_toplam = [];
			let for_kdv = [];
			let adet_words = [];

			let fatura_no;
			let date; 
			let time; 
			let toplam;
			let matrah; 

			fullTextAnnotation.pages.forEach(page => {
				page.blocks.forEach(block => {
					block.paragraphs.forEach(paragraph => {
						paragraph.words.forEach(word => {
							const wordText = word.symbols.map(s => s.text).join('');
                            i ++ ;

							const minY = Math.min(...word.boundingBox.vertices.map((v) => v.y));
							const maxY = Math.max(...word.boundingBox.vertices.map((v) => v.y));
							const midY = (minY + maxY) / 2;
						
							if (wordText === 'adet' || wordText === 'Adet' || wordText === 'ADET') {
								adet_words.push(word.boundingBox.vertices);
							}

							if ( currentLine.length === 0 || Math.abs(midY - currentLine[0].midY) <= 10 ) {
								// Add the word to the current line
								currentLine.push({ wordText, midY, boundingBox: word.boundingBox.vertices });
							} else {
								// Sort the words in the current line based on their horizontal positions
								currentLine.sort((a, b) => a.boundingBox[0].x - b.boundingBox[0].x);
								// Add the current line to the lines array and start a new line
								lines.push(currentLine);
								currentLine = [{ wordText, midY, boundingBox: word.boundingBox.vertices }];
							}

							// Check if the wordText matches "Fatura No" (adjust as needed)
							if ( currentLine.length === 4 && currentLine[0].wordText === 'Vergiler' && currentLine[1].wordText === 'Dahil' && currentLine[2].wordText === 'Toplam' &&currentLine[3].wordText === 'Tutar' ) {
								for_toplam.push(currentLine[0].boundingBox);
								for_toplam.push(currentLine[1].boundingBox);
								for_toplam.push(currentLine[2].boundingBox);
								for_toplam.push(currentLine[3].boundingBox);
							}
							else if ( currentLine.length === 2 && currentLine[0].wordText === 'Hesaplanan' && currentLine[1].wordText === 'KDV' ) {
								for_kdv.push(currentLine[0].boundingBox);
								for_kdv.push(currentLine[1].boundingBox);
							}
                            if ( yearPattern.test(wordText) ) {
								date = wordText;
							}
							else if ( timePattern.test(wordText) ) {
								time = wordText;
							}
							else if ( lettersRegex.test(wordText.slice(0, 3)) && regex.test(wordText.slice(3)) && !fatura_no ) {
								fatura_no = wordText;
							}
						});
					});
				});
				// Sort the words in the last line of the page based on their horizontal positions
				currentLine.sort((a, b) => a.boundingBox[0].x - b.boundingBox[0].x);

				// Add the current line to the lines array and start a new line
				lines.push(currentLine);
				currentLine = [];
			});

            let l = 0;

			if (for_toplam.length === 0) {
				for_toplam = [
					[
					  { x: 0, y: 0 },
					  { x: 0, y: 0 },
					  { x: 0, y: 0 },
					  { x: 0, y: 0 }
					]
				];
			}

			if (for_kdv.length === 0) {
				for_kdv = [
					[
					  { x: 0, y: 0 },
					  { x: 0, y: 0 },
					  { x: 0, y: 0 },
					  { x: 0, y: 0 }
					]
				];
			}

			let toplam_minY = for_toplam[0][0].y;
			let toplam_maxY = for_toplam[for_toplam.length - 1][2].y;

			let kdv_minY = for_kdv[0][0].y;
			let kdv_maxY = for_kdv[for_kdv.length - 1][2].y;

			let kalem_aralik = [];

			for (let i = 0; i < adet_words.length; i++) {
				let adet_minY = adet_words[i][0].y;
				let adet_maxY = adet_words[i][2].y;
				kalem_aralik.push(adet_minY);
				kalem_aralik.push(adet_maxY);
			}

			const groupedOutput = {};

            fullTextAnnotation.pages.forEach(page => {
				page.blocks.forEach(block => {
					block.paragraphs.forEach(paragraph => {
						paragraph.words.forEach(word => {
							const wordText = word.symbols.map(s => s.text).join('');
							l = l + 1;
							const minY = Math.min(...word.boundingBox.vertices.map((v) => v.y));
							const maxY = Math.max(...word.boundingBox.vertices.map((v) => v.y));
							const midY = (minY + maxY) / 2;

							kalem_aralik.forEach((Kalem, index) => {
								if (index % 2 === 0) {
								  const range = `${Kalem} ${kalem_aralik[index + 1]}`;
								  if (!groupedOutput.hasOwnProperty(range)) {
									groupedOutput[range] = [];
								  }
							  
								  if (midY > Kalem && midY < kalem_aralik[index + 1]) {
									groupedOutput[range].push(wordText);
								  }
								}
							});

                            if (midY < toplam_maxY && midY > toplam_minY && pricePattern.test(wordText)) {
								toplam = wordText;
                            }
							if (midY < kdv_maxY && midY > kdv_minY && pricePattern.test(wordText) && wordText !== kdv_oran) {
								kdv_fiyat = parseFloat(wordText.replace(',', '.'));
                            }
							if (wordText === '%') {
								yuzde = l;
							}
							if (midY < kdv_maxY && midY > kdv_minY && l === yuzde + 1 ) {
								kdv_oran = parseFloat(wordText.replace(',', '.'));
							}
						});
					});
				});
			});


			if (kdv_oran !== undefined && kdv_fiyat !== undefined) {
				matrah = kdv_fiyat * 100 / kdv_oran;
			}			

			const sentencesArray = [];

			for (const range in groupedOutput) {
				const values = groupedOutput[range];
				const sentence = `Aralik: ${range}, Degerler: ${values.join(' | ')}`;
				sentencesArray.push(sentence);
			  }

			//   sentencesArray.forEach(sentence => {
			// 	console.log(sentence);
			//   });

			fs.unlinkSync(filePath);
			
			return {fatura_no, date, time, kdv_fiyat, kdv_oran, toplam, matrah, sentencesArray};;
		}
		catch (err) {
			return err;
		}
	}

}

export default InvoiceService;