import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import fluxRoutes from './routes/flux.js';

const app = express();
app.use(cors());
app.use(express.json())
dotenv.config();

app.get('/', (req, res) => res.json('Hey, from my AePI'))

app.use('/v1', fluxRoutes)

app.listen(5001, () => console.log(' API listening on port 5001'))



// app.get('/flux', async (req, res) => {
//     const agent = new https.Agent({ rejectUnauthorized: false });
//     const replicate = new Replicate({
//         fetchOptions: { agent } // Pass custom agent to bypass SSL validation
//     });

//     const input = {
//         prompt: "black forest gateau cake spelling out the words \"FLUX SCHNELL\", tasty, food photography, dynamic shot"
//     };
//     try {
//         const output = await replicate.run("black-forest-labs/flux-schnell", { input });
//         console.log(output);
//         return res.json(output);
//     } catch (error) {
//         console.error("Error calling Replicate API:", error);
//         return res.status(500).json({ error: "Failed to generate image" });
//     }
//     // const output = await replicate.run("black-forest-labs/flux-schnell", { input });
//     // console.log(output)
//     // return res.json('Hey, from my API')
// })

