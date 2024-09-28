# Flip-Book

This project is a web application that allows users to upload PDF files and view them as a flippable book in the browser. It consists of a Node.js backend for processing PDF files and a Next.js frontend for displaying the book.

## Features

- PDF file upload
- Conversion of PDF pages to images
- Interactive book-like viewing experience
- Responsive design

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or later)
- npm (v6 or later)
- GraphicsMagick
- Ghostscript

### macOS-specific prerequisites

For macOS users, you'll need to install some additional dependencies:

```bash
brew install graphicsmagick
brew install ghostscript
```

## Setup

Follow these steps to set up the project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/krish4uu/FlipBook.git

   ```

2. Set up the backend:
   ```bash
   cd backend
   npm install
   mkdir uploads
   ```

3. Set up the frontend:
   ```bash
   cd ../frontend
   npm install
   ```

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npx ts-node src/index.ts
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Open the application in your web browser.
2. Click on the file input to select a PDF file for upload.
3. Wait for the file to be processed (this may take a moment depending on the size of the PDF).
4. Once processed, the PDF will be displayed as a flippable book.
5. Use the mouse or touch controls to flip through the pages of the book.

