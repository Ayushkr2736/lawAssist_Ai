import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("Missing GEMINI_API_KEY in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export async function askAI(messages: ChatMessage[]): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // Extract system prompt if present
        const systemMessage = messages.find((m) => m.role === "system");
        let prompt = "";

        if (systemMessage) {
            prompt += `System Instruction:\n${systemMessage.content}\n\n`;
        }

        // Convert conversation to a clearly formatted prompt string
        prompt += messages
            .filter((m) => m.role !== "system")
            .map((m) => {
                const role = m.role === "user" ? "User" : "Assistant";
                return `${role}: ${m.content}`;
            })
            .join("\n\n");

        // Add a final "Assistant:" to cue the model
        prompt += "\n\nAssistant:";

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error calling Gemini AI:", error);
        throw new Error("Failed to generate response from Gemini AI");
    }
}
