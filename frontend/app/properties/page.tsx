"use client";

import { useEffect, useState } from "react";
import { getProperties, saveProperty, unsaveProperty, getSavedProperties } from "@/services/property";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";
import { BackToDashboard } from "@/components/layout/back-to-dashboard";
import { useCompareStore } from "@/store/compare-store";
import { calculateInvestmentScore, getRecommendation } from "@/utils/investment";

export default function PropertiesPage() {

    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [bhkFilter, setBhkFilter] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [minArea, setMinArea] = useState("");
    const [maxArea, setMaxArea] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    const [userId, setUserId] = useState<string | null>(null);

    const addToCompare = useCompareStore((state) => state.addToCompare);
    const isCompared = useCompareStore((state) => state.isCompared);

    const handleCompareToggle = (e: React.MouseEvent, property: any) => {
        e.preventDefault();
        e.stopPropagation();
        addToCompare(property);
    };

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            try {
                const data = await getProperties();
                setProperties(data);
            } catch (error) {
                console.error("Failed to fetch properties:", error);
                toast.error("Failed to retrieve property catalog details");
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();

    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                try {
                    const savedList = await getSavedProperties(user.uid);
                    const ids = new Set(savedList.map((p) => p.id));
                    setSavedIds(ids);
                } catch (e) {
                    console.error("Failed to load user saved properties:", e);
                }
            } else {
                setUserId(null);
                setSavedIds(new Set());
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSaveToggle = async (e: React.MouseEvent, propertyId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!userId) {
            toast.error("Please login to save properties");
            return;
        }

        const isCurrentlySaved = savedIds.has(propertyId);
        try {
            if (isCurrentlySaved) {
                await unsaveProperty(userId, propertyId);
                setSavedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(propertyId);
                    return next;
                });
                toast.success("Property unsaved");
            } else {
                await saveProperty(userId, propertyId);
                setSavedIds((prev) => {
                    const next = new Set(prev);
                    next.add(propertyId);
                    return next;
                });
                toast.success("Property saved! ❤️");
            }
        } catch (error) {
            console.error(error);
            toast.error("Action failed");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent"></div>
            </div>
        );
    }

    const uniqueCities = Array.from(
        new Set(
            properties
                .map((property) => property.city?.trim())
                .filter(Boolean)
        )
    ).sort();

    const filteredProperties = properties.filter((property) => {

        const matchesSearch =
            property.title?.toLowerCase().includes(search.toLowerCase()) ||
            property.city?.toLowerCase().includes(search.toLowerCase()) ||
            property.location?.toLowerCase().includes(search.toLowerCase());

        const matchesCity =
            cityFilter === "" ||
            property.city?.toLowerCase() ===
            cityFilter.toLowerCase()

        const matchesBhk =
            bhkFilter === "" ||
            Number(property.bhk) === Number(bhkFilter);

        const matchesPrice =
            (minPrice === "" || property.price >= Number(minPrice)) &&
            (maxPrice === "" || property.price <= Number(maxPrice));

        const matchesArea =
            (minArea === "" || property.area >= Number(minArea)) &&
            (maxArea === "" || property.area <= Number(maxArea));

        return (
            matchesSearch &&
            matchesCity &&
            matchesBhk &&
            matchesPrice &&
            matchesArea
        );
    });

    const sortedProperties = [...filteredProperties];
    if (sortBy === "price-low") {
        sortedProperties.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-high") {
        sortedProperties.sort((a, b) => b.price - a.price);
    }

    if (sortBy === "area-high") {
        sortedProperties.sort((a, b) => b.area - a.area);
    }

    if (sortBy === "newest") {
        sortedProperties.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );
    }




    return (


        <main className="mx-auto max-w-[1600px] px-8 py-10">

            <BackToDashboard />

            <div className="mb-10">

                <h1 className="text-5xl font-bold tracking-tight">
                    Find Properties With Confidence
                </h1>

                <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                    Discover properties enriched with investment intelligence,
                    market insights, and AI-powered analysis.
                </p>

            </div>
            <div className="mb-10 rounded-[32px] border border-border bg-card p-6 shadow-sm">

                <input
                    type="text"
                    placeholder="Search property, city or location..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mb-5 w-full rounded-2xl border border-border bg-background p-4 text-foreground focus:outline-none focus:border-primary/50 transition"
                />

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">

                    <select
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:border-primary/30 cursor-pointer"
                    >
                        <option value="" className="bg-card text-foreground">All Cities</option>
                        {uniqueCities.map((city) => (
                            <option key={city} value={city} className="bg-card text-foreground">
                                {city}
                            </option>
                        ))}
                    </select>

                    <select
                        value={bhkFilter}
                        onChange={(e) => setBhkFilter(e.target.value)}
                        className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:border-primary/30 cursor-pointer"
                    >
                        <option value="" className="bg-card text-foreground">All BHK</option>
                        <option value="1" className="bg-card text-foreground">1 BHK</option>
                        <option value="2" className="bg-card text-foreground">2 BHK</option>
                        <option value="3" className="bg-card text-foreground">3 BHK</option>
                        <option value="4" className="bg-card text-foreground">4 BHK</option>
                    </select>

                    <input
                        type="number"
                        placeholder="Min Price (₹)"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:border-primary/30"
                    />

                    <input
                        type="number"
                        placeholder="Max Price (₹)"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:border-primary/30"
                    />

                    <input
                        type="number"
                        placeholder="Min Area (sqft)"
                        value={minArea}
                        onChange={(e) => setMinArea(e.target.value)}
                        className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:border-primary/30"
                    />

                    <input
                        type="number"
                        placeholder="Max Area (sqft)"
                        value={maxArea}
                        onChange={(e) => setMaxArea(e.target.value)}
                        className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:border-primary/30"
                    />

                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-border pt-4">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full sm:w-60 rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:border-primary/30 cursor-pointer"
                    >
                        <option value="" className="bg-card text-foreground">Sort By</option>
                        <option value="price-low" className="bg-card text-foreground">Price: Low to High</option>
                        <option value="price-high" className="bg-card text-foreground">Price: High to Low</option>
                        <option value="area-high" className="bg-card text-foreground">Largest Area</option>
                        <option value="newest" className="bg-card text-foreground">Newest First</option>
                    </select>

                    {(minPrice || maxPrice || minArea || maxArea || cityFilter || bhkFilter) && (
                        <button
                            onClick={() => {
                                setMinPrice("");
                                setMaxPrice("");
                                setMinArea("");
                                setMaxArea("");
                                setCityFilter("");
                                setBhkFilter("");
                            }}
                            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer flex items-center gap-1 p-2 rounded-xl hover:bg-muted"
                        >
                            ✕ Clear All Filters
                        </button>
                    )}
                </div>

                <div className="mb-6 flex items-center justify-between">

                    <h2 className="text-xl font-semibold">
                        Available Properties
                    </h2>

                    <p className="text-muted-foreground">
                        {filteredProperties.length} Properties Found
                    </p>

                </div>


            </div>

            <div className="space-y-6">



                {sortedProperties.map((property) => {

                      const investmentScore = calculateInvestmentScore(property);
                      const recommendation = getRecommendation(investmentScore);

      return(

                    <Link
                        key={property.id}
                        href={`/property/${property.id}`}
                        className="group flex overflow-hidden rounded-[32px] border border-white/10 bg-card/60 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20"
                    >

                        {/* IMAGE */}

                        <div className="h-[260px] w-[400px] shrink-0 relative">

                            <img
                                src={
                                    property.imageUrl?.startsWith("http")
                                        ? property.imageUrl
                                        : "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80"
                                }
                                alt={property.title}
                                className="h-full w-full object-cover"
                            />

                            <button
                                onClick={(e) => handleSaveToggle(e, property.id)}
                                className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-black/40 border border-white/10 hover:bg-black/60 transition"
                            >
                                <span className={savedIds.has(property.id) ? "text-rose-500 text-lg" : "text-white text-lg"}>
                                    {savedIds.has(property.id) ? "❤️" : "🤍"}
                                </span>
                            </button>

                        </div>

                        {/* CONTENT */}

                        <div className="flex flex-1 flex-col justify-center p-8">

                            <h2 className="text-3xl font-bold">
                                {property.title}
                            </h2>

                            <p className="mt-2 text-muted-foreground">
                                📍 {property.location}, {property.city}
                            </p>

                            <p className="mt-5 text-3xl font-bold">
                                ₹ {property.price?.toLocaleString()}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-3">

                                <span className="rounded-full border border-border px-4 py-2 text-sm text-foreground">
                                    {property.bhk} BHK
                                </span>

                                <span className="rounded-full border border-border px-4 py-2 text-sm text-foreground">
                                    {property.area} sqft
                                </span>

                                <span className="rounded-full border border-border px-4 py-2 text-sm text-foreground">
                                    Residential
                                </span>
                                <span className="rounded-full border border-border px-4 py-2 text-sm text-foreground">
                                    Ready To Move
                                </span>

                            </div>

                            <div className="mt-5 flex items-center gap-3">

                                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                    ⭐ Score {investmentScore}
                                </span>


                                <span className="text-sm text-muted-foreground">
                                    {recommendation}
                                </span>

                            </div>

                             <div className="mt-auto pt-6 flex items-center justify-between">

                                <span className="font-medium text-foreground">
                                    View Details →
                                </span>

                                <button
                                    onClick={(e) => handleCompareToggle(e, property)}
                                    className={`rounded-xl px-4 py-2 text-xs font-semibold border transition ${
                                        isCompared(property.id)
                                            ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/35"
                                            : "bg-background text-foreground border-border hover:bg-muted"
                                    }`}
                                >
                                    {isCompared(property.id) ? "Selected" : "Compare"}
                                </button>

                            </div>

                        </div>

                 </Link>

      );
})}

</div>
                

        </main>
    );
}