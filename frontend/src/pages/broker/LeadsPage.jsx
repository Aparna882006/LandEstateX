import { useEffect, useState } from "react";
import { Phone, Mail, Clock, X, Send } from "lucide-react";
import { getMyLeads, updateLeadStatus, addLeadActivity } from "../../services/broker.service";

const COLUMNS = [
  { key: "new", label: "New", color: "border-t-info-600" },
  { key: "contacted", label: "Contacted", color: "border-t-neutral-500" },
  { key: "qualified", label: "Qualified", color: "border-t-primary-700" },
  { key: "negotiating", label: "Negotiating", color: "border-t-amber-600" },
  { key: "won", label: "Won", color: "border-t-success-600" },
  { key: "lost", label: "Lost", color: "border-t-danger-600" },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [noteText, setNoteText] = useState("");

  const fetchLeads = () => {
    setLoading(true);
    getMyLeads({ limit: 100 })
      .then((res) => setLeads(res.data.data.leads))
      .catch(() => setLeads([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleMove = async (leadId, newStatus) => {
    setLeads((prev) => prev.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l)));
    await updateLeadStatus(leadId, newStatus).catch(() => fetchLeads());
    if (selectedLead?._id === leadId) setSelectedLead((prev) => ({ ...prev, status: newStatus }));
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !selectedLead) return;
    const res = await addLeadActivity(selectedLead._id, "note", noteText).catch(() => null);
    if (res) {
      setSelectedLead(res.data.data);
      setNoteText("");
      fetchLeads();
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-neutral-500">Move a lead forward by picking a new stage from its card.</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-neutral-200/60 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {COLUMNS.map((col) => {
            const columnLeads = leads.filter((l) => l.status === col.key);
            return (
              <div key={col.key} className={`bg-neutral-50 border-t-4 ${col.color} rounded-lg`}>
                <div className="px-3 py-2.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-900">{col.label}</span>
                  <span className="text-xs text-neutral-500">{columnLeads.length}</span>
                </div>
                <div className="px-2 pb-2 space-y-2 min-h-[80px]">
                  {columnLeads.map((lead) => (
                    <button
                      key={lead._id}
                      onClick={() => setSelectedLead(lead)}
                      className="w-full text-left bg-neutral-0 border border-neutral-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                    >
                      <p className="text-sm font-medium text-neutral-900 truncate">{lead.buyer?.name || lead.buyerName}</p>
                      <p className="text-xs text-neutral-500 truncate mt-0.5">{lead.property?.title}</p>
                      {lead.priority === "high" && (
                        <span className="inline-block mt-1.5 text-[10px] font-semibold text-danger-600">HIGH PRIORITY</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lead detail drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-neutral-900/40" onClick={() => setSelectedLead(null)} />
          <div className="relative w-full max-w-md bg-neutral-0 h-full overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <h2 className="text-base font-semibold text-neutral-900">{selectedLead.buyer?.name || selectedLead.buyerName}</h2>
              <button onClick={() => setSelectedLead(null)} className="p-1.5 rounded-lg hover:bg-neutral-50">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Interested in</p>
                <p className="text-sm font-medium text-neutral-900">{selectedLead.property?.title}</p>
              </div>

              <div className="flex gap-4">
                {selectedLead.buyerPhone && (
                  <a href={`tel:${selectedLead.buyerPhone}`} className="inline-flex items-center gap-1.5 text-sm text-primary-700 hover:text-primary-900">
                    <Phone size={14} /> {selectedLead.buyerPhone}
                  </a>
                )}
                {selectedLead.buyerEmail && (
                  <a href={`mailto:${selectedLead.buyerEmail}`} className="inline-flex items-center gap-1.5 text-sm text-primary-700 hover:text-primary-900">
                    <Mail size={14} /> Email
                  </a>
                )}
              </div>

              {selectedLead.message && (
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Message</p>
                  <p className="text-sm text-neutral-700">{selectedLead.message}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-neutral-500 mb-2">Move to stage</p>
                <div className="flex flex-wrap gap-2">
                  {COLUMNS.map((col) => (
                    <button
                      key={col.key}
                      onClick={() => handleMove(selectedLead._id, col.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        selectedLead.status === col.key
                          ? "bg-primary-900 text-white border-primary-900"
                          : "bg-neutral-0 text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-neutral-500 mb-2 flex items-center gap-1"><Clock size={12} /> Activity</p>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {(selectedLead.activities || []).length === 0 ? (
                    <p className="text-xs text-neutral-500">No activity logged yet.</p>
                  ) : (
                    selectedLead.activities
                      .slice()
                      .reverse()
                      .map((a, idx) => (
                        <div key={idx} className="text-xs border-l-2 border-neutral-200 pl-2.5 py-0.5">
                          <span className="font-medium text-neutral-900 capitalize">{a.type}</span>
                          {a.note && <span className="text-neutral-500"> — {a.note}</span>}
                        </div>
                      ))
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-3 py-2 rounded-lg bg-primary-900 text-white hover:bg-primary-700"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
