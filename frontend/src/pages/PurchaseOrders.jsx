import { useEffect, useState, Fragment } from "react";
import api from "../services/api"; 

function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const [formData, setFormData] = useState({
    supplier: "",
    expectedDeliveryDate: "",
    notes: "",
    items: [{ product: "", quantity: 1, costPrice: 0 }],
  });

  const fetchOrders = async () => {
    try {
      const res = await api.get("/purchase-orders");
      setOrders(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await api.get("/suppliers");
      setSuppliers(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
    fetchProducts();
  }, []);

  const createPurchaseOrder = async (e) => {
    e.preventDefault();
    try {
      await api.post("/purchase-orders", formData);
      setShowModal(false);
      setFormData({
        supplier: "",
        expectedDeliveryDate: "",
        notes: "",
        items: [{ product: "", quantity: 1, costPrice: 0 }],
      });
      fetchOrders();
      alert("🎉 Purchase Order Generated and Dispatched Successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to finalize Purchase Order.");
    }
  };

  const filteredProductsForSelectedSupplier = products.filter(
    (product) => product.supplier === formData.supplier || product.supplier?._id === formData.supplier
  );

  const filteredOrders = orders.filter((order) =>
    order.poNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRowExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Purchase Orders</h1>
          <p style={styles.headerSub}>
            Manage and track all procurement logs, inventory stocking pipelines, and supplier fulfillment chains.
          </p>
        </div>

        <button onClick={() => setShowModal(true)} style={styles.createBtn}>
          + Create New PO
        </button>
      </div>

      {/* DASHBOARD METRIC CARDS */}
      <div style={styles.cardContainer}>
        <Card title="Total PO" value={orders.length} borderLeft="6px solid #6366f1" />
        <Card title="Pending" value={orders.filter((o) => o.status === "PENDING").length} borderLeft="6px solid #f59e0b" />
        <Card title="Delivered" value={orders.filter((o) => o.status === "DELIVERED").length} borderLeft="6px solid #10b981" />
        <Card title="Closed" value={orders.filter((o) => o.status === "CLOSED").length} borderLeft="6px solid #64748b" />
      </div>

      {/* SEARCH FIELD */}
      <div style={styles.searchWrapper}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search by PO Sequence Identifier Number (e.g. PO-1001)..."
          style={styles.searchInput}
        />
      </div>

      {/* PURCHASE ORDER DIRECTORY TABLE */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={{ ...styles.th, width: "50px" }}></th>
              <th style={styles.th}>PO Number</th>
              <th style={styles.th}>Supplier Partner</th>
              <th style={styles.th}>Total Amount</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Created By</th>
              <th style={styles.th}>Order Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.noDataTd}>
                  📭 No active purchase order streams discovered.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const isExpanded = expandedOrderId === order._id;
                return (
                  <Fragment key={order._id}>
                    <tr
                      onClick={() => toggleRowExpand(order._id)}
                      style={{
                        ...styles.tableBodyRow,
                        background: isExpanded ? "#f8fafc" : "transparent",
                      }}
                    >
                      <td style={styles.expandArrowTd}>
                        {isExpanded ? "▼" : "▶"}
                      </td>
                      <td style={{ ...styles.td, fontWeight: "600" }}>
                        <span style={styles.poBadge}>
                          {order.poNumber}
                        </span>
                      </td>
                      <td style={{ ...styles.td, color: "#1e293b", fontWeight: "600" }}>
                        🏢 {order.supplier?.companyName || "Unknown Vendor"}
                      </td>
                      <td style={{ ...styles.td, fontWeight: "700", color: "#0f172a" }}>
                        ₹ {order.totalAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            background: order.status === "DELIVERED" ? "#dcfce7" : order.status === "PENDING" ? "#fef3c7" : "#e0f2fe",
                            color: order.status === "DELIVERED" ? "#16a34a" : order.status === "PENDING" ? "#d97706" : "#0369a1",
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td style={{ ...styles.td, color: "#64748b", fontWeight: "500" }}>
                        👤 {order.createdBy?.name || "System Executive"}
                      </td>
                      <td style={{ ...styles.td, color: "#64748b" }}>
                        📅 {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>

                    {/* EXPANDED DETAILS (SCREENSHOT SPECIFIC) */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="7" style={styles.expandedWrapperTd}>
                          <div style={styles.expandedCard}>
                            
                            {/* PO Title Block */}
                            <div style={styles.metaHeaderBlock}>
                              <h2 style={styles.mainTitle}>OFFICIAL PURCHASE ORDER</h2>
                              <div style={styles.metaRow}>
                                <strong>PO Code:</strong> {order.poNumber}
                              </div>
                              <div style={styles.metaRow}>
                                <strong>Generated On:</strong> {new Date(order.createdAt).toLocaleString("en-IN")}
                              </div>
                            </div>

                            {/* Supplier Section */}
                            <div style={styles.supplierBlock}>
                              <div style={styles.supplierLabel}>SUPPLIER / VENDOR</div>
                              <div style={styles.supplierName}>🏢 {order.supplier?.companyName || "Unknown Vendor"}</div>
                              <div style={styles.fulfillmentRow}>
                                Fulfillment Due: {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString("en-IN") : "Immediate Delivery Request"}
                              </div>
                            </div>

                            {/* Itemized Grid Table */}
                            <table style={styles.itemTable}>
                              <thead>
                                <tr>
                                  <th style={styles.tableTh}>Item Asset Descriptor</th>
                                  <th style={{ ...styles.tableTh, textAlign: "right" }}>Quantity</th>
                                  <th style={{ ...styles.tableTh, textAlign: "right" }}>Cost Price Basis</th>
                                  <th style={{ ...styles.tableTh, textAlign: "right" }}>Cumulative Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items?.map((item, idx) => (
                                  <tr key={idx}>
                                    <td style={styles.tableTd}>📦 {item.product?.name || "Unmapped SKU Asset"}</td>
                                    <td style={{ ...styles.tableTd, textAlign: "right", fontFamily: "monospace" }}>{item.quantity} units</td>
                                    <td style={{ ...styles.tableTd, textAlign: "right", fontFamily: "monospace" }}>₹{item.costPrice?.toFixed(2)}</td>
                                    <td style={{ ...styles.tableTd, textAlign: "right", fontWeight: "700", color: "#0f172a", fontFamily: "monospace" }}>
                                      ₹{(item.quantity * item.costPrice)?.toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                                <tr>
                                  <td colSpan="3" style={styles.tableGrandTotalLabel}>Grand Total:</td>
                                  <td style={styles.tableGrandTotalValue}>
                                    ₹{order.totalAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CONSOLE MODAL WINDOW */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <form onSubmit={createPurchaseOrder} style={styles.modalForm}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>📝 Create Purchase Order (PO)</h2>
              <button type="button" onClick={() => setShowModal(false)} style={styles.modalCloseBtn}>
                ✕
              </button>
            </div>

            <div style={styles.formGrid}>
              <div>
                <label style={styles.labelStyle}>Select Supplier Partner *</label>
                <select
                  required
                  value={formData.supplier}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    supplier: e.target.value,
                    items: [{ product: "", quantity: 1, costPrice: 0 }] 
                  })}
                  style={styles.inputStyle}
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
                <label style={styles.labelStyle}>Expected Delivery Date</label>
                <input
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                  style={styles.inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={styles.labelStyle}>Internal PO Notes</label>
              <textarea
                placeholder="Enter shipment criteria clauses..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={styles.textareaStyle}
              />
            </div>

            <div style={styles.matrixSection}>
              <h3 style={styles.matrixTitle}>📦 Line Items Execution Matrix</h3>

              {!formData.supplier ? (
                <div style={styles.matrixWarning}>
                  ⚠️ Please select a Supplier Partner above to unlock their linked catalog assets list.
                </div>
              ) : (
                formData.items.map((item, index) => (
                  <div key={index} style={styles.matrixRow}>
                    <div>
                      <label style={{ ...styles.labelStyle, fontSize: "12px" }}>Product Mapping Selection *</label>
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
                        style={styles.matrixSelect}
                      >
                        <option value="">-- Choose Catalog SKU Asset --</option>
                        {filteredProductsForSelectedSupplier.map((product) => (
                          <option key={product._id} value={product._id}>
                            📦 {product.name} ({product.sku})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ ...styles.labelStyle, fontSize: "12px" }}>Quantity *</label>
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
                        style={styles.matrixInput}
                      />
                    </div>

                    <div>
                      <label style={{ ...styles.labelStyle, fontSize: "12px" }}>Estimated Base Cost (₹) *</label>
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
                        style={styles.matrixInput}
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
                  style={styles.addMatrixItemBtn}
                >
                  + Add Another Matrix Item
                </button>
              )}
            </div>

            <div style={styles.modalControls}>
              <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>
                Cancel
              </button>
              <button type="submit" style={styles.submitBtn}>
                Authorize & Send PO
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, borderLeft }) {
  return (
    <div style={{ ...styles.card, borderLeft: borderLeft }}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value}</div>
    </div>
  );
}


const styles = {
  container: {
    background: "#f8fafc",
    minHeight: "100vh",
    padding: "40px 32px",
    fontFamily: "'Inter', system-ui, sans-serif",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  headerTitle: {
    margin: "0",
    fontSize: "32px",
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  headerSub: {
    color: "#64748b",
    margin: "6px 0 0 0",
    fontSize: "15px",
  },
  createBtn: {
    background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
  },
  cardContainer: {
    display: "flex",
    gap: "24px",
    marginBottom: "32px",
  },
  card: {
    flex: "1",
    background: "white",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.01)",
    border: "1px solid #e2e8f0",
    borderLeftWidth: "6px",
  },
  cardTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  cardValue: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#0f172a",
    marginTop: "6px",
  },
  searchWrapper: {
    position: "relative",
    marginBottom: "32px",
  },
  searchInput: {
    width: "100%",
    padding: "14px 18px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    boxSizing: "border-box",
    fontSize: "15px",
    background: "#fff",
    outline: "none",
  },
  tableCard: {
    background: "white",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },
  tableHeaderRow: {
    background: "#f8fafc",
    borderBottom: "2px solid #edf2f7",
  },
  th: {
    padding: "16px 14px",
    textAlign: "left",
    color: "#475569",
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  td: {
    padding: "16px 14px",
    verticalAlign: "middle",
    wordBreak: "break-word",
  },
  tableBodyRow: {
    borderBottom: "1px solid #f1f5f9",
    cursor: "pointer",
    transition: "background 0.15s ease",
  },
  noDataTd: {
    padding: "40px",
    textAlign: "center",
    color: "#94a3b8",
    fontWeight: "500",
    fontSize: "15px",
  },
  expandArrowTd: {
    padding: "16px 14px",
    verticalAlign: "middle",
    textAlign: "center",
    fontSize: "12px",
    color: "#64748b",
  },
  poBadge: {
    fontFamily: "monospace",
    background: "#eef2ff",
    color: "#4f46e5",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "13px",
  },
  statusBadge: {
    padding: "5px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
  },
  expandedWrapperTd: {
    padding: "20px 32px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  expandedCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "24px",
  },
  metaHeaderBlock: {
    textAlign: "center",
    paddingBottom: "16px",
    borderBottom: "1px solid #e2e8f0",
    marginBottom: "20px",
  },
  mainTitle: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 10px 0",
    letterSpacing: "0.2px",
  },
  metaRow: {
    fontSize: "15px",
    margin: "4px 0",
    color: "#475569",
  },
  supplierBlock: {
    marginBottom: "24px",
  },
  supplierLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "6px",
  },
  supplierName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "4px 0",
  },
  fulfillmentRow: {
    fontSize: "14px",
    color: "#64748b",
    marginTop: "2px",
  },
  itemTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableTh: {
    background: "#f8fafc",
    padding: "10px 12px",
    fontSize: "11px",
    textTransform: "uppercase",
    color: "#64748b",
    borderBottom: "2px solid #cbd5e1",
    textAlign: "left",
    fontWeight: "700",
    letterSpacing: "0.3px",
  },
  tableTd: {
    padding: "12px",
    fontSize: "13px",
    color: "#334155",
    borderBottom: "1px solid #f1f5f9",
  },
  tableGrandTotalLabel: {
    padding: "12px",
    fontSize: "13px",
    textAlign: "right",
    fontWeight: "700",
    borderTop: "1px solid #cbd5e1",
    color: "#1e293b",
  },
  tableGrandTotalValue: {
    padding: "12px",
    fontSize: "13px",
    textAlign: "right",
    fontWeight: "700",
    color: "#4f46e5",
    borderTop: "1px solid #cbd5e1",
    fontFamily: "monospace",
  },
  modalOverlay: {
    position: "fixed",
    inset: "0",
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "1100",
  },
  modalForm: {
    background: "white",
    width: "850px",
    maxHeight: "85vh",
    overflowY: "auto",
    padding: "32px",
    borderRadius: "16px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    boxSizing: "border-box",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  modalTitle: {
    margin: "0",
    fontSize: "24px",
    color: "#0f172a",
    fontWeight: "700",
    letterSpacing: "-0.5px",
  },
  modalCloseBtn: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#94a3b8",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  labelStyle: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
    marginBottom: "6px",
  },
  inputStyle: {
    width: "100%",
    padding: "11px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    background: "#ffffff",
    color: "#0f172a",
  },
  textareaStyle: {
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
    resize: "none",
  },
  matrixSection: {
    borderTop: "1px solid #e2e8f0",
    paddingTop: "20px",
    marginBottom: "24px",
  },
  matrixTitle: {
    margin: "0 0 16px 0",
    fontSize: "16px",
    color: "#1e293b",
    fontWeight: "700",
  },
  matrixWarning: {
    padding: "20px",
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    borderRadius: "12px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
  },
  matrixRow: {
    display: "grid",
    gridTemplateColumns: "3fr 1fr 1.5fr",
    gap: "16px",
    alignItems: "center",
    marginBottom: "12px",
    background: "#f8fafc",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  matrixSelect: {
    width: "100%",
    padding: "11px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    color: "#0f172a",
    marginBottom: "0",
    background: "#fff",
  },
  matrixInput: {
    width: "100%",
    padding: "11px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    color: "#0f172a",
    marginBottom: "0",
    background: "#fff",
  },
  addMatrixItemBtn: {
    background: "#ffffff",
    color: "#4f46e5",
    border: "1px dashed #4f46e5",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    marginTop: "8px",
  },
  modalControls: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "20px",
  },
  cancelBtn: {
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    padding: "12px 20px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
  },
};

export default PurchaseOrders;