import express from 'express';
import bodyParser from 'body-parser';

import ReceiptRouter from './routes/receipt';

const port = 3000;
const app = express();

const expressSwagger = require('express-swagger-generator')(app);

app.use(bodyParser.json());

let options = {
	swaggerDefinition: {
		info: {
			description: 'Customer - Order - Item',
			title: 'Customer - Order - Item',
			version: '1.0.0'
		},
		host: 'localhost:3000',
		basePath: '',
		produces: [
			'application/json',
			'application/xml'
		],
		schemes: [ 'http', 'https' ],
		security: [
			{
				JWT: [],
				language: []
			}
		],
		securityDefinitions: {
			JWT: {
				type: 'apiKey',
				in: 'header',
				name: 'Authorization',
				description: ''
			},
			language: {
				type: 'apiKey',
				in: 'header',
				name: 'language'
			}
		}
	},
	basedir: __dirname, 
	files: [ './**/*.js' ]
};
expressSwagger(options);

app.use('/receipt', ReceiptRouter);

app.listen({port: 3000}, async () => {
	console.log(`listening ${port}`);
});

module.exports = app;