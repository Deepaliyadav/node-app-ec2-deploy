import OpenAI from 'openai';
import { generateObjectId } from './utils.js';

export const getDalleImage = async (req, res) => {
    // OpenAI API Configuration
    const openai = new OpenAI({
    organization: "org-3KoojXGycJQ1YL7x2rhQeRSN",
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      const { prompt, quality = 'standard', size = '1024*1024', style = 'vivid' } = req.body;
      const response = await openai.images.generate({
        model: "dall-e-3",
          size,
          quality,
          style,
          prompt,
          n: 1,
      });
    
      const image_url = response.data[0].url;
      let urls = [{
            id: generateObjectId(),
            url: image_url,
            iterations: [],
            prompt
        }]
    return res.json({ s: true, url: urls });
    } catch (error) {
      console.error("Error during Image generation:", error);
      res
        .status(500)
        .json({ error: "An error occurred during Image generation." });
    }
  };

  export async function getDalleUrl(data = {}) {
    // OpenAI API Configuration
    const openai = new OpenAI({
    organization: "org-3KoojXGycJQ1YL7x2rhQeRSN",
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log({ data })
    try {
      const { prompt, quality = 'standard', size = '1024x1024', style = 'vivid', originalPrompt = '' } = data;
      const response = await openai.images.generate({ model: "dall-e-3", size, quality, style, prompt, n: 1 });
      console.log({ response: response.data })
      const image_url = response.data[0].url;
      let urls = [{
            id: generateObjectId(),
            url: image_url,
            iterations: [],
            prompt: originalPrompt,
            status: 'COMPLETE',
            model: 'GENERATION_2'
        }]
    return urls
    } catch (error) {
      console.error("Error during Image generation:", error);
      return [{ id: generateObjectId(), status: 'FAILED', model: 'GENERATION_2' }];
    }
  };
