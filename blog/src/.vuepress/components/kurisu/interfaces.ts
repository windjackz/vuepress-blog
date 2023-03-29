export interface ChatResponse {
    audio: string;
    commands: Array<{
        commands: { action: string; }
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
    tranlateText: string;
}

export interface UnknownMsg {
    cmd: string;
    content: string;
}
  

export interface MotionGroupEntry {
    name: string
    motions: {
        file: string;
        error?: any;
    }[]
}