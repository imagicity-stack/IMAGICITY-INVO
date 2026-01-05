export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <div className="card p-6">
        <p className="text-sm uppercase text-gray-500">Compliance</p>
        <h1 className="text-2xl font-semibold text-gray-900">GST (Rule 46) readiness</h1>
        <p className="text-sm text-gray-600">
          Populate GSTIN, place of supply, HSN/SAC, and tax breakdowns per line item. Toggle GST computations per document via the
          form component. For zero-rated exports, set GST rate to 0.
        </p>
      </div>
      <div className="card p-6">
        <h2 className="section-title">Role gating</h2>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-gray-700">
          <li>Only Firestore user documents with <code className="rounded bg-gray-100 px-1">role: "admin"</code> may access the dashboard.</li>
          <li>Inactive accounts (<code className="rounded bg-gray-100 px-1">active: false</code>) are automatically signed out.</li>
          <li>Extend roles by adding additional role strings and enforcing them in RequireAuth.</li>
        </ol>
      </div>
    </div>
  );
}
