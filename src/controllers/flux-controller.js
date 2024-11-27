
import { apiCall, generateImagePrompt, generateObjectId, pollForFinalData } from './utils.js';

// get Flux Image
export const getFluxImage = async (req, res) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const { data = {}, criteria = {} } = req.body;
    const { num_outputs = 1, aspect_ratio = '1:1' } = data;

    const input = { prompt: decodeURIComponent(generateImagePrompt(data.prompt, criteria)), num_outputs: Number(num_outputs), aspect_ratio };

    try {
        // First API call
        const response = await apiCall(
            "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions",
            "POST",
            { input }
        );

        const resultUrl = response?.urls?.get;
        console.log('First API response URL:', resultUrl);

        if (!resultUrl) {
            return res.status(500).json({ error: "No URL returned from the first API call", s: false });
        }

        // Second API call to retrieve final data
        const finalData = await pollForFinalData(resultUrl);
        console.log('Final Data:', finalData);
        if (!finalData?.output[0]) {
            return res.status(500).json({ s: false, error: "Failed to generate image" });
        }
        let urls = finalData.output.map(el => {
            return {
                id: generateObjectId(),
                url: el,
                iterations: [],
                prompt: data.prompt
            }
        })
        return res.json({ s: true, url: urls });
    } catch (error) {
        console.error("Error in API calls:", error);
        return res.status(500).json({ s: false, error: "Failed to generate image" });
    }
};

export async function geFluxUrl(data = {}) {
    const { prompt, versions = 1, aspect_ratio = '1:1', originalPrompt = '' } = data;
    const input = { prompt, num_outputs: Number(versions), aspect_ratio };
    console.log({ input })
    try {
        const response = await apiCall(
            "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions",
            "POST",
            { input }
        );
        console.log({ response })
        const resultUrl = response?.urls?.get;
        if (!resultUrl) return null
        return { url: resultUrl, generation: 'GENERATION_1', prompt: originalPrompt };
    } catch (error) {
        console.error("Error in API calls:", error);
        return null;
    }
}

export async function geFluxOutput(data) {
    const { url = '', versions = 1 } = data;

    try {
        const response = await apiCall(url, "GET");
        // console.log({ response })
        if (response.status === 'processing' || response.status === 'starting') {
            // console.log('Still processing, polling again...');
            let data = Array.from({ length: versions }, () => {
                return { id: generateObjectId(), status: 'PENDING', model: 'GENERATION_1' };
            });
            return data;
        } else if (response.status === 'succeeded') {
            let urls = response.output.map(el => {
                return {
                    id: generateObjectId(),
                    url: el,
                    iterations: [],
                    prompt: data.prompt,
                    status: 'COMPLETE',
                    model: 'GENERATION_1'
                }
            })
            return urls;
        } else {
            let data = Array.from({ length: versions }, () => {
                return { id: generateObjectId(), status: 'FAILED', model: 'GENERATION_1' };
            });
            return data;
        }
    } catch (error) {
        console.error("Error in API calls:", error);
        let data = Array.from({ length: versions }, () => {
            return { id: generateObjectId(), status: 'FAILED', model: 'GENERATION_1' };
        });
        return data;
    }
}
