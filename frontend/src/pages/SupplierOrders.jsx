import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:5000/api";
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function SupplierOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/supplier/orders");
      setOrders(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Critical Node Trace: Order ledger resolution failure:", error);
    } finally {
      setLoading(false);
    }
  };

  const executeStatusTransition = async (id, phase) => {
    try {
      setActionLoading(true);
      await api.patch(`/supplier/orders/${id}/${phase}`, {});
      await fetchOrders();
    } catch (error) {
      console.error(`Logistics Pipeline Alert: Failed to shift state to ${phase}:`, error);
      alert(error.response?.data?.message || `Transaction failure during ${phase} pipeline phase.`);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "ALL" || order.status === activeTab;
    const matchesSearch = 
      order.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(order.totalAmount).includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div style={loadingOverlayStyle}>
        <div style={spinnerStyle}></div>
        <div style={{ 
          marginTop: "16px", 
          fontWeight: "600", 
          color: "#64748b" 
        }}>
          Resolving Secure Order Stream Matrices...
        </div>
      </div>
    );
  }

  return (
    <div style={dashboardWrapper}>
      
      <div style={headerSectionStyle}>
        <div>
          <span style={pillBadgeStyle}>B2B ENCRYPTION INTERFACE LOGS</span>
          <h1 style={mainTitleStyle}>Purchase Orders Matrix</h1>
          <p style={subtitleStyle}>Execute inventory deployment, accept procurement queries, and process wholesale fulfillments.</p>
        </div>
      </div>

      <hr style={separatorLine} />

      <div style={datatableContainerStyle}>
        
        <div style={tableControlsHeader}>
          <div>
            <h3 style={{ 
              margin: 0, 
              fontSize: "16px", 
              fontWeight: "800", 
              color: "#1e293b" 
            }}>Procurement Master Ledger</h3>
            <p style={{ 
              margin: "2px 0 0 0", 
              fontSize: "12px", 
              color: "#64748b" 
            }}>Real-time synchronization with primary warehousing clusters</p>
          </div>
          
          <input 
            type="text" 
            placeholder="🔍 Search PO Reference or Value..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchControlStyle}
          />
        </div>

        <div style={tabsNavigationContainer}>
          {["ALL", "PENDING", "ACCEPTED", "SHIPPED", "DELIVERED", "REJECTED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...tabItemStyle,
                background: activeTab === tab ? "#0f172a" : "transparent",
                color: activeTab === tab ? "#fff" : "#64748b",
                borderColor: activeTab === tab ? "#0f172a" : "#e2e8f0"
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ overflowX: "auto" }}>
          {filteredOrders.length === 0 ? (
            <div style={emptyDataStateFallback}>
              📡 No procurement tickets match your staged matrix configuration queries.
            </div>
          ) : (
            <table style={{ 
              width: "100%", 
              borderCollapse: "collapse" 
            }}>
              <thead>
                <tr style={{ 
                  background: "#f8fafc", 
                  borderBottom: "2px solid #e2e8f0" 
                }}>
                  <th style={thStyle}>PO Identification Registry</th>
                  <th style={thStyle}>Financial Assessment Valuation</th>
                  <th style={thStyle}>Current Node State</th>
                  <th style={thStyle}>Target Delivery Log</th>
                  <th style={{ 
                    ...thStyle, 
                    textAlign: "right" 
                  }}>Operation Controllers</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} style={trHoverMatrixStyle}>
                    <td style={{ 
                      ...tdStyle, 
                      fontWeight: "700", 
                      fontFamily: "monospace", 
                      color: "#2563eb" 
                    }}>
                      {order.poNumber}
                    </td>
                    <td style={{ 
                      ...tdStyle, 
                      fontWeight: "600", 
                      color: "#0f172a" 
                    }}>
                      ₹{order.totalAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={tdStyle}>
                      <span style={{ 
                        ...statusBadgeEngine, 
                        ...getStatusColorStyles(order.status) 
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ 
                      ...tdStyle, 
                      color: "#475569", 
                      fontWeight: "500", 
                      fontSize: "13px" 
                    }}>
                      {order.expectedDeliveryDate
                        ? new Date(order.expectedDeliveryDate).toLocaleDateString("en-IN", { dateStyle: "medium" })
                        : "---"}
                    </td>
                    <td style={{ 
                      ...tdStyle, 
                      textAlign: "right" 
                    }}>
                      <div style={actionsContainerFlex}>
                        
                        {order.status === "PENDING" && (
                          <>
                            <button
                              disabled={actionLoading}
                              onClick={() => executeStatusTransition(order._id, "accept")}
                              style={acceptBtnStyle}
                            >
                              ✓ Accept PO
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => executeStatusTransition(order._id, "reject")}
                              style={rejectBtnStyle}
                            >
                              ✕ Decline
                            </button>
                          </>
                        )}

                        {order.status === "ACCEPTED" && (
                          <button
                            disabled={actionLoading}
                            onClick={() => executeStatusTransition(order._id, "shipped")}
                            style={shipBtnStyle}
                          >
                            🚚 Dispatched Warehouse Stock
                          </button>
                        )}

                        {["SHIPPED", "DELIVERED", "REJECTED"].includes(order.status) && (
                          <span style={immutableStateNoticeText}>
                            🔒 Records Fully Archived
                          </span>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const dashboardWrapper = { 
  padding: "32px", 
  background: "#f8fafc", 
  minHeight: "100vh", 
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif", 
  boxSizing: "border-box" 
};

const headerSectionStyle = { 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center" 
};

const mainTitleStyle = { 
  margin: "4px 0 0 0", 
  fontSize: "32px", 
  fontWeight: "900", 
  color: "#0f172a", 
  letterSpacing: "-0.75px" 
};

const subtitleStyle = { 
  margin: "6px 0 0 0", 
  fontSize: "14px", 
  color: "#64748b", 
  fontWeight: "400" 
};

const pillBadgeStyle = { 
  background: "rgba(37, 99, 235, 0.1)", 
  color: "#2563eb", 
  padding: "4px 10px", 
  borderRadius: "6px", 
  fontSize: "11px", 
  fontWeight: "800", 
  letterSpacing: "0.5px" 
};

const separatorLine = { 
  border: "none", 
  borderTop: "1px solid #e2e8f0", 
  margin: "24px 0 32px 0" 
};

const datatableContainerStyle = { 
  background: "#fff", 
  borderRadius: "16px", 
  border: "1px solid #e2e8f0", 
  boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04)", 
  overflow: "hidden" 
};

const tableControlsHeader = { 
  padding: "24px", 
  borderBottom: "1px solid #e2e8f0", 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center", 
  flexWrap: "wrap", 
  gap: "16px" 
};

const searchControlStyle = { 
  padding: "10px 14px", 
  width: "260px", 
  fontSize: "13px", 
  borderRadius: "10px", 
  border: "1px solid #cbd5e1", 
  outline: "none", 
  color: "#0f172a", 
  transition: "all 0.2s" 
};

const tabsNavigationContainer = { 
  display: "flex", 
  gap: "8px", 
  padding: "0 24px 16px 24px", 
  borderBottom: "1px solid #f1f5f9", 
  overflowX: "auto" 
};

const tabItemStyle = { 
  padding: "8px 14px", 
  fontSize: "12px", 
  fontWeight: "700", 
  borderRadius: "8px", 
  border: "1px solid", 
  cursor: "pointer", 
  transition: "all 0.15s ease" 
};

const thStyle = { 
  textAlign: "left", 
  padding: "14px 20px", 
  background: "#f8fafc", 
  color: "#475569", 
  fontSize: "11px", 
  fontWeight: "800", 
  textTransform: "uppercase", 
  letterSpacing: "0.5px" 
};

const tdStyle = { 
  padding: "14px 20px", 
  borderBottom: "1px solid #f1f5f9", 
  verticalAlign: "middle" 
};

const trHoverMatrixStyle = { 
  transition: "background 0.2s ease" 
};

const emptyDataStateFallback = { 
  padding: "50px", 
  textAlign: "center", 
  color: "#94a3b8", 
  fontSize: "14px", 
  fontWeight: "500" 
};

const actionsContainerFlex = { 
  display: "inline-flex", 
  gap: "8px", 
  justifyContent: "flex-end", 
  alignItems: "center", 
  width: "100%" 
};

const baseBtnDesign = { 
  border: "none", 
  padding: "8px 14px", 
  borderRadius: "8px", 
  fontSize: "12px", 
  fontWeight: "700", 
  cursor: "pointer", 
  transition: "all 0.2s ease" 
};

const acceptBtnStyle = { 
  ...baseBtnDesign, 
  background: "#10b981", 
  color: "#fff", 
  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)" 
};

const rejectBtnStyle = { 
  ...baseBtnDesign, 
  background: "#ef4444", 
  color: "#fff", 
  boxShadow: "0 2px 8px rgba(239, 68, 68, 0.2)" 
};

const shipBtnStyle = { 
  ...baseBtnDesign, 
  background: "#2563eb", 
  color: "#fff", 
  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.2)" 
};

const immutableStateNoticeText = { 
  fontSize: "12px", 
  fontWeight: "600", 
  color: "#94a3b8", 
  letterSpacing: "0.5px", 
  fontStyle: "italic" 
};

const statusBadgeEngine = { 
  padding: "5px 10px", 
  borderRadius: "6px", 
  fontSize: "11px", 
  fontWeight: "800", 
  letterSpacing: "0.5px", 
  display: "inline-block" 
};

const loadingOverlayStyle = { 
  minHeight: "100vh", 
  display: "flex", 
  flexDirection: "column", 
  justifyContent: "center", 
  alignItems: "center", 
  background: "#f8fafc" 
};

const spinnerStyle = { 
  width: "40px", 
  height: "40px", 
  border: "4px solid #e2e8f0", 
  borderTopColor: "#2563eb", 
  borderRadius: "50%", 
  animation: "spin 1s linear infinite" 
};

function getStatusColorStyles(status) {
  switch (status) {
    case "PENDING":
      return { 
        background: "rgba(245, 158, 11, 0.1)", 
        color: "#d97706" 
      };
    case "ACCEPTED":
      return { 
        background: "rgba(37, 99, 235, 0.1)", 
        color: "#1d4ed8" 
      };
    case "SHIPPED":
      return { 
        background: "rgba(139, 92, 246, 0.1)", 
        color: "#7c3aed" 
      };
    case "DELIVERED":
      return { 
        background: "rgba(16, 185, 129, 0.1)", 
        color: "#059669" 
      };
    case "REJECTED":
      return { 
        background: "rgba(220, 38, 38, 0.1)", 
        color: "#dc2626" 
      };
    default:
      return { 
        background: "#f1f5f9", 
        color: "#475569" 
      };
  }
}

export default SupplierOrders;