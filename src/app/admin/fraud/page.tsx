import { prisma } from "@/lib/prisma";
import { detectFraudAlerts } from "@/lib/fraud";

export default async function AdminFraudPage() {
  const alerts = await detectFraudAlerts(100).catch(() => []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">不正検知</h1>
      <p className="mb-6 text-sm text-muted">同一IP・高頻度ガチャなどの自動検知結果です。</p>
      {alerts.length === 0 ? (
        <div className="card-surface p-8 text-center text-muted">現在アラートはありません</div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a, i) => (
            <div
              key={`${a.userId}-${a.type}-${i}`}
              className={`card-surface p-4 ${
                a.severity === "high" ? "border-danger/40" : a.severity === "medium" ? "border-gold/30" : ""
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold">{a.email}</p>
                  <p className="mt-1 text-sm text-muted">{a.message}</p>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    a.severity === "high"
                      ? "bg-danger/20 text-danger"
                      : a.severity === "medium"
                        ? "bg-gold/20 text-gold"
                        : "bg-bg-elevated"
                  }`}
                >
                  {a.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
