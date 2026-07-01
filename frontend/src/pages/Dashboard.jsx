import { useEffect, useState } from "react";
import axios from "axios";

// Centered API Endpoint Registry
const DASHBOARD_API = "http://localhost:5000/api/dashboard/admin";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const getAuthConfig = () => ({
    headers: { 
      Authorization: `Bearer ${token}` 
    },
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(DASHBOARD_API, getAuthConfig());
        setData(res.data?.data || res.data);
        setLoading(false);
      } catch (err) {
        console.error("Critical Node Trace: Admin dashboard fetch error: ", err);
        setError(err.response?.data?.message || "Failed to load dashboard parameters.");
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={loadingOverlayStyle}>
        <div style={spinnerStyle}></div>
        <div 
          style={{ 
            marginTop: "16px", 
            fontWeight: "600", 
            color: "#64748b", 
            fontFamily: "sans-serif" 
          }}
        >
          Initializing Admin Command Center Matrix...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={errorOverlayStyle}>
        <h3>❌ System Access Interrupted</h3>
        <p>{error}</p>
      </div>
    );
  }

  // Safe destructuring with fallback structural primitives
  const {
    overview = {},
    totalProfit = 0,
    lowStockCount = 0,
    outOfStockCount = 0,
    pendingPOCount = 0,
    totalProducts = 0,
    totalCustomers = 0,
    totalUsers = 0,
  } = data;

  const totalRevenue = overview.totalRevenue || 0;
  const totalOrders = overview.totalOrders || 0;
  const totalTax = overview.totalTax || 0;
  const totalDiscount = overview.totalDiscount || 0;

  return (
    <div style={dashboardWrapper}>
      
      {/* ENTERPRISE INTERFACE CONTROL HEADER */}
      <div style={headerSectionStyle}>
        <div>
          <h1 style={mainTitleStyle}>Administrative Command Center</h1>
          <p style={subtitleStyle}>Real-time store telemetry, warehouse exceptions, and live audits.</p>
        </div>
        <div style={liveSyncIndicatorDeck}>
          <div style={pulseDot}></div>
        </div>
      </div>

      <hr style={separatorLine} />

      <div style={grid4ColLayout}>
        <FinancialKPICard title="Gross Gross Revenue" value={totalRevenue} subtext={`From ${totalOrders} checkout invoices`} color="#2563eb" bg="rgba(37, 99, 235, 0.05)" icon="💵" />
        <FinancialKPICard title="Net Operations Profit" value={totalProfit} subtext={`Margin Rate: ${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%`} color="#10b981" bg="rgba(16, 185, 129, 0.05)" icon="📈" />
        <FinancialKPICard title="Collected Pools Tax" value={totalTax} subtext="Staged liability ledger funds" color="#8b5cf6" bg="rgba(139, 92, 246, 0.05)" icon="🏛️" />
        <FinancialKPICard title="Trade Value Discounts" value={totalDiscount} subtext="Promotional customer burn" color="#f59e0b" bg="rgba(245, 158, 11, 0.05)" icon="🏷️" />
      </div>

      {/* SECTION 2: CRITICAL OPERATIONAL TELEMETRY HUDS */}
      <div style={operationalWidgetGrid}>
        <InventoryExceptionWidget count={outOfStockCount} label="Out of Stock SKUs" status="CRITICAL" color="#ef4444" bg="rgba(239, 68, 68, 0.08)" icon="🚨" />
        <InventoryExceptionWidget count={lowStockCount} label="Low Stock Warning Thresholds" status="WARNING" color="#f59e0b" bg="rgba(245, 158, 11, 0.08)" icon="📉" />
        <InventoryExceptionWidget count={pendingPOCount} label="Awaiting Procurement POs" status="PENDING" color="#3b82f6" bg="rgba(59, 130, 246, 0.08)" icon="⏳" />
        <InventoryExceptionWidget count={totalProducts} label="Active Base Registry SKUs" status="NOMINAL" color="#0f172a" bg="rgba(15, 23, 42, 0.04)" icon="📦" />
      </div>

      {/* REGISTRY SNAPSHOT FOOTPRINT CONTROL */}
      <div style={systemRegistryBanner}>
        <div style={registryItemText}>👥 <strong>Total Customer Registry Base:</strong> {totalCustomers} active accounts</div>
        <div style={registryDivider}></div>
        <div style={registryItemText}>🛡️ <strong>Assigned Terminal User Nodes:</strong> {totalUsers} active workers logged</div>
      </div>

    </div>
  );
}

// COMPONENT BLOCK SUB-ROUTINES: HIGH DEFINITION KPI DESIGN
function FinancialKPICard({ title, value, subtext, color, bg, icon }) {
  return (
    <div style={financialCardStyle}>
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}
      >
        <span style={cardLabelText}>{title}</span>
        <div 
          style={{ 
            ...iconContainerFrame, 
            background: bg, 
            color: color 
          }}
        >
          {icon}
        </div>
      </div>
      <h2 style={cardFinancialValue}>₹{value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h2>
      <div style={cardBottomMetricText}>{subtext}</div>
    </div>
  );
}

