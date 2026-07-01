import { useEffect, useState } from "react";
import api from "../services/api"; // Centralized API instance for backend communication

function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [availableProducts, setAvailableProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  // Customer Pipeline States
  const [customerType, setCustomerType] = useState("NEW"); 
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  
  // Smart Loyalty Engine States
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [isPointsFetched, setIsPointsFetched] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(false); 

  // Billing Configuration States
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [discount, setDiscount] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);

  // Invoice Overlays
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Fetch Session Audit Logs from Backend
  const fetchOrdersHistory = async () => {
    try {
      const res = await api.get("/orders");
      setOrdersList(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Ledger audit trail fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchOrdersHistory();
  }, []);

  // FIXED & STABLE DEBOUNCE SEARCH LOGIC
  useEffect(() => {
    if (!searchTerm.trim()) {
      setAvailableProducts([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
        
        // Fail-safe format handling
        let data = [];
        if (res.data && res.data.data) {
          data = res.data.data;
        } else if (Array.isArray(res.data)) {
          data = res.data;
        } else if (res.data && typeof res.data === "object") {
          data = res.data.products || [];
        }

        setAvailableProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Product catalogue query exception:", err);
        setAvailableProducts([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Master Customer Verification Routine
  const checkCustomerLoyalty = async () => {
    if (!customerPhone.trim() || customerPhone.length < 10) {
      alert("❌ Please enter a valid 10-digit mobile number!");
      return;
    }
    try {
      const res = await api.get(`/orders/customers/${customerPhone}`);
      const customer = res.data?.data || res.data;

      if (customer && (customer.name || customer._id)) {
        setCustomerName(customer.name);
        setLoyaltyPoints(customer.loyaltyPoints || 0);
        setIsPointsFetched(true);
        setCustomerType("EXISTING"); 
        alert(`🎉 Member Found: ${customer.name}\nAvailable Points: ${customer.loyaltyPoints}`);
      } else {
        alert("⚠️ Customer database document matched but structural records are corrupted.");
      }
    } catch (err) {
      console.error("Loyalty Pipeline Exception Details:", err.response);

      if (err.response && err.response.status === 404) {
        alert("🔍 This mobile number is not registered. Switching automatically to 'New Customer' mode. Please register the customer's name.");
        setCustomerType("NEW");
        setCustomerName("");
        setLoyaltyPoints(0);
        setIsPointsFetched(false);
      } else {
        alert(`❌ API Connection Failure: ${err.response?.data?.message || "Internal network bridge broke down."}`);
      }
    }
  };

  // Central Calculation Engine Matrix
  useEffect(() => {
    let currentSubTotal = 0;
    let currentTaxAmount = 0;

    cart.forEach((item) => {
      const lineTotal = item.sellingPrice * item.quantity;
      currentTaxAmount += (lineTotal * (item.taxPercentage || 0)) / 100;
      currentSubTotal += lineTotal;
    });

    setSubTotal(currentSubTotal);
    setTaxAmount(currentTaxAmount);

    let calculatedLoyaltyDiscount = 0;
    if (redeemPoints && loyaltyPoints > 0) {
      calculatedLoyaltyDiscount = Math.floor(loyaltyPoints / 20); 
    }
    setLoyaltyDiscount(calculatedLoyaltyDiscount);

    const finalTotal = currentSubTotal + currentTaxAmount - Number(discount) - calculatedLoyaltyDiscount;
    setGrandTotal(finalTotal > 0 ? finalTotal : 0);
  }, [cart, discount, loyaltyPoints, redeemPoints]);

  const addToCart = (product) => {
    if (product.stockQuantity <= 0) {
      alert(`⚠️ ${product.name} is completely Out of Stock!`);
      return;
    }
    const existIdx = cart.findIndex((item) => item.product === product._id);
    if (existIdx > -1) {
      const updated = [...cart];
      if (updated[existIdx].quantity + 1 > product.stockQuantity) {
        alert("🚨 Warehouse allocation threshold limit reached!");
        return;
      }
      updated[existIdx].quantity += 1;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          product: product._id,
          name: product.name,
          barcode: product.barcode,
          sellingPrice: product.sellingPrice,
          taxPercentage: product.taxPercentage || 0,
          stockQuantity: product.stockQuantity,
          quantity: 1,
        },
      ]);
    }
    setSearchTerm(""); 
  };

  const updateCartQuantity = (index, val) => {
    const qty = Number(val);
    if (qty < 1) return;
    const updated = [...cart];
    if (qty > updated[index].stockQuantity) {
      alert(`Only ${updated[index].stockQuantity} pieces available in database logs.`);
      return;
    }
    updated[index].quantity = qty;
    setCart(updated);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!customerPhone.trim()) {
      alert("❌ Customer Mobile Number is required!");
      return;
    }
    if (customerType === "NEW" && !customerName.trim()) {
      alert("❌ Entering the Customer Name is mandatory for registration!");
      return;
    }
    if (cart.length === 0) {
      alert("🛒 Staging cart queue is empty!");
      return;
    }

    const payload = {
      items: cart.map((i) => ({ product: i.product, quantity: i.quantity })),
      customerPhone,
      customerName,
      customerType,
      paymentMethod,
      discount: Number(discount),
      pointsRedeemed: redeemPoints ? loyaltyPoints : 0, 
    };

    try {
      const res = await api.post("/orders", payload);
      const freshOrderData = res.data?.data || res.data;
      
      alert("🎉 Transaction Authorized Successfully!");
      setOrdersList((prev) => [freshOrderData, ...prev]);
      setActiveInvoice(freshOrderData);
      setShowReceipt(true);

      setCart([]);
      setCustomerPhone("");
      setCustomerName("");
      setDiscount(0);
      setSearchTerm("");
      setLoyaltyPoints(0);
      setRedeemPoints(false);
      setIsPointsFetched(false);
      setCustomerType("NEW");
    } catch (err) {
      alert(err.response?.data?.message || "POS pipeline transaction aborted.");
    }
  };

  const executeThermalPrint = () => {
    const printContent = document.getElementById("thermal-receipt").innerHTML;
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <style>
            body { font-family: monospace; color: #000; padding: 10px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
      setShowReceipt(false);
    }, 500);
  };

  return (
    <div style={styles.appContainer}>
      
      {/* TITLE APP HEADER */}
      <div style={styles.headerContainer}>
        <div>
          <h2 style={styles.headerTitle}>
            🛒 Professional POS Workstation
          </h2>
          <p style={styles.headerSubtitle}>
            Direct counter lane sync engine with smart customer loyalty auto-deductions
          </p>
        </div>
        <div style={styles.counterLaneBadge}>
          Counter Lane #01 Active
        </div>
      </div>
      
      {/* TWO PANEL CORE GRID */}
      <div style={styles.mainGrid}>
        
        {/* LEFT COMPONENT: THE CHECKOUT FLOW OPERATIONS */}
        <div style={styles.leftColumn}>
          
          {/* STEP 1: CUSTOMER RECOGNITION REGISTRATION */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              👤 Customer Profile Identification
            </h3>
            
            <div style={styles.buttonGroup}>
              <button 
                type="button" 
                onClick={() => { setCustomerType("NEW"); setIsPointsFetched(false); setRedeemPoints(false); setLoyaltyPoints(0); setCustomerName(""); }} 
                style={{
                  ...styles.toggleButton,
                  border: customerType === "NEW" ? "2px solid #2563eb" : "1px solid #cbd5e1",
                  background: customerType === "NEW" ? "#eff6ff" : "white",
                  color: customerType === "NEW" ? "#1e40af" : "#475569",
                }}
              >
                🆕 Add New Customer
              </button>
              <button 
                type="button" 
                onClick={() => setCustomerType("EXISTING")} 
                style={{
                  ...styles.toggleButton,
                  border: customerType === "EXISTING" ? "2px solid #2563eb" : "1px solid #cbd5e1",
                  background: customerType === "EXISTING" ? "#eff6ff" : "white",
                  color: customerType === "EXISTING" ? "#1e40af" : "#475569",
                }}
              >
                👑 Verify Old Member
              </button>
            </div>

            <div style={styles.customerInputsGrid}>
              <div>
                <label style={styles.labelStyle}>Mobile Phone Number *</label>
                <div style={styles.flexGap}>
                  <input type="tel" placeholder="Enter 10-digit number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={styles.inputStyle} />
                  {customerType === "EXISTING" && (
                    <button type="button" onClick={checkCustomerLoyalty} style={styles.verifyButton}>
                      Verify
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label style={styles.labelStyle}>Customer Name {customerType === "NEW" ? " *" : ""}</label>
                <input type="text" placeholder={customerType === "NEW" ? "Enter Full Name (Required)" : "Member Account Name"} value={customerName} disabled={customerType === "EXISTING" && isPointsFetched} onChange={(e) => setCustomerName(e.target.value)} style={{
                  ...styles.inputStyle,
                  background: (customerType === "EXISTING" && isPointsFetched) ? "#f1f5f9" : "#fff"
                }} />
              </div>
            </div>

            {customerType === "EXISTING" && isPointsFetched && (
              <div style={styles.loyaltyBanner}>
                <div>
                  <div style={styles.loyaltyCardBadge}>Club Membership Card</div>
                  <div style={styles.loyaltyPointsText}>💎 {loyaltyPoints} Reward Points</div>
                  <div style={styles.loyaltyDiscountText}>Eligible Cash Discount: <strong>₹{Math.floor(loyaltyPoints / 20)}</strong> (at rate of 20 pts = ₹1)</div>
                </div>
                <div>
                  {loyaltyPoints >= 20 ? (
                    <label style={styles.applyPointsLabel}>
                      <input type="checkbox" checked={redeemPoints} onChange={(e) => setRedeemPoints(e.target.checked)} style={styles.checkboxScale} />
                      Apply Points
                    </label>
                  ) : (
                    <span style={styles.loyaltyLockedText}>Min 20 pts needed to unlock</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ITEM SEARCH */}
          <div style={styles.card}>
            <label style={styles.searchLabel}>
              🔍 SCAN BARCODE OR TYPE ITEM NAME
            </label>
            <input 
              type="text"
              placeholder="Scan item UPC identifier or search catalogue dynamically..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />

            {availableProducts.length > 0 && (
              <div style={styles.searchResultsDropdown}>
                {availableProducts.map((p) => (
                  <div key={p._id} style={styles.searchResultItem}>
                    <div>
                      <div style={styles.productNameText}>{p.name}</div>
                      <div style={styles.productBarcodeText}>{p.barcode}</div>
                    </div>
                    <div style={styles.productPriceText}>₹{p.sellingPrice?.toFixed(2)}</div>
                    <button type="button" onClick={() => addToCart(p)} style={styles.addItemButton}>
                      + Add Item
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIVE CART TABLE VIEWPORT */}
          <div style={styles.card}>
            <h3 style={styles.cartTitle}>🛒 Active Checkout Cart</h3>
            {cart.length === 0 ? (
              <div style={styles.emptyCartPlaceholder}>
                No active units added to counter queue lanes.
              </div>
            ) : (
              <table style={styles.tableCollapse}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.thStyle}>Particulars</th>
                    <th style={styles.thStyle}>Unit Rate</th>
                    <th style={styles.thQtyStyle}>Qty</th>
                    <th style={styles.thStyle}>Gross Total</th>
                    <th style={styles.thCenterStyle}>Void</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, idx) => (
                    <tr key={item.product} style={styles.tableBodyRow}>
                      <td style={styles.tdStyle}>
                        <div style={styles.cartItemName}>{item.name}</div>
                        <div style={styles.cartItemBarcode}>{item.barcode}</div>
                      </td>
                      <td style={styles.tdStyle}>₹{item.sellingPrice.toFixed(2)}</td>
                      <td style={styles.tdCenterStyle}>
                        <input type="number" min="1" value={item.quantity} onChange={(e) => updateCartQuantity(idx, e.target.value)} style={styles.cartQtyInput} />
                      </td>
                      <td style={styles.cartItemGrossTotal}>₹{(item.sellingPrice * item.quantity).toFixed(2)}</td>
                      <td style={styles.tdCenterStyle}>
                        <button onClick={() => removeFromCart(idx)} style={styles.removeCartItemButton}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* CHECKOUT MATRIX */}
          <div style={styles.card}>
            <form onSubmit={handlePlaceOrder}>
              <div style={styles.checkoutInputsGrid}>
                <div>
                  <label style={styles.labelStyle}>Payment Method Gateway</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={styles.selectInput}>
                    <option value="CASH">💵 REGISTER HARD CASH</option>
                    <option value="UPI">📱 DIGITAL UPI QR LINK</option>
                    <option value="CARD">💳 POS EDC CARD TERMINAL</option>
                  </select>
                </div>
                <div>
                  <label style={styles.labelStyle}>Flat Manual Trade Discount (₹)</label>
                  <input type="number" min="0" placeholder="0.00" value={discount} onChange={(e) => setDiscount(e.target.value)} style={styles.inputStyle} />
                </div>
              </div>

              <div style={styles.summaryBoxGrid}>
                <div style={styles.summaryLinesColumn}>
                  <div style={styles.summaryRow}><span>Subtotal Items Amount:</span><span style={styles.fontSemiBold}>₹{subTotal.toFixed(2)}</span></div>
                  <div style={styles.summaryRow}><span>Tax Pool Liabilities:</span><span>+ ₹{taxAmount.toFixed(2)}</span></div>
                  <div style={styles.summaryRow}><span>Manual Deductions:</span><span style={styles.textRed}>- ₹{Number(discount).toFixed(2)}</span></div>
                  {redeemPoints && (
                    <div style={styles.summaryRow}><span style={styles.loyaltyDeductionLabel}>💎 Loyalty Deduction:</span><span style={styles.loyaltyDeductionValue}>- ₹{loyaltyDiscount.toFixed(2)}</span></div>
                  )}
                </div>
                <div style={styles.grandTotalColumn}>
                  <div style={styles.grandTotalLabel}>Net Cash Payable</div>
                  <div style={styles.grandTotalValue}>₹{grandTotal.toFixed(2)}</div>
                </div>
              </div>

              <button type="submit" style={styles.submitTransactionButton}>
                🔒 AUTHORIZE TRANSACTION & RUN INVOICE
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: AUDIT HISTORY LEDGER SIDEBAR */}
        <div style={styles.sidebarCard}>
          <h3 style={styles.sidebarTitle}>📜 Live Transaction History Logs</h3>
          <p style={styles.sidebarSubtitle}>Expand items rows to verify structural specifications logs.</p>
          
          <div style={styles.flexDirectionColumnGap}>
            {ordersList.map((ord) => {
              const isExpanded = expandedOrderId === ord._id;
              return (
                <div key={ord._id}>
                  <div onClick={() => setExpandedOrderId(isExpanded ? null : ord._id)} style={{
                    ...styles.logRowContainer,
                    border: isExpanded ? "1px solid #2563eb" : "1px solid #e2e8f0",
                    background: isExpanded ? "#f8fafc" : "#ffffff",
                  }}>
                    <div style={styles.logRowHeader}>
                      <span style={styles.logOrderNumber}>
                        {ord.orderNumber}
                      </span>
                      <span style={styles.logPaymentMethod}>
                        {ord.paymentMethod}
                      </span>
                    </div>
                    <div style={styles.logRowBody}>
                      <span>📱 {ord.customerPhone} ({ord.customer?.name || "Walk-In"})</span>
                      <span style={styles.logGrandTotal}>₹{ord.grandTotal?.toFixed(2)}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={styles.expandedLogDropdown}>
                      {ord.items?.map((item, idx) => (
                        <div key={idx} style={styles.expandedLogItemLine}>
                          <span style={styles.textSlate700}>{item.productName} x {item.quantity}</span>
                          <span style={styles.fontSemiBold}>₹{item.total?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* FIXED INVOICE RECEIPT MODAL */}
      {showReceipt && activeInvoice && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <div id="thermal-receipt" style={styles.thermalReceiptWrapper}>
              <div style={styles.textCenter}>
                <h4 style={styles.receiptStoreName}>** UNIMART SUPERMARKET **</h4>
                <p style={styles.margin2pxVertical}>CENTRAL SALES OUTLET RECEIPT</p>
                <p style={styles.margin2pxVertical}>----------------------------------</p>
              </div>
              <div style={styles.receiptMetadataBlock}>
                <div><strong>Invoice:</strong> {activeInvoice.orderNumber}</div>
                <div><strong>Date:</strong> {new Date(activeInvoice.createdAt).toLocaleString()}</div>
                <div><strong>Customer:</strong> {activeInvoice.customer?.name || activeInvoice.customerName || "Walk-In Customer"} ({activeInvoice.customerPhone})</div>
              </div>
              <p style={styles.margin4pxVertical}>----------------------------------</p>
              <table style={styles.thermalTable}>
                <tbody>
                  {activeInvoice.items?.map((it, i) => (
                    <tr key={i}>
                      <td style={styles.padding3pxVertical}>{it.productName} x{it.quantity}</td>
                      <td style={styles.textRight}>₹{it.total?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={styles.margin4pxVertical}>----------------------------------</p>
              <div style={styles.receiptCalculationsBlock}>
                <div>Gross Subtotal: ₹{activeInvoice.subTotal?.toFixed(2)}</div>
                <div>Tax Pool Liability: ₹{activeInvoice.taxAmount?.toFixed(2)}</div>
                {activeInvoice.pointsRedeemed > 0 && (
                  <div style={styles.textAmber800}>Loyalty Deducted (20pts=₹1): -₹{activeInvoice.cashDiscountFromPoints?.toFixed(2)}</div>
                )}
                <div>Net Total Paid: <strong>₹{activeInvoice.grandTotal?.toFixed(2)}</strong></div>
              </div>
              <div style={styles.receiptFooter}>
                <p style={styles.receiptFooterText}>Thank You! Visit Again.</p>
              </div>
            </div>
            <div style={styles.modalActionButtonsGroup}>
              <button onClick={executeThermalPrint} style={styles.thermalPrintButton}>
                🖨️ Thermal Print
              </button>
              <button onClick={() => setShowReceipt(false)} style={styles.closeModalButton}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ONE PROPERTY, ONE LINE STYLE STRUCTURE
const styles = {
  appContainer: {
    padding: "35px",
    background: "#f1f5f9",
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, sans-serif",
    boxSizing: "border-box"
  },
  headerContainer: {
    marginBottom: "30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-0.5px"
  },
  headerSubtitle: {
    color: "#475569",
    margin: "4px 0 0 0",
    fontSize: "14px"
  },
  counterLaneBadge: {
    background: "#e2e8f0",
    padding: "6px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155"
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "25px",
    alignItems: "flex-start"
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "25px"
  },
  card: {
    background: "white",
    padding: "24px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
  },
  cardTitle: {
    margin: "0 0 16px 0",
    fontSize: "15px",
    fontWeight: "700",
    color: "#1e293b",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  buttonGroup: {
    display: "flex",
    gap: "16px",
    marginBottom: "20px"
  },
  toggleButton: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer"
  },
  customerInputsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    alignItems: "flex-end"
  },
  flexGap: {
    display: "flex",
    gap: "8px"
  },
  verifyButton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "0 18px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "13px"
  },
  loyaltyBanner: {
    marginTop: "16px",
    padding: "16px",
    background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    borderRadius: "10px",
    border: "1px solid #fde68a",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  loyaltyCardBadge: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#b45309",
    textTransform: "uppercase"
  },
  loyaltyPointsText: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#78350f",
    marginTop: "2px"
  },
  loyaltyDiscountText: {
    fontSize: "12px",
    color: "#92400e",
    marginTop: "2px"
  },
  applyPointsLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "white",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #d97706",
    fontWeight: "700",
    color: "#78350f",
    cursor: "pointer"
  },
  checkboxScale: {
    transform: "scale(1.2)"
  },
  loyaltyLockedText: {
    fontSize: "12px",
    color: "#b45309",
    fontStyle: "italic",
    fontWeight: "600"
  },
  searchLabel: {
    fontWeight: "700",
    fontSize: "13px",
    display: "block",
    marginBottom: "8px",
    color: "#475569",
    letterSpacing: "0.5px"
  },
  searchInput: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
    outline: "none",
    color: "#0f172a",
    fontSize: "14px"
  },
  searchResultsDropdown: {
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    background: "#fff",
    marginTop: "8px",
    maxHeight: "220px",
    overflowY: "auto",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
    zIndex: 50
  },
  searchResultItem: {
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  productNameText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a"
  },
  productBarcodeText: {
    fontSize: "11px",
    color: "#64748b",
    fontFamily: "monospace"
  },
  productPriceText: {
    fontSize: "13px",
    fontWeight: "600"
  },
  addItemButton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer"
  },
  cartTitle: {
    margin: "0 0 16px 0",
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a"
  },
  emptyCartPlaceholder: {
    color: "#94a3b8",
    textAlign: "center",
    padding: "40px 0",
    border: "2px dashed #e2e8f0",
    borderRadius: "10px",
    background: "#f8fafc"
  },
  tableCollapse: {
    width: "100%",
    borderCollapse: "collapse"
  },
  tableHeaderRow: {
    background: "#f8fafc",
    borderBottom: "2px solid #e2e8f0",
    textAlign: "left"
  },
  tableBodyRow: {
    borderBottom: "1px solid #f1f5f9"
  },
  cartItemName: {
    fontWeight: "600",
    color: "#1e293b",
    fontSize: "14px"
  },
  cartItemBarcode: {
    fontSize: "11px",
    color: "#64748b",
    fontFamily: "monospace"
  },
  cartQtyInput: {
    width: "55px",
    padding: "5px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    textAlign: "center"
  },
  cartItemGrossTotal: {
    padding: "12px 12px",
    verticalAlign: "middle",
    fontWeight: "600",
    color: "#0f172a"
  },
  removeCartItemButton: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    padding: "4px 8px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  checkoutInputsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "20px"
  },
  selectInput: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
    outline: "none",
    color: "#0f172a",
    fontSize: "13px",
    cursor: "pointer"
  },
  summaryBoxGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    background: "#f8fafc",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0"
  },
  summaryLinesColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  grandTotalColumn: {
    textAlign: "right",
    borderLeft: "2px dashed #cbd5e1",
    paddingLeft: "24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  grandTotalLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase"
  },
  grandTotalValue: {
    fontSize: "32px",
    fontWeight: "900",
    color: "#16a34a",
    marginTop: "2px"
  },
  loyaltyDeductionLabel: {
    color: "#b45309",
    fontWeight: "600"
  },
  loyaltyDeductionValue: {
    color: "#b45309",
    fontWeight: "600"
  },
  submitTransactionButton: {
    width: "100%",
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "20px"
  },
  sidebarCard: {
    background: "white",
    padding: "24px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    height: "85vh",
    overflowY: "auto"
  },
  sidebarTitle: {
    margin: "0 0 2px 0",
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a"
  },
  sidebarSubtitle: {
    color: "#64748b",
    fontSize: "12px",
    margin: "0 0 16px 0"
  },
  flexDirectionColumnGap: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  logRowContainer: {
    padding: "14px",
    borderRadius: "10px",
    cursor: "pointer"
  },
  logRowHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px"
  },
  logOrderNumber: {
    fontWeight: "700",
    fontFamily: "monospace",
    color: "#2563eb",
    fontSize: "13px"
  },
  logPaymentMethod: {
    fontSize: "10px",
    fontWeight: "700",
    background: "#f0fdf4",
    color: "#16a34a",
    padding: "2px 6px",
    borderRadius: "4px"
  },
  logRowBody: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#475569"
  },
  logGrandTotal: {
    fontWeight: "700",
    color: "#0f172a"
  },
  expandedLogDropdown: {
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    borderRadius: "8px",
    padding: "12px",
    margin: "4px 0 6px 0",
    fontSize: "12px"
  },
  expandedLogItemLine: {
    display: "flex",
    justifyContent: "space-between",
    padding: "4px 0"
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  modalContainer: {
    background: "white",
    width: "380px",
    padding: "24px",
    borderRadius: "14px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
  },
  thermalReceiptWrapper: {
    fontFamily: "monospace",
    color: "#000",
    fontSize: "12px"
  },
  receiptStoreName: {
    margin: "0 0 4px 0",
    fontSize: "16px"
  },
  receiptMetadataBlock: {
    margin: "10px 0",
    lineHeight: "1.4"
  },
  thermalTable: {
    width: "100%",
    fontSize: "12px",
    fontFamily: "monospace"
  },
  receiptCalculationsBlock: {
    textAlign: "right",
    lineHeight: "1.4"
  },
  receiptFooter: {
    textAlign: "center",
    marginTop: "16px"
  },
  receiptFooterText: {
    margin: 0,
    fontWeight: "700"
  },
  modalActionButtonsGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "20px"
  },
  thermalPrintButton: {
    flex: 1,
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer"
  },
  closeModalButton: {
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer"
  },
  thStyle: {
    padding: "10px 12px",
    borderBottom: "2px solid #e2e8f0",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase"
  },
  thQtyStyle: {
    padding: "10px 12px",
    borderBottom: "2px solid #e2e8f0",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    textAlign: "center",
    width: "80px"
  },
  thCenterStyle: {
    padding: "10px 12px",
    borderBottom: "2px solid #e2e8f0",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    textAlign: "center"
  },
  tdStyle: {
    padding: "12px 12px",
    verticalAlign: "middle"
  },
  tdCenterStyle: {
    padding: "12px 12px",
    verticalAlign: "middle",
    textAlign: "center"
  },
  labelStyle: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
    fontSize: "12px",
    color: "#475569",
    textTransform: "uppercase"
  },
  inputStyle: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
    outline: "none",
    color: "#0f172a",
    fontSize: "13px"
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    color: "#475569",
    fontSize: "13px"
  },
  fontSemiBold: {
    fontWeight: "600"
  },
  textRed: {
    color: "#dc2626"
  },
  textSlate700: {
    color: "#334155"
  },
  textCenter: {
    textAlign: "center"
  },
  textRight: {
    textAlign: "right"
  },
  textAmber800: {
    color: "#b45309"
  },
  margin2pxVertical: {
    margin: "2px 0"
  },
  margin4pxVertical: {
    margin: "4px 0"
  },
  padding3pxVertical: {
    padding: "3px 0"
  }
};

export default OrderManagement;