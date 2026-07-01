import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

function AdminLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "86vw",
        background: "#f1f5f9",
      }}
    >
      {/* Navbar */}
      <Navbar />

      {/* Sidebar */}
      <div
        style={{
          position: "fixed",
          top: "70px",
          left: 0,
          width: "260px",
          height: "calc(100vh - 70px)",
          zIndex: 100,
        }}
      >
        <Sidebar />
      </div>

      {/* Content Area */}
      <main
        style={{
          marginTop: "70px",
          marginLeft: "100px",
          width: "calc(100% - 100px)",
          minHeight: "calc(100vh - 70px)",
          padding: "30px",
          boxSizing: "border-box",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;