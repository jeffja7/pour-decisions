export type Category = "wine" | "beer" | "cocktails";

export interface CategoryPreferences {
  description: string;
  anchors: string[];
}

export interface TasteProfile {
  categories: Partial<Record<Category, CategoryPreferences>>;
  extractedPreferences: {
    wine: {
      styles: string[];
      grapes: string[];
      regions: string[];
      attributes: string[];
    };
    beer: {
      styles: string[];
      breweries: string[];
      attributes: string[];
    };
    cocktails: {
      styles: string[];
      spirits: string[];
      attributes: string[];
    };
  };
}

export interface Recommendation {
  item: string;
  confidence: number;
  reason: string;
  adventureLevel: "comfort" | "stretch" | "adventure";
}

export interface RecommendationResponse {
  menuItems: string[];
  topPicks: Recommendation[];
  adventurePick: {
    item: string;
    reason: string;
  };
}

export interface FeedbackEntry {
  item: string;
  rating: "up" | "down" | "skip";
  timestamp: number;
  menuType: "wine" | "beer" | "cocktails" | "unknown";
}

export interface ScanHistoryEntry {
  id: string;
  timestamp: number;
  menuType: "wine" | "beer" | "cocktails" | "unknown";
  recommendations: RecommendationResponse;
  feedback: FeedbackEntry[];
}
