import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "../pages/Login";

import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Products from "../pages/Products";
import Suppliers from "../pages/Suppliers";
import PurchaseOrders from "../pages/PurchaseOrders";
import GRN from "../pages/GRN";
import Inventory from "../pages/Inventory";
import Orders from "../pages/Orders";
import Customers from "../pages/Customers";
import Analytics from "../pages/Analytics";
import Alerts from "../pages/Alerts";

import AdminLayout from "../layouts/AdminLayout";
import CashierLayout from "../layouts/CashierLayout";
import SupplierLayout from "../layouts/SupplierLayout";
import SupplierDashboard from "../pages/SupplierDashboard";
import SupplierOrders from "../pages/SupplierOrders";
import SupplierProfile from "../pages/SupplierProfile";


function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* ADMIN */}

        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          <Route
            path="users"
            element={<Users />}
          />

          <Route
            path="products"
            element={<Products />}
          />

          <Route
            path="suppliers"
            element={<Suppliers />}
          />

          <Route
            path="purchase-orders"
            element={
              <PurchaseOrders />
            }
          />

          <Route
            path="grn"
            element={<GRN />}
          />

          <Route
            path="inventory"
            element={
              <Inventory />
            }
          />

          <Route
            path="orders"
            element={<Orders />}
          />

          <Route
            path="customers"
            element={
              <Customers />
            }
          />

          <Route
            path="analytics"
            element={
              <Analytics />
            }
          />

          <Route
            path="alerts"
            element={<Alerts />}
          />
        </Route>

        {/* MANAGER */}

        <Route
          path="/manager"
          element={<AdminLayout />}
        >
          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          <Route
            path="products"
            element={<Products />}
          />

          <Route
            path="suppliers"
            element={<Suppliers />}
          />

          <Route
            path="purchase-orders"
            element={
              <PurchaseOrders />
            }
          />

          <Route
            path="grn"
            element={<GRN />}
          />

          <Route
            path="inventory"
            element={
              <Inventory />
            }
          />

          <Route
            path="orders"
            element={<Orders />}
          />

          <Route
            path="customers"
            element={
              <Customers />
            }
          />

          <Route
            path="analytics"
            element={
              <Analytics />
            }
          />

          <Route
           path="alerts"
           element={<Alerts />}
          />
        </Route>

        {/* CASHIER */}

        <Route
          path="/cashier"
          element={<CashierLayout />}
        >
          

          <Route
            path="orders"
            element={<Orders />}
          />

          <Route
            path="customers"
            element={
              <Customers />
            }
          />
        </Route>

        {/* SUPPLIER */}

       <Route
  path="/supplier"
  element={<SupplierLayout />}
>
  <Route
    path="dashboard"
    element={<SupplierDashboard />}
  />

  <Route
    path="orders"
    element={<SupplierOrders />}
  />

  <Route
    path="profile"
    element={<SupplierProfile />}
  />
</Route>

        

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;