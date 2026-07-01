import { useState, useEffect } from "react";
import axios from "axios";

// ========================================================
// MATCHED: Staging exact endpoints from your alertController routes
// ========================================================
const ALERTS_BASE = "http://localhost:5000/api/alerts"; 

function Alerts() {
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTab, setLoadingTab] = useState(false);
  const [activeTab, setActiveTab] = useState("low-stock"); // Default view toggle

  // Summary Counter States Perfect Match with getAlertSummary
  const [summary, setSummary] = useState({
    lowStockCount: 0,
    expiringCount: 0,
    outOfStockCount: 0,
    pendingPOCount: 0
  });

  // Dynamic Array Grid View State
  const [tableData, setTableData] = useState([]);

  const token = localStorage.getItem("token");
  const getAuthConfig = () => ({
    headers: { 
      Authorization: `Bearer ${token}` 
    },
  });

  // 1. Fetch KPI Top Counters (Hits GET /summary)
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

  // 2. Fetch Active Tab List Data (Hits /low-stock, /out-of-stock, /expiring, ya /reorder)
  const fetchTabDetails = async (tabName) => {
    try {
      setLoadingTab(true);
      setTableData([]); // Flash clear existing row records
      const res = await axios.get(`${ALERTS_BASE}/${tabName}`, getAuthConfig());
      setTableData(res.data.data || []);
      setLoadingTab(false);
    } catch (err) {
      console.error(`Failed to load ledger stream for tab: ${tabName}`, err);
      setLoadingTab(false);
    }
  };

  // Initial Boot loader hook
  useEffect(() => {
    fetchAlertSummary();
    fetchTabDetails(activeTab);
  }, []);

  // Handler for explicit tab toggles
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    fetchTabDetails(tabKey);
  };

  return (
    <div style={{ 
      padding: "25px", 
      background: "#f4f6f9", 
      minHeight: "100vh", 
      fontFamily: "sans-serif" 
    }}>
      <h2 style={{ 
        margin: "0 0 5px 0", 
        color: "#0f172a" 
      }}>⚠️ Intelligent Inventory Watchdog Deck</h2>
      <p style={{ 
        color: "#64748b", 
        margin: "0 0 25px 0" 
      }}>Real-time warehouse threshold alerts, product shelf life tracking, and machine reorder recommendations.</p>

      {/* TOP KPI BANNER ROW */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "20px", 
        marginBottom: "30px" 
      }}>
        
        <div 
          onClick={() => handleTabChange("low-stock")}
          style={{ 
            ...kpiCardStyle, 
            borderBottom: activeTab === "low-stock" ? "4px solid #f59e0b" : "1px solid #edf2f7" 
          }}
        >
          <span style={cardLabelStyle}>📉 Low Stock Alert</span>
          <h2 style={{ 
            color: "#d97706", 
            margin: "8px 0 0 0" 
          }}>
            {loadingSummary ? "..." : `${summary.lowStockCount} SKUs`}
          </h2>
        </div>

        <div 
          onClick={() => handleTabChange("out-of-stock")}
          style={{ 
            ...kpiCardStyle, 
            borderBottom: activeTab === "out-of-stock" ? "4px solid #dc2626" : "1px solid #edf2f7" 
          }}
        >
          <span style={cardLabelStyle}>🚨 Completely Vacant</span>
          <h2 style={{ 
            color: "#dc2626", 
            margin: "8px 0 0 0" 
          }}>
            {loadingSummary ? "..." : `${summary.outOfStockCount} SKUs`}
          </h2>
        </div>

        <div 
          onClick={() => handleTabChange("expiring")}
          style={{ 
            ...kpiCardStyle, 
            borderBottom: activeTab === "expiring" ? "4px solid #ef4444" : "1px solid #edf2f7" 
          }}
        >
          <span style={cardLabelStyle}>⏳ Expiry Risk (30 Days)</span>
          <h2 style={{ 
            color: "#ef4444", 
            margin: "8px 0 0 0" 
          }}>
            {loadingSummary ? "..." : `${summary.expiringCount} items`}
          </h2>
        </div>

        <div 
          onClick={() => handleTabChange("reorder")}
          style={{ 
            ...kpiCardStyle, 
            borderBottom: activeTab === "reorder" ? "4px solid #2563eb" : "1px solid #edf2f7" 
          }}
        >
          <span style={cardLabelStyle}>🤖 Suggested Procurements</span>
          <h2 style={{ 
            color: "#2563eb", 
            margin: "8px 0 0 0" 
          }}>
            {loadingSummary ? "..." : "Review Now"}
          </h2>
        </div>

        <div style={{ 
          ...kpiCardStyle, 
          cursor: "default", 
          background: "#f8fafc" 
        }}>
          <span style={cardLabelStyle}>📦 Open Purchase Orders</span>
          <h2 style={{ 
            color: "#475569", 
            margin: "8px 0 0 0" 
          }}>
            {loadingSummary ? "..." : `${summary.pendingPOCount} Staged`}
          </h2>
        </div>

      </div>

      {/* SYSTEM OPERATIONS WORKSPACE BLOCKS */}
      <div style={{ 
        background: "white", 
        borderRadius: "12px", 
        padding: "20px", 
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)" 
      }}>
        
        {/* NAV SEGMENT CONTROLS */}
        <div style={{ 
          display: "flex", 
          gap: "10px", 
          borderBottom: "2px solid #f1f5f9", 
          paddingBottom: "15px", 
          marginBottom: "20px" 
        }}>
          <button 
            onClick={() => handleTabChange("low-stock")} 
            style={activeTab === "low-stock" ? activeTabBtn : inactiveTabBtn}
          >
            📉 Low Stock Items
          </button>
          <button 
            onClick={() => handleTabChange("out-of-stock")} 
            style={activeTab === "out-of-stock" ? activeTabBtn : inactiveTabBtn}
          >
            🚨 Out of Stock List
          </button>
          <button 
            onClick={() => handleTabChange("expiring")} 
            style={activeTab === "expiring" ? activeTabBtn : inactiveTabBtn}
          >
            ⏳ Near Expiry Batch
          </button>
          <button 
            onClick={() => handleTabChange("reorder")} 
            style={activeTab === "reorder" ? activeTabBtn : inactiveTabBtn}
          >
            🤖 Automated Reorder Sheet
          </button>
        </div>

        {/* DATA CONTAINER WORKSTATION */}
        {loadingTab ? (
          <p style={{ 
            textAlign: "center", 
            color: "#64748b", 
            padding: "40px 0", 
            fontSize: "15px" 
          }}>🔄 Extracting parameters from warehouse manifests...</p>
        ) : tableData.length === 0 ? (
          <p style={{ 
            textAlign: "center", 
            color: "#94a3b8", 
            padding: "50px 0" 
          }}>✅ Excellent! No alerts raised on this segment matrix.</p>
        ) : (
          <table style={{ 
            width: "100%", 
            borderCollapse: "collapse" 
          }}>
            <thead>
              <tr style={{ 
                background: "#f8fafc", 
                textAlign: "left" 
              }}>
                <th style={thStyle}>Catalog Product Metadata</th>
                <th style={thStyle}>Stock Capacity Status</th>
                <th style={thStyle}>Supplier Assignment</th>
                
                {/* Dynamically adjust the column header according to user context tab */}
                {activeTab === "expiring" && <th style={thStyle}>Calendar Expiry</th>}
                {activeTab === "reorder" && <th style={thStyle}>Calculated Replenishment Plan</th>}
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, idx) => {
                // Determine layout mapping key markers depending on schema format variation
                const isReorderTab = activeTab === "reorder";
                const pId = isReorderTab ? item.productId : item._id;
                const pName = isReorderTab ? item.productName : item.name;
                const pBarcode = isReorderTab ? "Auto Staged Engine" : item.barcode;
                const pSku = isReorderTab ? "REORDER_PLAN" : item.sku;
                const currentStock = isReorderTab ? item.currentStock : item.stockQuantity;
                const companyName = item.supplier?.companyName;
                const codeName = item.supplier?.supplierCode;

                return (
                  <tr key={pId || idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={tdStyle}>
                      <span style={{ 
                        fontWeight: "600", 
                        color: "#0f172a", 
                        fontSize: "15px" 
                      }}>{pName}</span>
                      <div style={{ 
                        fontSize: "12px", 
                        color: "#64748b", 
                        marginTop: "3px" 
                      }}>
                        SKU: <span style={{ fontFamily: "monospace" }}>{pSku}</span> {pBarcode !== "Auto Staged Engine" && `| Barcode: ${pBarcode}`}
                      </div>
                    </td>
                    
                    <td style={tdStyle}>
                      <span style={{ 
                        padding: "4px 8px", 
                        borderRadius: "6px", 
                        fontSize: "13px", 
                        fontWeight: "bold",
                        background: currentStock === 0 ? "#fee2e2" : "#fef3c7",
                        color: currentStock === 0 ? "#dc2626" : "#d97706"
                      }}>
                        Current Level: {currentStock} {item.unit || "PCS"}
                      </span>
                      {!isReorderTab && (
                        <div style={{ 
                          fontSize: "11px", 
                          color: "#94a3b8", 
                          marginTop: "5px" 
                        }}>
                          Threshold Limit Trigger: {item.lowStockThreshold} {item.unit || "PCS"}
                        </div>
                      )}
                    </td>

                    <td style={tdStyle}>
                      <span style={{ 
                        fontWeight: "500", 
                        color: "#334155" 
                      }}>{companyName || "No Supplier Assigned"}</span>
                      {codeName && <div style={{ 
                        fontSize: "11px", 
                        color: "#94a3b8", 
                        fontFamily: "monospace", 
                        marginTop: "2px" 
                      }}>Code: {codeName}</div>}
                    </td>

                    {/* Expiry Tab Dynamic Metadata */}
                    {activeTab === "expiring" && (
                      <td style={tdStyle}>
                        <span style={{ 
                          color: "#ef4444", 
                          fontWeight: "600", 
                          fontSize: "14px" 
                        }}>
                          📅 {new Date(item.expiryDate).toLocaleDateString()}
                        </span>
                        <div style={{ 
                          fontSize: "11px", 
                          color: "#64748b", 
                          marginTop: "3px" 
                        }}>
                          Expires in: {Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} Days
                        </div>
                      </td>
                    )}

                    {/* Reorder Recommendation Pipeline Values */}
                    {isReorderTab && (
                      <td style={tdStyle}>
                        <div style={{ 
                          fontSize: "13px", 
                          color: "#1e293b" 
                        }}>
                          Trigger Level Target: <strong>{item.reorderLevel} units</strong>
                        </div>
                        <div style={{ 
                          fontSize: "14px", 
                          color: "#2563eb", 
                          fontWeight: "700", 
                          marginTop: "4px" 
                        }}>
                          📦 Suggested Order Qty: +{item.suggestedOrderQty} units
                        </div>
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

// Inline Style Blocks
const kpiCardStyle = { 
  flex: 1, 
  background: "white", 
  padding: "18px", 
  borderRadius: "12px", 
  boxShadow: "0 2px 6px rgba(0,0,0,0.03)", 
  border: "1px solid #edf2f7", 
  cursor: "pointer", 
  transition: "0.2s" 
};

const cardLabelStyle = { 
  fontSize: "12px", 
  fontWeight: "700", 
  color: "#64748b", 
  textTransform: "uppercase" 
};

const thStyle = { 
  padding: "12px", 
  borderBottom: "2px solid #cbd5e1", 
  color: "#475569", 
  fontSize: "13px", 
  fontWeight: "700" 
};

const tdStyle = { 
  padding: "14px 12px", 
  verticalAlign: "middle" 
};

// Tab Buttons Style Toggles
const activeTabBtn = { 
  padding: "10px 16px", 
  background: "#0f172a", 
  color: "white", 
  border: "none", 
  borderRadius: "6px", 
  fontWeight: "bold", 
  cursor: "pointer", 
  fontSize: "13px" 
};

const inactiveTabBtn = { 
  padding: "10px 16px", 
  background: "#f1f5f9", 
  color: "#475569", 
  border: "none", 
  borderRadius: "6px", 
  fontWeight: "600", 
  cursor: "pointer", 
  fontSize: "13px" 
};

export default Alerts;