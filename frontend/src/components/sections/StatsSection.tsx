export default function StatsSection() {
  const stats = [
    {
      value: "$2.5B+",
      label: "Total Volume Traded",
    },
    {
      value: "50K+",
      label: "Active Traders",
    },
    {
      value: "4",
      label: "Cryptocurrencies",
    },
  ];

  return (
    <section className="py-20 px-4 bg-card">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
