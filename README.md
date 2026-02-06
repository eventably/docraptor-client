
# DocRaptor Client

This project is a Node.js-based API that proxies the [DocRaptor](https://docraptor.com/) service. It provides routes for creating, retrieving, checking, and deleting PDFs. The resulting PDFs are stored in an Amazon S3 bucket.

The PDFs created by DocRaptor should be accessible. However, the level of accessibility is predicated upon the service being fed accessible HTML to begin with. Furthermore, you should be aware that there are some inherent limits in PDF for making certain kinds of content accessible. That said, clean, well-structured HTML should result in an accessible PDF from the DocRaptor service.

## Features

- **POST**: Accepts an HTML string and UUID, generates a PDF using DocRaptor, and uploads it to an S3 bucket.
- **GET**: Retrieves and downloads the PDF from the S3 bucket.
- **HEAD**: Checks if the PDF exists in the S3 bucket.
- **DELETE**: Deletes the PDF from the S3 bucket.
- Uses Bunyan for logging.
- Uses Nodemon for development.
- Uses PM2 for production.
- Uses Jest and Supertest for testing.
- Uses dotenv for environment variable management.

## Installation

1. Clone the repository:

    ```sh
    git clone git+ssh://git@github.com/eventably/docraptor-client.git
    cd docraptor-client
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Create a `.env` file in the root of the project using `.envSAMPLE` as your guide for the content needed.

4. Ensure that your S3 bucket permissions are correct.

## Usage

### Development

To start the server in development mode with Nodemon:

```sh
npm run dev
```

### Production

To start the server in production mode with PM2:

```sh
pm2 start ecosystem.config.js --env production
```

### API Endpoints

- **POST /pdf**
  - Request Body: `{ "html": "<html content>", "uuid": "unique-id" }`
  - Response: `201 Created`

  Note: You are responsible for generating the UUID when POSTing the request

- **GET /pdf/:uuid**
  - Response: PDF file

- **HEAD /pdf/:uuid**
  - Response: `200 OK` if exists, `404 Not Found` if not

- **DELETE /pdf/:uuid**
  - Response: `200 OK` if deleted, `500 Internal Server Error` if error

### Testing

To run tests:

```sh
npm run test
```

## Logging

The application uses Bunyan for logging. Logs are printed to the console *and* to file by default. Feel free to modify this behavior in `./logger.js`

## Environment Variables

The application uses `dotenv` to manage environment variables. Ensure the `.env` file is present in the root of the project with the necessary variables.

## License

This project is licensed under the MIT License.
