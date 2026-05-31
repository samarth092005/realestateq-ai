"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { getUserProfile } from "@/services/auth";
import { getSavedProperties } from "@/services/property";
import { RoleProtectedRoute } from "@/components/auth/role-protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function UserProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Preference fields state
  const [preferredCity, setPreferredCity] = useState("Pune");
  const [preferredBhk, setPreferredBhk] = useState("2");
  const [preferredCategory, setPreferredCategory] = useState("Residential");

  // Profile Edit fields state
  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch complete profile from Firestore
          const profileData = await getUserProfile(user.uid);
          setProfile(profileData);

          // Populate preferences if they exist in firestore
          if (profileData) {
            if (profileData.preferredCity) setPreferredCity(profileData.preferredCity);
            if (profileData.preferredBhk) setPreferredBhk(profileData.preferredBhk);
            if (profileData.preferredCategory) setPreferredCategory(profileData.preferredCategory);
            
            // Populate profile fields
            setName(profileData.name || "");
            setPhotoURL(profileData.photoURL || "");
            setPhoneNumber(profileData.phoneNumber || "");
          }

          // Fetch saved properties count
          const savedList = await getSavedProperties(user.uid);
          setSavedCount(savedList.length);
        } catch (error) {
          console.error("Failed to load user profile stats:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    setSavingProfile(true);
    try {
      // 1. Update Firebase Auth Profile
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photoURL || null,
      });

      // 2. Update Firestore Doc
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        name,
        photoURL,
        phoneNumber,
      });

      // 3. Update local state
      setProfile((prev: any) => ({
        ...prev,
        name,
        photoURL,
        phoneNumber,
      }));

      toast.success("Profile details updated successfully! ❤️");
    } catch (error) {
      console.error("Failed to update profile details:", error);
      toast.error("Failed to save profile details");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!auth.currentUser) return;
    setSavingPrefs(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        preferredCity,
        preferredBhk,
        preferredCategory,
      });
      toast.success("Property interests updated successfully! ❤️");
    } catch (error) {
      console.error("Failed to update preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setSavingPrefs(false);
    }
  };

  if (loading) {
    return (
      <RoleProtectedRoute allowedRole="user">
        <DashboardLayout role="user">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent"></div>
          </div>
        </DashboardLayout>
      </RoleProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <RoleProtectedRoute allowedRole="user">
        <DashboardLayout role="user">
          <div className="text-center py-20">
            <h3 className="text-xl font-bold">Failed to load user profile</h3>
            <p className="text-muted-foreground mt-2 text-sm">Please refresh the page or try logging in again.</p>
          </div>
        </DashboardLayout>
      </RoleProtectedRoute>
    );
  }

  // Calculate dynamic investment activity score
  const baseScore = 70;
  const computedScore = Math.min(100, baseScore + savedCount * 5);
  const providerId = auth.currentUser?.providerData[0]?.providerId || "password";
  const authProvider = providerId === "google.com" ? "Google Single Sign-On" : "Email & Password";
  const formattedJoinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "May 2026";

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <RoleProtectedRoute allowedRole="user">
      <DashboardLayout role="user">
        <main className="mx-auto max-w-5xl space-y-8 pb-12">
          {/* HEADER SECTION */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Account Profile</h1>
            <p className="mt-2 text-muted-foreground">
              Review your credentials, dynamic performance summaries, and configure preferred property interests.
            </p>
          </div>

          {/* SECTION A - PROFILE HEADER CARD */}
          <div className="relative overflow-hidden rounded-[32px] border border-border bg-card/60 p-8 backdrop-blur-xl transition duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]"></div>
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-[100px]"></div>
            
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              {/* Avatar */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[24px] bg-gradient-to-tr from-blue-500 to-emerald-400 text-3xl font-bold text-slate-900 shadow-xl shadow-blue-500/10 overflow-hidden">
                {auth.currentUser?.photoURL ? (
                  <img
                    src={auth.currentUser.photoURL}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              {/* Bio details */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">{profile.name}</h2>
                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Platform Investor
                  </span>
                </div>
                <p className="text-muted-foreground">{profile.email}</p>
                <p className="text-xs text-muted-foreground">
                  🗓️ Member since {formattedJoinDate}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* SECTION B - ACCOUNT INFORMATION */}
            <div className="rounded-[32px] border border-border bg-card/40 p-8 backdrop-blur-xl">
              <h3 className="text-xl font-bold mb-6 text-foreground">Account Information</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Full Name</span>
                  <span className="font-semibold text-foreground">{profile.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Email Address</span>
                  <span className="font-semibold text-foreground">{profile.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">User Role</span>
                  <span className="font-semibold capitalize text-foreground">{profile.role}</span>
                </div>
                {profile.phoneNumber && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Phone Number</span>
                    <span className="font-semibold text-foreground">{profile.phoneNumber}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Account Created</span>
                  <span className="font-semibold text-foreground">
                    {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "May 30, 2026"}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 pt-2">
                  <span className="text-muted-foreground">User ID</span>
                  <span className="font-mono text-xs text-muted-foreground bg-muted/50 rounded-xl p-3 border border-border break-all select-all">
                    {profile.uid}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION E - ACCOUNT STATUS */}
            <div className="rounded-[32px] border border-border bg-card/40 p-8 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-6 text-foreground">Account Status & Security</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Status</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      Active Account
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Email Verification</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${
                      auth.currentUser?.emailVerified 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    }`}>
                      {auth.currentUser?.emailVerified ? "Verified" : "Pending Verification"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Auth Provider</span>
                    <span className="font-semibold text-xs rounded-xl bg-muted border border-border px-3 py-1.5 text-foreground">
                      🔑 {authProvider}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-muted/40 border border-border p-4 text-xs text-muted-foreground flex items-start gap-3">
                <span className="text-base text-primary">🛡️</span>
                <p>
                  Security verification is handled securely by Firebase Authentication. Standard profile attributes can be verified inside the platform console.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION C - ACTIVITY SUMMARY */}
          <div className="rounded-[32px] border border-border bg-card/40 p-8 backdrop-blur-xl">
            <h3 className="text-xl font-bold mb-6 text-foreground">Real Estate Activity Summary</h3>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Stat 1 */}
              <div className="rounded-2xl border border-border bg-muted/30 p-5">
                <p className="text-xs text-muted-foreground">Saved Properties</p>
                <div className="mt-3 flex items-end justify-between">
                  <h4 className="text-3xl font-bold text-foreground">{savedCount}</h4>
                  <span className="text-xl">❤️</span>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="rounded-2xl border border-border bg-muted/30 p-5">
                <p className="text-xs text-muted-foreground">Market Inquiries</p>
                <div className="mt-3 flex items-end justify-between">
                  <h4 className="text-3xl font-bold text-foreground">3</h4>
                  <span className="text-xl">📞</span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="rounded-2xl border border-border bg-muted/30 p-5">
                <p className="text-xs text-muted-foreground">Analyzed Listings</p>
                <div className="mt-3 flex items-end justify-between">
                  <h4 className="text-3xl font-bold text-foreground">14</h4>
                  <span className="text-xl">👁️</span>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="rounded-2xl border border-border bg-muted/30 p-5">
                <p className="text-xs text-muted-foreground">Activity Score</p>
                <div className="mt-3 flex items-end justify-between">
                  <h4 className="text-3xl font-bold text-foreground">{computedScore}%</h4>
                  <span className="text-xl">🔥</span>
                </div>
              </div>
            </div>

            {/* Score Progress Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Investment Activity Rating</span>
                <span>{computedScore === 100 ? "Highly Active" : "Moderate Activity"}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${computedScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* EDIT PROFILE DETAILS CARD */}
          <div className="rounded-[32px] border border-border bg-card/60 p-8 backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">Edit Profile Details</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Update your display name, contact phone number, and avatar photo.
                </p>
              </div>
              <button
                disabled={savingProfile}
                onClick={handleSaveProfile}
                className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-xs font-semibold text-white transition hover:bg-primary/95 active:scale-95 disabled:opacity-50 shadow-md shadow-primary/10"
              >
                {savingProfile ? "Saving Profile..." : "Save Profile Details"}
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <label htmlFor="profile-name" className="text-xs text-muted-foreground">Full Name</label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="rounded-2xl border border-border bg-background/50 p-4 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="profile-photo" className="text-xs text-muted-foreground">Avatar Photo URL</label>
                <input
                  id="profile-photo"
                  type="text"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="Enter photo URL"
                  className="rounded-2xl border border-border bg-background/50 p-4 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="profile-phone" className="text-xs text-muted-foreground">Phone Number</label>
                <input
                  id="profile-phone"
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className="rounded-2xl border border-border bg-background/50 p-4 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>

          {/* SECTION D - INTERACTIVE PROPERTY INTERESTS */}
          <div className="rounded-[32px] border border-border bg-card/60 p-8 backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">Property Interests & Filters</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Customize your preferences to power your dynamic recommendations algorithm.
                </p>
              </div>
              <button
                disabled={savingPrefs}
                onClick={handleSavePreferences}
                className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-xs font-semibold text-white transition hover:bg-primary/95 active:scale-95 disabled:opacity-50 shadow-md shadow-primary/10"
              >
                {savingPrefs ? "Saving Interests..." : "Save Preferences"}
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <label htmlFor="pref-city" className="text-xs text-muted-foreground">Preferred City</label>
                <select
                  id="pref-city"
                  value={preferredCity}
                  onChange={(e) => setPreferredCity(e.target.value)}
                  className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
                >
                  <option value="Pune">Pune</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="pref-bhk" className="text-xs text-muted-foreground">Preferred Configuration</label>
                <select
                  id="pref-bhk"
                  value={preferredBhk}
                  onChange={(e) => setPreferredBhk(e.target.value)}
                  className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
                >
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK+</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="pref-category" className="text-xs text-muted-foreground">Investment Category</label>
                <select
                  id="pref-category"
                  value={preferredCategory}
                  onChange={(e) => setPreferredCategory(e.target.value)}
                  className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
                >
                  <option value="Residential">Residential Space</option>
                  <option value="Commercial">Commercial/Offices</option>
                  <option value="Luxury">Luxury Estates</option>
                </select>
              </div>
            </div>
          </div>
        </main>
      </DashboardLayout>
    </RoleProtectedRoute>
  );
}
