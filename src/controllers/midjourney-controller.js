import axios from "axios";
import { generateObjectId } from "./utils.js";
import fetch from 'node-fetch';

export const getMidjourneyImage = async (req, res) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required!" });
    }
    try {
        const generateResponse = await apiCall('https://cl.imagineapi.dev/items/images/', 'POST', { prompt })
        const imageId = generateResponse.data.id;
        const imageUrl = await pollForImage(imageId);
        let urls = imageUrl.map(el => {
            return {
                id: generateObjectId(),
                url: el,
                iterations: [],
                prompt
            }
        })
        return res.json({ s: true, url: urls });
    } catch (error) {
        console.error('Error generating image:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to generate image" });
    }
}

const pollForImage = async (imageId) => {
    let imageUrls = [];
    while (!imageUrls.length) {
        console.log("Checking image status...");
        const statusResponse = await apiCall(`https://cl.imagineapi.dev/items/images/${imageId}`, 'GET')
        console.log({ statusResponse })
        const imageData = statusResponse.data;
        if (imageData.status === 'completed') {
            imageUrls = imageData.upscaled_urls;
            console.log(`Image generation completed. URL: ${imageUrls}`);
        } else if (imageData.status === 'pending' || imageData.status === 'in-progress') {
            console.log(`Current status: ${imageData.status}. Retrying in 3 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 5 seconds before retrying
        } else if (imageData.status === 'failed') {
            res.status(500).json({ s: false, error: imageData.error || "Failed to generate image" });
        }
    }
    return imageUrls;
};

async function apiCall(url, method, body = null) {
    try {
        const options = {
            method,
            headers: {
                "Authorization": `Bearer 6Sa2q3v64tN6WTG44tx_sF_DcW8Ky4ZW`,
                "Content-Type": "application/json"
            }
        };

        if (body) options.body = JSON.stringify(body);
        const response = await fetch(url, options);
         return response.json();

    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        throw new Error("API call failed");
    }
}

export async function getMidjourneyUrls(data = {}) {
    const { prompt, originalPrompt = '', versions = 1 } = data;
    // console.log('getMidjourneyUrls', prompt);
    try {
        const generateResponse = await apiCall('https://cl.imagineapi.dev/items/images/', 'POST', { prompt })
        console.log({ generateResponse })
        if (generateResponse?.data?.id) {
            const imageId = generateResponse?.data?.id;
            // console.log({ imageId });
            return { url: imageId, generation: 'GENERATION_3', prompt: originalPrompt, versions };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error in API calls:", error);
        return null;
    }
}

export async function getMidjourneyOutput(data) {
    const { url = '', versions = 4 } = data;

    try {
        let imageUrls = [];
        console.log("Checking image status...");
        const statusResponse = await apiCall(`https://cl.imagineapi.dev/items/images/${url}`, 'GET')
        const imageData = statusResponse.data || {};
        if (imageData.status === 'completed') {
            imageUrls = imageData.upscaled_urls;
            let urls = [];
            imageUrls.filter((el, i) => {
                // if (i <= (versions - 1)) {
                    urls.push({
                        id: generateObjectId(),
                        url: el,
                        iterations: [],
                        prompt: data.prompt,
                        status: 'COMPLETE',
                        model: 'GENERATION_3'
                    })
                // }
            })
            console.log({ urls });
            return urls;
        } else if (imageData.status === 'pending' || imageData.status === 'in-progress') {
            console.log(`Current status: ${imageData.status}. Retrying in 3 seconds...`);
            let data = Array.from({ length: versions }, () => {
                return { id: generateObjectId(), status: 'PENDING', model: 'GENERATION_3' };
            });
            return data;
        } else {
            let data = Array.from({ length: versions }, () => {
                return { id: generateObjectId(), status: 'FAILED', model: 'GENERATION_3' };
            });
            return data;
        }
    } catch (error) {
        console.error("Error in API calls:", error);
        let data = Array.from({ length: versions }, () => {
            return { id: generateObjectId(), status: 'FAILED', model: 'GENERATION_3' };
        });
        return data;
    }
}