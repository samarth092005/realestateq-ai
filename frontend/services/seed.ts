import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs, addDoc } from "firebase/firestore";

/**
 * Automatically initializes dynamic Firestore config, stats and insights
 * if they are missing or not seeded yet. This is fully idempotent.
 */
export async function initFirestoreMetadata(): Promise<void> {
  try {
    // 1. Seed Config (City Intelligence)
    const configDocRef = doc(db, "config", "city_intelligence");
    const configSnapshot = await getDoc(configDocRef);
    if (!configSnapshot.exists()) {
      console.log("Seeding config/city_intelligence in Firestore...");
      await setDoc(configDocRef, {
        "Mumbai": {
          multiplier: 2.0,
          growthPotential: "High",
          rentalDemand: "High"
        },
        "Pune": {
          multiplier: 1.5,
          growthPotential: "High",
          rentalDemand: "High"
        },
        "Bangalore": {
          multiplier: 1.5,
          growthPotential: "High",
          rentalDemand: "High"
        },
        "Hyderabad": {
          multiplier: 1.4,
          growthPotential: "High",
          rentalDemand: "High"
        },
        "Delhi": {
          multiplier: 1.4,
          growthPotential: "High",
          rentalDemand: "Medium"
        }
      });
    }

    // 2. Seed Global Stats
    const statsDocRef = doc(db, "analytics", "global_stats");
    const statsSnapshot = await getDoc(statsDocRef);
    if (!statsSnapshot.exists()) {
      console.log("Seeding analytics/global_stats in Firestore...");
      await setDoc(statsDocRef, {
        propertiesAnalyzed: 12480,
        predictionAccuracy: 94,
        investmentOpportunities: 248,
        activeBrokers: 350
      });
    }

    // 3. Seed Market Insights Collection
    const insightsColRef = collection(db, "marketInsights");
    const insightsSnapshot = await getDocs(insightsColRef);
    if (insightsSnapshot.empty) {
      console.log("Seeding marketInsights collection in Firestore...");
      const defaultInsights = [
        {
          title: "Pune Market Growth",
          description: "AI predicts a 12% increase in property prices across Pune over the next quarter."
        },
        {
          title: "Investment Hotspot",
          description: "Baner and Hinjewadi show the highest projected ROI for long-term investments."
        },
        {
          title: "Broker Activity Surge",
          description: "Broker engagement has increased by 28% this month compared to previous trends."
        }
      ];

      for (const insight of defaultInsights) {
        await addDoc(insightsColRef, insight);
      }
    }

    console.log("Firestore metadata auto-initialization check completed successfully.");
  } catch (error) {
    console.error("Failed to auto-initialize Firestore metadata:", error);
  }
}
