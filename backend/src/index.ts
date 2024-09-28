import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdf from 'pdf-parse';
import { fromPath } from 'pdf2pic';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('pdf'), (req: Request, res: Response, next: NextFunction) => {
  handleUpload(req, res).catch(next);
});

async function handleUpload(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  const pdfPath = req.file.path;
  const outputDir = path.join(path.dirname(pdfPath), path.parse(req.file.filename).name);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    const dataBuffer = await fs.promises.readFile(pdfPath);
    const data = await pdf(dataBuffer);
    const pageCount = data.numpages;

    const options = {
      density: 300,
      saveFilename: "page",
      savePath: outputDir,
      format: "png",
      width: 800,
      height: 1200
    };

    const convert = fromPath(pdfPath, options);

    for (let i = 1; i <= pageCount; i++) {
      await convert(i);
    }

    res.json({
      message: 'File uploaded and processed successfully',
      filename: req.file.filename,
      pageCount: pageCount,
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ message: 'Error processing PDF' });
  }
}

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});