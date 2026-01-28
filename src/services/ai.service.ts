import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../common/config';
import {
    ServiceUnavailableError,
    ValidationError,
} from '../common/errors/app.error';

interface AIHistoryPart {
    text: string;
}

interface AIHistoryItem {
    role: string;
    parts: AIHistoryPart[];
}

export class AIService {
    private genAI: GoogleGenerativeAI;

    private modelName: string;

    private history: AIHistoryItem[];

    constructor() {
        const apiKey = env.AI_API_KEY;
        if (!apiKey) {
            throw new ServiceUnavailableError(
                'GOOGLE_API_KEY is not configured'
            );
        }

        if (!env.AI_MODEL) {
            throw new ServiceUnavailableError('AI_MODEL is not configured');
        }

        if (!env.AI_PROMPT) {
            throw new ServiceUnavailableError('AI_PROMPT is not configured');
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.modelName = env.AI_MODEL;
        this.history = [
            {
                role: 'user',
                parts: [
                    {
                        text: env.AI_PROMPT,
                    },
                ],
            },
        ];
    }

    public async sendMessage(message: string) {
        if (!message || !message.trim()) {
            throw new ValidationError('Message is required');
        }

        try {
            const model = this.genAI.getGenerativeModel({
                model: this.modelName,
            });

            const chat = model.startChat({
                history: this.history,
            });

            const result = await chat.sendMessage(message);
            const responseText =
                typeof result.response?.text === 'function'
                    ? result.response.text()
                    : result.response?.candidates?.[0]?.content?.parts?.[0]
                          ?.text || '';

            return {
                response: responseText,
                result,
            };
        } catch (error) {
            throw new ServiceUnavailableError(
                'Failed to generate response from Handbook AI',
                error instanceof Error ? error.message : error
            );
        }
    }
}
