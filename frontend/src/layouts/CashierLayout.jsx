import { Outlet, NavLink } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

function CashierLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        marginLeft: "-199px",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', sans-serif",
        background: "#f8fafc",
      }}
    >
      {/* Top Navbar */}
      <Navbar />

      {/* Cashier Navigation */}
      <div
        style={{
          marginTop: "70px",
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          padding: "0 30px",
          display: "flex",
          gap: "20px",
          height: "60px",
          alignItems: "center",
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
       

        <NavLink
          to="/cashier/orders"
          style={({ isActive }) => ({
            textDecoration: "none",
            color: isActive
              ? "#2563eb"
              : "#475569",
            fontWeight: "600",
          })}
        >
          Orders
        </NavLink>

        <NavLink
          to="/cashier/customers"
          style={({ isActive }) => ({
            textDecoration: "none",
            color: isActive
              ? "#2563eb"
              : "#475569",
            fontWeight: "600",
          })}
        >
          Customers
        </NavLink>
      </div>

      {/* Content */}
      <main
        style={{
          padding: "30px",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default CashierLayout;