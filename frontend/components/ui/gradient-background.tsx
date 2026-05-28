export function GradientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">

      {/* Top Glow */}
      <div
        className="absolute left-1/2 top-[-120px] h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0) 70%)",
        }}
      />

      {/* Bottom Right Glow */}
      <div
        className="absolute bottom-[-100px] right-[-100px] h-[400px] w-[400px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(148,163,184,0.14) 0%, rgba(148,163,184,0) 70%)",
        }}
      />

    </div>
  );
}