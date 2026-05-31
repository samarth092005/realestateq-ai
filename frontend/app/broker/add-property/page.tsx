"use client";

import { useState } from "react";
import { addProperty, uploadPropertyImage } from "@/services/property";
import { auth } from "@/lib/firebase";
import { RoleProtectedRoute } from "@/components/auth/role-protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { BackToDashboard } from "@/components/layout/back-to-dashboard";
import toast from "react-hot-toast";

export default function AddPropertyPage() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [bhk, setBhk] = useState("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Verify image-only uploads
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Please select a JPG, PNG, or WEBP image.");
        e.target.value = ""; // clear input
        setImageFile(null);
        setImagePreview("");
        return;
      }

      // 2. Verify file size restrictions (10MB)
      const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSizeInBytes) {
        toast.error("File size is too large. Maximum allowed size is 10MB.");
        e.target.value = ""; // clear input
        setImageFile(null);
        setImagePreview("");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success("Image selected successfully!");
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Property title is required");
      return;
    }

    if (!city.trim()) {
      toast.error("City is required");
      return;
    }

    if (Number(price) <= 0) {
      toast.error("Enter valid price");
      return;
    }

    if (Number(bhk) <= 0) {
      toast.error("Enter valid BHK");
      return;
    }

    if (Number(area) <= 0) {
      toast.error("Enter valid area");
      return;
    }

    if (!imageFile) {
      toast.error("Please select and upload an image file first");
      return;
    }

    try {
      setLoading(true);

      // 1. Upload file if exists
      setUploadingImage(true);
      const imageUrl = await uploadPropertyImage(imageFile);
      setUploadingImage(false);

      // 2. Save property to Firestore
      await addProperty({
        title: title.trim(),
        price: Number(price),
        city: city.trim(),
        location: location.trim(),
        bhk: Number(bhk),
        area: Number(area),
        description: description.trim(),
        imageUrl,
        brokerId: auth.currentUser?.uid,
        createdAt: new Date().toISOString(),
      });

      toast.success("Property Added Successfully! 🏢");

      setTitle("");
      setPrice("");
      setCity("");
      setLocation("");
      setBhk("");
      setArea("");
      setDescription("");
      setImageFile(null);
      setImagePreview("");

    } catch (error: any) {
      console.error(error);
      toast.error(`Failed to add property: ${error.message || "Unknown error occurred"}`);
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  return (
    <RoleProtectedRoute allowedRole="broker">
      <DashboardLayout role="broker">
        <main className="mx-auto max-w-3xl">
          <BackToDashboard />

          <div className="rounded-[32px] border border-white/10 bg-card/60 p-8 backdrop-blur-xl">

            <h1 className="text-4xl font-bold">
              Add New Property
            </h1>

            <p className="mt-2 text-muted-foreground">
              Create and publish a new property listing.
            </p>

            <div className="mt-10 space-y-8">

              {/* BASIC INFO */}
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  Basic Information
                </h2>
                <label htmlFor="prop-title" className="sr-only">Property Title</label>
                <input
                  id="prop-title"
                  placeholder="Property Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-background p-4"
                />
              </div>

              {/* PROPERTY DETAILS */}
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  Property Details
                </h2>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label htmlFor="prop-price" className="sr-only">Price (INR)</label>
                    <input
                      id="prop-price"
                      placeholder="Price (INR)"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-background p-4"
                    />
                  </div>

                  <div>
                    <label htmlFor="prop-bhk" className="sr-only">BHK</label>
                    <input
                      id="prop-bhk"
                      placeholder="BHK"
                      value={bhk}
                      onChange={(e) => setBhk(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-background p-4"
                    />
                  </div>

                  <div>
                    <label htmlFor="prop-area" className="sr-only">Area (sq ft)</label>
                    <input
                      id="prop-area"
                      placeholder="Area (sq ft)"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-background p-4"
                    />
                  </div>
                </div>
              </div>

              {/* LOCATION */}
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  Location
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="prop-city" className="sr-only">City</label>
                    <input
                      id="prop-city"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-background p-4"
                    />
                  </div>

                  <div>
                    <label htmlFor="prop-location" className="sr-only">Location</label>
                    <input
                      id="prop-location"
                      placeholder="Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-background p-4"
                    />
                  </div>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  Description
                </h2>
                <label htmlFor="prop-description" className="sr-only">Property Description</label>
                <textarea
                  id="prop-description"
                  placeholder="Property Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-background p-4"
                />
              </div>

              {/* MEDIA */}
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  Property Image Upload
                </h2>

                <div className="flex flex-col gap-4">
                  <label htmlFor="prop-image" className="flex flex-col items-center justify-center border border-dashed border-white/20 rounded-2xl p-8 bg-background/50 hover:bg-background/80 transition cursor-pointer">
                    <span className="text-sm font-medium text-muted-foreground">
                      {imageFile ? imageFile.name : "Click to select property image"}
                    </span>
                    <span className="text-xs text-muted-foreground/60 mt-1">
                      Supports JPG, PNG, WEBP files (Max 10MB)
                    </span>
                    <input
                      id="prop-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {imagePreview && (
                    <div className="relative h-56 w-full rounded-2xl overflow-hidden border border-white/10 bg-black/20 mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                disabled={loading}
                onClick={handleSubmit}
                className="w-full rounded-2xl bg-foreground py-4 font-semibold text-background transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {loading
                  ? uploadingImage
                    ? "Uploading Image..."
                    : "Saving Property..."
                  : "Add Property"}
              </button>

            </div>

          </div>

        </main>
      </DashboardLayout>
    </RoleProtectedRoute>
  );
}