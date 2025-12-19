export default function Loading() {
  return (
    <main className="app-loader" aria-busy="true" aria-live="polite">
      <div className="app-loader__title">Buff Launch</div>
      <img src="/images/logoBuff.png" alt="Buff Launch" className="app-loader__logo" />
    </main>
  );
}
