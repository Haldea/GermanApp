import express from 'express';
import fs from 'fs';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const FILE_PATH = './vocabulary_master.json';

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// 1. Load Data
app.get('/data', (req, res) => {
  if (!fs.existsSync(FILE_PATH)) return res.json([]);
  const data = fs.readFileSync(FILE_PATH);
  res.json(JSON.parse(data));
});

// 2. Save/Overwrite Data
app.post('/save', (req, res) => {
  const data = req.body;
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  res.send({ status: 'Success' });
});

app.listen(3001, () => console.log('🚀 Server running on http://localhost:3001'));