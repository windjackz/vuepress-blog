export interface ChatResponse {
    audio: string;
    commands: Array<{
        commands: string;
        data: Record<string, any>;
    }>;
    emotions: {
        emotions: {
            "喜悦": string;
            "愤怒": string;
            "傲娇": string;
            "悲伤": string;
        }
    };
    text: string;
}