import { useState } from "react";
import { useFleetStore } from "../../store/useFleetStore";
import type { VehicleAlert } from "../../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ─── KPI card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  accent?: string;
}

function KpiCard({
  icon,
  value,
  label,
  accent = "var(--color-text-primary)",
}: KpiCardProps) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-3 flex-1"
      style={{ borderRight: "1px solid var(--color-surface-border)" }}
    >
      <span style={{ color: accent, opacity: 0.85 }}>{icon}</span>
      <div className="flex flex-col gap-0.5">
        <span
          className="text-2xl font-bold leading-none"
          style={{ color: accent, fontFamily: "var(--font-mono)" }}
        >
          {value}
        </span>
        <span
          className="text-xs uppercase tracking-wider"
          style={{ color: "var(--color-text-muted)" }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── Alert card ──────────────────────────────────────────────────────────────

interface AlertCardProps {
  alert: VehicleAlert;
  regNumber?: string;
  onAck: (id: string) => void;
}

function AlertCard({ alert, regNumber, onAck }: AlertCardProps) {
  const isCritical = alert.severity === "critical";
  const isWarning = alert.severity === "warning";

  const accentColor = isCritical
    ? "var(--color-critical)"
    : isWarning
      ? "var(--color-warning)"
      : "var(--color-info)";

  const bgColor = isCritical
    ? "var(--color-critical-bg)"
    : isWarning
      ? "var(--color-warning-bg)"
      : "var(--color-info-bg)";

  const severityLabel = isCritical ? "CRIT" : isWarning ? "WARN" : "INFO";

  return (
    <div
      className="flex flex-col justify-between shrink-0 px-3 py-2.5 rounded-md"
      style={{
        width: 240,
        background: bgColor,
        border: `1px solid ${accentColor}`,
        borderLeft: `3px solid ${accentColor}`,
        opacity: 0.95,
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Severity dot */}
          <span
            className="shrink-0 w-1.5 h-1.5 rounded-full"
            style={{ background: accentColor }}
          />
          {/* Vehicle + severity badge */}
          <span
            className="text-xs font-semibold truncate"
            style={{ color: accentColor, fontFamily: "var(--font-mono)" }}
          >
            {regNumber ?? alert.vehicle_id.slice(0, 8)}
          </span>
          <span
            className="shrink-0 text-xs font-bold px-1 rounded"
            style={{
              color: accentColor,
              background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
            }}
          >
            {severityLabel}
          </span>
        </div>
        <span
          className="text-xs shrink-0"
          style={{ color: "var(--color-text-muted)" }}
        >
          {relativeTime(alert.created_at)}
        </span>
      </div>

      {/* Message */}
      <p
        className="text-xs leading-snug mb-2.5"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {alert.message}
      </p>

      {/* ACK button */}
      <button
        onClick={() => onAck(alert.id)}
        className="self-end text-xs font-semibold px-2.5 py-1 rounded"
        style={{
          background: `color-mix(in srgb, ${accentColor} 20%, transparent)`,
          color: accentColor,
          border: `1px solid color-mix(in srgb, ${accentColor} 40%, transparent)`,
          cursor: "pointer",
          fontFamily: "var(--font-mono)",
        }}
      >
        ACK
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AlertStrip() {
  const vehicles = useFleetStore((s) => s.vehicles);
  const alerts = useFleetStore((s) => s.alerts);
  const [collapsed, setCollapsed] = useState(false);

  const total = vehicles.length;
  const active = vehicles.filter((v) => v.is_active).length;
  const needAttention = vehicles.filter(
    (v) => v.health_status === "warning" || v.health_status === "critical",
  ).length;
  // ongoing trips: vehicles that are active and have a non-null speed (rough proxy without a trips slice)
  const ongoingTrips = vehicles.filter(
    (v) => v.is_active && (v.current_speed ?? 0) > 0,
  ).length;

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const infoCount = alerts.filter(
    (a) => a.severity !== "critical" && a.severity !== "warning",
  ).length;

  // Build lookup: vehicleId → registration_number
  const regMap = Object.fromEntries(
    vehicles.map((v) => [v.id, v.registration_number]),
  );

  // Sort: critical first, then warning, then info; then by created_at desc
  const sortedAlerts = [...alerts].sort((a, b) => {
    const sev = { critical: 0, warning: 1 } as Record<string, number>;
    const as = sev[a.severity] ?? 2;
    const bs = sev[b.severity] ?? 2;
    if (as !== bs) return as - bs;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  function handleAck(_id: string) {
    // No-op for MVP — dismiss could update store or call Supabase
    // Kept intentionally minimal; wire to a real mutation when needed
  }

  return (
    <div
      style={{
        borderBottom: "1px solid var(--color-surface-border)",
        background: "var(--color-surface-1)",
      }}
    >
      {/* ── Row 1: KPI cards ── */}
      <div
        className="flex items-stretch"
        style={{ borderBottom: "1px solid var(--color-surface-border)" }}
      >
        <KpiCard
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </svg>
          }
          value={total}
          label="Total Vehicles"
        />
        <KpiCard
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
          value={active}
          label="Active"
          accent="var(--color-ok)"
        />
        <KpiCard
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          }
          value={needAttention}
          label="Need Attention"
          accent={
            needAttention > 0
              ? "var(--color-warning)"
              : "var(--color-text-primary)"
          }
        />
        <KpiCard
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          }
          value={ongoingTrips}
          label="Ongoing Trips"
          accent="var(--color-brand)"
        />

        {/* Collapse toggle + alert count pills */}
        {alerts.length > 0 && (
          <div
            className="flex items-center gap-2 px-4 ml-auto"
            style={{ borderLeft: "1px solid var(--color-surface-border)" }}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="text-xs font-semibold"
                style={{
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Alerts
              </span>
              {criticalCount > 0 && (
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{
                    background: "var(--color-critical-bg)",
                    color: "var(--color-critical)",
                    border: "1px solid var(--color-critical)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {criticalCount} CRIT
                </span>
              )}
              {warningCount > 0 && (
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{
                    background: "var(--color-warning-bg)",
                    color: "var(--color-warning)",
                    border: "1px solid var(--color-warning)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {warningCount} WARN
                </span>
              )}
              {infoCount > 0 && (
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{
                    background: "var(--color-info-bg)",
                    color: "var(--color-info)",
                    border: "1px solid var(--color-info)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {infoCount} INFO
                </span>
              )}
            </div>
            <button
              onClick={() => setCollapsed((c) => !c)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted)",
                padding: 4,
                display: "flex",
                alignItems: "center",
              }}
              title={collapsed ? "Expand alerts" : "Collapse alerts"}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              >
                <path
                  d="M3 6l5 5 5-5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ── Row 2: Alert cards ── */}
      {!collapsed && sortedAlerts.length > 0 && (
        <div
          className="flex items-stretch gap-2 px-3 py-2 overflow-x-auto scrollbar-thin"
          style={{ minHeight: 88 }}
        >
          {sortedAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              regNumber={regMap[alert.vehicle_id]}
              onAck={handleAck}
            />
          ))}
        </div>
      )}

      {/* ── Healthy state (no alerts) ── */}
      {sortedAlerts.length === 0 && (
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{ borderTop: "1px solid var(--color-surface-border)" }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--color-ok)" }}
          />
          <span className="text-xs" style={{ color: "var(--color-ok)" }}>
            All vehicles healthy
          </span>
        </div>
      )}
    </div>
  );
}
