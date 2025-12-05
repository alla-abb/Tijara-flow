export enum AppStep {
  UPLOAD = 0,
  VISUAL_ENGINE = 1,
  DERJA_COPYWRITER = 2,
  SOUG_ANALYST = 3,
  AUTO_DESIGN = 4
}

export type Language = 'en' | 'fr' | 'ar';

export interface MarketData {
  averagePrice: string;
  recommendation: string;
  details: string;
  sources: Array<{
    title: string;
    uri: string;
  }>;
}

export interface ProductInfo {
  name: string;
  category: string;
  tags: string[];
}

export enum ImageAspectRatio {
  SQUARE = "1:1",
  PORTRAIT = "3:4",
  LANDSCAPE = "4:3",
  WIDE = "16:9",
  STORY = "9:16"
}

export enum ImageSize {
  K1 = "1K",
  K2 = "2K",
  K4 = "4K"
}
