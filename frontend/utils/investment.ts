/**
 * Property Intelligence Calculations
 * Reuses and standardizes calculations across catalog, saved list, comparison, and details pages.
 */

export interface CityIntelligence {
  multiplier: number;
  growthPotential: "High" | "Medium" | "Low";
  rentalDemand: "High" | "Medium" | "Low";
}

export interface IntelligenceMetrics {
  investmentScore: number;
  recommendation: string;
  growthPotential: "High" | "Medium" | "Low";
  rentalPotential: "High" | "Medium" | "Low";
  riskLevel: "Low Risk" | "Medium Risk" | "High Risk";
}

/**
 * Calculates the investment score dynamically using config or hardcoded defaults.
 */
export function calculateInvestmentScore(
  property: {
    city?: string;
    area?: number;
    bhk?: number;
  },
  config?: Record<string, CityIntelligence>
): number {
  let score = 5;
  const city = property.city?.trim();
  const area = Number(property.area) || 0;
  const bhk = Number(property.bhk) || 0;

  let multiplier = 1.0;
  if (city) {
    if (config) {
      const matchedCity = Object.keys(config).find(
        (key) => key.toLowerCase() === city.toLowerCase()
      );
      if (matchedCity) {
        multiplier = config[matchedCity].multiplier ?? 1.0;
      }
    } else {
      const c = city.toLowerCase();
      if (c === "mumbai") {
        multiplier = 2.0;
      } else if (c === "pune" || c === "bangalore") {
        multiplier = 1.5;
      }
    }
  }

  score += multiplier;

  if (area >= 1500) {
    score += 1.5;
  } else if (area >= 1000) {
    score += 1.0;
  }

  if (bhk >= 3) {
    score += 1.0;
  }

  return Math.min(10, Number(score.toFixed(1)));
}

/**
 * Gets recommendation based on investment score.
 */
export function getRecommendation(score: number): string {
  if (score >= 8) {
    return "Strong Buy";
  } else if (score >= 6) {
    return "Good Opportunity";
  }
  return "Average";
}

/**
 * Returns growth potential. Mumbai, Pune, Bangalore -> High, Other -> Medium.
 * Uses config-driven growth potential if available.
 */
export function getGrowthPotential(
  city?: string,
  config?: Record<string, CityIntelligence>
): "High" | "Medium" | "Low" {
  if (city) {
    if (config) {
      const matchedCity = Object.keys(config).find(
        (key) => key.toLowerCase() === city.trim().toLowerCase()
      );
      if (matchedCity && config[matchedCity].growthPotential) {
        return config[matchedCity].growthPotential;
      }
    } else {
      const c = city.trim().toLowerCase();
      if (c === "mumbai" || c === "pune" || c === "bangalore") {
        return "High";
      }
    }
  }
  return "Medium";
}

/**
 * Returns rental potential. Area >= 1200 -> High, Area >= 800 -> Medium, Else -> Low.
 * Uses config-driven rental demand if available.
 */
export function getRentalPotential(
  area?: number,
  city?: string,
  config?: Record<string, CityIntelligence>
): "High" | "Medium" | "Low" {
  if (city && config) {
    const matchedCity = Object.keys(config).find(
      (key) => key.toLowerCase() === city.trim().toLowerCase()
    );
    if (matchedCity && config[matchedCity].rentalDemand) {
      return config[matchedCity].rentalDemand;
    }
  }

  const a = Number(area) || 0;
  if (a >= 1200) return "High";
  if (a >= 800) return "Medium";
  return "Low";
}

/**
 * Score >= 8 -> Low Risk, Score >= 6 -> Medium Risk, Else -> High Risk.
 */
export function getRiskLevel(score: number): "Low Risk" | "Medium Risk" | "High Risk" {
  if (score >= 8) return "Low Risk";
  if (score >= 6) return "Medium Risk";
  return "High Risk";
}

/**
 * Returns all intelligence metrics for a property.
 */
export function getPropertyIntelligence(
  property: {
    city?: string;
    area?: number;
    bhk?: number;
  },
  config?: Record<string, CityIntelligence>
): IntelligenceMetrics {
  const score = calculateInvestmentScore(property, config);
  return {
    investmentScore: score,
    recommendation: getRecommendation(score),
    growthPotential: getGrowthPotential(property.city, config),
    rentalPotential: getRentalPotential(property.area, property.city, config),
    riskLevel: getRiskLevel(score),
  };
}

/**
 * Generates an array of AI insights dynamically for a property.
 */
export function generatePropertyInsights(
  property: {
    city?: string;
    area?: number;
    bhk?: number;
    price?: number;
  },
  score?: number
): string[] {
  const insights: string[] = [];
  const finalScore = score !== undefined ? score : calculateInvestmentScore(property);

  // 1. Layout config
  if (property.bhk && Number(property.bhk) >= 3) {
    insights.push("Family-friendly configuration");
  } else {
    insights.push("Optimized space design");
  }

  // 2. Space utilization
  if (property.area && Number(property.area) > 1200) {
    insights.push("Spacious Living Environment");
  } else {
    insights.push("Good space utilization");
  }

  // 3. Investment Opportunity
  if (finalScore >= 8) {
    insights.push("Strong investment opportunity");
  } else if (finalScore >= 6) {
    insights.push("Good local development hotspot");
  } else {
    insights.push("Stable value appreciation potential");
  }

  // 4. Urban demand
  const city = property.city?.trim().toLowerCase();
  if (city === "mumbai" || city === "pune" || city === "bangalore" || city === "hyderabad" || city === "delhi") {
    insights.push("Strong local demand");
  } else {
    insights.push("Moderate submarket demand");
  }

  // 5. Pricing structure
  const price = Number(property.price) || 0;
  if (price >= 15000000) {
    insights.push("Luxury Market Position");
  } else {
    insights.push("Positive long-term outlook");
  }

  return insights;
}
