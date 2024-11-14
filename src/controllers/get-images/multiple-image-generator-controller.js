import { getDalleUrl } from "../dall-e-controller.js";
import { geFluxOutput, geFluxUrl } from "../flux-controller.js";
import { getMidjourneyOutput, getMidjourneyUrls } from "../midjourney-controller.js";
import { generateImagePrompt } from "../utils.js";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export const generateImageIds = async (req, res) => {
    try {
        const { prompt = '', versions = 1, criteria = {}, aspect_ratio = '1:1' } = req.body;

        if (!prompt) {
            return res.status(400).json({ s: false, error: "Prompt is required" });
        }

        const updatedPrompt = decodeURIComponent(generateImagePrompt(prompt, criteria));
        const ids = [];

        // Ensure versions is between 1 and 9
        const clampedVersions = Math.min(Math.max(versions, 1), 9);

        // Map for image distribution based on clampedVersions
        const versionMapping = [
            { flux: 1, midjourney: 0, dalle: 0 },  // clampedVersions = 1
            { flux: 1, midjourney: 1, dalle: 0 },  // clampedVersions = 2
            { flux: 1, midjourney: 1, dalle: 1 },  // clampedVersions = 3
            { flux: 1, midjourney: 2, dalle: 1 },  // clampedVersions = 4
            { flux: 1, midjourney: 3, dalle: 1 },  // clampedVersions = 5
            { flux: 1, midjourney: 4, dalle: 1 },  // clampedVersions = 6
            { flux: 2, midjourney: 4, dalle: 1 },  // clampedVersions = 7
            { flux: 3, midjourney: 4, dalle: 1 },  // clampedVersions = 8
            { flux: 4, midjourney: 4, dalle: 1 }   // clampedVersions = 9
        ];

        // Set versions for each model based on clampedVersions
        const { flux: fluxVersions, midjourney: midjourneyVersions, dalle: dalleVersions } = versionMapping[clampedVersions - 1];

        // Data objects for each model with their specific versions
        const modelData = {
            prompt: updatedPrompt,
            originalPrompt: prompt
        };

        // Initialize responses as null
        let fluxRes = null;
        let midJourRes = null;
        console.log({ fluxVersions, midjourneyVersions, dalleVersions });
        // Attempt to get responses, handling any errors that may occur
        if (fluxVersions) {
            try {
                console.log('inside flux')
                fluxRes = await geFluxUrl({ ...modelData, versions: fluxVersions, aspect_ratio });
                console.log({ fluxRes })
            } catch (error) {
                console.error("Error in geFluxUrl:", error);
            }
        }
        if (midjourneyVersions) {
            try {
                midJourRes = await getMidjourneyUrls({ ...modelData, versions: midjourneyVersions });
                console.log({ midJourRes })
            } catch (error) {
                console.error("Error in getMidjourneyUrls:", error);
            }
        }

        // Always call DALL-E, as it generates 1 image regardless of versions
        const dalleRes = {
            generation: "GENERATION_2",
            prompt: updatedPrompt,
            originalPrompt: prompt,
            size: getSize(aspect_ratio)
        };

        // Only push valid results to the ids array
        if (fluxRes) ids.push(fluxRes);
        if (midJourRes) ids.push(midJourRes);
        if (dalleVersions) ids.push(dalleRes);

        // Check if no valid ids were generated
        if (ids.length === 0) {
            return res.status(500).json({ s: false, error: "Failed to generate image IDs" });
        }

        return res.json({ s: true, ids });
    } catch (error) {
        console.error("Error in generateImageIds:", error);
        return res.status(500).json({ s: false, error: "Internal server error" });
    }
};

const getSize = aspect_ratio => ({
    '1:1': '1024x1024',
    '16:9': '1792x1024',
    '9:16': '1024x1792'
}[aspect_ratio] ?? '1024x1024');

export const pollImageModels = async (req, res) => {
    const { ids = [] } = req.body;
    // console.log({ ids });

    try {
        const images = await Promise.all(ids.map(async (el) => {
            if (el.generation === 'GENERATION_1') {
                return await geFluxOutput(el);
            }
            if (el.generation === 'GENERATION_2') {
                return await getDalleUrl(el);
            }
            if (el.generation === 'GENERATION_3') {
                return await getMidjourneyOutput(el);
            }
            return [];  // Return an empty array if none of the conditions match
        }));
        // console.log({ images })
        return res.json({ s: true, images: images.flat(1) });
    } catch (error) {
        console.error("Error polling image models:", error);
        return res.status(500).json({ s: false, error: "Failed to fetch images" });
    }
};
