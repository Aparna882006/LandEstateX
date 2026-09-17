import { useEffect, useState } from "react";
import { RefreshCw, ShieldCheck, CheckCircle2, MessageCircleReply, Handshake, Star, AlertTriangle } from "lucide-react";
import TrustBadge from "../../components/broker/TrustBadge";
import { getMyTrustScore, recalculateTrustScore } from "../../services/broker.service";

const COMPONENTS = [
  { key: "verifiedIdentity", label: "Identity verification", max: 20, icon: CheckCircle2 },
  { key: "responseRate", label: "Response rate", max: 20, icon: MessageCircleReply },
  { key: "dealSuccessRate", label: "Deal success rate", max: 25, icon: Handshake },
  { key: "reviewScore", label: "Customer reviews", max: 25, icon: Star },
  { key: "fraudFlagsPenalty", label: "Fraud flags", max: 0, min: -20, icon: AlertTriangle },
];

export default function TrustScorePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const fetchScore = () => {
    setLoading(true);
    getMyTrustScore()
      .then((res) => setData(res.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchScore();
  }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    await recalculateTrustScore().catch(() => {});
    await fetchScore();
    setRecalculating(false);
  };

  if (loading) {
    return <div className="h-64 bg-neutral-200/60 rounded-xl animate-pulse" />;
  }

  if (!data) {
    return <p className="text-sm text-danger-600">Couldn't load your trust score.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-neutral-0 border border-neutral-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">Overall trust score</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-4xl font-semibold text-neutral-900">{data.trustScore}</span>
            <span className="text-neutral-500">/ 100</span>
            <TrustBadge tier={data.trustBadge} />
          </div>
          {data.lastCalculatedAt && (
            <p className="text-xs text-neutral-500 mt-2">
              Last updated {new Date(data.lastCalculatedAt).toLocaleString()}
            </p>
          )}
        </div>
        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
        >
          <RefreshCw size={15} className={recalculating ? "animate-spin" : ""} />
          {recalculating ? "Recalculating..." : "Recalculate now"}
        </button>
      </div>

      <div className="bg-neutral-0 border border-neutral-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary-700" /> Score breakdown
        </h2>
        <div className="space-y-5">
          {COMPONENTS.map(({ key, label, max, min = 0, icon: Icon }) => {
            const value = data.breakdown?.[key] || 0;
            const range = max - min;
            const pct = range > 0 ? ((value - min) / range) * 100 : 0;
            return (
              <div key={key}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="inline-flex items-center gap-2 text-neutral-700 font-medium">
                    <Icon size={15} className="text-neutral-500" /> {label}
                  </span>
                  <span className="text-neutral-500">
                    {value} / {max || min}
                  </span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${value < 0 ? "bg-danger-600" : "bg-primary-700"}`}
                    style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-primary-100/40 border border-primary-200 rounded-xl p-5">
        <p className="text-sm text-primary-900 font-medium">How this is calculated</p>
        <p className="text-sm text-neutral-700 mt-1">
          Your score updates automatically as leads convert and new reviews come in. Verified identity and license
          checks are set once your documents are approved by our team. Recalculate manually any time to see the
          latest number reflected immediately.
        </p>
      </div>
    </div>
  );
}
