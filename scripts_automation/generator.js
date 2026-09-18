import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

let ai;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
}

const fallbackGenerator = (appName, category) => {
    return {
        title: appName,
        themeColor: ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5'][Math.floor(Math.random() * 5)],
        content: `# Welcome to ${appName}\n\nThis is a mock generated application in the ${category} category.\n\nEnjoy the automated content!`,
        items: [
            { title: "Feature A", description: "This is feature A for " + appName },
            { title: "Feature B", description: "This is feature B for " + appName }
        ]
    };
};

export const generateAppData = async (appName, category) => {
    if (!ai) {
        console.warn(`[WARNING] No GEMINI_API_KEY provided. Using mock data for ${appName}.`);
        return fallbackGenerator(appName, category);
    }

    try {
        const prompt = `Generate JSON configuration for a mobile app named "${appName}" in the "${category}" category.
Return ONLY a valid JSON object with the following schema:
{
  "title": "Short Application Title",
  "themeColor": "#HEXCODE",
  "content": "Markdown formatted description of the app's purpose and usage instructions.",
  "items": [
    {"title": "Feature 1", "description": "Brief description"},
    {"title": "Feature 2", "description": "Brief description"}
  ]
}
Ensure the content is creative and matches the context of the app.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const textResponse = response.text;
        const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/) || textResponse.match(/{[\s\S]*}/);

        let jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : textResponse;

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error(`[ERROR] Failed to generate data for ${appName}:`, error.message);
        console.warn(`Falling back to mock data for ${appName}.`);
        return fallbackGenerator(appName, category);
    }
};

// If run directly for testing
if (process.argv[1] === new URL(import.meta.url).pathname) {
    generateAppData('Mock App', 'Test Category').then(console.log);
}
