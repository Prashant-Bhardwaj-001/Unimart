
import { useEffect, useState } from "react";
import api from "../services/api";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  
  const [activeTab, setActiveTab] = useState("ADMIN");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CASHIER",
    phone: "",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users", formData);
      setShowModal(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "CASHIER",
        phone: "",
      });
      fetchUsers();
      alert("User created successfully");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to create user");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/users/${id}/status`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this user terminal?")) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
        alert("User completely removed.");
      } catch (err) {
        console.error(err);
        alert(err?.response?.data?.message || "Failed to delete user");
      }
    }
  };

  // Search Filter
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Role Navigation Configuration
  const ROLE_SECTIONS = [
    { key: "ADMIN", title: "👑 Admin Terminals", color: "#ef4444", bg: "#fef2f2" },
    { key: "MANAGER", title: "💼 Store Managers", color: "#f59e0b", bg: "#fffbeb" },
    { key: "CASHIER", title: "💵 Cashier Operators", color: "#10b981", bg: "#f0fdf4" },
    { key: "SUPPLIER", title: "🚛 Logistics Suppliers", color: "#3b82f6", bg: "#eff6ff" }
  ];

  const currentTabUsers = filteredUsers.filter(u => u.role === activeTab);
  const currentSectionMeta = ROLE_SECTIONS.find(s => s.key === activeTab);

 return (
    <div 
      style={{ 
        padding: "40px 0", 
        background: "#f8fafc", 
        minHeight: "100vh",
        width: "100%", 
        fontFamily: "'Inter', sans-serif" 
      }}
    >
      
      {/* HEADER OPERATIONS BAR */}
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "32px" 
        }}
      >
        <div>
          <h1 
            style={{ 
              margin: 0, 
              fontSize: "32px", 
              fontWeight: "700", 
              color: "#0f172a", 
              letterSpacing: "-0.5px" 
            }}
          >
            Users Management
          </h1>
          <p 
            style={{ 
              margin: "4px 0 0 0", 
              color: "#64748b", 
              fontSize: "15px" 
            }}
          >
            Monitor and manage access configurations across structured role hierarchies.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "#fff",
            border: "none",
            padding: "12px 24px",
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
          }}
        >
          + Create Operator
        </button>
      </div>

      {/* SEARCH FIELD */}
      <div 
        style={{ 
          position: "relative", 
          marginBottom: "32px" 
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search users inside current operational block..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            outline: "none",
            fontSize: "15px",
            boxSizing: "border-box",
            background: "#fff",
            color:"black"
          }}
        />
      </div>

      {/* ROLE TABS NAVBAR */}
      <div 
        style={{
          
          display: "flex",
          background: "#ffffff",
          padding: "6px",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          marginBottom: "36px",
          gap: "4px",
          overflowX: "auto"
        }}
      >
        {ROLE_SECTIONS.map((tab) => {
          const count = filteredUsers.filter(u => u.role === tab.key).length;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                minWidth: "160px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "12px 16px",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                background: isActive ? tab.bg : "transparent",
                color: isActive ? tab.color : "#64748b",
                boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              }}
            >
              <span>{tab.title}</span>
              <span 
                style={{
                  fontSize: "11px",
                  background: isActive ? tab.color : "#f1f5f9",
                  color: isActive ? "#ffffff" : "#64748b",
                  padding: "2px 8px",
                  borderRadius: "20px",
                  fontWeight: "700"
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* CARDS CONTAINER WHERE ACCTUAL USERS CARDS SHOWS */}
      {loading ? (
        <div 
          style={{ 
            padding: "40px", 
            textAlign: "center", 
            color: "#000000", 
            fontWeight: "500" 
          }}
        >
          Synchronizing user nodes...
        </div>
      ) : (
        <div 
          style={{ 
            borderLeft: `4px solid ${currentSectionMeta?.color}`, 
            paddingLeft: "20px" 
          }}
        >
          {currentTabUsers.length === 0 ? (
            <div 
              style={{ 
                background: "#ffffff", 
                border: "1px dashed #cbd5e1", 
                borderRadius: "16px", 
                padding: "48px", 
                textAlign: "center", 
                color: "#64748b" 
              }}
            >
              📭 No active users registered under {currentSectionMeta?.title}.
            </div>
          ) : (
            <div 
              style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
                gap: "24px" 
              }}
            >
              {currentTabUsers.map((user) => (
                <div
                  key={user._id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    padding: "24px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.01), 0 2px 4px -1px rgba(0,0,0,0.01)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div 
                      style={{ 
                        display: "flex", 
                        justifyContent: "flex-end", 
                        marginBottom: "12px" 
                      }}
                    >
                      <span 
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          color: user.isActive ? "#16a34a" : "#dc2626"
                        }}
                      >
                        <span 
                          style={{ 
                            width: "8px", 
                            height: "8px", 
                            background: user.isActive ? "#16a34a" : "#dc2626", 
                            borderRadius: "50%" 
                          }}
                        ></span>
                        {user.isActive ? "Active" : "Suspended"}
                      </span>
                    </div>

                    <h3 
                      style={{ 
                        margin: "0 0 6px 0", 
                        fontSize: "18px", 
                        fontWeight: "700", 
                        color: "#0f172a" 
                      }}
                    >
                      {user.name}
                    </h3>
                    
                    <p 
                      style={{ 
                        margin: "0 0 10px 0", 
                        fontSize: "14px", 
                        color: "#64748b", 
                        wordBreak: "break-all" 
                      }}
                    >
                      ✉️ {user.email}
                    </p>

                    <p 
                      style={{ 
                        margin: "0 0 20px 0", 
                        fontSize: "14px", 
                        color: "#64748b" 
                      }}
                    >
                      📞 {user.phone || "No phone added"}
                    </p>
                  </div>

                  {/* CARD ACTIONS */}
                  <div 
                    style={{ 
                      display: "flex", 
                      gap: "12px", 
                      borderTop: "1px solid #f1f5f9", 
                      paddingTop: "16px", 
                      marginTop: "12px" 
                    }}
                  >
                    <button
                      onClick={() => handleToggleStatus(user._id)}
                      style={{
                        flex: 1,
                        background: user.isActive ? "#f1f5f9" : "#eff6ff",
                        color: user.isActive ? "#475569" : "#2563eb",
                        border: "none",
                        padding: "10px",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      {user.isActive ? "🚫 Suspend" : "✅ Activate"}
                    </button>

                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      style={{
                        background: "#fef2f2",
                        color: "#dc2626",
                        border: "1px solid #fee2e2",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* 
       this code is for showing the modal for creating a new user 
       in this when on clicking the create operator button showmodal became the true and condtion runs and when clicking on dismiss button the modal will hide */}
      {showModal && (
        <div 
          style={{ 
            position: "fixed", 
            inset: 0, 
            background: "rgba(15, 23, 42, 0.6)", 
            backdropFilter: "blur(4px)", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            zIndex: 1100 
          }}
        >
          <form
            onSubmit={handleCreateUser}
            style={{ 
              background: "#fff", 
              padding: "32px", 
              width: "100%", 
              maxWidth: "460px", 
              borderRadius: "16px", 
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" 
            }}
          >
            <h2 
              style={{ 
                margin: "0 0 6px 0", 
                fontSize: "24px", 
                fontWeight: "700", 
                color: "#0f172a" 
              }}
            >
              Add System Node
            </h2>
            <p 
              style={{ 
                margin: "0 0 24px 0", 
                color: "#64748b", 
                fontSize: "14px" 
              }}
            >
              Register a completely new credential into active infrastructure.
            </p>

            <div 
              style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "16px", 
                marginBottom: "28px" 
              }}
            >
              <div>
                <label style={labelStyle}>Full Operator Name *</label>
                <input
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  required
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={modalInputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Secure Corporate Email *</label>
                <input
                  type="email"
                  placeholder="name@unimart.com"
                  value={formData.email}
                  required
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={modalInputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Security Password *</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  required
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={modalInputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Operational Contact Phone</label>
                <input
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={modalInputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>System Role Node *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{
                    ...modalInputStyle, 
                    appearance: "none", 
                    cursor: "pointer"
                  }}
                >
                  <option value="ADMIN">👑 ADMIN NODE</option>
                  <option value="MANAGER">💼 MANAGER TERMINAL</option>
                  <option value="CASHIER">💵 CASHIER CONSOLE</option>
                  
                </select>
              </div>
            </div>

            <div 
              style={{ 
                display: "flex", 
                justifyContent: "flex-end", 
                gap: "12px", 
                borderTop: "1px solid #e2e8f0", 
                paddingTop: "20px" 
              }}
            >
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ 
                  background: "#f1f5f9", 
                  color: "#475569", 
                  border: "none", 
                  padding: "12px 20px", 
                  borderRadius: "10px", 
                  fontWeight: "600", 
                  cursor: "pointer", 
                  fontSize: "14px" 
                }}
              >
                Dismiss
              </button>

              <button
                type="submit"
                style={{ 
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", 
                  color: "#fff", 
                  border: "none", 
                  padding: "12px 20px", 
                  borderRadius: "10px", 
                  fontWeight: "600", 
                  cursor: "pointer", 
                  fontSize: "14px", 
                  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)" 
                }}
              >
                Authorize User
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// UPGRADED & CLEAN INPUT BOX STYLES
const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  color: "#475569",
  marginBottom: "6px"
};

const modalInputStyle = {
  width: "100%",
  padding: "12px 16px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  fontSize: "14px",
  color: "#0f172a",
  outline: "none",
  background: "#ffffff",
  boxSizing: "border-box",
  transition: "all 0.15s ease-in-out",
  fontFamily: "inherit"
};

export default Users;