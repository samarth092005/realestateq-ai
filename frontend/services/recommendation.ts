import { getProperties, getPropertyById } from "./property";

export interface RecommendedProperty {
  id: string;
  title: string;
  city: string;
  location: string;
  price: number;
  bhk: number;
  area: number;
  imageUrl?: string;
  matchScore: number;
  matchPercentage: number;
  reasons: string[];
}

/**
 * Computes recommendation matches for a target property
 * @param propertyId Target property ID
 * @returns Top 3 recommended properties with match details
 */
export async function getRecommendedProperties(propertyId: string): Promise<RecommendedProperty[]> {
  try {
    const currentProperty = await getPropertyById(propertyId) as any;
    if (!currentProperty) {
      return [];
    }

    const allProperties = await getProperties() as any[];
    
    // Filter out the current property
    const candidates = allProperties.filter((p) => p.id !== propertyId);

    const scoredCandidates = candidates.map((candidate) => {
      let score = 0;
      const reasons: string[] = [];

      // 1. Same City (+5 points)
      const currentCity = currentProperty.city?.trim().toLowerCase();
      const candidateCity = candidate.city?.trim().toLowerCase();
      const isSameCity = currentCity && candidateCity && currentCity === candidateCity;
      if (isSameCity) {
        score += 5;
        reasons.push("Same city");
      }

      // 2. Same BHK (+3 points)
      const currentBhk = Number(currentProperty.bhk) || 0;
      const candidateBhk = Number(candidate.bhk) || 0;
      const isSameBhk = currentBhk > 0 && candidateBhk > 0 && currentBhk === candidateBhk;
      if (isSameBhk) {
        score += 3;
        reasons.push("Similar BHK");
      }

      // 3. Price Difference <= 20% (+2 points)
      const currentPrice = Number(currentProperty.price) || 0;
      const candidatePrice = Number(candidate.price) || 0;
      let isSimilarBudget = false;
      if (currentPrice > 0) {
        const pricePercentDiff = Math.abs(currentPrice - candidatePrice) / currentPrice;
        isSimilarBudget = pricePercentDiff <= 0.20;
        if (isSimilarBudget) {
          score += 2;
          reasons.push("Similar budget");
        }
      }

      // 4. Area Difference <= 300 sq ft (+1 point)
      const currentArea = Number(currentProperty.area) || 0;
      const candidateArea = Number(candidate.area) || 0;
      const isSimilarSize = Math.abs(currentArea - candidateArea) <= 300;
      if (isSimilarSize) {
        score += 1;
        reasons.push("Similar size");
      }

      // 5. General Profile Match check
      if (score >= 5) {
        reasons.push("Similar investment profile");
      }

      // If no other reasons were added but they have a low score, show basic description
      if (reasons.length === 0) {
        reasons.push("Residential properties");
      }

      const matchPercentage = Math.round((score / 11) * 100);

      return {
        id: candidate.id,
        title: candidate.title,
        city: candidate.city,
        location: candidate.location,
        price: candidate.price,
        bhk: candidate.bhk,
        area: candidate.area,
        imageUrl: candidate.imageUrl,
        matchScore: score,
        matchPercentage,
        reasons,
      };
    });

    // Sort by match score descending and take the top 3
    return scoredCandidates
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);
  } catch (error) {
    console.error("Failed to get recommended properties:", error);
    return [];
  }
}
