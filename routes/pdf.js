const express = require('express');
const axios = require('axios');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const logger = require('../logger');
require('dotenv').config();

const router = express.Router();
const s3Client = new S3Client({ region: process.env.AWS_REGION });

router.post('/', async (req, res) => {
    const { html, uuid } = req.body;
    if (!html || !uuid) {
        return res.status(400).send('HTML and UUID are required.');
    }

    try {
        const response = await axios.post('https://docraptor.com/docs', {
            user_credentials: process.env.DOCRAPTOR_API_KEY,
            doc: {
                test: true,
                document_content: html,
                name: `${uuid}.pdf`,
                document_type: 'pdf',
                // Enable accessibility features
                prince_options: {
                    accessibility: true,
                    // Additional options for improved accessibility
                    tag_svg: true, // Tag SVG elements
                    lang: 'en', // Set the document language
                    pdf_profile: 'PDF/UA-1' // Ensure the PDF is PDF/UA compliant
                }
            },
        });

        const params = {
            Bucket: process.env.S3_BUCKET,
            Key: `${uuid}.pdf`,
            Body: Buffer.from(response.data),
            ContentType: 'application/pdf',
        };

        await s3Client.send(new PutObjectCommand(params));
        logger.info(`PDF created and uploaded to S3 with UUID: ${uuid}`);
        res.status(201).send('PDF created and uploaded.');
    } catch (error) {
        logger.error('Error creating PDF', error);
        res.status(500).send('Error creating PDF');
    }
});

router.get('/:uuid', async (req, res) => {
    const { uuid } = req.params;
    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: `${uuid}.pdf`,
    };

    try {
        const data = await s3Client.send(new GetObjectCommand(params));
        res.setHeader('Content-Type', 'application/pdf');
        data.Body.pipe(res);
    } catch (error) {
        logger.error('Error retrieving PDF', error);
        res.status(404).send('PDF not found');
    }
});

router.head('/:uuid', async (req, res) => {
    const { uuid } = req.params;
    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: `${uuid}.pdf`,
    };

    try {
        await s3Client.send(new GetObjectCommand(params));
        res.status(200).send('PDF exists');
    } catch (error) {
        logger.error('PDF does not exist', error);
        res.status(404).send('PDF not found');
    }
});

router.delete('/:uuid', async (req, res) => {
    const { uuid } = req.params;
    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: `${uuid}.pdf`,
    };

    try {
        await s3Client.send(new DeleteObjectCommand(params));
        logger.info(`PDF deleted from S3 with UUID: ${uuid}`);
        res.status(200).send('PDF deleted');
    } catch (error) {
        logger.error('Error deleting PDF', error);
        res.status(500).send('Error deleting PDF');
    }
});

module.exports = router;
