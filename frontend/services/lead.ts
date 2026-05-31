import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

export interface BrokerLead {
  id?: string;
  propertyId: string;
  propertyTitle: string;
  brokerId: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  createdAt?: any;
  status?: string;
}

/**
 * Creates a new lead document in the 'brokerLeads' Firestore collection.
 */
export async function createBrokerLead(lead: Omit<BrokerLead, "createdAt" | "status">): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "brokerLeads"), {
      ...lead,
      createdAt: serverTimestamp(),
      status: "new",
    });
    return docRef.id;
  } catch (error) {
    console.error("Create Broker Lead Error:", error);
    throw error;
  }
}

/**
 * Retrieves all buyer inquiry leads addressed to a specific broker from Firestore.
 */
export async function getBrokerLeads(brokerId: string): Promise<BrokerLead[]> {
  try {
    const q = query(
      collection(db, "brokerLeads"),
      where("brokerId", "==", brokerId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BrokerLead[];
  } catch (error) {
    console.error("Get Broker Leads Error:", error);
    throw error;
  }
}

/**
 * Retrieves all buyer inquiry leads created by a specific user from Firestore.
 */
export async function getUserLeads(userId: string): Promise<BrokerLead[]> {
  try {
    const q = query(
      collection(db, "brokerLeads"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BrokerLead[];
  } catch (error) {
    console.error("Get User Leads Error:", error);
    throw error;
  }
}

