import { useEffect, useState, Fragment } from "react";
import axios from "axios";

const CUSTOMER_API = "http://localhost:5000/api/customers";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  // See More functionality configuration tracking state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");
  
  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  // Dynamic Server-Side Search Hook
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      // Jab tak user 3 characters ya digit pure nahi karega bheed load nahi hogi
      if (searchTerm.trim().length < 3) {
        setCustomers([]);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`${CUSTOMER_API}?search=${searchTerm}`, getAuthConfig());
        setCustomers(res.data.data || res.data || []);
      } catch (err) {
        console.error("Dynamic lookup broken:", err);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const checkExistingCustomer = async (phoneStr) => {
    if (phoneStr.length < 10 || editingId) return;
    try {
      const res = await axios.get(`${CUSTOMER_API}/phone/${phoneStr}`, getAuthConfig());
      const existing = res.data.data || res.data;
      if (existing) {
        alert(`💡 Customer with phone ${phoneStr} already registered! Loading metadata profiles...`);
        handleEdit(existing);
      }
    } catch (err) {
      console.log("New registration profile trace checked.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone.trim()) {
      alert("Phone number is strictly required!");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${CUSTOMER_API}/${editingId}`, {
          name: formData.name,
          email: formData.email || null
        }, getAuthConfig());
        alert("🎉 Customer Profile Updated Successfully!");
      } else {
        await axios.post(CUSTOMER_API, {
          name: formData.name || "Walk-In Customer",
          phone: formData.phone,
          email: formData.email || null
        }, getAuthConfig());
        alert("🚀 New Customer Registered Successfully!");
      }
      
      setFormData({ name: "", phone: "", email: "" });
      setEditingId(null);
      setSearchTerm(""); 
      setCustomers([]);
    } catch (err) {
      alert(err.response?.data?.message || "Operation rejected by server core.");
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer._id);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", phone: "", email: "" });
  };

  const triggerSeeMore = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  // Conditionals for Dynamic Styles
  const conditionalInputStyle = editingId 
    ? { 
        ...inputStyle, 
        background: "#f1f5f9", 
        color: "#64748b" 
      } 
    : inputStyle;

  const submitButtonStyle = { 
    width: "100%", 
    background: editingId ? "#d97706" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", 
    color: "white", 
    border: "none", 
    padding: "12px", 
    borderRadius: "10px", 
    fontWeight: "600", 
    cursor: "pointer", 
    fontSize: "14px", 
    boxShadow: "0 4px 12px rgba(37, 205, 235, 0.2)" 
  };

  return (
    <div style={{ 
      padding: "40px 32px", 
      background: "#f8fafc", 
      minHeight: "100vh", 
      fontFamily: "'Inter', sans-serif", 
      boxSizing: "border-box" 
    }}>
      
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ 
          margin: "0 0 6px 0", 
          fontSize: "28px", 
          fontWeight: "700", 
          color: "#0f172a", 
          letterSpacing: "-0.5px" 
        }}>
          👥 Customer & Loyalty Registry Dashboard
        </h2>
        <p style={{ 
          color: "#64748b", 
          margin: 0, 
          fontSize: "15px" 
        }}>
          Manage customer profiles, query dynamic records, and audit lifestyle points logs cleanly.
        </p>
      </div>

      {/* TWO PERMANENT PARTS DIVIDE LAYOUT */}
      <div style={{ 
        display: "flex", 
        gap: "32px", 
        alignItems: "flex-start" 
      }}>
        
        {/* ==========================================
            LEFT WORKSTATION: FORM CONSOLE (35% WIDTH)
            ========================================== */}
        <div style={{ 
          flex: "0 0 35%", 
          background: "white", 
          padding: "28px", 
          borderRadius: "16px", 
          border: "1px solid #e2e8f0", 
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" 
        }}>
          <h3 style={{ 
            marginTop: 0, 
            fontSize: "18px", 
            fontWeight: "700", 
            color: "#1e293b", 
            marginBottom: "20px" 
          }}>
            {editingId ? "📝 Modify Customer Metadata" : "➕ Register New Profile"}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Mobile Phone Number *</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
                onBlur={(e) => checkExistingCustomer(e.target.value)}
                placeholder="e.g. 9876543210" 
                style={conditionalInputStyle} 
                required 
                disabled={!!editingId}
              />
              {editingId && <small style={{ 
                color: "#64748b", 
                display: "block", 
                marginTop: "4px" 
              }}>* Mobile tokens are non-mutable infrastructure keys.</small>}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Customer Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Defaults to: Walk-In Customer" 
                style={inputStyle} 
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="buyer@unimart.com" 
                style={inputStyle} 
              />
            </div>

            <button type="submit" style={submitButtonStyle}>
              {editingId ? "💾 Save Profile Changes" : "🚀 Commit Registration"}
            </button>

            {editingId && (
              <button 
                type="button" 
                onClick={resetForm}
                style={{ 
                  width: "100%", 
                  background: "#f1f5f9", 
                  color: "#475569", 
                  border: "none", 
                  padding: "12px", 
                  borderRadius: "10px", 
                  fontWeight: "600", 
                  cursor: "pointer", 
                  marginTop: "12px" 
                }}
              >
                Cancel / Reset Form
              </button>
            )}
          </form>
        </div>

        {/* ==========================================
            RIGHT WORKSTATION: SEARCH DIRECTORY (65% WIDTH)
            ========================================== */}
        <div style={{ 
          flex: "1 1 65%", 
          background: "white", 
          padding: "28px", 
          borderRadius: "16px", 
          border: "1px solid #e2e8f0", 
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" 
        }}>
          
          {/* FIXED SEARCH CONTAINER WITH EXPLICIT TEXT COLOR */}
          <div style={{ marginBottom: "28px" }}>
            <label style={{ 
              fontWeight: "700", 
              fontSize: "13px", 
              display: "block", 
              marginBottom: "8px", 
              color: "#475569", 
              letterSpacing: "0.5px" 
            }}>
              🔎 SEARCH LIVE CUSTOMER DIRECTORY
            </label>
            <input 
              type="text" 
              placeholder="Type customer name or search mobile digits..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "14px 18px", 
                borderRadius: "12px", 
                border: "2px solid #4f46e5", 
                fontSize: "15px", 
                outline: "none", 
                background: "#ffffff", 
                color: "#0f172a", 
                boxSizing: "border-box",
                boxShadow: "0 0 0 4px rgba(79, 70, 229, 0.08)"
              }}
            />
          </div>

          {searchTerm.trim().length < 3 ? (
            <div style={{ 
              color: "#64748b", 
              textAlign: "center", 
              padding: "64px 0", 
              background: "#f8fafc", 
              borderRadius: "12px", 
              border: "1px dashed #cbd5e1", 
              fontWeight: "500" 
            }}>
              ⚡ Type at least <strong>3 characters</strong> of phone or buyer name to match active network ledgers.
            </div>
          ) : loading ? (
            <div style={{ 
              textAlign: "center", 
              padding: "40px", 
              color: "#64748b", 
              fontWeight: "500" 
            }}>Searching ledger nodes...</div>
          ) : customers.length === 0 ? (
            <div style={{ 
              color: "#ef4444", 
              textAlign: "center", 
              padding: "40px 0", 
              fontWeight: "500" 
            }}>📭 No verified profiles discovered.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ 
                width: "100%", 
                borderCollapse: "collapse" 
              }}>
                <thead>
                  <tr style={{ 
                    background: "#f8fafc", 
                    borderBottom: "2px solid #e2e8f0", 
                    textAlign: "left" 
                  }}>
                    <th style={thStyle}>Identity Profile</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Loyalty Balance</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Actions Panel</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={tdStyle}>
                        <span style={{ 
                          fontWeight: "600", 
                          color: "#0f172a", 
                          fontSize: "15px" 
                        }}>{c.name}</span>
                        <div style={{ 
                          fontSize: "12px", 
                          color: "#64748b", 
                          marginTop: "3px" 
                        }}>
                          📱 {c.phone} {c.email && ` | ✉️ ${c.email}`}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <span style={{ 
                          background: "#fef3c7", 
                          color: "#b45309", 
                          padding: "4px 10px", 
                          borderRadius: "8px", 
                          fontWeight: "700", 
                          fontSize: "12px" 
                        }}>
                          🏅 {c.loyaltyPoints || 0} pts
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <div style={{ 
                          display: "inline-flex", 
                          gap: "8px" 
                        }}>
                          <button 
                            type="button"
                            onClick={() => triggerSeeMore(c)} 
                            style={{ 
                              background: "#f1f5f9", 
                              color: "#1e293b", 
                              border: "none", 
                              padding: "6px 12px", 
                              borderRadius: "8px", 
                              cursor: "pointer", 
                              fontWeight: "600", 
                              fontSize: "13px" 
                            }}
                          >
                            🔎 See More
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleEdit(c)} 
                            style={{ 
                              background: "#eff6ff", 
                              color: "#2563eb", 
                              border: "none", 
                              padding: "6px 12px", 
                              borderRadius: "8px", 
                              cursor: "pointer", 
                              fontWeight: "600", 
                              fontSize: "13px" 
                            }}
                          >
                            Modify
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* EXTENDED PROFILE SUMMARY MODAL (SEE MORE DETAILS) */}
      {showDetailsModal && selectedCustomer && (
        <div style={{ 
          position: "fixed", 
          inset: 0, 
          background: "rgba(15, 23, 42, 0.6)", 
          backdropFilter: "blur(4px)", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          zIndex: 1100 
        }}>
          <div style={{ 
            background: "white", 
            width: "100%", 
            maxWidth: "480px", 
            padding: "32px", 
            borderRadius: "16px", 
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
          }}>
            
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              borderBottom: "1px solid #e2e8f0", 
              paddingBottom: "16px", 
              marginBottom: "20px" 
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: "20px", 
                fontWeight: "700", 
                color: "#0f172a" 
              }}>📊 Customer Analytics Profile</h3>
              <button onClick={() => setShowDetailsModal(false)} style={{ 
                background: "none", 
                border: "none", 
                fontSize: "22px", 
                cursor: "pointer", 
                color: "#94a3b8" 
              }}>✕</button>
            </div>

            <div style={{ 
              background: "#f8fafc", 
              padding: "16px", 
              borderRadius: "12px", 
              border: "1px solid #e2e8f0", 
              marginBottom: "20px" 
            }}>
              <div style={{ 
                fontSize: "18px", 
                fontWeight: "700", 
                color: "#0f172a" 
              }}>{selectedCustomer.name}</div>
              <div style={{ 
                fontSize: "13px", 
                color: "#64748b", 
                marginTop: "4px", 
                fontFamily: "monospace" 
              }}>System Code: {selectedCustomer.customerCode || `CUST-${selectedCustomer._id?.slice(-6).toUpperCase()}`}</div>
            </div>

            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr", 
              gap: "16px", 
              marginBottom: "24px" 
            }}>
              <div style={metricBox}>
                <span style={metricLabel}>Total Orders Filed</span>
                <strong style={{ 
                  fontSize: "18px", 
                  color: "#2563eb" 
                }}>{selectedCustomer.totalOrders || 0} bills</strong>
              </div>
              <div style={metricBox}>
                <span style={metricLabel}>Life-Time Remittance</span>
                <strong style={{ 
                  fontSize: "18px", 
                  color: "#16a34a" 
                }}>₹{selectedCustomer.totalSpent?.toFixed(2) || "0.00"}</strong>
              </div>
              <div style={{ 
                ...metricBox, 
                gridColumn: "span 2", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center" 
              }}>
                <div>
                  <span style={metricLabel}>Current Points Bank</span>
                  <strong style={{ 
                    fontSize: "22px", 
                    color: "#d97706", 
                    display: "block", 
                    marginTop: "2px" 
                  }}>{selectedCustomer.loyaltyPoints || 0} pts</strong>
                </div>
                <span style={{ fontSize: "32px" }}>🏅</span>
              </div>
            </div>

            {selectedCustomer.lastPurchaseDate && (
              <div style={{ 
                fontSize: "13px", 
                color: "#64748b", 
                background: "#f1f5f9", 
                padding: "12px", 
                borderRadius: "8px", 
                textAlign: "center" 
              }}>
                📅 Last Active Checkout Timestamp: <strong>{new Date(selectedCustomer.lastPurchaseDate).toLocaleDateString("en-IN")}</strong>
              </div>
            )}

            <button onClick={() => setShowDetailsModal(false)} style={{ 
              width: "100%", 
              background: "#0f172a", 
              color: "white", 
              border: "none", 
              padding: "12px", 
              borderRadius: "10px", 
              fontWeight: "600", 
              cursor: "pointer", 
              marginTop: "24px", 
              fontSize: "14px" 
            }}>
              Dismiss Operational Summary
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

// Global Micro-Styles System
const thStyle = { 
  padding: "14px 16px", 
  borderBottom: "2px solid #e2e8f0", 
  color: "#475569", 
  fontSize: "13px", 
  fontWeight: "600", 
  textTransform: "uppercase", 
  letterSpacing: "0.5px" 
};

const tdStyle = { 
  padding: "16px" 
};

const labelStyle = { 
  display: "block", 
  marginBottom: "6px", 
  fontWeight: "600", 
  fontSize: "13px", 
  color: "#475569" 
};

const inputStyle = { 
  width: "100%", 
  padding: "11px 14px", 
  borderRadius: "10px", 
  border: "1px solid #cbd5e1", 
  boxSizing: "border-box", 
  outline: "none", 
  color: "#0f172a", 
  fontFamily: "inherit", 
  background: "#ffffff" 
};

const metricBox = { 
  background: "#f8fafc", 
  padding: "14px 16px", 
  borderRadius: "12px", 
  border: "1px solid #e2e8f0", 
  display: "flex", 
  flexDirection: "column", 
  gap: "4px" 
};

const metricLabel = { 
  fontSize: "12px", 
  fontWeight: "600", 
  color: "#64748b", 
  textTransform: "uppercase", 
  letterSpacing: "0.3px" 
};

export default Customers;