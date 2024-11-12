import { apiCall, generateObjectId, pollForFinalData } from './utils.js';

// get Upscale Image
export const upscaleImage = async (req, res) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const { image = '', scale = 1 } = req.body;
    const body = {
        version: "f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
        input: {
            image,
            scale
        }
    };
    try {
        // First API call
        const response = await apiCall(
            "https://api.replicate.com/v1/predictions",
            "POST",
            { ...body }
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
         return res.json({ s: true, url: { id: generateObjectId(), url: finalData?.output, type: 'Upscale' } });


    } catch (error) {
        console.error("Error in API calls:", error);
        return res.status(500).json({ s: false, error: "Failed to generate image" });
    }
};

// remove Image Bg
export const removeBg = async (req, res) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const { image = '' } = req.body;
    const body = {
        version: "95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1",
        input: { image }
    };

    try {
        // First API call
        const response = await apiCall(
            "https://api.replicate.com/v1/predictions",
            "POST",
            { ...body }
        );
        const resultUrl = response?.urls?.get;
        console.log('First API response URL:', resultUrl);

        if (!resultUrl) {
            return res.status(500).json({ error: "No URL returned from the first API call", s: false });
        }
         // Second API call to retrieve final datax
         const finalData = await pollForFinalData(resultUrl);
         console.log('Final Data:', finalData);
         if (!finalData?.output[0]) {
             return res.status(500).json({ s: false, error: "Failed to generate image" });
         }
         return res.json({ s: true, url: { id: generateObjectId(), url: finalData?.output, type: 'Remove Bg' } });
    } catch (error) {
        console.error("Error in API calls:", error);
        return res.status(500).json({ s: false, error: "Failed to generate image" });
    }
};