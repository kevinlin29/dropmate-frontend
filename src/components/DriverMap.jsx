export default function DriverMap() {
  return (
    <section className="panel panel-right">
      <h2>Driver location (live)</h2>
      <p className="subtitle">
        In real app: fetch from database every 5s (demo) / 30s (prod).
      </p>

      <div className="card map-placeholder">
        <p>Map live location goes here</p>
      </div>
    </section>
  );
}
