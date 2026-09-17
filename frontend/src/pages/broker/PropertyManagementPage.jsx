import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, MoreVertical, Trash2, Eye } from "lucide-react";
import StatusPill from "../../components/broker/StatusPill";
import { getMyProperties, updatePropertyStatus, deleteProperty } from "../../services/broker.service";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Pending review", value: "pending_review" },
  { label: "Sold", value: "sold" },
  { label: "Rented", value: "rented" },
  { label: "Inactive", value: "inactive" },
];

export default function PropertyManagementPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchProperties = () => {
    setLoading(true);
    getMyProperties({ status: statusFilter || undefined })
      .then((res) => setProperties(res.data.data.properties))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleStatusChange = async (id, status) => {
    await updatePropertyStatus(id, status).catch(() => {});
    setOpenMenuId(null);
    fetchProperties();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing? This can't be undone.")) return;
    await deleteProperty(id).catch(() => {});
    setProperties((prev) => prev.filter((p) => p._id !== id));
  };

  const filtered = properties.filter((p) => p.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search your listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg bg-neutral-0 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          />
        </div>
        <Link
          to="/broker/properties/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary-900 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} /> List a property
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === f.value
                ? "bg-primary-900 text-white border-primary-900"
                : "bg-neutral-0 text-neutral-700 border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-neutral-200/60 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-200 rounded-xl">
          <p className="text-sm font-medium text-neutral-900">No listings yet</p>
          <p className="text-sm text-neutral-500 mt-1">Add your first property to start receiving leads.</p>
          <Link
            to="/broker/properties/new"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-primary-900 text-white text-sm font-medium hover:bg-primary-700"
          >
            <Plus size={16} /> List a property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((property) => (
            <div key={property._id} className="bg-neutral-0 border border-neutral-200 rounded-xl overflow-hidden group">
              <div className="relative h-40 bg-neutral-100">
                {property.coverImage ? (
                  <img src={property.coverImage} alt={property.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs">No image</div>
                )}
                <div className="absolute top-2 left-2">
                  <StatusPill status={property.status} />
                </div>
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === property._id ? null : property._id)}
                    className="w-8 h-8 rounded-full bg-neutral-0/90 flex items-center justify-center text-neutral-700 hover:bg-neutral-0"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenuId === property._id && (
                    <div className="absolute right-0 mt-1 w-44 bg-neutral-0 border border-neutral-200 rounded-lg shadow-lg py-1 z-10">
                      {["active", "inactive", "sold", "rented"].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(property._id, s)}
                          className="w-full text-left px-3 py-1.5 text-xs capitalize text-neutral-700 hover:bg-neutral-50"
                        >
                          Mark as {s}
                        </button>
                      ))}
                      <button
                        onClick={() => handleDelete(property._id)}
                        className="w-full flex items-center gap-1.5 text-left px-3 py-1.5 text-xs text-danger-600 hover:bg-danger-100/50"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-sm font-semibold text-neutral-900 truncate">{property.title}</h3>
                <p className="text-xs text-neutral-500 mt-0.5 truncate">{property.address?.city}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-semibold text-primary-900">
                    {property.price ? `₹${Number(property.price).toLocaleString("en-IN")}` : "—"}
                  </span>
                  <Link
                    to={`/broker/properties/${property._id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 hover:text-primary-900"
                  >
                    <Eye size={14} /> View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
