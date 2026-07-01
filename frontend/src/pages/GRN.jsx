import { useEffect, useState, Fragment } from "react";
import api from "../services/api";

function GRN() {
  const [receipts, setReceipts] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [expandedGrnId, setExpandedGrnId] = useState(null);

  const [formData, setFormData] = useState({
    purchaseOrderId: "",
    notes: "",
    items: [],
  });

  const fetchReceipts = async () => {
    try {
      const res = await api.get("/goods-receipts");
      setReceipts(res.data.data || res.data || []);
    } catch (err) {
      console.log("Error fetching GRNs:", err);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const res = await api.get("/purchase-orders");
      const allPOs = res.data.data || res.data || [];
      const shipped = allPOs.filter((po) => po.status === "SHIPPED");
      setPurchaseOrders(shipped);
    } catch (err) {
      console.log("Error fetching POs:", err);
    }
  };

  useEffect(() => {
    fetchReceipts();
    fetchPurchaseOrders();
  }, []);

  const handlePOSelect = async (poId) => {
    if (!poId) {
      setFormData({ purchaseOrderId: "", notes: "", items: [] });
      return;
    }
    try {
      const res = await api.get(`/purchase-orders/${poId}`);
      const order = res.data.data || res.data;

      setFormData({
        purchaseOrderId: poId,
        notes: "",
        items: (order.items || []).map((item) => ({
          product: item.product._id || item.product,
          productName: item.product.name || "Staged SKU Item",
          orderedQuantity: item.quantity,
          receivedQuantity: item.quantity, 
        })),
      });
    } catch (err) {
      console.log("Failed to load detailed items for PO:", err);
    }
  };

  const receiveGoods = async (e) => {
    e.preventDefault();
    if (!formData.purchaseOrderId) {
      alert("Please select a Purchase Order first.");
      return;
    }
    try {
      await api.post("/goods-receipts/receive", formData);
      alert("🎉 Goods Received Note (GRN) Processed and Stock Updated!");
      setShowModal(false);
      setFormData({ purchaseOrderId: "", notes: "", items: [] });
      
      fetchReceipts();
      fetchPurchaseOrders(); 
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || "Something went wrong during GRN push.");
    }
  };

  const toggleGrnExpand = (id) => {
    setExpandedGrnId(expandedGrnId === id ? null : id);
  };

  return (
    <div style={containerStyle}>
      
      {/* Header Section */}
      <div style={headerSectionStyle}>
        <div>
          <h1 style={mainTitleStyle}>Goods Receipt Notes (GRN)</h1>
          <p style={subtitleStyle}>
            Track inbound inventory arrivals, verify product shipments, and reconcile physical warehouse counts.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} style={addGrnButtonStyle}>
          + Receive Inbound Goods
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div style={analyticsGridStyle}>
        <Card title="Total GRN Filed" value={receipts.length} borderLeft="5px solid #2563eb" />
        <Card title="Active Shipped POs" value={purchaseOrders.length} borderLeft="5px solid #f59e0b" />
        <Card title="Total Distinct Batches" value={receipts.reduce((tot, r) => tot + (r.items?.length || 0), 0)} borderLeft="5px solid #10b981" />
      </div>

      {/* GRN Logs Table View */}
      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr style={tableHeaderRowStyle}>
              <th style={{ ...th, width: "50px" }}></th>
              <th style={th}>GRN Number</th>
              <th style={th}>Supplier Vendor</th>
              <th style={th}>Distinct Items</th>
              <th style={th}>Inward Officer</th>
              <th style={th}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {receipts.length === 0 ? (
              <tr>
                <td colSpan="6" style={emptyStateStyle}>
                  📭 No GRN records managed in database yet.
                </td>
              </tr>
            ) : (
              receipts.map((receipt) => {
                const isExpanded = expandedGrnId === receipt._id;
                return (
                  <Fragment key={receipt._id}>
                    <tr 
                      onClick={() => toggleGrnExpand(receipt._id)}
                      style={{ 
                        borderBottom: "1px solid #f1f5f9", 
                        cursor: "pointer", 
                        background: isExpanded ? "#f8fafc" : "transparent",
                        transition: "background 0.15s ease"
                      }}
                    >
                      <td style={{ ...td, textAlign: "center", fontSize: "12px", color: "#64748b" }}>
                        {isExpanded ? "▼" : "▶"}
                      </td>
                      <td style={{ ...td, fontWeight: "600", color: "#2563eb" }}>
                        <span style={grnBadgeStyle}>{receipt.grnNumber}</span>
                      </td>
                      <td style={{ ...td, fontWeight: "600", color: "#1e293b" }}>
                        🏢 {receipt.supplier?.companyName || "Vendor Registry"}
                      </td>
                      <td style={td}>{receipt.items?.length} Items Arrived</td>
                      <td style={{ ...td, color: "#64748b", fontWeight: "500" }}>👤 {receipt.receivedBy?.name || "Warehouse Staff"}</td>
                      <td style={{ ...td, color: "#64748b" }}>{new Date(receipt.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>

                    {/* EXPANDED DETAILS PANEL */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="6" style={expandedTdStyle}>
                          <div style={expandedContainerStyle}>
                            <h4 style={sectionTitleStyle}>📌 Dispatch & Stakeholder Overview</h4>
                            <div style={metaGridStyle}>
                              <div style={metaCardStyle}>
                                <div style={metaLabelStyle}>Sender (Supplier Vendor)</div>
                                <div style={metaValueStyle}>🏢 {receipt.supplier?.companyName || "N/A"}</div>
                                <div style={metaSubValueStyle}>Contact: {receipt.supplier?.email || "No email available"}</div>
                              </div>
                              <div style={metaCardStyle}>
                                <div style={metaLabelStyle}>Receiver (Inward Officer)</div>
                                <div style={metaValueStyle}>👤 {receipt.receivedBy?.name || "Warehouse Staff"}</div>
                                <div style={metaSubValueStyle}>Role: Authorized Stock Receiver</div>
                              </div>
                              <div style={metaCardStyle}>
                                <div style={metaLabelStyle}>Timeline Dates</div>
                                <div style={metaValueStyle}>📅 Recd: {new Date(receipt.createdAt).toLocaleString("en-IN")}</div>
                                {receipt.purchaseOrder?.dispatchedAt && (
                                  <div style={metaSubValueStyle}>Sent: {new Date(receipt.purchaseOrder.dispatchedAt).toLocaleDateString("en-IN")}</div>
                                )}
                              </div>
                            </div>

                            <h4 style={{ ...sectionTitleStyle, marginTop: "24px" }}>📋 Reconciliation Audit Matrix for PO</h4>
                            <div style={itemGridHeaderStyle}>
                              <div>Item SKU Name</div>
                              <div style={{ textAlign: "center" }}>Ordered Units</div>
                              <div style={{ textAlign: "center" }}>Physically Received</div>
                            </div>
                            
                            {receipt.items?.map((item, idx) => (
                              <div key={idx} style={{ 
                                display: "grid", 
                                gridTemplateColumns: "3fr 1fr 1fr", 
                                gap: "16px", 
                                padding: "12px 0", 
                                borderBottom: idx === receipt.items.length - 1 ? "none" : "1px dashed #f1f5f9", 
                                fontSize: "14px" 
                              }}>
                                <div style={{ color: "#1e293b", fontWeight: "500" }}>📦 {item.product?.name || "Catalog Asset Item"}</div>
                                <div style={{ textAlign: "center", color: "#64748b", fontWeight: "500" }}>{item.orderedQuantity || item.quantity} units</div>
                                <div style={{ 
                                  textAlign: "center", 
                                  fontWeight: "700", 
                                  color: (item.receivedQuantity || item.quantity) < (item.orderedQuantity || item.quantity) ? "#ef4444" : "#16a34a" 
                                }}>
                                  {item.receivedQuantity || item.quantity} units
                                </div>
                              </div>
                            ))}

                            {receipt.notes && (
                              <div style={notesBlockStyle}>
                                <strong>Inspector Remarks:</strong> {receipt.notes}
                              </div>
                            )}
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

      {/* GRN Filing Popup Window */}
      {showModal && (
        <div style={modalBackdropStyle}>
          <form onSubmit={receiveGoods} style={modalFormStyle}>
            <h2 style={modalTitleStyle}>Process Inbound Goods Receipt</h2>
            <p style={modalSubtitleStyle}>Select a dispatched order terminal to verify incoming quantities before committing to inventory counts.</p>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Staged Purchase Order *</label>
              <select required value={formData.purchaseOrderId} onChange={(e) => handlePOSelect(e.target.value)} style={inputStyle}>
                <option value="">Select Dispatched PO Number</option>
                {purchaseOrders.map((po) => (
                  <option key={po._id} value={po._id}>
                    📦 {po.poNumber} — ({po.supplier?.companyName || "Vendor"})
                  </option>
                ))}
              </select>
            </div>

            {/* Inward Items Verification Sheet */}
            {formData.items.length > 0 && (
              <div style={verificationSheetStyle}>
                <h4 style={verificationSheetTitleStyle}>Verify Item Shipments Matching PO</h4>
                <div style={verificationHeaderStyle}>
                  <span style={{ flex: 2 }}>Item Name</span>
                  <span style={{ flex: 1, textAlign: "center" }}>Ordered Qty</span>
                  <span style={{ flex: 1, textAlign: "center" }}>Received Qty</span>
                </div>

                {formData.items.map((item, index) => (
                  <div key={index} style={verificationRowStyle}>
                    <span style={{ flex: 2, fontSize: "14px", fontWeight: "500", color: "#334155" }}>{item.productName}</span>
                    <input type="number" value={item.orderedQuantity} disabled style={disabledInputStyle} />
                    <input
                      type="number"
                      required
                      min="0"
                      value={item.receivedQuantity}
                      onChange={(e) => {
                        const updatedItems = formData.items.map((it, idx) => 
                          idx === index ? { ...it, receivedQuantity: Number(e.target.value) } : it
                        );
                        setFormData({ ...formData, items: updatedItems });
                      }}
                      style={activeInputStyle}
                    />
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Operational Notes / Remarks</label>
              <textarea
                placeholder="e.g. Received in fine condition, box 3 slightly damp..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={textareaStyle}
              />
            </div>

            <div style={modalActionRowStyle}>
              <button type="button" onClick={() => { setShowModal(false); setFormData({ purchaseOrderId: "", notes: "", items: [] }); }} style={cancelButtonStyle}>
                Cancel
              </button>
              <button type="submit" style={confirmButtonStyle}>
                Confirm Inward Receipt
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

const headerSectionStyle = { 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center", 
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

const addGrnButtonStyle = { 
  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", 
  color: "white", 
  border: "none", 
  padding: "12px 24px", 
  borderRadius: "12px", 
  cursor: "pointer", 
  fontWeight: "600", 
  fontSize: "14px", 
  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)" 
};

const analyticsGridStyle = { 
  display: "flex", 
  gap: "24px", 
  marginBottom: "32px" 
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

const emptyStateStyle = { 
  textAlign: "center", 
  padding: "40px", 
  color: "#94a3b8", 
  fontWeight: "500" 
};

const grnBadgeStyle = { 
  fontFamily: "monospace", 
  background: "#eff6ff", 
  padding: "4px 10px", 
  borderRadius: "6px" 
};

const expandedTdStyle = { 
  padding: "20px 32px", 
  background: "#f8fafc", 
  borderBottom: "1px solid #e2e8f0" 
};

const expandedContainerStyle = { 
  background: "#fff", 
  border: "1px solid #e2e8f0", 
  borderRadius: "12px", 
  padding: "20px" 
};

const sectionTitleStyle = { 
  margin: "0 0 12px 0", 
  fontSize: "14px", 
  color: "#0f172a", 
  fontWeight: "700", 
  textTransform: "uppercase", 
  letterSpacing: "0.5px" 
};

const metaGridStyle = { 
  display: "grid", 
  gridTemplateColumns: "1fr 1fr 1fr", 
  gap: "16px", 
  marginBottom: "20px" 
};

const metaCardStyle = { 
  background: "#f8fafc", 
  border: "1px solid #e2e8f0", 
  borderRadius: "8px", 
  padding: "12px" 
};

const metaLabelStyle = { 
  fontSize: "11px", 
  textTransform: "uppercase", 
  color: "#64748b", 
  fontWeight: "600", 
  marginBottom: "4px" 
};

const metaValueStyle = { 
  fontSize: "14px", 
  fontWeight: "600", 
  color: "#1e293b" 
};

const metaSubValueStyle = { 
  fontSize: "12px", 
  color: "#64748b", 
  marginTop: "2px" 
};

const itemGridHeaderStyle = { 
  display: "grid", 
  gridTemplateColumns: "3fr 1fr 1fr", 
  gap: "16px", 
  paddingBottom: "8px", 
  borderBottom: "1px solid #f1f5f9", 
  fontWeight: "600", 
  fontSize: "13px", 
  color: "#475569" 
};

const notesBlockStyle = { 
  marginTop: "16px", 
  padding: "12px", 
  background: "#f8fafc", 
  borderLeft: "4px solid #3b82f6", 
  borderRadius: "4px", 
  fontSize: "13px", 
  color: "#475569" 
};

const modalBackdropStyle = { 
  position: "fixed", 
  inset: "0", 
  background: "rgba(15, 23, 42, 0.6)", 
  backdropFilter: "blur(4px)", 
  display: "flex", 
  justifyContent: "center", 
  alignItems: "center", 
  zIndex: "9999" 
};

const modalFormStyle = { 
  background: "white", 
  width: "680px", 
  padding: "32px", 
  borderRadius: "16px", 
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", 
  maxHeight: "85vh", 
  overflowY: "auto", 
  boxSizing: "border-box" 
};

const modalTitleStyle = { 
  margin: "0 0 6px 0", 
  fontSize: "24px", 
  fontWeight: "700", 
  color: "#0f172a" 
};

const modalSubtitleStyle = { 
  margin: "0 0 24px 0", 
  color: "#64748b", 
  fontSize: "14px" 
};

const verificationSheetStyle = { 
  marginBottom: "24px", 
  background: "#f8fafc", 
  padding: "20px", 
  borderRadius: "12px", 
  border: "1px solid #e2e8f0" 
};

const verificationSheetTitleStyle = { 
  margin: "0 0 12px 0", 
  color: "#1e293b", 
  fontSize: "15px", 
  fontWeight: "700" 
};

const verificationHeaderStyle = { 
  display: "flex", 
  gap: "12px", 
  fontWeight: "600", 
  fontSize: "12px", 
  color: "#64748b", 
  marginBottom: "8px", 
  textTransform: "uppercase", 
  letterSpacing: "0.5px" 
};

const verificationRowStyle = { 
  display: "flex", 
  gap: "12px", 
  marginBottom: "10px", 
  alignItems: "center" 
};

const disabledInputStyle = { 
  width: "100%", 
  padding: "11px 14px", 
  borderRadius: "10px", 
  fontSize: "14px", 
  boxSizing: "border-box", 
  outline: "none", 
  marginBottom: "0", 
  flex: "1", 
  textAlign: "center", 
  background: "#e2e8f0", 
  color: "#475569", 
  border: "1px solid #cbd5e1" 
};

const activeInputStyle = { 
  width: "100%", 
  padding: "11px 14px", 
  borderRadius: "10px", 
  fontSize: "14px", 
  boxSizing: "border-box", 
  outline: "none", 
  marginBottom: "0", 
  flex: "1", 
  textAlign: "center", 
  border: "1px solid #2563eb", 
  fontWeight: "700", 
  background: "#fff" 
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

const modalActionRowStyle = { 
  display: "flex", 
  justifyContent: "flex-end", 
  gap: "12px", 
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
  background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)", 
  color: "white", 
  border: "none", 
  padding: "12px 20px", 
  borderRadius: "10px", 
  cursor: "pointer", 
  fontWeight: "600", 
  fontSize: "14px", 
  boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)" 
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

export default GRN;