import { useEffect, useState, Fragment } from "react";

import api from "../services/api";  

function Inventory() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [showPOModal, setShowPOModal] = useState(false);

  const [formData, setFormData] = useState({
    supplier: "",
    expectedDeliveryDate: "",
    notes: "",
    items: [
      {
        product: "",
        quantity: 1,
        costPrice: 0,
      },
    ],
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data.data || res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await api.get("/suppliers");
      setSuppliers(res.data.data || res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const handleInstantReorder = (product) => {
    const sId = product.supplier._id || product.supplier;
    
    setFormData({
      supplier: sId,
      expectedDeliveryDate: "",
      notes: `👉 Automated system trigger from Low Stock/Out Of Stock alert for item: ${product.name}.`,
      items: [
        {
          product: product._id,
          quantity: 10,
          costPrice: product.costPrice || 0,
        },
      ],
    });
    setShowPOModal(true);
  };

  const createPurchaseOrder = async (e) => {
    e.preventDefault();
    try {
      await api.post("/purchase-orders", formData);
      setShowPOModal(false);
      setFormData({
        supplier: "",
        expectedDeliveryDate: "",
        notes: "",
        items: [{ product: "", quantity: 1, costPrice: 0 }],
      });
      alert("🎉 Purchase Order Generated and Dispatched Successfully!");
      fetchProducts(); 
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed to finalize Purchase Order.");
    }
  };

  const filteredProductsForSelectedSupplier = products.filter(
    (product) => product.supplier === formData.supplier || product.supplier?._id === formData.supplier
  );

  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(search.toLowerCase()) ||
      product.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const totalProducts = products.length;
  const totalStock = products.reduce((total, p) => total + (p.stockQuantity || 0), 0);
  const lowStock = products.filter((p) => p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0).length;
  const outOfStock = products.filter((p) => p.stockQuantity === 0).length;

  return (
    <div style={containerStyle}>
      
      {/* Header */}
      <div style={headerBlockStyle}>
        <h1 style={mainTitleStyle}>Inventory Management</h1>
        <p style={subtitleStyle}>
          Monitor live supermarket stock quantities, observe threshold configurations, and restock low assets directly.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div style={analyticsGridStyle}>
        <Card title="Total Unique Products" value={totalProducts} borderLeft="5px solid #2563eb" />
        <Card title="Cumulative Stock" value={totalStock} borderLeft="5px solid #10b981" />
        <Card title="Low Stock Warning" value={lowStock} borderLeft="5px solid #f59e0b" />
        <Card title="Out Of Stock Critical" value={outOfStock} borderLeft="5px solid #ef4444" />
      </div>

      {/* Search Engine */}
      <div style={searchContainerStyle}>
        <input
          type="text"
          placeholder="🔍 Search master inventory database by Product identity or SKU key..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      {/* Main Table Workstation */}
      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr style={tableHeaderRowStyle}>
              <th style={th}>Product Details</th>
              <th style={th}>SKU Key</th>
              <th style={th}>Category</th>
              <th style={th}>Supplier Partner</th>
              <th style={th}>Current Stock</th>
              <th style={th}>Reorder Level</th>
              <th style={th}>Status / Controls</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" style={emptyStateStyle}>
                  📭 No matching inventory items tracked.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const isOutOfStock = product.stockQuantity === 0;
                const isLowStock = product.stockQuantity <= (product.lowStockThreshold || product.reorderLevel) && product.stockQuantity > 0;

                return (
                  <tr key={product._id} style={tableBodyRowStyle}>
                    <td style={td}>
                      <span style={productNameStyle}>{product.name}</span>
                      {product.brand && <span style={brandNameStyle}>Brand: {product.brand}</span>}
                    </td>
                    <td style={skuStyle}>{product.sku}</td>
                    <td style={td}>
                      <span style={categoryBadgeStyle}>{product.category}</span>
                    </td>
                    <td style={vendorTextStyle}>🏢 {product.supplier?.companyName || "Direct Vendor"}</td>
                    <td style={{ 
                      ...td, 
                      fontWeight: "700", 
                      color: isOutOfStock ? "#ef4444" : isLowStock ? "#d97706" : "#0f172a" 
                    }}>
                      {product.stockQuantity} <span style={unitTextStyle}>{product.unit || "PCS"}</span>
                    </td>
                    <td style={reorderLevelStyle}>{product.reorderLevel || product.lowStockThreshold || 10}</td>
                    <td style={td}>
                      <div style={statusContainerStyle}>
                        {isOutOfStock ? (
                          <span style={outOfStockBadgeStyle}>Out Of Stock</span>
                        ) : isLowStock ? (
                          <span style={lowStockBadgeStyle}>Low Stock</span>
                        ) : (
                          <span style={inStockBadgeStyle}>In Stock</span>
                        )}

                        {(isOutOfStock || isLowStock) && (
                          <button
                            onClick={() => handleInstantReorder(product)}
                            style={instantReorderButtonStyle}
                          >
                            ⚡ Reorder
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PO GENERATION MODAL WINDOW */}
      {showPOModal && (
        <div style={modalBackdropStyle}>
          <form onSubmit={createPurchaseOrder} style={modalFormStyle}>
            
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>
                📝 Create Purchase Order (PO)
              </h2>
              <button type="button" onClick={() => setShowPOModal(false)} style={modalCloseButtonStyle}>
                ✕
              </button>
            </div>

            {/* Master Fields Grid */}
            <div style={modalFormGridStyle}>
              <div>
                <label style={labelStyle}>Supplier Partner *</label>
                <select
                  required
                  value={formData.supplier}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    supplier: e.target.value,
                    items: [{ product: "", quantity: 1, costPrice: 0 }] 
                  })}
                  style={inputStyle}
                >
                  <option value="">-- Choose Authorized Vendor --</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      🚛 {supplier.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Expected Delivery Date</label>
                <input
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Internal PO Notes</label>
              <textarea
                placeholder="Enter shipment criteria clauses..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={textareaStyle}
              />
            </div>

            {/* LINE ITEMS SHEET MAP */}
            <div style={lineItemsContainerStyle}>
              <h3 style={lineItemsTitleStyle}>
                📦 Line Items Execution Matrix
              </h3>

              {!formData.supplier ? (
                <div style={emptyLineItemsStyle}>
                  ⚠️ Please select a Supplier Partner above to unlock catalog assets list.
                </div>
              ) : (
                formData.items.map((item, index) => (
                  <div key={index} style={lineItemRowStyle}>
                    <div>
                      <label style={lineItemLabelStyle}>Product Mapping Selection *</label>
                      <select
                        required
                        value={item.product}
                        onChange={(e) => {
                          const items = [...formData.items];
                          items[index].product = e.target.value;
                          const matchedProduct = filteredProductsForSelectedSupplier.find(p => p._id === e.target.value);
                          if(matchedProduct) {
                            items[index].costPrice = matchedProduct.costPrice || 0;
                          }
                          setFormData({ ...formData, items });
                        }}
                        style={lineItemSelectStyle}
                      >
                        <option value="">-- Choose Catalog SKU Asset --</option>
                        {filteredProductsForSelectedSupplier.map((p) => (
                          <option key={p._id} value={p._id}>
                            📦 {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={lineItemLabelStyle}>Quantity *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const items = [...formData.items];
                          items[index].quantity = Number(e.target.value);
                          setFormData({ ...formData, items });
                        }}
                        style={lineItemSelectStyle}
                      />
                    </div>

                    <div>
                      <label style={lineItemLabelStyle}>Estimated Base Cost (₹) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={item.costPrice}
                        onChange={(e) => {
                          const items = [...formData.items];
                          items[index].costPrice = Number(e.target.value);
                          setFormData({ ...formData, items });
                        }}
                        style={lineItemSelectStyle}
                      />
                    </div>
                  </div>
                ))
              )}

              {formData.supplier && (
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      items: [...formData.items, { product: "", quantity: 1, costPrice: 0 }],
                    })
                  }
                  style={addItemsButtonStyle}
                >
                  + Add Another Matrix Item
                </button>
              )}
            </div>

            {/* CONTROLS */}
            <div style={modalActionRowStyle}>
              <button type="button" onClick={() => setShowPOModal(false)} style={cancelButtonStyle}>
                Cancel
              </button>
              <button type="submit" style={confirmButtonStyle}>
                Authorize & Send PO
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* TOKENIZED CARD COMPONENT WITH SINGLE PROPERTY PER LINE CSS */
function Card({ title, value, borderLeft }) {
  return (
    <div style={{ 
      flex: 1, 
      background: "white", 
      padding: "24px", 
      borderRadius: "16px", 
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.01)", 
      border: "1px solid #e2e8f0", 
      borderLeft: borderLeft, 
      borderLeftWidth: "6px" 
    }}>
      <div style={{ 
        fontSize: "13px", 
        fontWeight: "600", 
        color: "#64748b", 
        textTransform: "uppercase", 
        letterSpacing: "0.5px" 
      }}>{title}</div>
      <div style={{ 
        fontSize: "32px", 
        fontWeight: "700", 
        color: "#0f172a", 
        marginTop: "6px" 
      }}>{value}</div>
    </div>
  );
}

/* EVERY SINGLE CSS PROPERTY BROKEN INTO A NEW LINE */
const containerStyle = { 
  padding: "40px 32px", 
  background: "#f8fafc", 
  minHeight: "100vh", 
  fontFamily: "'Inter', sans-serif", 
  boxSizing: "border-box" 
};

const headerBlockStyle = { 
  marginBottom: "32px" 
};

const mainTitleStyle = { 
  margin: "0", 
  fontSize: "32px", 
  fontWeight: "700", 
  color: "#0f172a", 
  letterSpacing: "-0.5px" 
};

const subtitleStyle = { 
  color: "#64748b", 
  margin: "6px 0 0 0", 
  fontSize: "15px" 
};

const analyticsGridStyle = { 
  display: "flex", 
  gap: "24px", 
  marginBottom: "32px" 
};

const searchContainerStyle = { 
  position: "relative", 
  marginBottom: "32px" 
};

const searchInputStyle = { 
  width: "100%", 
  padding: "14px 18px", 
  border: "1px solid #e2e8f0", 
  borderRadius: "12px", 
  boxSizing: "border-box", 
  fontSize: "15px", 
  background: "#fff", 
  outline: "none", 
  color: "#0f172a" 
};

const tableWrapperStyle = { 
  background: "white", 
  borderRadius: "16px", 
  overflow: "hidden", 
  border: "1px solid #e2e8f0", 
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" 
};

const tableStyle = { 
  width: "100%", 
  borderCollapse: "collapse" 
};

const tableHeaderRowStyle = { 
  background: "#f8fafc", 
  borderBottom: "2px solid #edf2f7" 
};

const tableBodyRowStyle = { 
  borderBottom: "1px solid #f1f5f9" 
};

const emptyStateStyle = { 
  textAlign: "center", 
  color: "#94a3b8", 
  padding: "40px", 
  fontWeight: "500", 
  verticalAlign: "middle" 
};

const productNameStyle = { 
  fontWeight: "600", 
  color: "#0f172a", 
  display: "block" 
};

const brandNameStyle = { 
  fontSize: "12px", 
  color: "#64748b" 
};

const skuStyle = { 
  padding: "16px 14px", 
  verticalAlign: "middle", 
  fontFamily: "monospace", 
  color: "#475569", 
  fontSize: "13px" 
};

const categoryBadgeStyle = { 
  fontSize: "12px", 
  background: "#f1f5f9", 
  padding: "4px 8px", 
  borderRadius: "8px", 
  color: "#475569", 
  fontWeight: "500" 
};

const vendorTextStyle = { 
  padding: "16px 14px", 
  verticalAlign: "middle", 
  color: "#1e293b", 
  fontWeight: "500" 
};

const unitTextStyle = { 
  fontSize: "12px", 
  fontWeight: "400", 
  color: "#64748b" 
};

const reorderLevelStyle = { 
  padding: "16px 14px", 
  verticalAlign: "middle", 
  color: "#475569", 
  fontFamily: "monospace" 
};

const statusContainerStyle = { 
  display: "flex", 
  alignItems: "center", 
  gap: "12px" 
};

const outOfStockBadgeStyle = { 
  background: "#fee2e2", 
  color: "#dc2626", 
  padding: "5px 12px", 
  borderRadius: "8px", 
  fontSize: "12px", 
  fontWeight: "600" 
};

const lowStockBadgeStyle = { 
  background: "#fef3c7", 
  color: "#b45309", 
  padding: "5px 12px", 
  borderRadius: "8px", 
  fontSize: "12px", 
  fontWeight: "600" 
};

const inStockBadgeStyle = { 
  background: "#dcfce7", 
  color: "#15803d", 
  padding: "5px 12px", 
  borderRadius: "8px", 
  fontSize: "12px", 
  fontWeight: "600" 
};

const instantReorderButtonStyle = { 
  background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)", 
  color: "#ffffff", 
  border: "none", 
  padding: "6px 14px", 
  borderRadius: "8px", 
  fontSize: "12px", 
  fontWeight: "600", 
  cursor: "pointer", 
  boxShadow: "0 2px 6px rgba(79, 70, 229, 0.2)" 
};

const modalBackdropStyle = { 
  position: "fixed", 
  inset: "0", 
  background: "rgba(15, 23, 42, 0.6)", 
  backdropFilter: "blur(4px)", 
  display: "flex", 
  justifyContent: "center", 
  alignItems: "center", 
  zIndex: "1100" 
};

const modalFormStyle = { 
  background: "white", 
  width: "850px", 
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
  margin: "0", 
  fontSize: "24px", 
  color: "#0f172a", 
  fontWeight: "700", 
  letterSpacing: "-0.5px" 
};

const modalCloseButtonStyle = { 
  background: "none", 
  border: "none", 
  fontSize: "24px", 
  cursor: "pointer", 
  color: "#94a3b8" 
};

const modalFormGridStyle = { 
  display: "grid", 
  gridTemplateColumns: "1fr 1fr", 
  gap: "20px", 
  marginBottom: "20px" 
};

const lineItemsContainerStyle = { 
  borderTop: "1px solid #e2e8f0", 
  paddingTop: "20px", 
  marginBottom: "24px" 
};

const lineItemsTitleStyle = { 
  margin: "0 0 16px 0", 
  fontSize: "16px", 
  color: "#1e293b", 
  fontWeight: "700" 
};

const emptyLineItemsStyle = { 
  padding: "20px", 
  background: "#f8fafc", 
  border: "1px dashed #cbd5e1", 
  borderRadius: "12px", 
  textAlign: "center", 
  color: "#64748b", 
  fontSize: "14px" 
};

const lineItemRowStyle = { 
  display: "grid", 
  gridTemplateColumns: "3fr 1fr 1.5fr", 
  gap: "16px", 
  alignItems: "center", 
  marginBottom: "12px", 
  background: "#f8fafc", 
  padding: "16px", 
  borderRadius: "12px", 
  border: "1px solid #e2e8f0" 
};

const lineItemLabelStyle = { 
  display: "block", 
  fontSize: "12px", 
  fontWeight: "600", 
  color: "#475569", 
  marginBottom: "6px" 
};

const lineItemSelectStyle = { 
  width: "100%", 
  padding: "11px 14px", 
  border: "1px solid #cbd5e1", 
  borderRadius: "10px", 
  fontSize: "14px", 
  boxSizing: "border-box", 
  outline: "none", 
  background: "#fff", 
  color: "#0f172a", 
  marginBottom: "0" 
};

const addItemsButtonStyle = { 
  background: "#ffffff", 
  color: "#4f46e5", 
  border: "1px dashed #4f46e5", 
  padding: "10px 16px", 
  borderRadius: "10px", 
  cursor: "pointer", 
  fontWeight: "600", 
  fontSize: "13px", 
  marginTop: "8px" 
};

const modalActionRowStyle = { 
  display: "flex", 
  gap: "12px", 
  justifyContent: "flex-end", 
  borderTop: "1px solid #e2e8f0", 
  paddingTop: "20px" 
};

const cancelButtonStyle = { 
  background: "#f1f5f9", 
  color: "#475569", 
  border: "none", 
  padding: "12px 20px", 
  borderRadius: "10px", 
  fontWeight: "600", 
  cursor: "pointer", 
  fontSize: "14px" 
};

const confirmButtonStyle = { 
  background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)", 
  color: "white", 
  border: "none", 
  padding: "12px 24px", 
  borderRadius: "10px", 
  fontWeight: "600", 
  cursor: "pointer", 
  fontSize: "14px", 
  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)" 
};

const textareaStyle = { 
  width: "100%", 
  padding: "11px 14px", 
  border: "1px solid #cbd5e1", 
  borderRadius: "10px", 
  fontSize: "14px", 
  boxSizing: "border-box", 
  outline: "none", 
  background: "#ffffff", 
  color: "#0f172a", 
  height: "80px", 
  resize: "none" 
};

const th = { 
  padding: "16px 14px", 
  textAlign: "left", 
  color: "#475569", 
  fontSize: "13px", 
  fontWeight: "600", 
  textTransform: "uppercase", 
  letterSpacing: "0.5px" 
};

const td = { 
  padding: "16px 14px", 
  verticalAlign: "middle" 
};

const labelStyle = { 
  display: "block", 
  fontSize: "13px", 
  fontWeight: "600", 
  color: "#475569", 
  marginBottom: "6px" 
};

const inputStyle = { 
  width: "100%", 
  padding: "11px 14px", 
  border: "1px solid #cbd5e1", 
  borderRadius: "10px", 
  fontSize: "14px", 
  boxSizing: "border-box", 
  outline: "none", 
  background: "#ffffff", 
  color: "#0f172a" 
};

export default Inventory;