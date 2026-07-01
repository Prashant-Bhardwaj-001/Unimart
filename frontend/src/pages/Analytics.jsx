import { useState, useEffect } from "react";
import axios from "axios";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";

// ========================================================
// MATCHED: Staging explicit route prefixes for your endpoints
// ========================================================
const ANALYTICS_BASE = "http://localhost:5000/api/analytics"; 

const COLORS = [
  "#0088FE", 
  "#00C49F", 
  "#FFBB28", 
  "#FF8042", 
  "#8884d8"
];

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);

  // Separate states synced with your 5 backend endpoints
  const [overview, setOverview] = useState({ 
    totalOrders: 0, 
    totalRevenue: 0, 
    totalTax: 0, 
    totalDiscount: 0 
  });
  const [profitData, setProfitData] = useState({ 
    totalRevenue: 0, 
    totalCost: 0, 
    totalProfit: 0 
  });
  const [topProducts, setTopProducts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [dailySales, setDailySales] = useState([]);

  const token = localStorage.getItem("token");
  const getAuthConfig = () => ({
    headers: { 
      Authorization: `Bearer ${token}` 
    },
  });

  useEffect(() => {
    const fetchAllAnalyticsData = async () => {
      try {
        setLoading(true);
        setErrorStatus(null);

        // CONCURRENT HIT: Fire all 5 explicit sub-routes at the same time
        const [overviewRes, profitRes, productsRes, paymentsRes, dailyRes] = await Promise.all([
          axios.get(`${ANALYTICS_BASE}/overview`, getAuthConfig()),
          axios.get(`${ANALYTICS_BASE}/profit`, getAuthConfig()),
          axios.get(`${ANALYTICS_BASE}/top-products`, getAuthConfig()),
          axios.get(`${ANALYTICS_BASE}/payments`, getAuthConfig()),
          axios.get(`${ANALYTICS_BASE}/daily-sales`, getAuthConfig())
        ]);

        // 1. Set Overview Data
        setOverview(overviewRes.data.data || { totalOrders: 0, totalRevenue: 0, totalTax: 0, totalDiscount: 0 });

        // 2. Set Profit Metrics
        setProfitData(profitRes.data.data || { totalRevenue: 0, totalCost: 0, totalProfit: 0 });

        // 3. Set Top Selling Products Array
        setTopProducts(productsRes.data.data || []);

        // 4. Set Payment Splitting
        setPayments(paymentsRes.data.data || []);

        // 5. Set Daily Sales Timeline (Formatting response objects dynamically for Recharts)
        const formattedDaily = (dailyRes.data.data || []).map(item => ({
          date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
          revenue: item.totalRevenue,
          orders: item.totalOrders
        })).reverse(); // Sort old to new for graphical display
        
        setDailySales(formattedDaily);
        setLoading(false);
      } catch (err) {
        console.error("Dashboard multi-stream fetch failed:", err);
        setErrorStatus(err.response?.data?.message || "Failed to establish stream connection with server.");
        setLoading(false);
      }
    };

    fetchAllAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        padding: "40px", 
        textAlign: "center", 
        fontFamily: "sans-serif" 
      }}>
        <h3 style={{ 
          color: "#2563eb" 
        }}>🔄 Running Enterprise Analytics Pipelines...</h3>
        <p style={{ 
          color: "#64748b" 
        }}>Fetching metrics from multiple sub-ledgers.</p>
      </div>
    );
  }

  if (errorStatus) {
    return (
      <div style={{ 
        padding: "40px", 
        textAlign: "center", 
        fontFamily: "sans-serif", 
        color: "#dc2626" 
      }}>
        <h3>❌ Pipeline Execution Aborted</h3>
        <p style={{ 
          color: "#475569" 
        }}>Error Root: {errorStatus}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            marginTop: "15px", 
            padding: "10px 20px", 
            background: "#2563eb", 
            color: "white", 
            border: "none", 
            borderRadius: "6px", 
            cursor: "pointer", 
            fontWeight: "bold" 
          }}
        >
          Retry Operations
        </button>
      </div>
    );
  }

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
      }}>📊 Real-Time Business Intelligence Deck</h2>
      <p style={{ 
        color: "#64748b", 
        margin: "0 0 25px 0" 
      }}>Multi-endpoint synchronized diagnostics dashboard for revenue margins, payment channels, and top product movements.</p>

      {/* KPI METRICS BLOCK */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
        gap: "20px", 
        marginBottom: "25px" 
      }}>
        <div style={cardStyle}>
          <span style={cardLabel}>Gross Turnaround</span>
          <h2 style={{ 
            color: "#2563eb", 
            margin: "10px 0 0 0" 
          }}>₹{(overview.totalRevenue || 0).toFixed(2)}</h2>
        </div>
        <div style={cardStyle}>
          <span style={cardLabel}>Net Store Profit</span>
          <h2 style={{ 
            color: "#16a34a", 
            margin: "10px 0 0 0" 
          }}>₹{(profitData.totalProfit || 0).toFixed(2)}</h2>
        </div>
        <div style={cardStyle}>
          <span style={cardLabel}>Total Staged Cost</span>
          <h2 style={{ 
            color: "#dc2626", 
            margin: "10px 0 0 0" 
          }}>₹{(profitData.totalCost || 0).toFixed(2)}</h2>
        </div>
        <div style={cardStyle}>
          <span style={cardLabel}>Completed Billings</span>
          <h2 style={{ 
            color: "#0f172a", 
            margin: "10px 0 0 0" 
          }}>{overview.totalOrders || 0} Invoice Logs</h2>
        </div>
      </div>

      {/* ADDITIONAL BREAKDOWN PILL INDICATORS */}
      <div style={{ 
        display: "flex", 
        gap: "20px", 
        marginBottom: "25px", 
        background: "#fff", 
        padding: "15px", 
        borderRadius: "12px", 
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)" 
      }}>
        <div style={{ 
          fontSize: "14px", 
          color: "#475569" 
        }}>📦 <strong>Collected Taxes Ledger:</strong> ₹{(overview.totalTax || 0).toFixed(2)}</div>
        <div style={{ 
          fontSize: "14px", 
          color: "#475569" 
        }}>🏷️ <strong>Total System Discounts Allowed:</strong> ₹{(overview.totalDiscount || 0).toFixed(2)}</div>
      </div>

      {/* ROW 1: SALES GRAPH TIMELINE */}
      <div style={{ 
        background: "white", 
        padding: "20px", 
        borderRadius: "12px", 
        boxShadow: "0 2px 6px rgba(0,0,0,0.03)", 
        marginBottom: "25px" 
      }}>
        <h3 style={{ 
          margin: "0 0 15px 0", 
          color: "#1e293b" 
        }}>📈 Daily Revenue & Operations Stream Timeline</h3>
        <div style={{ 
          width: "100%", 
          height: 300 
        }}>
          {dailySales.length === 0 ? (
            <p style={{ 
              textAlign: "center", 
              color: "#94a3b8", 
              padding: "100px 0" 
            }}>No calendar data available for current frame.</p>
          ) : (
            <ResponsiveContainer>
              <AreaChart data={dailySales} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="revenue" name="Daily Revenue (₹)" stroke="#2563eb" fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ROW 2: PIE SPLITTING AND TOP PRODUCTS BAR CHART */}
      <div style={{ 
        display: "flex", 
        gap: "25px", 
        flexWrap: "wrap" 
      }}>
        
        {/* PAYMENT SETTLEMENT DISTRIBUTION */}
        <div style={{ 
          ...blockStyle, 
          flex: 1, 
          minWidth: "300px" 
        }}>
          <h3 style={{ 
            margin: "0 0 15px 0" 
          }}>💳 Settlement Mode Allocation</h3>
          <div style={{ 
            width: "100%", 
            height: 260, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: "20px" 
          }}>
            <div style={{ 
              width: "140px", 
              height: "100%" 
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={payments} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="totalRevenue">
                    {payments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "8px", 
              fontSize: "13px" 
            }}>
              {payments.map((entry, index) => (
                <div key={entry._id} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px" 
                }}>
                  <span style={{ 
                    width: "10px", 
                    height: "10px", 
                    borderRadius: "50%", 
                    background: COLORS[index % COLORS.length], 
                    display: "inline-block" 
                  }}></span>
                  <span style={{ 
                    fontWeight: "600", 
                    color: "#1e293b" 
                  }}>{entry._id}:</span>
                  <span style={{ 
                    color: "#64748b" 
                  }}>₹{entry.totalRevenue.toFixed(2)} ({entry.totalOrders} items)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TOP SELLING PRODUCTS MOVEMENT BAR */}
        <div style={{ 
          ...blockStyle, 
          flex: 1, 
          minWidth: "400px" 
        }}>
          <h3 style={{ 
            margin: "0 0 15px 0" 
          }}>🏆 Top 10 High-Velocity Products Ledger</h3>
          <div style={{ 
            width: "100%", 
            height: 260 
          }}>
            {topProducts.length === 0 ? (
              <p style={{ 
                color: "#94a3b8", 
                textAlign: "center", 
                padding: "80px 0" 
              }}>No catalog assets moved yet.</p>
            ) : (
              <ResponsiveContainer>
                <BarChart data={topProducts} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="productName" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip formatter={(value) => `Units Sold: ${value}`} />
                  <Bar dataKey="totalSold" name="Quantity Sold" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Global Clean Dashboard Styles
const cardStyle = { 
  flex: 1, 
  background: "white", 
  padding: "20px", 
  borderRadius: "12px", 
  boxShadow: "0 2px 6px rgba(0,0,0,0.03)", 
  border: "1px solid #edf2f7" 
};

const cardLabel = { 
  fontSize: "12px", 
  fontWeight: "700", 
  color: "#64748b", 
  textTransform: "uppercase", 
  letterSpacing: "0.5px" 
};

const blockStyle = { 
  background: "white", 
  padding: "20px", 
  borderRadius: "12px", 
  boxShadow: "0 2px 6px rgba(0,0,0,0.03)", 
  border: "1px solid #edf2f7" 
};

export default Analytics;