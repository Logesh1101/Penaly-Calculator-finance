import React, { useEffect, useState, useRef } from "react";

export default function PenaltyCalculator() {
  const [loanStartDisplay, setLoanStartDisplay] = useState<string>(""); // DD/MM/YYYY
  const [duesCleared, setDuesCleared] = useState<string>("");
  const [clearingToday, setClearingToday] = useState<string>("");
  const [penaltyRate, setPenaltyRate] = useState<string>("5");
  const [result, setResult] = useState<null | {
    penalties: { due: string; daysLate: number; penalty: number }[];
    totalPenalty: number;
  }>(null);

  const datePickerRef = useRef<HTMLInputElement | null>(null);

  function displayToISO(display: string): string {
    // DD/MM/YYYY -> YYYY-MM-DD
    const digits = display.replace(/[^0-9]/g, "");
    if (digits.length !== 8) return "";
    const dd = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    const yyyy = digits.slice(4, 8);
    return `${yyyy}-${mm}-${dd}`;
  }

  function isoToDisplay(iso: string): string {
    // YYYY-MM-DD -> DD/MM/YYYY
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return "";
    return `${m[3]}/${m[2]}/${m[1]}`;
  }

  function parseDisplayToDate(display: string): Date | null {
    const iso = displayToISO(display);
    if (!iso) return null;
    const d = new Date(iso);
    return isNaN(+d) ? null : d;
  }

  function formatDisplayInput(raw: string): string {
    // Keep digits, insert slashes after 2 and 4, clamp length to 10
    const digits = raw.replace(/[^0-9]/g, "").slice(0, 8);
    const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
    return parts.join("/");
  }

  function handleLoanStartChange(value: string) {
    const formatted = formatDisplayInput(value);
    setLoanStartDisplay(formatted);
  }

  function calculatePenalty() {
    const duesClearedNum = Number(duesCleared || 0);
    const clearingTodayNum = Number(clearingToday || 0);
    const penaltyRateNum = Number(penaltyRate || 0);

    const startDate = parseDisplayToDate(loanStartDisplay);

    if (!startDate || clearingTodayNum <= 0) {
      alert("Enter a valid start date and number of dues being cleared today!");
      return;
    }

    const today = new Date();

    const allDues: Date[] = [];
    const checkDate = new Date(startDate);
    while (true) {
      checkDate.setMonth(checkDate.getMonth() + 1);
      if (checkDate <= today) {
        allDues.push(new Date(checkDate));
      } else {
        break;
      }
    }

    const unpaidDues = Math.max(allDues.length - duesClearedNum, 0);
    const duesToClear = Math.min(clearingTodayNum, unpaidDues);

    const penalties: { due: string; daysLate: number; penalty: number }[] = [];
    let totalPenalty = 0;

    for (let i = 0; i < duesToClear; i++) {
      const dueIndex = duesClearedNum + i;
      const dueDate = allDues[dueIndex];
      if (!dueDate) continue;

      const daysLate = Math.floor((+today - +dueDate) / (1000 * 60 * 60 * 24));
      const penalty = daysLate > 0 ? daysLate * penaltyRateNum : 0;

      penalties.push({
        due: dueDate.toDateString(),
        daysLate,
        penalty,
      });
      totalPenalty += penalty;
    }

    setResult({ penalties, totalPenalty });
  }

  useEffect(() => {
    if (loanStartDisplay !== "" && duesCleared !== "" && clearingToday !== "") {
      calculatePenalty();
    }
  }, [loanStartDisplay, duesCleared, clearingToday, penaltyRate]);

  const headerBarStyle: React.CSSProperties = {
    width: "100%",
    background: "#FAF9F6",
    color: "#16a34a",
    padding: "14px 16px",
    fontWeight: 800,
    letterSpacing: 0.5,
    textAlign: "center",
    fontSize: 22,
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    padding: "18px",
    borderRadius: 16,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    width: "100%",
    maxWidth: 460,
    fontFamily: "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  };

  const labelStyle: React.CSSProperties = { fontWeight: 600, color: "#1f2937" };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: 12,
    background: "#f9fafb",
    fontSize: 16,
    marginTop: 6,
    outline: "none",
  };

  const sectionStyle: React.CSSProperties = { display: "grid", gap: 14 };

  return (
    <div
      style={{
        minHeight: "100svh",
        background: "#FAF9F6",
      }}
    >
      <div style={headerBarStyle}>wisebook.</div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: 16,
        }}
      >
        <div style={cardStyle}>
          <h2 style={{ textAlign: "center", color: "#0f172a", margin: "6px 0 14px" }}>
            Penalty Calculator
          </h2>

          <div style={sectionStyle}>
            <div>
              <label style={labelStyle}>Loan Start Date</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="DD/MM/YYYY"
                  value={loanStartDisplay}
                  onChange={(e) => handleLoanStartChange(e.target.value)}
                  style={{ ...inputStyle, paddingRight: 48 }}
                />
                <button
                  type="button"
                  aria-label="Open calendar"
                  onClick={() => {
                    const el = datePickerRef.current;
                    if (el && (el as any).showPicker) {
                      try { (el as any).showPicker(); } catch { el.click(); }
                    } else if (el) {
                      el.click();
                    }
                  }}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    padding: 6,
                    cursor: "pointer",
                    color: "#334155",
                    fontSize: 18,
                  }}
                >
                  📅
                </button>
                <input
                  ref={datePickerRef}
                  type="date"
                  value={displayToISO(loanStartDisplay)}
                  onChange={(e) => setLoanStartDisplay(isoToDisplay(e.target.value))}
                  style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
                  tabIndex={-1}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Dues already cleared</label>
              <input
                type="number"
                inputMode="numeric"
                value={duesCleared}
                onChange={(e) => setDuesCleared(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Dues clearing today</label>
              <input
                type="number"
                inputMode="numeric"
                value={clearingToday}
                onChange={(e) => setClearingToday(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Penalty per day (₹)</label>
              <input
                type="tel"
                inputMode="decimal"
                value={penaltyRate}
                onFocus={(e) => {
                  const input = e.currentTarget as HTMLInputElement;
                  const len = input.value.length;
                  try {
                    input.setSelectionRange(len, len);
                  } catch {}
                }}
                onChange={(e) => setPenaltyRate(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {!result && (
            <div
              style={{
                marginTop: 18,
                background: "#f8fafc",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 16,
                color: "#475569",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                Calculate Your Penalty
              </div>
              <div style={{ marginTop: 6, fontSize: 14 }}>
                Enter details above and tap Calculate to see total penalty and
                a breakdown per due.
              </div>
            </div>
          )}

          {result && (
            <div style={{ marginTop: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontWeight: 700, color: "#0f172a" }}>Total Penalty</span>
                <span style={{ fontWeight: 800, color: "#0f172a" }}>₹ {result.totalPenalty.toLocaleString()}</span>
              </div>
              <div
                style={{
                  maxHeight: 300,
                  overflowY: "auto",
                  borderTop: "1px solid #e5e7eb",
                  paddingTop: 10,
                }}
              >
                {result.penalties.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: "1px dashed #e5e7eb",
                      fontSize: 14,
                    }}
                  >
                    <div>
                      <div style={{ color: "#111827", fontWeight: 700 }}>{p.due}</div>
                      <div style={{ color: "#6b7280" }}>{p.daysLate} days late</div>
                    </div>
                    <div style={{ fontWeight: 800 }}>₹ {p.penalty.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
