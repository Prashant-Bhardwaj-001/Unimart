import { useEffect, useState } from "react";
import api from "../services/api"; // Centralized API instance for backend communication

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    password: "", 
    phone: "",
    alternatePhone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
    website: "",
    notes: "",
  });

  // Fetch Suppliers via Centralized API instance
  const fetchSuppliers = async () => {
    try {
      const res = await api.get("/suppliers");
      setSuppliers(res.data.data || res.data || []);
    } catch (err) {
      console.log("Error fetching suppliers:", err);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Create Supplier
  const createSupplier = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/suppliers", formData);
      
      setFormData({
        companyName: "",
        contactPerson: "",
        email: "",
        password: "",
        phone: "",
        alternatePhone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        gstNumber: "",
        website: "",
        notes: "",
      });
      setShowModal(false);
      fetchSuppliers();
      alert("Supplier added successfully! 🎉");
    } catch (err) {
      console.log("Error creating supplier:", err);
      alert(err.response?.data?.message || "Failed to create supplier node.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Active/Inactive Status
  const toggleStatus = async (id) => {
    try {
      await api.patch(`/suppliers/${id}/status`, {});
      fetchSuppliers();
    } catch (err) {
      console.log("Error toggling status:", err);
    }
  };

  // Delete Supplier Contract
  const handleDeleteSupplier = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this supplier contract? This will affect products linked to this vendor.")) {
      try {
        await api.delete(`/suppliers/${id}`);
        alert("🗑️ Supplier completely removed from database.");
        fetchSuppliers();
      } catch (err) {
        console.log("Error deleting supplier:", err);
        alert(err.response?.data?.message || "Failed to delete supplier.");
      }
    }
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      supplier.contactPerson?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={pageContainerStyle}>
      
      {/* Header */}
      <div style={headerSectionStyle}>
        <div>
          <h1 style={mainHeadingStyle}>Supplier Management</h1>
          <p style={subHeadingStyle}>
            Monitor and manage your supermarket vendor partner accounts and logistics metrics efficiently.
          </p>
        </div>

        <button onClick={() => setShowModal(true)} style={addSupplierBtnStyle}>
          + Add New Supplier
        </button>
      </div>

      {/* Analytics Cards */}
      <div style={cardsGridStyle}>
        <Card title="Total Suppliers" value={suppliers.length} borderLeft="5px solid #4f46e5" />
        <Card title="Active Vendors" value={suppliers.filter((s) => s.isActive).length} borderLeft="5px solid #16a34a" />
        <Card title="Inactive Vendors" value={suppliers.filter((s) => !s.isActive).length} borderLeft="5px solid #dc2626" />
      </div>

      {/* Search Bar */}
      <div style={searchBarContainerStyle}>
        <input
          type="text"
          placeholder="🔍 Search by Company identity or Contact Person name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      {/* Table Workstation */}
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr style={tableHeaderRowStyle}>
              <th style={thStyle}>Code</th>
              <th style={thStyle}>Company Name</th>
              <th style={thStyle}>Contact Person</th>
              <th style={thStyle}>Email Address</th>
              <th style={thStyle}>City</th>
              <th style={thStyle}>Status</th>
              <th style={thCenterStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan="7" style={emptyTableStyle}>
                  📭 No active suppliers matched your criteria.
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((supplier) => (
                <tr key={supplier._id} style={tableRowStyle}>
                  <td style={tdStyle}>
                    <span style={supplierCodeBadgeStyle}>
                      {supplier.supplierCode || "N/A"}
                    </span>
                  </td>
                  <td style={companyNameStyle}>{supplier.companyName}</td>
                  <td style={tdStyle}>{supplier.contactPerson}</td>
                  <td style={emailTdStyle}>{supplier.email}</td>
                  <td style={tdStyle}>{supplier.city || "-"}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        background: supplier.isActive ? "#dcfce7" : "#fee2e2",
                        color: supplier.isActive ? "#16a34a" : "#dc2626",
                        padding: "5px 12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "600",
                        display: "inline-block",
                      }}
                    >
                      {supplier.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  
                  <td style={thCenterStyle}>
                    <div style={actionButtonGroupStyle}>
                      <button onClick={() => toggleStatus(supplier._id)} style={statusToggleBtnStyle(supplier.isActive)}>
                        {supplier.isActive ? "Deactivate" : "Activate"}
                      </button>

                      <button onClick={() => handleDeleteSupplier(supplier._id)} style={deleteBtnStyle}>
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>🤝 Add New Vendor Partner</h2>
              <button onClick={() => setShowModal(false)} style={modalCloseBtnStyle}>
                ✕
              </button>
            </div>

            <form onSubmit={createSupplier}>
              <div style={modalFormGridStyle}>
                {Object.keys(formData).map((field) => {
                  const label = field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
                  const isFullWidth = field === "address" || field === "notes";
                  const isRequired = field === "companyName" || field === "contactPerson" || field === "email" || field === "password";

                  return (
                    <div key={field} style={{ gridColumn: isFullWidth ? "span 2" : "span 1" }}>
                      <label style={formLabelStyle}>
                        {label} {isRequired ? "*" : ""}
                      </label>
                      <input
                        type={field === "password" ? "password" : "text"}
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        required={isRequired}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                        style={formInputStyle}
                      />
                    </div>
                  );
                })}
              </div>

              <div style={modalActionsStyle}>
                <button type="button" onClick={() => setShowModal(false)} style={modalCancelBtnStyle}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={modalSubmitBtnStyle}>
                  {loading ? "Saving Node..." : "Save Supplier"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Sub-Component Card
function Card({ title, value, borderLeft }) {
  return (
    <div
      style={{
        flex: 1,
        background: "#fff",
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        borderLeft: borderLeft,
        borderLeftWidth: "6px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.01)"
      }}
    >
      <div style={cardTitleStyle}>{title}</div>
      <div style={cardValueStyle}>{value}</div>
    </div>
  );
}

// ==========================================
// CLEAN CSS OBJECTS (EVERY PROPERTY ON NEXT LINE)
// ==========================================

const pageContainerStyle = {
  minHeight: "100vh",
  minWidth: "100%",
  background: "#f8fafc",
  padding: "40px 32px",
  fontFamily: "'Inter', system-ui, sans-serif",
  boxSizing: "border-box"
};

const headerSectionStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "32px"
};

const mainHeadingStyle = {
  margin: 0,
  fontSize: "32px",
  fontWeight: "700",
  color: "#0f172a",
  letterSpacing: "-0.5px"
};

const subHeadingStyle = {
  color: "#64748b",
  margin: "6px 0 0 0",
  fontSize: "15px"
};

const addSupplierBtnStyle = {
  background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
  color: "#fff",
  border: "none",
  padding: "12px 24px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)"
};

const cardsGridStyle = {
  display: "flex",
  gap: "24px",
  marginBottom: "32px"
};

const searchBarContainerStyle = {
  position: "relative",
  marginBottom: "32px"
};

const searchInputStyle = {
  width: "100%",
  padding: "14px 18px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  boxSizing: "border-box",
  fontSize: "15px",
  background: "#fff",
  color: "#0f172a",
  outline: "none"
};

const tableContainerStyle = {
  background: "#fff",
  borderRadius: "16px",
  overflow: "hidden",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse"
};

const tableHeaderRowStyle = {
  background: "#f8fafc",
  borderBottom: "2px solid #edf2f7"
};

const tableRowStyle = {
  borderBottom: "1px solid #f1f5f9"
};

const supplierCodeBadgeStyle = {
  fontFamily: "monospace",
  background: "#f1f5f9",
  padding: "4px 8px",
  borderRadius: "6px",
  fontWeight: "600",
  fontSize: "13px",
  color: "#475569"
};

const companyNameStyle = {
  padding: "16px 14px",
  color: "#0f172a",
  fontSize: "14px",
  verticalAlign: "middle",
  fontWeight: "600"
};

const emailTdStyle = {
  padding: "16px 14px",
  fontSize: "14px",
  verticalAlign: "middle",
  color: "#64748b"
};

const actionButtonGroupStyle = {
  display: "inline-flex",
  gap: "8px",
  justifyContent: "center",
  width: "100%"
};

const statusToggleBtnStyle = (isActive) => ({
  background: isActive ? "#f1f5f9" : "#eff6ff",
  color: isActive ? "#475569" : "#4f46e5",
  border: "none",
  padding: "6px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600"
});

const deleteBtnStyle = {
  background: "#fef2f2",
  color: "#dc2626",
  border: "1px solid #fee2e2",
  padding: "6px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600"
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.6)",
  backdropFilter: "blur(4px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1100
};

const modalContentStyle = {
  background: "white",
  width: "750px",
  maxHeight: "85vh",
  overflowY: "auto",
  padding: "32px",
  borderRadius: "16px",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  boxSizing: "border-box"
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px"
};

const modalTitleStyle = {
  margin: 0,
  fontSize: "24px",
  color: "#0f172a",
  fontWeight: "700",
  letterSpacing: "-0.5px"
};

const modalCloseBtnStyle = {
  background: "none",
  border: "none",
  fontSize: "24px",
  cursor: "pointer",
  color: "#94a3b8"
};

const modalFormGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
  marginBottom: "28px"
};

const formLabelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  color: "#475569",
  marginBottom: "6px"
};

const formInputStyle = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  fontSize: "14px",
  boxSizing: "border-box",
  outline: "none",
  background: "#ffffff",
  color: "#0f172a"
};

