import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header
      style={{
        height: "72px",
        background: "#ffffff",
        borderBottom: "1px solid #f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Left Side: Brand Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          cursor: "pointer"
        }}
        onClick={() => navigate("/")}
      >
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: "18px",
          fontWeight: "800"
        }}>
          U
        </div>
        <h2
          style={{
            margin: 0,
            color: "#0f172a",
            fontSize: "20px",
            fontWeight: "700",
            letterSpacing: "-0.5px",
          }}
        >
          UNIMART <span style={{ color: "#2563eb", fontWeight: "800" }}>ERP</span>
        </h2>
      </div>

      {/* Right Side: Profile Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
        }}
      >
        {/* Notification Bell Icon Component */}
        <button
          style={{
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            position: "relative",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f8fafc";
            e.currentTarget.style.borderColor = "#cbd5e1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.borderColor = "#e2e8f0";
          }}
        >
          <span>🔔</span>
          {/* Active notification indicator dot */}
          <span style={{
            position: "absolute",
            top: "10px",
            right: "11px",
            width: "8px",
            height: "8px",
            background: "#ef4444",
            borderRadius: "50%",
            border: "2px solid #fff"
          }}></span>
        </button>

        {/* Vertical Separator line */}
        <div style={{ width: "1px", height: "28px", background: "#e2e8f0" }}></div>

        {/* User Card Widget */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "4px 8px",
            borderRadius: "14px",
          }}
        >
          {/* Avatar circle with name gradient fallback */}
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "600",
              fontSize: "15px",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)"
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>

          {/* User Name & Dynamic Badged Roles */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div
              style={{
                fontWeight: "600",
                color: "#1e293b",
                fontSize: "14px",
                lineHeight: "1.2"
              }}
            >
              {user?.name || "Administrator"}
            </div>

            <div style={{ display: "flex" }}>
              <span
                style={{
                  color: "#2563eb",
                  background: "#eff6ff",
                  border: "1px solid #dbeafe",
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  letterSpacing: "0.3px",
                  textTransform: "uppercase"
                }}
              >
                {user?.role || "ADMIN"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: Styled Logout */}
        <button
          onClick={handleLogout}
          style={{
            border: "1px solid #fee2e2",
            background: "#fef2f2",
            color: "#dc2626",
            padding: "10px 16px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#dc2626";
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.borderColor = "#dc2626";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#fef2f2";
            e.currentTarget.style.color = "#dc2626";
            e.currentTarget.style.borderColor = "#fee2e2";
          }}
        >
          <span>Sign Out</span> 🚪
        </button>
      </div>
    </header>
  );
}

export default Navbar;