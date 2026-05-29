import Image from "next/image";

const properties = [
  {
    title: "Luxury Apartment",
    location: "Pune",
    price: "₹1.24 Cr",
    image: "/images/property-1.jpg",
  },
  {
    title: "Modern Villa",
    location: "Mumbai",
    price: "₹2.85 Cr",
    image: "/images/property-2.jpg",
  },
  {
    title: "Premium Residency",
    location: "Bangalore",
    price: "₹98 Lakh",
    image: "/images/property-3.jpg",
  },
];

export function FeaturedProperties() {
  return (
    <section className="mx-auto max-w-[1400px] px-8 py-28">

      <div className="mb-16 text-center">

        <div className="inline-flex rounded-full border border-border bg-muted px-4 py-1 text-sm text-muted-foreground">
          Featured Properties
        </div>

        <h2 className="mt-6 text-5xl font-bold tracking-tight">
          Discover Premium Real Estate Opportunities
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Explore curated properties enhanced with AI-powered valuation,
          investment scoring and market intelligence.
        </p>

      </div>

      <div className="grid gap-8 lg:grid-cols-3">

        {properties.map((property) => (
          <div
            key={property.title}
            className="group overflow-hidden rounded-[32px] border border-white/10 bg-card/60 transition-all duration-300 hover:-translate-y-2 hover:border-white/20 hover:shadow-2xl"
          >

            <Image
              src={property.image}
              alt={property.title}
              width={600}
              height={400}
              className="h-80 w-full object-cover transition duration-500 hover:scale-105"
            />

            <div className="p-6">

              <h3 className="text-2xl font-semibold">
                {property.title}
              </h3>

              <p className="mt-2 text-muted-foreground">
                {property.location}
              </p>

              <div className="mt-6 flex items-center justify-between">

                <span className="text-xl font-bold">
                  {property.price}
                </span>

                <span className="rounded-full border border-white/10 px-3 py-1 text-xs">
                  AI Verified
                </span>

              </div>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}