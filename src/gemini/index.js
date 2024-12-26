import { GoogleGenerativeAI } from '@google/generative-ai';

async function generateComment(context, apiKey) {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Construct the prompt with context
        const prompt = {
            contents: [
            {
                role: 'user',
                parts: [
                {
                    text: `Based on this context, generate a concise and insightful comment suitable for posting on Bluesky:\n\n${JSON.stringify(
                    context
                    )}`,
                },
                ],
            },
            ],
        };

        const result = await model.generateContent(prompt);

        console.log('gemini returned comment', result.response.text());
        const comment = result.response.text();
        
        return comment;

    } catch (error) {
      console.error('Error generating Bluesky comment:', error);
      return null; // Or handle the error as needed
    }
}

export { generateComment };