export function InsightsPanel() {

  const insights = [
    {
      title: "Pune Market Growth",
      description:
        "AI predicts a 12% increase in property prices across Pune over the next quarter.",
    },
    {
      title: "Investment Hotspot",
      description:
        "Baner and Hinjewadi show the highest projected ROI for long-term investments.",
    },
    {
      title: "Broker Activity Surge",
      description:
        "Broker engagement has increased by 28% this month compared to previous trends.",
    },
  ];

  return (
    <section className="rounded-[32px] border border-white/10 bg-card/60 p-8 backdrop-blur-xl">

      <div className="mb-8">

        <h2 className="text-3xl font-bold tracking-tight">
          AI Market Insights
        </h2>

        <p className="mt-2 text-muted-foreground">
          Real-time intelligence generated from market analytics and AI models.
        </p>

      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {insights.map((insight) => (
          <div
            key={insight.title}
            className="rounded-3xl border border-white/10 bg-background/40 p-6 transition hover:border-white/20"
          >

            <h3 className="text-xl font-semibold">
              {insight.title}
            </h3>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {insight.description}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}