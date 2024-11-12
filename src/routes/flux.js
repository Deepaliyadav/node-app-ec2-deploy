import express from 'express';
import { getFluxImage } from '../controllers/flux-controller.js';
import { removeBg, upscaleImage } from '../controllers/refine-controller.js';
import { getMidjourneyImage } from '../controllers/midjourney-controller.js';
import { generateImageIds, pollImageModels } from '../controllers/get-images/multiple-image-generator-controller.js';
import { getDalleImage } from '../controllers/dall-e-controller.js';

const router = express.Router()

// get Flux image
router.post("/getImage1", getFluxImage);
router.post("/upscale", upscaleImage);
router.post("/removeBg", removeBg);
router.post("/getImage2", getDalleImage)
router.post("/getImage3", getMidjourneyImage);

// Get multiple images by id
router.post("/getImages", generateImageIds);
router.post('/poll/images', pollImageModels);

// module.exports = router;
export default router;

