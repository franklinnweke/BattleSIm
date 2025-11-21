
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from '@google/genai';
import { Character, BattleResult } from '../types';

// Define schema explicitly to avoid runtime enum issues if any
const battleSchema = {
  type: Type.OBJECT,
  properties: {
    winnerId: { type: Type.STRING, description: "The ID of the character who won." },
    narrative: { type: Type.STRING, description: "A high-octane, 3-paragraph play-by-play of the battle action. Focus on specific moves, explosions, and speed." },
    winningMove: { type: Type.STRING, description: "The name of the final move or strategy that secured victory." },
    winnerQuote: { type: Type.STRING, description: "A short, badass 1-sentence victory quote from the winner." },
  },
  required: ["winnerId", "narrative", "winningMove", "winnerQuote"],
};

export const simulateBattle = async (char1: Character, char2: Character): Promise<Omit<BattleResult, 'id' | 'date' | 'loserId'>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // 1. Generate the Battle Outcome
  const prompt = `
    Simulate a DEATH BATTLE between ${char1.name} (from ${char1.anime}) and ${char2.name} (from ${char2.anime}).
    
    ${char1.name} Stats: Power ${char1.stats.power}, Speed ${char1.stats.speed}, INT ${char1.stats.intelligence}, STM ${char1.stats.stamina}
    ${char2.name} Stats: Power ${char2.stats.power}, Speed ${char2.stats.speed}, INT ${char2.stats.intelligence}, STM ${char2.stats.stamina}

    Analyze their fighting styles. Be creative. Random upsets are allowed if logic supports it (e.g., brains over brawn).
    The narrative should be cinematic, fast-paced, and violent (anime style).
    
    The winnerId MUST be exactly "${char1.id}" or "${char2.id}".
  `;

  try {
    const battleResponse: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: battleSchema,
        temperature: 0.9,
      },
    });

    const text = battleResponse.text;
    if (!text) throw new Error("No response from Gemini");
    const result = JSON.parse(text);

    // 2. Generate Victory Speech Audio (TTS)
    let audioBase64: string | undefined;
    try {
      const ttsResponse: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: result.winnerQuote }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { 
                voiceName: 'Puck'
              },
            },
          },
        },
      });
      
      audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (e) {
      console.warn("TTS generation failed, proceeding without audio", e);
    }

    return {
      winnerId: result.winnerId,
      narrative: result.narrative,
      winningMove: result.winningMove,
      winnerQuote: result.winnerQuote,
      audioBase64: audioBase64,
    };

  } catch (error) {
    console.error("Battle Simulation Error:", error);
    return {
      winnerId: char1.id,
      narrative: "The energy released by their clash destroyed the recording equipment! (API Error)",
      winningMove: "Unknown Technique",
      winnerQuote: "...",
    };
  }
};

export async function playAudio(base64String: string) {
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass({ sampleRate: 24000 });
        
        const binaryString = atob(base64String);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        const dataInt16 = new Int16Array(bytes.buffer);
        const frameCount = dataInt16.length;
        const buffer = audioContext.createBuffer(1, frameCount, 24000);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i] / 32768.0;
        }

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
    } catch (e) {
        console.error("Audio playback error", e);
    }
}
