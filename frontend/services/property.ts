import {
  addDoc,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Upload Image to Cloudinary (Hardened)
export async function uploadPropertyImage(
  file: File
): Promise<string> {
  try {
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!preset || !cloudName) {
      throw new Error("Cloudinary credentials are not configured on the server. Please verify NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET and NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your environment setup.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Remote Cloudinary upload rejected the image.");
    }

    return data.secure_url;
  } catch (error: any) {
    console.error("Upload Image Error:", error);
    throw new Error(error.message || "Failed to communicate with image upload provider.");
  }
}

// Add New Property
export async function addProperty(property: any) {
  try {
    const docRef = await addDoc(
      collection(db, "properties"),
      property
    );
    return docRef.id;
  } catch (error) {
    console.error("Add Property Error:", error);
    throw error;
  }
}

// Fetch All Properties
export async function getProperties() {
  try {
    const snapshot = await getDocs(
      collection(db, "properties")
    );
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Get Properties Error:", error);
    throw error;
  }
}

// Fetch Property by ID
export async function getPropertyById(id: string) {
  try {
    const snapshot = await getDoc(
      doc(db, "properties", id)
    );
    if (!snapshot.exists()) {
      return null;
    }
    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Save Property Reference to Firestore
export async function saveProperty(userId: string, propertyId: string): Promise<void> {
  try {
    const isSaved = await checkIfPropertySaved(userId, propertyId);
    if (isSaved) return; // Prevent duplicate saves

    await addDoc(collection(db, "savedProperties"), {
      userId,
      propertyId,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Save Property Error:", error);
    throw error;
  }
}

// Unsave / Remove Property Reference
export async function unsaveProperty(userId: string, propertyId: string): Promise<void> {
  try {
    const q = query(
      collection(db, "savedProperties"),
      where("userId", "==", userId),
      where("propertyId", "==", propertyId)
    );
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Unsave Property Error:", error);
    throw error;
  }
}

// Check if a property is already saved by the user
export async function checkIfPropertySaved(userId: string, propertyId: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, "savedProperties"),
      where("userId", "==", userId),
      where("propertyId", "==", propertyId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Check If Property Saved Error:", error);
    return false;
  }
}

// Fetch All Saved Properties for User
export async function getSavedProperties(userId: string): Promise<any[]> {
  try {
    const q = query(
      collection(db, "savedProperties"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const savedRefs = snapshot.docs.map((doc) => doc.data());

    const propertiesList: any[] = [];
    for (const ref of savedRefs) {
      const propDoc = await getDoc(doc(db, "properties", ref.propertyId));
      if (propDoc.exists()) {
        propertiesList.push({
          id: propDoc.id,
          ...propDoc.data(),
        });
      }
    }
    return propertiesList;
  } catch (error) {
    console.error("Get Saved Properties Error:", error);
    throw error;
  }
}

// Fetch properties owned by specific broker
export async function getBrokerProperties(brokerId: string): Promise<any[]> {
  try {
    const q = query(
      collection(db, "properties"),
      where("brokerId", "==", brokerId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Get Broker Properties Error:", error);
    throw error;
  }
}

// Delete Property Listing
export async function deleteProperty(propertyId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "properties", propertyId));
  } catch (error) {
    console.error("Delete Property Error:", error);
    throw error;
  }
}