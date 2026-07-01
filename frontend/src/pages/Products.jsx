import { useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    sku: "",
    category: "",
    brand: "",
    supplier: "", 
    costPrice: "",
    sellingPrice: "",
    stockQuantity: "",
    unit: "PCS",
  });

  const token = localStorage.getItem("token");
  
  

const fetchProducts = async () => {
  try {
   
    const res = await api.get("/products");
    setProducts(res.data.data || res.data || []);
  } catch (error) {
    console.log(error);
  }
};

const fetchSuppliers = async () => {
  try {
    
    const res = await api.get("/suppliers");
    setSuppliers(res.data.data || res.data || []);
  } catch (error) {
    console.log(error);
  }
};

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplier) {
      alert("⚠️ Error: Assigning a registered Supplier Vendor is strictly mandatory.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/products", formData);
      alert("🎉 Product Saved successfully into Master Catalog");

      setFormData({
        name: "",
        barcode: "",
        sku: "",
        category: "",
        brand: "",
        supplier: "",
        costPrice: "",
        sellingPrice: "",
        stockQuantity: "",
        unit: "PCS",
      });

      setShowForm(false);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong while adding asset.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to permanently delete this product from master catalog inventory?")) {
      try {
        setLoading(true);
        await api.delete(`/products/${productId}`);
        alert("🗑️ Product removed successfully.");
        fetchProducts(); 
      } catch (error) {
        alert(error.response?.data?.message || "Failed to remove product from server backend terminal.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={pageContainerStyle}>
      
      {/* HEADER SECTION */}
      <div style={headerSectionStyle}>
        <div>
          <h2 style={mainHeadingStyle}>📦 Product Master Catalog</h2>
          <p style={subHeadingStyle}>
            Register new inventory SKU codes and tie active master distribution pipelines to authorized supplier contracts.
          </p>
        </div>

        {!showForm && (
          <button onClick={() => setShowForm(true)} style={addProductBtnStyle}>
            ➕ Add Product
          </button>
        )}
      </div>

      <div style={mainLayoutStyle}>
        
        {/* CONDITIONAL FORM */}
        {showForm && (
          <div style={formContainerStyle}>
            <div style={formHeaderStyle}>
              <h3 style={formTitleStyle}>➕ Register SKU Core Item</h3>
              <button type="button" onClick={() => setShowForm(false)} style={cancelBtnStyle}>
                ❌ Cancel
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={formGridStyle}>
                <div>
                  <label style={labelStyle}>Product Identity Name *</label>
                  <input type="text" name="name" placeholder="e.g. Wireless Mouse" value={formData.name} onChange={handleChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Barcode String *</label>
                  <input type="text" name="barcode" placeholder="Scan or type code" value={formData.barcode} onChange={handleChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>SKU Core Code *</label>
                  <input type="text" name="sku" placeholder="e.g. ELEC-MOU-01" value={formData.sku} onChange={handleChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <input type="text" name="category" placeholder="e.g. Electronics" value={formData.category} onChange={handleChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Brand</label>
                  <input type="text" name="brand" placeholder="e.g. Logitech" value={formData.brand} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={supplierLabelStyle}>Assigned Supplier Vendor *</label>
                  <select name="supplier" value={formData.supplier} onChange={handleChange} style={supplierSelectStyle} required>
                    <option value="" disabled hidden>-- Select Contract --</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>🚛 {supplier.companyName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Cost Price (₹) *</label>
                  <input type="number" name="costPrice" placeholder="0.00" value={formData.costPrice} onChange={handleChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Selling Price (₹) *</label>
                  <input type="number" name="sellingPrice" placeholder="0.00" value={formData.sellingPrice} onChange={handleChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Opening Qty</label>
                  <input type="number" name="stockQuantity" placeholder="0" value={formData.stockQuantity} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Stock Unit</label>
                  <select name="unit" value={formData.unit} onChange={handleChange} style={unitSelectStyle}>
                    <option value="PCS">PCS</option>
                    <option value="KG">KG</option>
                    <option value="GRAM">GRAM</option>
                    <option value="LITRE">LITRE</option>
                    <option value="ML">ML</option>
                    <option value="BOX">BOX</option>
                    <option value="PACK">PACK</option>
                  </select>
                </div>
              </div>

              <div style={formActionsStyle}>
                <button type="submit" disabled={loading} style={submitBtnStyle}>
                  {loading ? "Adding Assets..." : "🚀 Save Master Product"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TABLE DIRECTORY */}
        <div style={tableContainerStyle}>
          <h3 style={tableTitleStyle}>📋 Master Products Directory</h3>
          
          <div style={tableResponsiveStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={thStyle}>Product Details</th>
                  <th style={thStyle}>SKU Key</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Staged Stock</th>
                  <th style={thStyle}>Selling Price</th>
                  <th style={thStyle}>Vendor Supplier</th>
                  <th style={thCenterStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={emptyTableStyle}>
                      📭 No operational items found in terminal directory.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const isLowStock = product.stockQuantity <= 10;
                    const stockStyle = {
                      fontWeight: "700",
                      color: isLowStock ? "#ef4444" : "#0f172a",
                      background: isLowStock ? "#fef2f2" : "transparent",
                      padding: isLowStock ? "4px 8px" : "0",
                      borderRadius: "6px"
                    };

                    return (
                      <tr key={product._id} style={tableRowStyle}>
                        <td style={tdStyle}>
                          <span style={productNameStyle}>{product.name}</span>
                          {product.brand && <div style={productBrandStyle}>Brand: {product.brand}</div>}
                        </td>
                        <td style={skuTdStyle}>{product.sku}</td>
                        <td style={tdStyle}>
                          <span style={categoryBadgeStyle}>{product.category}</span>
                        </td>
                        <td style={tdStyle}>
                          <span style={stockStyle}>
                            {product.stockQuantity} {product.unit || "PCS"}
                          </span>
                        </td>
                        <td style={priceTdStyle}>₹{product.sellingPrice?.toFixed(2)}</td>
                        <td style={vendorTdStyle}>
                          {product.supplier?.companyName ? `🏢 ${product.supplier.companyName}` : <span style={missingContractStyle}>⚠️ Missing Contract</span>}
                        </td>
                        <td style={thCenterStyle}>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            style={deleteBtnStyle}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#dc2626";
                              e.currentTarget.style.color = "#ffffff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#fef2f2";
                              e.currentTarget.style.color = "#dc2626";
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};



const pageContainerStyle = {
  padding: "40px 32px",
  background: "#f8fafc",
  minHeight: "100vh",
  fontFamily: "'Inter', sans-serif"
};

const headerSectionStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "36px",
  flexWrap: "wrap",
  gap: "16px"
};

const mainHeadingStyle = {
  margin: "0 0 6px 0",
  fontSize: "28px",
  fontWeight: "700",
  color: "#0f172a",
  letterSpacing: "-0.5px"
};

const subHeadingStyle = {
  color: "#64748b",
  margin: 0,
  fontSize: "15px"
};

const addProductBtnStyle = {
  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
  color: "white",
  border: "none",
  padding: "12px 24px",
  borderRadius: "10px",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)"
};

const mainLayoutStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "32px"
};

const formContainerStyle = {
  background: "white",
  padding: "28px",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
};

const formHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px"
};

const formTitleStyle = {
  margin: 0,
  fontSize: "18px",
  fontWeight: "700",
  color: "#1e293b"
};

const cancelBtnStyle = {
  background: "none",
  border: "none",
  color: "#64748b",
  fontWeight: "600",
  cursor: "pointer",
  fontSize: "14px"
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
  marginBottom: "20px"
};

const formActionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px"
};

const submitBtnStyle = {
  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
  color: "white",
  border: "none",
  padding: "12px 28px",
  borderRadius: "10px",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer"
};

const tableContainerStyle = {
  background: "white",
  padding: "28px",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
};

const tableTitleStyle = {
  marginTop: 0,
  marginBottom: "20px",
  fontSize: "18px",
  fontWeight: "700",
  color: "#1e293b"
};

const tableResponsiveStyle = {
  overflowX: "auto"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px"
};

const tableHeaderRowStyle = {
  background: "#f8fafc",
  textAlign: "left",
  color: "#475569"
};

const tableRowStyle = {
  borderBottom: "1px solid #f1f5f9",
  transition: "all 0.2s"
};

const productNameStyle = {
  fontWeight: "600",
  color: "#0f172a"
};

const productBrandStyle = {
  fontSize: "12px",
  color: "#64748b",
  marginTop: "2px"
};

const categoryBadgeStyle = {
  fontSize: "12px",
  background: "#eff6ff",
  border: "1px solid #dbeafe",
  padding: "4px 10px",
  borderRadius: "8px",
  color: "#1e40af",
  fontWeight: "500"
};

const missingContractStyle = {
  color: "#dc2626",
  fontSize: "12px"
};

const deleteBtnStyle = {
  border: "1px solid #fee2e2",
  background: "#fef2f2",
  color: "#dc2626",
  padding: "6px 12px",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "12px",
  cursor: "pointer",
  transition: "all 0.15s ease-in-out"
};

const thStyle = { 
  padding: "14px 12px", 
  borderBottom: "2px solid #e2e8f0", 
  fontSize: "13px", 
  fontWeight: "600", 
  color: "#475569" 
};

const thCenterStyle = { 
  padding: "14px 12px", 
  borderBottom: "2px solid #e2e8f0", 
  fontSize: "13px", 
  fontWeight: "600", 
  color: "#475569",
  textAlign: "center" 
};

const tdStyle = { 
  padding: "16px 12px", 
  verticalAlign: "middle" 
};

const skuTdStyle = {
  padding: "16px 12px", 
  verticalAlign: "middle",
  fontFamily: "monospace", 
  color: "#64748b", 
  fontSize: "13px"
};

const priceTdStyle = {
  padding: "16px 12px", 
  verticalAlign: "middle",
  fontWeight: "700", 
  color: "#0f172a"
};

const vendorTdStyle = {
  padding: "16px 12px", 
  verticalAlign: "middle",
  color: "#475569", 
  fontWeight: "500"
};

const labelStyle = { 
  display: "block", 
  marginBottom: "6px", 
  fontWeight: "600", 
  fontSize: "13px", 
  color: "#475569" 
};

const supplierLabelStyle = {
  display: "block", 
  marginBottom: "6px", 
  fontWeight: "600", 
  fontSize: "13px", 
  color: "#2563eb"
};

const inputStyle = { 
  width: "100%", 
  padding: "11px 14px", 
  borderRadius: "10px", 
  border: "1px solid #cbd5e1", 
  boxSizing: "border-box", 
  fontSize: "14px", 
  outline: "none",
  color: "#0f172a",
  fontFamily: "inherit"
};

const supplierSelectStyle = {
  width: "100%", 
  padding: "11px 14px", 
  borderRadius: "10px", 
  border: "1px solid #cbd5e1", 
  boxSizing: "border-box", 
  fontSize: "14px", 
  outline: "none",
  color: "#0f172a",
  fontFamily: "inherit",
  background: "#f8fafc", 
  borderColor: "#bfdbfe", 
  cursor: "pointer"
};

const unitSelectStyle = {
  width: "100%", 
  padding: "11px 14px", 
  borderRadius: "10px", 
  border: "1px solid #cbd5e1", 
  boxSizing: "border-box", 
  fontSize: "14px", 
  outline: "none",
  color: "#0f172a",
  fontFamily: "inherit",
  cursor: "pointer"
};

const emptyTableStyle = {
  textAlign: "center", 
  padding: "40px", 
  color: "#94a3b8", 
  fontWeight: "500"
};

export default Product;