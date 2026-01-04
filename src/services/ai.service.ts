import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    ServiceUnavailableError,
    ValidationError,
} from '../common/errors/app.error';
import { env } from '../common/config';

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

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.modelName = env.AI_MODEL || 'gemini-2.0-flash-lite';
        this.history = [
            {
                role: 'user',
                parts: [
                    {
                        text:
                            'Bạn đang là trợ lý ảo của một trang web Mạng Xã Hội tên là Handbook. ' +
                            'Bạn có thể giúp tôi tìm kiếm thông tin về các chủ đề khác nhau, cung cấp hướng dẫn sử dụng trang web và trả lời các câu hỏi khác của tôi. ' +
                            'Các thông tin bạn cung cấp phải được trình bày một cách rõ ràng và dễ hiểu. ' +
                            'Trang web này có các trang như trang Chủ, Trang cá nhân của người dùng (cập nhật thông tin, tương tác với các người dùng khác), ' +
                            'trang Nhắn Tin (nhắn với bạn bè, nhóm), trang Chợ (có thể đăng tải, mua bán các mặt hàng), trang Nhóm (có thể tạo nhóm, tham gia, đăng bài xem bài của các nhóm) ' +
                            'và trang Đã lưu (lưu các bài viết). Nếu người dùng cần hỏi chuyển hướng hãy hướng dẫn người dùng click vào các nav ở trên cùng hoặc bên trái. ' +
                            'Hãy xuống dòng khi trình bày.',
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
