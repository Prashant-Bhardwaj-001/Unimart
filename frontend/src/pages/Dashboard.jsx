import { useEffect, useState } from "react";
import axios from "axios";

const DASHBOARD_API = "http://localhost:5000/api/dashboard/admin";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${token}` },
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
        <div style={{ marginTop: "16px", fontWeight: "600", color: "#0f172a", fontFamily: "sans-serif", fontSize: "15px" }}>
          Initializing D-Mart Management Matrix...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={errorOverlayStyle}>
        <div style={{ fontSize: "50px", marginBottom: "16px" }}>⚠️</div>
        <h3 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 8px 0" }}>System Access Interrupted</h3>
        <p style={{ color: "#64748b", margin: 0 }}>{error}</p>
      </div>
    );
  }

  const {
    overview = {},
    lowStockCount = 0,
    outOfStockCount = 0,
    pendingPOCount = 0,
    totalProducts = 0,
    totalCustomers = 0,
    totalUsers = 0,
    fastMovingItems = [],
    leastMovingItems = [],
    hourlySales = []
  } = data || {};

  const totalRevenue = overview.totalRevenue || 0;
  const totalOrders = overview.totalOrders || 0;
  
  const averageTicketSize = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const simulatedActiveCounters = Math.max(1, Math.min(15, Math.floor(totalOrders / 30))); 
  const maxSalesValue = hourlySales.length > 0 ? Math.max(...hourlySales.map(s => s.sales || 0)) : 1;

  return (
    <div style={dashboardWrapper}>
      <div style={headerSectionStyle}>
        <div>
          <span style={brandTagStyle}>D-MART ENTERPRISE HUB</span>
          <h1 style={mainTitleStyle}>Operations Control Center</h1>
          <p style={subtitleStyle}>Real-time system telemetry, transactional flow metrics, and critical exceptions.</p>
        </div>
        <div style={liveSyncIndicatorDeck}>
          <div style={pulseDot}></div>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>LIVE FEED ACTIVE</span>
        </div>
      </div>

      <div style={grid4ColLayout}>
        <MetricKPICard title="Today's Total Sales" value={`₹${totalRevenue.toLocaleString("en-IN")}`} subtext={`From ${totalOrders} checkout invoices`} color="#0284c7" bg="linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)" icon="💵" />
        <MetricKPICard title="Total Footfall / Bills" value={totalOrders.toLocaleString("en-IN")} subtext="Completed register checkout events" color="#16a34a" bg="linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)" icon="🛒" />
        <MetricKPICard title="Average Ticket Size" value={`₹${averageTicketSize.toLocaleString("en-IN")}`} subtext="Average spending per basket" color="#7c3aed" bg="linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)" icon="📊" />
        <MetricKPICard title="Active Counters" value={`${simulatedActiveCounters} Outlets`} subtext="Live registers transmitting telemetry" color="#ea580c" bg="linear-gradient(135deg, #ffedd5 0%, #fff7ed 100%)" icon="⚡" />
      </div>

      <div style={splitLayout2Side}>
        <div style={mainContentPanelStyle}>
          <div style={panelHeaderDeck}>
            <h3 style={panelTitleStyle}>Live Sales Timeline Monitor</h3>
            <span style={badgeStatusLabelNominal}>REAL-TIME FLOW</span>
          </div>
          <p style={{ margin: "0 0 24px 0", fontSize: "13px", color: "#64748b" }}>Hourly retail transaction velocity spikes tracking system load balance.</p>
          
          <div style={chartGraphSimulationFrame}>
            {hourlySales.length > 0 ? (
              hourlySales.map((item, index) => {
                const percentageHeight = ((item.sales || 0) / maxSalesValue) * 100;
                const barColor = percentageHeight > 75 ? "#ef4444" : percentageHeight > 40 ? "#f59e0b" : "#10b981";
                return (
                  <div key={index} style={barColumnWrapper}>
                    <div style={barTooltipValue}>
                      {item.sales >= 100000 ? `₹${(item.sales / 100000).toFixed(1)}L` : `₹${Math.round(item.sales / 1000)}k`}
                    </div>
                    <div style={{ ...barGraphicPillar, height: `${percentageHeight}%`, backgroundColor: barColor }}></div>
                    <div style={barLabelTimeText}>{item.time}</div>
                  </div>
                );
              })
            ) : (
              <div style={emptyStatePlaceholderText}>No hourly sales orders processed today yet.</div>
            )}
          </div>
        </div>

        <div style={sidePanelAlertsDeck}>
          <div style={panelHeaderDeck}>
            <h3 style={panelTitleStyle}>Critical Alerts (Action Required)</h3>
            <span style={{ ...badgeStatusLabelNominal, background: "#fef2f2", color: "#ef4444" }}>
              {outOfStockCount + lowStockCount} BREAKS
            </span>
          </div>
          <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#64748b" }}>Systems that need immediate attention to maintain shelf optimization.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <AlertRowItem count={outOfStockCount} label="Out of Stock SKUs Detected" urgency="CRITICAL ACTION" color="#ef4444" icon="🚨" />
            <AlertRowItem count={lowStockCount} label="Low Stock Threshold Warnings" urgency="REORDER QUEUED" color="#d97706" icon="📉" />
            <AlertRowItem count={pendingPOCount} label="Awaiting Procurement Orders (POs)" urgency="IN TRANSIT" color="#2563eb" icon="⏳" />
            <AlertRowItem count={totalProducts} label="Active System Catalog Registry Base" urgency="NOMINAL RUN" color="#0f172a" icon="📦" />
          </div>
        </div>
      </div>

      <div style={{ ...splitLayout2Side, marginTop: "24px" }}>
        <div style={mainContentPanelStyle}>
          <h3 style={panelTitleStyle}>🚀 High-Velocity Fast Moving Goods</h3>
          <p style={{ margin: "4px 0 16px 0", fontSize: "13px", color: "#64748b" }}>Top performing assets cleared from inventory lanes today.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {fastMovingItems.length > 0 ? (
              fastMovingItems.map((item, index) => (
                <div key={item.id || index} style={tableRowCustom}>
                  <span style={{ fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>{item.name}</span>
                  <span style={{ background: "#dcfce7", color: "#16a34a", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" }}>
                    {item.sales} Units Sold
                  </span>
                </div>
              ))
            ) : (
              <div style={emptyStateRow}>No top-selling item logs registered for this Node today.</div>
            )}
          </div>
        </div>

        <div style={mainContentPanelStyle}>
          <h3 style={panelTitleStyle}>⚠️ Stagnant Floor Stocks (High Shelf Age)</h3>
          <p style={{ margin: "4px 0 16px 0", fontSize: "13px", color: "#64748b" }}>Assets blocking capital footprint. Consider promotional optimization.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {leastMovingItems.length > 0 ? (
              leastMovingItems.map((item, index) => (
                <div key={item.id || index} style={tableRowCustom}>
                  <span style={{ fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>{item.name}</span>
                  <span style={{ background: "#fee2e2", color: "#ef4444", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" }}>
                    Idle: {item.stockAge} Days
                  </span>
                </div>
              ))
            ) : (
              <div style={emptyStateRow}>Nominal status. Zero dead stock warnings in active buffer.</div>
            )}
          </div>
        </div>
      </div>

      <div style={systemRegistryBanner}>
        <div style={registryItemText}>👥 <strong>Total Customer Accounts:</strong> {totalCustomers} active system footprints</div>
        <div style={registryDivider}></div>
        <div style={registryItemText}>🛡️ <strong>Assigned Terminal Users:</strong> {totalUsers} workers active in terminal networks</div>
      </div>
    </div>
  );
}

// 1-Line Property Separated CSS Configurations
const dashboardWrapper = { 
  padding: "32px", 
  background: "#f1f5f9", 
  minHeight: "100vh", 
  boxSizing: "border-box", 
  fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" 
};

const brandTagStyle = { 
  fontSize: "11px", 
  fontWeight: "800", 
  color: "#0284c7", 
  letterSpacing: "1.5px", 
  textTransform: "uppercase" 
};

const headerSectionStyle = { 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center", 
  flexWrap: "wrap", 
  gap: "16px", 
  marginBottom: "32px" 
};

const mainTitleStyle = { 
  margin: "2px 0 0 0", 
  fontSize: "28px", 
  fontWeight: "900", 
  color: "#0f172a", 
  letterSpacing: "-0.5px" 
};

const subtitleStyle = { 
  margin: "4px 0 0 0", 
  fontSize: "14px", 
  color: "#475569" 
};

const liveSyncIndicatorDeck = { 
  display: "flex", 
  alignItems: "center", 
  gap: "10px", 
  background: "#fff", 
  padding: "10px 16px", 
  borderRadius: "12px", 
  border: "1px solid #e2e8f0" 
};

const pulseDot = { 
  width: "8px", 
  height: "8px", 
  background: "#16a34a", 
  borderRadius: "50%", 
  boxShadow: "0 0 0 4px rgba(22, 163, 74, 0.25)" 
};

const grid4ColLayout = { 
  display: "grid", 
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
  gap: "20px" 
};

const splitLayout2Side = { 
  display: "grid", 
  gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", 
  gap: "24px", 
  marginTop: "24px" 
};

const mainContentPanelStyle = { 
  background: "#fff", 
  padding: "24px", 
  borderRadius: "16px", 
  border: "1px solid #e2e8f0" 
};

const sidePanelAlertsDeck = { 
  background: "#fff", 
  padding: "24px", 
  borderRadius: "16px", 
  border: "1px solid #e2e8f0" 
};

const panelHeaderDeck = { 
  display: "flex", 
  alignItems: "center", 
  marginBottom: "6px", 
  justifyContent: "space-between" 
};

const panelTitleStyle = { 
  margin: 0, 
  fontSize: "16px", 
  fontWeight: "800", 
  color: "#0f172a" 
};

const badgeStatusLabelNominal = { 
  fontSize: "10px", 
  fontWeight: "800", 
  background: "#f0fdf4", 
  color: "#16a34a", 
  padding: "4px 8px", 
  borderRadius: "6px" 
};

const chartGraphSimulationFrame = { 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "flex-end", 
  height: "180px", 
  padding: "20px 10px 0 10px", 
  borderBottom: "2px solid #e2e8f0", 
  marginTop: "12px" 
};

const barColumnWrapper = { 
  display: "flex", 
  flexDirection: "column", 
  alignItems: "center", 
  width: "14%", 
  height: "100%", 
  justifyContent: "flex-end" 
};

const barTooltipValue = { 
  fontSize: "10px", 
  fontWeight: "700", 
  color: "#475569", 
  marginBottom: "6px" 
};

const barGraphicPillar = { 
  width: "100%", 
  borderRadius: "4px 4px 0 0", 
  transition: "height 0.3s ease" 
};

const barLabelTimeText = { 
  fontSize: "10px", 
  fontWeight: "600", 
  color: "#64748b", 
  marginTop: "8px", 
  whiteSpace: "nowrap" 
};

const alertRowFrame = { 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center", 
  padding: "12px 16px", 
  background: "#f8fafc", 
  borderRadius: "12px", 
  border: "1px solid #e2e8f0" 
};

const tableRowCustom = { 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center", 
  padding: "14px 16px", 
  background: "#f8fafc", 
  borderRadius: "10px", 
  border: "1px solid #e2e8f0" 
};

const financialCardStyle = { 
  padding: "24px", 
  borderRadius: "16px", 
  border: "1px solid #e2e8f0" 
};

const cardLabelText = { 
  fontSize: "12px", 
  fontWeight: "800", 
  color: "#64748b", 
  textTransform: "uppercase" 
};

const iconContainerFrame = { 
  width: "38px", 
  height: "38px", 
  borderRadius: "10px", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center", 
  fontSize: "18px" 
};

const cardFinancialValue = { 
  margin: "12px 0 4px 0", 
  fontSize: "24px", 
  fontWeight: "900", 
  color: "#0f172a" 
};

const cardBottomMetricText = { 
  fontSize: "12px", 
  color: "#64748b", 
  fontWeight: "500" 
};

const systemRegistryBanner = { 
  display: "flex", 
  gap: "24px", 
  background: "#fff", 
  padding: "16px 24px", 
  borderRadius: "16px", 
  border: "1px solid #e2e8f0", 
  marginTop: "24px", 
  alignItems: "center", 
  flexWrap: "wrap" 
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
  alignItems: "center", 
  background: "#f1f5f9", 
  justifyContent: "center" 
};

const errorOverlayStyle = { 
  padding: "40px", 
  textAlign: "center", 
  background: "#fff", 
  maxWidth: "400px", 
  margin: "100px auto", 
  borderRadius: "16px", 
  border: "1px solid #e2e8f0" 
};

const spinnerStyle = { 
  width: "40px", 
  height: "40px", 
  border: "4px solid #e2e8f0", 
  borderTopColor: "#0284c7", 
  borderRadius: "50%" 
};

const emptyStatePlaceholderText = { 
  width: "100%", 
  textAlign: "center", 
  paddingBottom: "40px", 
  color: "#94a3b8", 
  fontSize: "13px", 
  fontStyle: "italic" 
};

const emptyStateRow = { 
  width: "100%", 
  padding: "16px", 
  textAlign: "center", 
  color: "#94a3b8", 
  fontSize: "13px", 
  background: "#f8fafc", 
  borderRadius: "10px", 
  border: "1px dashed #cbd5e1" 
};

function MetricKPICard({ title, value, subtext, color, bg, icon }) {
  return (
    <div style={{ ...financialCardStyle, background: "#fff", borderTop: `4px solid ${color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={cardLabelText}>{title}</span>
        <div style={{ ...iconContainerFrame, background: bg, color: color }}>{icon}</div>
      </div>
      <h2 style={cardFinancialValue}>{value}</h2>
      <div style={cardBottomMetricText}>{subtext}</div>
    </div>
  );
}

function AlertRowItem({ count, label, urgency, color, icon }) {
  return (
    <div style={{ ...alertRowFrame, borderLeft: `4px solid ${color}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "18px" }}>{icon}</span>
        <div>
          <div style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>{label}</div>
          <span style={{ fontSize: "10px", fontWeight: "800", color: color, letterSpacing: "0.5px" }}>{urgency}</span>
        </div>
      </div>
      <div style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", fontFamily: "monospace" }}>{count}</div>
    </div>
  );
}

export default Dashboard;