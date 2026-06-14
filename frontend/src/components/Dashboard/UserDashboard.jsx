import React from "react";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const UserDashboard = () => {
  return (
    <>
      <Navbar />

      <div>
        <Outlet />
      </div>
    </>
  );
};

export default UserDashboard;
