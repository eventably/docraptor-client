const express = require('express');
const axios = require('axios');
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { z } = require('zod');
const env = require('../config/env');
const logger = require('../logger');

const router = express.Router();
const s3Client = new S3Client({ region: env.AWS_REGION });

const MAX_HTML_BYTES = 10_000_000;

const PostBodySchema = z.object({
  html: z.string().min(1).max(MAX_HTML_BYTES),
  uuid: z.string().uuid(),
});

const UuidParamSchema = z.object({
  uuid: z.string().uuid(),
});

/**
 * Build the S3 object params for a given UUID.
 *
 * @param {string} uuid - Client-provided UUID identifying the PDF.
 * @returns {{ Bucket: string, Key: string }} S3 object params.
 */
function s3Params(uuid) {
  return { Bucket: env.S3_BUCKET, Key: `${uuid}.pdf` };
}

router.post('/', async (req, res) => {
  const parsed = PostBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { html, uuid } = parsed.data;

  try {
    const response = await axios.post('https://docraptor.com/docs', {
      user_credentials: env.DOCRAPTOR_API_KEY,
      doc: {
        test: true,
        document_content: html,
        name: `${uuid}.pdf`,
        document_type: 'pdf',
        prince_options: {
          accessibility: true,
          tag_svg: true,
          lang: 'en',
          pdf_profile: 'PDF/UA-1',
        },
      },
    });

    await s3Client.send(
      new PutObjectCommand({
        ...s3Params(uuid),
        Body: Buffer.from(response.data),
        ContentType: 'application/pdf',
      }),
    );
    logger.info(`PDF created and uploaded to S3 with UUID: ${uuid}`);
    res.status(201).send('PDF created and uploaded.');
  } catch (error) {
    logger.error('Error creating PDF', error);
    res.status(500).send('Error creating PDF');
  }
});

router.get('/:uuid', async (req, res) => {
  const parsed = UuidParamSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { uuid } = parsed.data;

  try {
    const data = await s3Client.send(new GetObjectCommand(s3Params(uuid)));
    res.setHeader('Content-Type', 'application/pdf');
    data.Body.pipe(res);
  } catch (error) {
    logger.error('Error retrieving PDF', error);
    res.status(404).send('PDF not found');
  }
});

router.head('/:uuid', async (req, res) => {
  const parsed = UuidParamSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { uuid } = parsed.data;

  try {
    await s3Client.send(new GetObjectCommand(s3Params(uuid)));
    res.status(200).send('PDF exists');
  } catch (error) {
    logger.error('PDF does not exist', error);
    res.status(404).send('PDF not found');
  }
});

router.delete('/:uuid', async (req, res) => {
  const parsed = UuidParamSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { uuid } = parsed.data;

  try {
    await s3Client.send(new DeleteObjectCommand(s3Params(uuid)));
    logger.info(`PDF deleted from S3 with UUID: ${uuid}`);
    res.status(200).send('PDF deleted');
  } catch (error) {
    logger.error('Error deleting PDF', error);
    res.status(500).send('Error deleting PDF');
  }
});

module.exports = router;
