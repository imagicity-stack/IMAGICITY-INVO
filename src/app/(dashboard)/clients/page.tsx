const sampleClients = [
  {
    name: "Sunrise Retail",
    contact: "billing@sunrise.com",
    gst: "27AAQCS1234N1Z7",
    address: "Lower Parel, Mumbai",
  },
  {
    name: "Pixel Studios",
    contact: "finance@pixel.studio",
    gst: "29AAQCS6789A1Z3",
    address: "Indiranagar, Bengaluru",
  },
];

export default function ClientsPage() {
  return (
    <div className="card p-6 space-y-4">
      <div>
        <p className="text-sm uppercase text-gray-500">Clients</p>
        <h1 className="text-2xl font-semibold text-gray-900">CRM and compliance</h1>
        <p className="text-sm text-gray-600">Keep GSTIN, addresses, and billing contacts ready for invoice issuance.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sampleClients.map((client) => (
          <div key={client.name} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900">{client.name}</p>
                <p className="text-sm text-gray-600">{client.address}</p>
              </div>
              <span className="badge bg-brand-yellow text-gray-900">Active</span>
            </div>
            <p className="mt-2 text-sm text-gray-700">Contact: {client.contact}</p>
            <p className="text-sm text-gray-700">GSTIN: {client.gst}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
