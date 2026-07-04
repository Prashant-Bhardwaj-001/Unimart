import { useState, useEffect } from "react";
import axios from "axios";

const ALERTS_BASE = "http://localhost:5000/api/alerts"; 

function Alerts() {
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTab, setLoadingTab] = useState(false);
  const [activeTab, setActiveTab] = useState("low-stock");

  const [summary, setSummary] = useState({
    lowStockCount: 0,
    expiringCount: 0,
    outOfStockCount: 0,
    pendingPOCount: 0
  });

  const [tableData, setTableData] = useState([]);

  const token = localStorage.getItem("token");
  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchAlertSummary = async () => {
    try {
      setLoadingSummary(true);
      const res = await axios.get(`${ALERTS_BASE}/summary`, getAuthConfig());
      setSummary(res.data.data || { lowStockCount: 0, expiringCount: 0, outOfStockCount: 0, pendingPOCount: 0 });
      setLoadingSummary(false);
    } catch (err) {
      console.error("Failed to load counter metrics summary:", err);
      setLoadingSummary(false);
    }
  };

  const fetchTabDetails = async (tabName) => {
    try {
      setLoadingTab(true);
      setTableData([]);
      const res = await axios.get(`${ALERTS_BASE}/${tabName}`, getAuthConfig());
      setTableData(res.data.data || []);
      setLoadingTab(false);
    } catch (err) {
      console.error(`Failed to load ledger stream for tab: ${tabName}`, err);
      setLoadingTab(false);
    }
  };

  useEffect(() => {
    fetchAlertSummary();
    fetchTabDetails(activeTab);
  }, []);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    fetchTabDetails(tabKey);
  };

  return (
    <div style={pageWrapper}>
      <div style={headerContainer}>
        <h2 style={mainTitle}>⚠️ Inventory Watchdog</h2>
        <p style={subTitle}>Real-time warehouse threshold alerts and procurement lifecycle tracking.</p>
      </div>

      {/* TOP KPI BANNER ROW */}
      <div style={kpiGridRow}>
        <KpiCard active={activeTab === "low-stock"} onClick={() => handleTabChange("low-stock")} label="📉 Low Stock" count={loadingSummary ? "..." : summary.lowStockCount} color="#d97706" />
        <KpiCard active={activeTab === "out-of-stock"} onClick={() => handleTabChange("out-of-stock")} label="🚨 Out of Stock" count={loadingSummary ? "..." : summary.outOfStockCount} color="#dc2626" />
        <KpiCard active={activeTab === "expiring"} onClick={() => handleTabChange("expiring")} label="⏳ Expiry Risk" count={loadingSummary ? "..." : summary.expiringCount} color="#ef4444" />
        <KpiCard active={activeTab === "reorder"} onClick={() => handleTabChange("reorder")} label="🤖 Reorder AI" count={loadingSummary ? "..." : "Analyze"} color="#2563eb" />
        <div style={{ ...kpiCardStyle, cursor: "default", background: "#f8fafc" }}>
          <span style={cardLabelStyle}>📦 Open POs</span>
          <h2 style={{ color: "#475569", margin: "8px 0 0 0", fontSize: "20px" }}>{loadingSummary ? "..." : `${summary.pendingPOCount} Staged`}</h2>
        </div>
      </div>

      {/* MAIN DATA WORKSPACE */}
      <div style={workspaceContainer}>
        <div style={tabSwitcherRow}>
          <TabButton active={activeTab === "low-stock"} onClick={() => handleTabChange("low-stock")} text="Low Stock Items" />
          <TabButton active={activeTab === "out-of-stock"} onClick={() => handleTabChange("out-of-stock")} text="Out of Stock List" />
          <TabButton active={activeTab === "expiring"} onClick={() => handleTabChange("expiring")} text="Near Expiry Batch" />
          <TabButton active={activeTab === "reorder"} onClick={() => handleTabChange("reorder")} text="Automated Reorder" />
        </div>

        {loadingTab ? (
          <div style={emptyStateWrap}>🔄 Synchronizing warehouse nodes...</div>
        ) : tableData.length === 0 ? (
          <div style={emptyStateWrap}>✅ All systems nominal. No alerts found.</div>
        ) : (
          <table style={dataTableStyle}>
            <thead>
              <tr style={tableHeaderRow}>
                <th style={thStyle}>Product Details</th>
                <th style={thStyle}>Stock Metrics</th>
                <th style={thStyle}>Supplier Matrix</th>
                {activeTab === "expiring" && <th style={thStyle}>Expiry Timeline</th>}
                {activeTab === "reorder" && <th style={thStyle}>Replenishment Plan</th>}
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, idx) => {
                const isReorder = activeTab === "reorder";
                return (
                  <tr key={item._id || idx} style={tableBodyRow}>
                    <td style={tdStyle}>
                      <div style={cellProductName}>{isReorder ? item.productName : item.name}</div>
                      <div style={cellProductMeta}>SKU: {isReorder ? "AUTO_GEN" : item.sku}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={stockBadge(item.stockQuantity === 0)}>
                        Level: {isReorder ? item.currentStock : item.stockQuantity}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={cellSupplierName}>{item.supplier?.companyName || "N/A"}</div>
                    </td>
                    {activeTab === "expiring" && (
                      <td style={tdStyle}>
                        <div style={cellExpiryDate}>📅 {new Date(item.expiryDate).toLocaleDateString()}</div>
                      </td>
                    )}
                    {isReorder && (
                      <td style={tdStyle}>
                        <div style={cellReorderPlan}>📦 Order: +{item.suggestedOrderQty} units</div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// REFINED UI COMPONENT ARCHITECTURE
// =========================================================================

function KpiCard({ label, count, color, onClick, active }) {
  return (
    <div onClick={onClick} style={{ ...kpiCardStyle, borderBottom: active ? `4px solid ${color}` : "1px solid #edf2f7" }}>
      <span style={cardLabelStyle}>{label}</span>
      <h2 style={{ color: color, margin: "8px 0 0 0", fontSize: "20px" }}>{count}</h2>
    </div>
  );
}

function TabButton({ active, onClick, text }) {
  return (
    <button onClick={onClick} style={active ? activeTabBtn : inactiveTabBtn}>
      {text}
    </button>
  );
}

// =========================================================================
// SINGLE-LINE CSS PROPERTY MATRICES
// =========================================================================

const pageWrapper = { padding: "32px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" };
const headerContainer = { marginBottom: "28px" };
const mainTitle = { margin: "0 0 4px 0", color: "#0f172a", fontSize: "24px", fontWeight: "800" };
const subTitle = { color: "#64748b", margin: 0, fontSize: "14px" };
const kpiGridRow = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px", marginBottom: "32px" };
const kpiCardStyle = { background: "white", padding: "20px", borderRadius: "14px", border: "1px solid #edf2f7", cursor: "pointer", transition: "all 0.2s" };
const cardLabelStyle = { fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" };
const workspaceContainer = { background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" };
const tabSwitcherRow = { display: "flex", gap: "12px", borderBottom: "2px solid #f8fafc", paddingBottom: "16px", marginBottom: "20px" };
const activeTabBtn = { padding: "8px 16px", background: "#0f172a", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "13px" };
const inactiveTabBtn = { padding: "8px 16px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "13px" };
const dataTableStyle = { width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" };
const tableHeaderRow = { background: "#f8fafc", textAlign: "left" };
const thStyle = { padding: "16px 12px", color: "#64748b", fontSize: "12px", fontWeight: "800", textTransform: "uppercase" };
const tableBodyRow = { background: "#ffffff", borderBottom: "1px solid #f1f5f9" };
const tdStyle = { padding: "16px 12px", verticalAlign: "middle" };
const cellProductName = { fontWeight: "700", color: "#0f172a", fontSize: "14px" };
const cellProductMeta = { fontSize: "11px", color: "#94a3b8", marginTop: "2px", fontFamily: "monospace" };
const stockBadge = (isZero) => ({ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", display: "inline-block", background: isZero ? "#fee2e2" : "#fef3c7", color: isZero ? "#dc2626" : "#d97706" });
const cellSupplierName = { fontWeight: "500", color: "#334155", fontSize: "13px" };
const cellExpiryDate = { color: "#ef4444", fontWeight: "600", fontSize: "13px" };
const cellReorderPlan = { color: "#2563eb", fontWeight: "700", fontSize: "13px" };
const emptyStateWrap = { textAlign: "center", color: "#94a3b8", padding: "60px 0", fontSize: "14px", fontStyle: "italic" };

export default Alerts;