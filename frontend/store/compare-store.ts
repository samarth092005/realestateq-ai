import { create } from "zustand";
import toast from "react-hot-toast";

export interface Property {
  id: string;
  title: string;
  city: string;
  location: string;
  price: number;
  bhk: number;
  area: number;
  imageUrl?: string;
  description?: string;
  createdAt?: string;
}

interface CompareState {
  selectedProperties: Property[];
  addToCompare: (property: Property) => void;
  removeFromCompare: (propertyId: string) => void;
  clearCompare: () => void;
  isCompared: (propertyId: string) => boolean;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  selectedProperties: [],

  addToCompare: (property) => {
    const { selectedProperties } = get();
    const isAlreadyAdded = selectedProperties.some((p) => p.id === property.id);

    if (isAlreadyAdded) {
      // Toggle logic: If already added, remove it
      get().removeFromCompare(property.id);
      return;
    }

    if (selectedProperties.length >= 2) {
      toast.error("Maximum of 2 properties allowed for comparison.");
      return;
    }

    set({ selectedProperties: [...selectedProperties, property] });
    toast.success("Added to Compare");
  },

  removeFromCompare: (propertyId) => {
    set({
      selectedProperties: get().selectedProperties.filter((p) => p.id !== propertyId),
    });
    toast.success("Removed from Compare");
  },

  clearCompare: () => {
    set({ selectedProperties: [] });
  },

  isCompared: (propertyId) => {
    return get().selectedProperties.some((p) => p.id === propertyId);
  },
}));
