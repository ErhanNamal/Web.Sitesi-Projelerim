const express = require('express');
const cors = require('cors');
const fs = require('fs'); // Dosya okuma
const path = require('path');
const multer = require('multer');
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 },
});

const app = express();
const port = 3000;

app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR));

const SUBMISSIONS_FILE = path.join(__dirname, 'submissions.json');

function readSubmissions() {
    try {
        if (!fs.existsSync(SUBMISSIONS_FILE)) return [];
        const raw = fs.readFileSync(SUBMISSIONS_FILE, 'utf8');
        return JSON.parse(raw || '[]');
    } catch (err) {
        console.error('readSubmissions error:', err);
        return [];
    }
}

function writeSubmissions(list) {
    try {
        fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
        console.error('writeSubmissions error:', err);
    }
}

app.get('/api/v1/trends', (req, res) => {
    try {
        const rawdata = fs.readFileSync('trends.json');
        const trends = JSON.parse(rawdata);
        
        trends.sort((a, b) => b.popularity - a.popularity);
        
        res.json({
            status: 'success',
            data: trends
        });
        
    } catch (error) {
        console.error("Trend verileri okunurken hata oluştu:", error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Sunucu trend verilerini işleyemedi.' 
        });
    }
});

app.post('/api/v1/form-submit', upload.array('recipe_files', 8), (req, res)=> {
   try {
        // Multer, verileri ayrıştırıp req.body içine yerleştirir
        console.log("Gelen Form Verileri:", req.body);

        const filesMeta = (req.files || []).map(f => ({
            originalname: f.originalname,
            filename: f.filename,
            mimetype: f.mimetype,
            size: f.size,
            url: `/uploads/${f.filename}`
        }));

        const submissions = readSubmissions();
        const entry = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            data: req.body,
            files: filesMeta
        };
        submissions.unshift(entry);
        writeSubmissions(submissions);

        res.json({
            status: 'success',
            receivedData: req.body,
            entry
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.get('/api/v1/submissions', (req, res) => {
    try {
        const submissions = readSubmissions();
        res.json({ status: 'success', data: submissions });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Sunucu gönderileri okuyamadı.' });
    }
});

app.delete('/api/v1/submissions/:id', (req, res) => {
    try {
        const { id } = req.params;
        let submissions = readSubmissions();
        submissions = submissions.filter(s => s.id !== id);
        writeSubmissions(submissions);
        res.json({ status: 'success', message: 'Gönderim silindi' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Silme başarısız oldu.' });
    }
});

app.listen(port, () => {
    console.log(`Yemek Trendleri API'si http://localhost:${port} adresinde çalışıyor!`);
    console.log(`Endpoint: http://localhost:${port}/api/v1/trends`);
});