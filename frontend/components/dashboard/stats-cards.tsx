export function StatsCards() {

  const stats = [
    {
      title: "Properties Analyzed",
      value: "12,480",
      change: "+18.2%",
    },
    {
      title: "AI Prediction Accuracy",
      value: "94%",
      change: "+4.3%",
    },
    {
      title: "Investment Opportunities",
      value: "248",
      change: "+12.7%",
    },
    {
      title: "Active Brokers",
      value: "350+",
      change: "+9.1%",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {stats.map((stat) => (
        <div
          key={stat.title}
          className="rounded-[28px] border border-white/10 bg-card/60 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20"
        >

          <p className="text-sm text-muted-foreground">
            {stat.title}
          </p>

          <div className="mt-4 flex items-end justify-between">

            <h2 className="text-4xl font-bold tracking-tight">
              {stat.value}
            </h2>

            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              {stat.change}
            </span>

          </div>

        </div>
      ))}

    </div>
  );
}