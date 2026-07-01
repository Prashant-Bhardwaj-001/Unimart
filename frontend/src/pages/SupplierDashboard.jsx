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

function SupplierDashboard() {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, ordersRes] = await Promise.all([
        api.get("/supplier/profile"),
        api.get("/supplier/orders"),
      ]);

      setProfile(profileRes.data?.data || profileRes.data);
      setOrders(ordersRes.data?.data || ordersRes.data || []);
    } catch (error) {
      console.error("Critical Node Trace: Dashboard fetch error: ", error);
    } finally {
      setLoading(false);
    }
  };

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === "PENDING").length;
  const acceptedOrdersCount = orders.filter((o) => o.status === "ACCEPTED").length;
  const shippedOrdersCount = orders.filter((o) => o.status === "SHIPPED").length;
  const deliveredOrdersCount = orders.filter((o) => o.status === "DELIVERED").length;

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
          Initializing Secure Supplier Node Operations...
        </div>
      </div>
    );
  }

  return (
    <div style={dashboardWrapper}>
      
      <div style={headerSectionStyle}>
        <div>
          <h1 style={mainTitleStyle}>Operations Control Terminal</h1>
          <p style={subtitleStyle}>Real-time supplier logistics pipelines, B2B purchasing metrics, and fulfillment analytics.</p>
        </div>
        <div style={timeSyncContainer}>
          <div style={pulseDot}></div>
        </div>
      </div>

      <hr style={separatorLine} />

      <div style={mainGridLayout}>
        
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "24px" 
        }}>
          
          <div style={profileCardStyle}>
            <div style={avatarCircle}>
              {profile?.companyName ? profile.companyName.charAt(0).toUpperCase() : "V"}
            </div>
            <div style={{ marginTop: "16px" }}>
              <div style={vendorCodeLabel}>{profile?.supplierCode || "SUPPLIER ACCOUNT NODE"}</div>
              <h2 style={companyTitle}>{profile?.companyName}</h2>
            </div>
            
            <div style={profileSpecsGrid}>
              <div style={specItem}>
                <span style={{ 
                  color: "#94a3b8", 
                  fontSize: "11px", 
                  fontWeight: "600", 
                  textTransform: "uppercase" 
                }}>Contact Head</span>
                <strong style={{ 
                  color: "#334155", 
                  fontWeight: "600" 
                }}>{profile?.contactPerson || "N/A"}</strong>
              </div>
              <div style={specItem}>
                <span style={{ 
                  color: "#94a3b8", 
                  fontSize: "11px", 
                  fontWeight: "600", 
                  textTransform: "uppercase" 
                }}>Secure Mail</span>
                <strong style={{ 
                  color: "#334155", 
                  fontWeight: "600" 
                }}>{profile?.email || "N/A"}</strong>
              </div>
              <div style={specItem}>
                <span style={{ 
                  color: "#94a3b8", 
                  fontSize: "11px", 
                  fontWeight: "600", 
                  textTransform: "uppercase" 
                }}>System Comms</span>
                <strong style={{ 
                  color: "#334155", 
                  fontWeight: "600" 
                }}>{profile?.phone || "N/A"}</strong>
              </div>
            </div>
          </div>

          <div style={logisticsBoxStyle}>
            <h3 style={sectionHeadingStyle}>Operational Performance</h3>
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "12px", 
              marginTop: "16px" 
            }}>
              <div style={progressTrackerRow}>
                <span>Order Fulfillment Rate</span>
                <strong>{totalOrdersCount > 0 ? Math.floor((deliveredOrdersCount / totalOrdersCount) * 100) : 0}%</strong>
              </div>
              <div style={progressTrackerRow}>
                <span>Backlog Pipeline Stress</span>
                <strong style={{ 
                  color: pendingOrdersCount > 2 ? "#ef4444" : "#10b981" 
                }}>
                  {pendingOrdersCount > 2 ? "HIGH STRESS" : "NOMINAL"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "24px" 
        }}>
          
          <div style={statsGridStructure}>
            <StatCard title="Total Registry POs" value={totalOrdersCount} color="#3b82f6" icon="📊" bg="rgba(59, 130, 246, 0.05)" />
            <StatCard title="Awaiting Verification" value={pendingOrdersCount} color="#f59e0b" icon="⏳" bg="rgba(245, 158, 11, 0.05)" />
            <StatCard title="Fulfillment Committed" value={acceptedOrdersCount} color="#06b6d4" icon="⚙️" bg="rgba(6, 182, 212, 0.05)" />
            <StatCard title="Transit Distribution" value={shippedOrdersCount} color="#8b5cf6" icon="🚚" bg="rgba(139, 92, 246, 0.05)" />
            <StatCard title="Settled Transactions" value={deliveredOrdersCount} color="#10b981" icon="✅" bg="rgba(16, 185, 129, 0.05)" />
          </div>

          <div style={datatableContainerStyle}>
            
            <div style={tableControlsHeader}>
              <div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: "16px", 
                  fontWeight: "800", 
                  color: "#1e293b" 
                }}>Purchase Ledger Data Matrix</h3>
                <p style={{ 
                  margin: "2px 0 0 0", 
                  fontSize: "12px", 
                  color: "#64748b" 
                }}>Executing filters across staging nodes</p>
              </div>
              
              <input 
                type="text" 
                placeholder="🔍 Query PO Number or Value..." 
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
                  📡 No sequential purchase orders match current node criteria stack.
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
                      <th style={thStyle}>Purchase Order Reference</th>
                      <th style={thStyle}>Financial Valuation</th>
                      <th style={thStyle}>Pipeline Status</th>
                      <th style={thStyle}>Timestamp Logs</th>
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
                          color: "#64748b", 
                          fontSize: "13px" 
                        }}>
                          {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon, bg }) {
  return (
    <div style={{ 
      ...statCardLayout, 
      borderTop: `4px solid ${color}`, 
      background: "#fff" 
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-start" 
      }}>
        <div style={statLabelText}>{title}</div>
        <div style={{ 
          ...iconFrameBox, 
          background: bg, 
          color: color 
        }}>{icon}</div>
      </div>
      <div style={{ 
        ...statValueText, 
        color: "#0f172a" 
      }}>{value}</div>
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
  alignItems: "center", 
  flexWrap: "wrap", 
  gap: "16px" 
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

const timeSyncContainer = { 
  display: "flex", 
  alignItems: "center", 
  gap: "8px", 
  background: "#fff", 
  padding: "10px 16px", 
  borderRadius: "10px", 
  boxShadow: "0 1px 3px rgba(0,0,0,0.02)", 
  border: "1px solid #e2e8f0" 
};

const pulseDot = { 
  width: "8px", 
  height: "8px", 
  background: "#0ea5e9", 
  borderRadius: "50%", 
  boxShadow: "0 0 0 4px rgba(14, 165, 233, 0.2)" 
};

const separatorLine = { 
  border: "none", 
  borderTop: "1px solid #e2e8f0", 
  margin: "24px 0 32px 0" 
};

const mainGridLayout = { 
  display: "grid", 
  gridTemplateColumns: "320px 1fr", 
  gap: "32px", 
  alignItems: "flex-start" 
};

const profileCardStyle = { 
  background: "#fff", 
  padding: "28px", 
  borderRadius: "16px", 
  border: "1px solid #e2e8f0", 
  boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04)", 
  textAlign: "center" 
};

const avatarCircle = { 
  width: "64px", 
  height: "64px", 
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", 
  color: "#fff", 
  fontSize: "24px", 
  fontWeight: "800", 
  borderRadius: "50%", 
  display: "inline-flex", 
  alignItems: "center", 
  justifyContent: "center", 
  boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.1)" 
};

