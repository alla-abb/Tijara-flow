import { GoogleGenAI, Type } from "@google/genai";
import { MarketData, ProductInfo, ImageAspectRatio, ImageSize, Language } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to convert File to Base64
 */
export const fileToGenericBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Step 1 Helper: Analyze the uploaded image to identify the product.
 * Uses gemini-3-pro-preview for high intelligence understanding.
 */
export const analyzeProductImage = async (base64Image: string): Promise<ProductInfo> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: "Identify the main product in this image. Return JSON with 'name', 'category', and a list of 5 descriptive 'tags' (e.g. color, material, brand)." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as ProductInfo;
  } catch (error) {
    console.error("Analysis Error:", error);
    return { name: "Product", category: "General", tags: ["Item"] };
  }
};

/**
 * Step 1: Visual Engine (Scene Hallucination)
 * Uses gemini-2.5-flash-image for editing/hallucinating new backgrounds.
 */
export const hallucinateScene = async (base64Image: string, vibePrompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: `Edit this image. Keep the main product exactly as is, but replace the background completely. Hallucinate a scene: ${vibePrompt}. Ensure the lighting matches the product.` }
        ]
      }
    });

    // Check for image part
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Scene Gen Error:", error);
    throw error;
  }
};

/**
 * Step 1 (Alternative): Generate Stock Reference
 * Uses gemini-2.5-flash-image (Nano Banana 2.5) for stock generation.
 * Note: gemini-2.5-flash-image does not support imageSize, only aspectRatio.
 */
export const generateHighQualityReference = async (
  prompt: string, 
  aspectRatio: ImageAspectRatio
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio
          // imageSize not supported on 2.5-flash-image
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No high-res image generated");
  } catch (error) {
    console.error("HQ Gen Error:", error);
    throw error;
  }
};

/**
 * Step 2: Derja-Copywriter
 * Uses gemini-3-pro-preview with THINKING to strategize the perfect Algerian ad.
 */
export const generateDerjaCaption = async (productInfo: ProductInfo, vibe: string, captionLang: string): Promise<string> => {
  try {
    const prompt = `
      You are an expert Algerian Social Media Manager and Copywriter.
      Product: ${productInfo.name} (${productInfo.category})
      Features: ${productInfo.tags.join(", ")}
      Vibe: ${vibe}
      Target Language: ${captionLang}

      Structure:
      1. Hook (Emojis + Urgency)
      2. Product Description (Engaging, persuasive)
      3. Call to Action (Order method, Delivery 58 wilayas)
      
      Use 3-4 emojis. Keep it punchy.
      IMPORTANT: Return PLAIN TEXT only. Do NOT use markdown formatting (no **, no #, no bullet points that are markdown syntax). Use simple dashes or newlines for lists. Do not wrap in quotes.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2048 },
      }
    });

    return response.text || "Error generating caption.";
  } catch (error) {
    console.error("Copywriting Error:", error);
    return "Error generating caption.";
  }
};

/**
 * Step 3: Soug-Analyst
 * Uses gemini-3-pro-preview with Google Search Grounding.
 * Intelligent fallback: uses internal knowledge if search results are sparse.
 */
export const analyzeMarket = async (productName: string, lang: Language): Promise<MarketData> => {
  try {
    const languageMap = {
      en: "English",
      fr: "French",
      ar: "Arabic (Modern Standard with slight Algerian context)"
    };

    const targetLang = languageMap[lang] || "English";

    const prompt = `
      You are an expert Algerian market analyst.
      Task: Determine the price range and sales strategy for "${productName}" in Algeria.
      
      1. First, try to find live prices on OuedKniss, Facebook Marketplace DZ, and Jumia DZ.
      2. If live data is scarce, use your internal knowledge of the Algerian market to estimate a realistic price range.
      
      Output Language: ${targetLang}
      
      Provide a summary in the following strict format (Plain Text, no Markdown):
      PRICE_RANGE: [Average price range in DZD]
      RECOMMENDATION: [One strategic sentence on pricing to sell fast]
      DETAILS: [2-3 sentences explaining the market situation, demand, and where it sells best. Be specific.]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "";
    
    // Manual Parsing with fallback for loose formatting
    const priceMatch = text.match(/PRICE_RANGE:\s*(.*)/i);
    const recMatch = text.match(/RECOMMENDATION:\s*(.*)/i);
    const detailsMatch = text.match(/DETAILS:\s*([\s\S]*)/i);

    // Clean up markdown markers if any slipped through
    const cleanText = (str: string) => str.replace(/\*\*/g, '').replace(/\[.*?\]/g, '').trim();

    const data = {
        averagePrice: priceMatch ? cleanText(priceMatch[1]) : "N/A",
        recommendation: recMatch ? cleanText(recMatch[1]) : "Analysis incomplete",
        details: detailsMatch ? cleanText(detailsMatch[1]) : cleanText(text)
    };

    // Extract grounding chunks for citations
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .filter((c: any) => c.web?.uri)
      .map((c: any) => ({
        title: c.web.title || "Source",
        uri: c.web.uri
      }));

    return {
      ...data,
      sources
    };
  } catch (error) {
    console.error("Market Analysis Error:", error);
    return {
      averagePrice: "Check OuedKniss",
      recommendation: "Manual verification recommended",
      details: "Could not retrieve automated data. Please check local listings manually.",
      sources: []
    };
  }
};