const modalActionsStyle = {
  display: "flex",
  gap: "12px",
  justifyContent: "flex-end",
  borderTop: "1px solid #e2e8f0",
  paddingTop: "20px"
};

const modalCancelBtnStyle = {
  background: "#f1f5f9",
  color: "#475569",
  border: "none",
  padding: "12px 20px",
  borderRadius: "10px",
  fontWeight: "600",
  cursor: "pointer",
  fontSize: "14px"
};

const modalSubmitBtnStyle = {
  background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
  color: "white",
  border: "none",
  padding: "12px 24px",
  borderRadius: "10px",
  fontWeight: "600",
  cursor: "pointer",
  fontSize: "14px"
};

const cardTitleStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const cardValueStyle = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#0f172a",
  marginTop: "6px"
};

const thStyle = {
  padding: "16px 14px",
  textAlign: "left",
  color: "#475569",
  fontSize: "13px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const thCenterStyle = {
  padding: "16px 14px",
  color: "#475569",
  fontSize: "13px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  textAlign: "center"
};

const tdStyle = {
  padding: "16px 14px",
  color: "#334155",
  fontSize: "14px",
  verticalAlign: "middle"
};

const emptyTableStyle = {
  padding: "16px 14px",
  fontSize: "14px",
  verticalAlign: "middle",
  textAlign: "center",
  color: "#94a3b8",
  fontWeight: "500"
};