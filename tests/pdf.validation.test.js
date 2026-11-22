const request = require('supertest');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pdfRouter = require('../routes/pdf');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use('/pdf', pdfRouter);

const validUuid = uuidv4();
const invalidUuid = 'not-a-uuid';
const nonRfcGuid = '12345678-1234-1234-1234-123456789012';

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

    it('returns a flattened error body naming the failing field', async () => {
      const res = await request(app).post('/pdf').send({ html: '<h1>hi</h1>', uuid: invalidUuid });
      expect(res.status).toBe(400);
      expect(res.body.error.formErrors).toEqual([]);
      expect(res.body.error.fieldErrors.uuid).toEqual(expect.any(Array));
      expect(res.body.error.fieldErrors.html).toBeUndefined();
    });

    it('accepts a GUID that is not RFC 9562 (version/variant nibbles unchecked)', async () => {
      // Pins the pre-zod-4 contract: any 8-4-4-4-12 hex id is a valid key.
      // Empty html keeps the request at the validation layer (no S3 call).
      const res = await request(app).post('/pdf').send({ html: '', uuid: nonRfcGuid });
      expect(res.status).toBe(400);
      expect(res.body.error.fieldErrors.uuid).toBeUndefined();
      expect(res.body.error.fieldErrors.html).toEqual(expect.any(Array));
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
