const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const https = require('https');

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const apiKey = envConfig.GEMINI_API_KEY;

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        fs.writeFileSync('models.json', body);
        console.log("Done.");
    });
}).on('error', (e) => {
    console.error(`Error: ${e.message}`);
});
