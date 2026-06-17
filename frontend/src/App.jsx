import "./App.css";
import { Routes, Route } from "react-router-dom";

import HomePage from "./components/Home/HomePage";
import Login from "./components/Home/Login";
import SignUp from "./components/Home/SignUp";
import PrivateRoutes from "./utils/PrivateRoutes";
import RoleBaseRoutes from "./utils/RoleBaseRoutes";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import AdminSummary from "./components/Dashboard/AdminSummary";
import UserDashboard from "./components/Dashboard/UserDashboard";
import ChatBot from "./components/Chatbot/Chatbot";
import List from "./components/User/List";
import Setting from "./components/Home/Setting";
import CaseLaw from "./components/Home/CaseLaw";
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/admin-dashboard"
        element={
          <PrivateRoutes>
            <RoleBaseRoutes requiredRoles={["admin"]}>
              <AdminDashboard />
            </RoleBaseRoutes>
          </PrivateRoutes>
        }
      >
        <Route index element={<AdminSummary />} />
        <Route path="users" element={<List />} />
        <Route path="case-laws" element={<CaseLaw />} />
        <Route path="chatbot" element={<ChatBot />} />
        <Route path="pricing" element={<div>Pricing Management</div>} />
        <Route path="settings" element={<Setting />} />
      </Route>
      <Route
        path="/user-dashboard"
        element={
          <PrivateRoutes>
            <RoleBaseRoutes requiredRoles={["user"]}>
              <UserDashboard />
            </RoleBaseRoutes>
          </PrivateRoutes>
        }
      >
        <Route path="case-laws" element={<CaseLaw />} />

        <Route path="chatbot" element={<ChatBot />} />
        <Route path="settings" element={<Setting />} />
      </Route>
    </Routes>
  );
}

export default App;
