// Function to generate image prompt based on basePrompt and criteria
export function generateImagePrompt(basePrompt, criteria) {
    // Start with the base prompt
    let refinedPrompt = basePrompt;

    // Loop through each key-value pair in the criteria object
    for (const [key, value] of Object.entries(criteria)) {
        if (value) {
            // Add each criterion with a readable format
            refinedPrompt += `, ${key.toLowerCase()} should be ${value.toLowerCase()}`;
        }
    }

    return refinedPrompt;
}

// Recursive polling function for the second API call
export async function pollForFinalData(url) {
    const response = await apiCall(url, "GET");
console.log({ response })
    if (response.status === 'processing' || response.status === 'starting') {
        console.log('Still processing, polling again...');
        await new Promise(resolve => setTimeout(resolve, 500));  // Wait 2 seconds before retrying
        return pollForFinalData(url);  // Retry
    } else if (response.status === 'succeeded') {
        return response;  // Return the final result
    } else {
        throw new Error("Failed to complete processing");
    }
}

export function generateObjectId() {
    const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0'); // 4-byte timestamp
    const randomValue = Math.floor(Math.random() * 0xFFFFFFFFFFFF).toString(16).padStart(12, '0'); // 5-byte random value
    const counter = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0'); // 3-byte counter
    
    return timestamp + randomValue + counter;
}

// Reusable API call function
export async function apiCall(url, method, body = null) {
    try {
        const options = {
            method,
            headers: {
                "Authorization": `Bearer ${process.env.REPLICATE_API_TOKEN}`,
                "Content-Type": "application/json"
            }
        };

        if (body) options.body = JSON.stringify(body);

        const response = await fetch(url, options);
        return await response.json();

    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        throw new Error("API call failed");
    }
}