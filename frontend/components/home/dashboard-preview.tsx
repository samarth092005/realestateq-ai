export function DashboardPreview() {
    return (
        <section
  id="dashboard-preview"
  className="mx-auto max-w-[1400px] px-8 pb-32"
>

            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">

                {/* Top Bar */}
                <div className="flex items-center justify-between border-b border-border px-8 py-6">

                    <div>
                        <h2 className="text-2xl font-semibold">
                            Market Intelligence Dashboard
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            AI-powered property analytics overview
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-muted px-4 py-2 text-sm text-muted-foreground">
                        Pune Market • Live
                    </div>

                </div>

                {/* Dashboard Content */}
                <div className="grid gap-8 p-8 lg:grid-cols-3">

                    {/* Left Analytics */}
                    <div className="space-y-6 lg:col-span-2">

                        {/* Chart Mock */}
                        <div className="rounded-2xl border border-border bg-background p-6">

                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="font-medium">
                                    Property Price Trends
                                </h3>

                                <span className="text-sm text-muted-foreground">
                                    Last 6 Months
                                </span>
                            </div>

                            <div className="flex h-80 items-end gap-4">

                                <div className="h-[35%] w-full rounded-t-xl bg-muted"></div>
                                <div className="h-[45%] w-full rounded-t-xl bg-muted"></div>
                                <div className="h-[52%] w-full rounded-t-xl bg-muted"></div>
                                <div className="h-[60%] w-full rounded-t-xl bg-muted"></div>
                                <div className="h-[72%] w-full rounded-t-xl bg-foreground/80"></div>
                                <div className="h-[85%] w-full rounded-t-xl bg-foreground"></div>

                            </div>

                        </div>

                        {/* Bottom Cards */}
                        <div className="grid gap-6 md:grid-cols-2">

                            <div className="rounded-2xl border border-border bg-background p-6">
                                <p className="text-sm text-muted-foreground">
                                    AI Predicted Growth
                                </p>

                                <h3 className="mt-3 text-4xl font-bold">
                                    +18.4%
                                </h3>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    Expected property growth in Baner region
                                </p>
                            </div>

                            <div className="rounded-2xl border border-border bg-background p-6">
                                <p className="text-sm text-muted-foreground">
                                    Investment Score
                                </p>

                                <h3 className="mt-3 text-3xl font-bold">
                                    8.7/10
                                </h3>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    High ROI potential detected by AI engine
                                </p>
                            </div>

                        </div>

                    </div>

                    {/* Right Insights Panel */}
                    <div className="rounded-2xl border border-border bg-background p-6">

                        <h3 className="text-lg font-semibold">
                            AI Insights
                        </h3>

                        <div className="mt-6 space-y-6">

                            <div className="rounded-2xl bg-muted p-5">
                                <p className="text-sm">
                                    Baner shows strong investment growth due to rising demand and infrastructure expansion.
                                </p>
                            </div>

                            <div className="rounded-2xl bg-muted p-5">
                                <p className="text-sm">
                                    3BHK premium properties are outperforming market averages this quarter.
                                </p>
                            </div>

                            <div className="rounded-2xl bg-muted p-5">
                                <p className="text-sm">
                                    AI model predicts continued appreciation in high-connectivity zones.
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}