const vendorCodeLabel = { 
  fontSize: "11px", 
  fontWeight: "800", 
  color: "#94a3b8", 
  letterSpacing: "1px" 
};

const companyTitle = { 
  margin: "4px 0 0 0", 
  fontSize: "20px", 
  fontWeight: "800", 
  color: "#0f172a" 
};

const profileSpecsGrid = { 
  display: "flex", 
  flexDirection: "column", 
  gap: "14px", 
  marginTop: "24px", 
  borderTop: "1px dashed #e2e8f0", 
  paddingTop: "20px", 
  textAlign: "left" 
};

const specItem = { 
  display: "flex", 
  flexDirection: "column", 
  gap: "2px", 
  fontSize: "13px" 
};

const logisticsBoxStyle = { 
  background: "#fff", 
  padding: "24px", 
  borderRadius: "16px", 
  border: "1px solid #e2e8f0", 
  boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04)" 
};

const sectionHeadingStyle = { 
  margin: 0, 
  fontSize: "14px", 
  fontWeight: "800", 
  color: "#0f172a", 
  textTransform: "uppercase", 
  letterSpacing: "0.5px" 
};

const progressTrackerRow = { 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center", 
  fontSize: "13px", 
  color: "#475569", 
  fontWeight: "500" 
};

const statsGridStructure = { 
  display: "grid", 
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
  gap: "16px" 
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
  width: "240px", 
  fontSize: "13px", 
  borderRadius: "10px", 
  border: "1px solid #cbd5e1", 
  outline: "none", 
  color: "#0f172a" 
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
  padding: "16px 20px", 
  borderBottom: "1px solid #f1f5f9", 
  verticalAlign: "middle" 
};

const trHoverMatrixStyle = { 
  transition: "background 0.2s ease" 
};

const emptyDataStateFallback = { 
  padding: "40px", 
  textAlign: "center", 
  color: "#94a3b8", 
  fontSize: "14px", 
  fontWeight: "500" 
};

const statCardLayout = { 
  padding: "20px", 
  borderRadius: "14px", 
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)", 
  border: "1px solid #e2e8f0", 
  display: "flex", 
  flexDirection: "column", 
  gap: "12px" 
};

const statLabelText = { 
  color: "#64748b", 
  fontSize: "12px", 
  fontWeight: "700", 
  textTransform: "uppercase", 
  letterSpacing: "0.5px" 
};

const statValueText = { 
  fontSize: "28px", 
  fontWeight: "800", 
  margin: 0, 
  fontFamily: "monospace" 
};

const iconFrameBox = { 
  width: "32px", 
  height: "32px", 
  borderRadius: "8px", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center", 
  fontSize: "16px" 
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
  background: "#f8fafc", 
  fontFamily: "sans-serif" 
};

const spinnerStyle = { 
  width: "40px", 
  height: "40px", 
  border: "4px solid #e2e8f0", 
  borderTopColor: "#0f172a", 
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

export default SupplierDashboard;