// COMPONENT BLOCK SUB-ROUTINES: WARNING/EXCEPTION MANAGEMENT CARDS
function InventoryExceptionWidget({ count, label, status, color, bg, icon }) {
  return (
    <div style={operationalWidgetWrapper}>
      <div 
        style={{ 
          ...widgetIconContainer, 
          background: bg 
        }}
      >
        {icon}
      </div>
      <div>
        <div 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "6px" 
          }}
        >
          <span 
            style={{ 
              fontSize: "22px", 
              fontWeight: "900", 
              color: color, 
              fontFamily: "monospace" 
            }}
          >
            {count}
          </span>
          <span 
            style={{ 
              ...systemStatusBadgeIndicator, 
              color: color, 
              background: bg 
            }}
          >
            {status}
          </span>
        </div>
        <div style={widgetLabelTextDescription}>{label}</div>
      </div>
    </div>
  );
}

// HIGH RESOLUTION STYLING CONFIGURATION MATRICES
const dashboardWrapper = { 
  padding: "32px", 
  background: "#f8fafc", 
  minHeight: "100vh", 
  boxSizing: "border-box", 
  fontFamily: "'Inter', sans-serif" 
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

const separatorLine = { 
  border: "none", 
  borderTop: "1px solid #e2e8f0", 
  margin: "24px 0 32px 0" 
};

const liveSyncIndicatorDeck = { 
  display: "flex", 
  alignItems: "center", 
  gap: "8px", 
  background: "#fff", 
  padding: "10px 16px", 
  borderRadius: "10px", 
  border: "1px solid #e2e8f0" 
};

const pulseDot = { 
  width: "8px", 
  height: "8px", 
  background: "#10b981", 
  borderRadius: "50%", 
  boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.2)" 
};

const grid4ColLayout = { 
  display: "grid", 
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
  gap: "24px" 
};

const operationalWidgetGrid = { 
  display: "grid", 
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
  gap: "24px", 
  marginTop: "24px" 
};

const financialCardStyle = { 
  background: "#fff", 
  padding: "24px", 
  borderRadius: "16px", 
  border: "1px solid #e2e8f0", 
  boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.02)" 
};

const cardLabelText = { 
  fontSize: "12px", 
  fontWeight: "800", 
  color: "#64748b", 
  textTransform: "uppercase", 
  letterSpacing: "0.5px" 
};

const iconContainerFrame = { 
  width: "36px", 
  height: "36px", 
  borderRadius: "10px", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center", 
  fontSize: "18px" 
};

const cardFinancialValue = { 
  margin: "14px 0 6px 0", 
  fontSize: "26px", 
  fontWeight: "900", 
  color: "#0f172a" 
};

const cardBottomMetricText = { 
  fontSize: "12px", 
  color: "#64748b", 
  fontWeight: "500" 
};

const operationalWidgetWrapper = { 
  background: "#fff", 
  padding: "18px 20px", 
  borderRadius: "16px", 
  border: "1px solid #e2e8f0", 
  display: "flex", 
  alignItems: "center", 
  gap: "16px", 
  boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.02)" 
};

const widgetIconContainer = { 
  width: "44px", 
  height: "44px", 
  borderRadius: "12px", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center", 
  fontSize: "20px" 
};

const systemStatusBadgeIndicator = { 
  fontSize: "9px", 
  fontWeight: "900", 
  padding: "2px 6px", 
  borderRadius: "4px", 
  letterSpacing: "0.5px" 
};

const widgetLabelTextDescription = { 
  fontSize: "12px", 
  color: "#64748b", 
  fontWeight: "600", 
  marginTop: "4px" 
};

const systemRegistryBanner = { 
  display: "flex", 
  gap: "24px", 
  background: "#fff", 
  padding: "16px 24px", 
  borderRadius: "16px", 
  border: "1px solid #e2e8f0", 
  margin: "24px 0", 
  alignItems: "center" 
};

const registryItemText = { 
  fontSize: "13px", 
  color: "#475569", 
  fontWeight: "500" 
};

const registryDivider = { 
  height: "16px", 
  width: "1px", 
  background: "#e2e8f0" 
};

const loadingOverlayStyle = { 
  minHeight: "100vh", 
  display: "flex", 
  flexDirection: "column", 
  justifyContent: "center", 
  alignItems: "center", 
  background: "#f8fafc" 
};

const errorOverlayStyle = { 
  padding: "60px 40px", 
  textAlign: "center", 
  background: "#fff", 
  minHeight: "100vh", 
  color: "#dc2626", 
  fontFamily: "sans-serif" 
};

const spinnerStyle = { 
  width: "42px", 
  height: "42px", 
  border: "4px solid #e2e8f0", 
  borderTopColor: "#2563eb", 
  borderRadius: "50%", 
  animation: "spin 1s linear infinite" 
};

export default Dashboard;