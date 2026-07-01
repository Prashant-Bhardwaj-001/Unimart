import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "", 
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    const originalMargin = document.body.style.margin;
    const originalPadding = document.body.style.padding;
    const originalBoxSizing = document.body.style.boxSizing;

    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.boxSizing = "border-box";


    return () => {
      document.body.style.margin = originalMargin;
      document.body.style.padding = originalPadding;
      document.body.style.boxSizing = originalBoxSizing;
    };
  }, []);

  const handleChange = (e) => {
    setError("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.role) {
      setError("Please select your operational role to continue.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
        role: formData.role, 
      });

      const { token, user } = response.data;

      // CRITICAL ACCOUNT STATUS CHECK:
      if (user && user.isActive === false) {
        setError("🚨 Access Denied: Your account is currently suspended. Please contact the administrator.");
        setLoading(false);
        return;
      }

      // CRITICAL SECURITY CHECK:
      if (user.role !== formData.role) {
        setError(`Access Error: You are registered as ${user.role}, not ${formData.role}.`);
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Dynamic switch routing matching user credentials roles
      switch (user.role) {
        case "ADMIN":
          navigate("/admin/dashboard");
          break;

        case "MANAGER":
          navigate("/manager/dashboard");
          break;

        case "CASHIER":
          navigate("/cashier/orders");
          break;

        case "SUPPLIER":
          navigate("/supplier/dashboard");
          break;

        default:
          navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Invalid Email, Password or Role match"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        marginLeft: "-199px",
        width: "100%",
        display: "flex",
        background: "#0b0f19",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      
      {/* LEFT SIDE PANEL: INFO VIEWPORT */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          color: "#fff",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #311042 100%)",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box"
        }}
      >
        {/* Decorative Background Glows */}
        <div 
          style={{ 
            position: "absolute", 
            width: "400px", 
            height: "400px", 
            background: "rgba(59, 130, 246, 0.15)", 
            filter: "blur(100px)", 
            top: "-100px", 
            left: "-100px", 
            borderRadius: "50%" 
          }}
        ></div>
        
        <div 
          style={{ 
            position: "absolute", 
            width: "400px", 
            height: "400px", 
            background: "rgba(147, 51, 234, 0.15)", 
            filter: "blur(100px)", 
            bottom: "-100px", 
            right: "-100px", 
            borderRadius: "50%" 
          }}
        ></div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div 
            style={{ 
              display: "inline-flex", 
              padding: "8px 16px", 
              background: "rgba(255,255,255,0.08)", 
              backdropFilter: "blur(8px)", 
              borderRadius: "20px", 
              fontSize: "13px", 
              fontWeight: "600", 
              letterSpacing: "1px", 
              color: "#38bdf8", 
              marginBottom: "24px", 
              border: "1px solid rgba(255,255,255,0.1)" 
            }}
          >
            ENTERPRISE RESOURCE PLANNING
          </div>
          
          <h1 
            style={{ 
              fontSize: "64px", 
              fontWeight: "800", 
              marginBottom: "24px", 
              letterSpacing: "-1px", 
              lineHeight: "1.2", 
              display: "block", 
              background: "linear-gradient(to right, #ffffff, #cbd5e1)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent" 
            }}
          >
            UNIMART ERP
          </h1>

          <p 
            style={{ 
              fontSize: "18px", 
              color: "#94a3b8", 
              maxWidth: "520px", 
              lineHeight: "1.8", 
              fontWeight: "400" 
            }}
          >
            Smart inventory management, supplier tracking, billing, analytics and complete business operations unified in one secure terminal.
          </p>

          <div 
            style={{ 
              marginTop: "48px", 
              display: "grid", 
              gap: "20px" 
            }}
          >
            {[
              "Inventory Management Systems",
              "Supplier Logistics Tracking",
              "Billing & Smart POS Cashier Counter",
              "Core Sales Analytics Pipelines"
            ].map((text, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "12px", 
                  color: "#e2e8f0", 
                  fontSize: "15px", 
                  fontWeight: "500" 
                }}
              >
                <span 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    width: "24px", 
                    height: "24px", 
                    background: "rgba(34, 197, 94, 0.15)", 
                    color: "#4ade80", 
                    borderRadius: "50%", 
                    fontSize: "12px" 
                  }}
                >
                  ✓
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE PANEL: LOGIN VIEWPORT */}
      <div
        style={{
          width: "550px",
          background: "#0f172a",
          borderLeft: "1px solid rgba(255, 255, 255, 0.05)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "60px",
          boxSizing: "border-box"
        }}
      >
        <div 
          style={{ 
            width: "100%", 
            maxWidth: "400px", 
            boxSizing: "border-box" 
          }}
        >
          <h2 
            style={{ 
              fontSize: "36px", 
              fontWeight: "700", 
              marginBottom: "12px", 
              color: "#f8fafc", 
              letterSpacing: "-0.5px" 
            }}
          >
            Welcome Back
          </h2>

          <p 
            style={{ 
              color: "#94a3b8", 
              marginBottom: "36px", 
              fontSize: "15px", 
              lineHeight: "1.5" 
            }}
          >
            Sign in to access your operational terminal node
          </p>

          {error && (
            <div 
              style={{ 
                display: "flex", 
                gap: "10px", 
                background: "rgba(239, 68, 68, 0.1)", 
                border: "1px solid rgba(239, 68, 68, 0.2)", 
                color: "#fca5a5", 
                padding: "14px 16px", 
                borderRadius: "12px", 
                marginBottom: "28px", 
                fontSize: "14px", 
                fontWeight: "500", 
                lineHeight: "1.4" 
              }}
            >
              <span>⚠️</span> <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* ROLE SELECTION DROPDOWN COMPONENT */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Select System Role *</label>
              <div style={{ position: "relative" }}>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="" disabled style={{ background: "#1e293b" }}>-- Choose Your Staged Role --</option>
                  <option value="ADMIN" style={{ background: "#1e293b" }}>👑 UNIMART ADMIN</option>
                  <option value="MANAGER" style={{ background: "#1e293b" }}>💼 STORE MANAGER</option>
                  <option value="CASHIER" style={{ background: "#1e293b" }}>💵 CASHIER OPERATOR</option>
                  <option value="SUPPLIER" style={{ background: "#1e293b" }}>🚛 LOGISTICS SUPPLIER</option>
                </select>
              </div>
            </div>

            {/* EMAIL INPUT */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your registered email"
                required
                style={inputStyle}
              />
            </div>

            {/* PASSWORD INPUT */}
            <div style={{ marginBottom: "32px" }}>
              <label style={labelStyle}>Security Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password tokens"
                required
                style={inputStyle}
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "15px",
                border: "none",
                borderRadius: "12px",
                background: loading ? "#334155" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                color: loading ? "#94a3b8" : "#fff",
                fontWeight: "600",
                fontSize: "16px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 20px rgba(37, 99, 235, 0.25)",
                transition: "all 0.2s ease-in-out"
              }}
            >
              {loading ? "Verifying Nodes..." : "Secure Sign In 🔒"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { 
  display: "block", 
  marginBottom: "8px", 
  fontWeight: "500", 
  fontSize: "13px", 
  color: "#94a3b8",
  letterSpacing: "0.5px",
  textTransform: "uppercase"
};

const inputStyle = { 
  width: "100%", 
  padding: "15px 16px", 
  border: "1px solid #334155", 
  borderRadius: "12px", 
  fontSize: "15px", 
  boxSizing: "border-box", 
  background: "#1e293b", 
  color: "#f8fafc",
  outline: "none",
  transition: "all 0.2s ease",
};

export default Login;