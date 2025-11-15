export default function PackageInfo({ pkg }) {
  return (
    <section className="panel panel-center">
      <h2>Package Info</h2>

      <div className="card current-status">
        <h3>Current Status</h3>
        <p>{pkg?.status || "Select a package from the list."}</p>
      </div>

      <div className="card history">
        <h3>History (status updates)</h3>
        <ul>
          <li>Created label</li>
          <li>Arrived at sorting facility</li>
          <li>Out for delivery</li>
          <li>Delivered</li>
        </ul>
      </div>
    </section>
  );
}
