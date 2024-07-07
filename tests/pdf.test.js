const request = require('supertest');
const express = require('express');
const pdfRouter = require('../routes/pdf');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/pdf', pdfRouter);

const uuid = uuidv4();
const html = '<h1>Hello, DocRaptor!</h1>';

describe('PDF Routes', () => {
    it('should create and upload a PDF', async () => {
        const response = await request(app)
            .post('/pdf')
            .send({ html, uuid });

        expect(response.status).toBe(201);
        expect(response.text).toBe('PDF created and uploaded.');
    });

    it('should retrieve a PDF', async () => {
        const response = await request(app).get(`/pdf/${uuid}`);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/pdf');
    });

    it('should check if a PDF exists', async () => {
        const response = await request(app).head(`/pdf/${uuid}`);

        expect(response.status).toBe(200);
    });

    it('should delete a PDF', async () => {
        const response = await request(app).delete(`/pdf/${uuid}`);

        expect(response.status).toBe(200);
        expect(response.text).toBe('PDF deleted');
    });
});
