const request = require('supertest');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pdfRouter = require('../routes/pdf');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use('/pdf', pdfRouter);

const validUuid = uuidv4();
const invalidUuid = 'not-a-uuid';

describe('PDF Routes — input validation (no DocRaptor/S3 calls)', () => {
  describe('POST /pdf', () => {
    it('rejects missing html with 400', async () => {
      const res = await request(app).post('/pdf').send({ uuid: validUuid });
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('rejects missing uuid with 400', async () => {
      const res = await request(app).post('/pdf').send({ html: '<h1>hi</h1>' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('rejects empty html with 400', async () => {
      const res = await request(app).post('/pdf').send({ html: '', uuid: validUuid });
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('rejects non-string html with 400', async () => {
      const res = await request(app).post('/pdf').send({ html: 42, uuid: validUuid });
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('rejects malformed uuid with 400', async () => {
      const res = await request(app).post('/pdf').send({ html: '<h1>hi</h1>', uuid: invalidUuid });
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('rejects empty body with 400', async () => {
      const res = await request(app).post('/pdf').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /pdf/:uuid', () => {
    it('rejects malformed uuid with 400', async () => {
      const res = await request(app).get(`/pdf/${invalidUuid}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('HEAD /pdf/:uuid', () => {
    it('rejects malformed uuid with 400', async () => {
      const res = await request(app).head(`/pdf/${invalidUuid}`);
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /pdf/:uuid', () => {
    it('rejects malformed uuid with 400', async () => {
      const res = await request(app).delete(`/pdf/${invalidUuid}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });
});
