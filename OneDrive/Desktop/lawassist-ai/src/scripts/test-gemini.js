const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const apiKey = envConfig.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ No GEMINI_API_KEY");
    process.exit(1);
}

// Log first 5 chars to verify key update
console.log(`🔑 Using Key matching prefix: ${apiKey.substring(0, 5)}...`);

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
    console.log(`\n🤖 Testing model: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hi");
        const response = await result.response;
        console.log(`✅ Success with ${modelName}!`);
        return true;
    } catch (error) {
        console.error(`❌ Failed with ${modelName}:`);
        console.error(`Status: ${error.status || 'Unknown'}`);
        console.error(`StatusText: ${error.statusText || 'Unknown'}`);
        // Log full error for deeper debugging if needed
        // console.error(JSON.stringify(error, null, 2));
        return false;
    }
}

async function run() {
    let success = await testModel("gemini-1.5-flash");
    if (!success) success = await testModel("gemini-pro");
    if (!success) success = await testModel("gemini-1.0-pro");
}

run();
