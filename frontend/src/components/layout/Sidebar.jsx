import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaBox,
  FaTruck,
  FaClipboardList,
  FaWarehouse,
  FaShoppingCart,
  FaUserFriends,
  FaChartBar,
  FaBell,
} from "react-icons/fa";

function Sidebar() {
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const role = user?.role || "ADMIN";

  const menus =
    role === "MANAGER"
      ? [
          
          {
            name: "Products",
            path: "/manager/products",
            icon: <FaBox />,
          },
          {
            name: "Suppliers",
            path: "/manager/suppliers",
            icon: <FaTruck />,
          },
          {
            name: "Purchase Orders",
            path: "/manager/purchase-orders",
            icon: <FaClipboardList />,
          },
          {
            name: "GRN",
            path: "/manager/grn",
            icon: <FaClipboardList />,
          },
          {
            name: "Inventory",
            path: "/manager/inventory",
            icon: <FaWarehouse />,
          },
          {
            name: "Orders",
            path: "/manager/orders",
            icon: <FaShoppingCart />,
          },
          {
            name: "Customers",
            path: "/manager/customers",
            icon: <FaUserFriends />,
          },
          {
            name: "Alerts",
            path: "/manager/alerts",
            icon: <FaBell />,
          },
        ]
      : [
          {
            name: "Dashboard",
            path: "/admin/dashboard",
            icon: <FaTachometerAlt />,
          },
          {
            name: "Users",
            path: "/admin/users",
            icon: <FaUsers />,
          },
          {
            name: "Products",
            path: "/admin/products",
            icon: <FaBox />,
          },
          {
            name: "Suppliers",
            path: "/admin/suppliers",
            icon: <FaTruck />,
          },
          {
            name: "Purchase Orders",
            path: "/admin/purchase-orders",
            icon: <FaClipboardList />,
          },
          {
            name: "GRN",
            path: "/admin/grn",
            icon: <FaClipboardList />,
          },
          {
            name: "Inventory",
            path: "/admin/inventory",
            icon: <FaWarehouse />,
          },
          {
            name: "Orders",
            path: "/admin/orders",
            icon: <FaShoppingCart />,
          },
          {
            name: "Customers",
            path: "/admin/customers",
            icon: <FaUserFriends />,
          },
          {
            name: "Analytics",
            path: "/admin/analytics",
            icon: <FaChartBar />,
          },
          {
            name: "Alerts",
            path: "/admin/alerts",
            icon: <FaBell />,
          },
        ];

  return (
    <aside
      style={{
        width: "260px",
        height: "100%",
        background: "#0f172a",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px",
          borderBottom:
            "1px solid #1e293b",
        }}
      >
        

        <p
          style={{
            marginTop: "6px",
            color: "#94a3b8",
            fontSize: "13px",
          }}
        >
          {role} Panel
        </p>
      </div>

      {/* Menu */}
      <div
        style={{
          flex: 1,
          padding: "16px",
          overflowY: "auto",
        }}
      >
        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              marginBottom: "8px",
              borderRadius: "12px",
              textDecoration: "none",
              color: "#fff",
              background: isActive
                ? "#2563eb"
                : "transparent",
              transition:
                "all 0.3s ease",
              fontWeight: isActive
                ? "600"
                : "500",
            })}
          >
            <span
              style={{
                fontSize: "18px",
              }}
            >
              {menu.icon}
            </span>

            {menu.name}
          </NavLink>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "18px",
          borderTop:
            "1px solid #1e293b",
        }}
      >
        <div
          style={{
            background: "#1e293b",
            padding: "12px",
            borderRadius: "10px",
          }}
        >
          <div
            style={{
              fontWeight: "600",
            }}
          >
            {role}
          </div>

          <div
            style={{
              color: "#94a3b8",
              fontSize: "13px",
              marginTop: "4px",
            }}
          >
            Online
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;