import React, { useState, useEffect } from "react";
import axios from "axios";
import ElapsedTimeDisplay from "../Components/FetchingData/ElapsedTimeDisplay";
import FetchingDataPro from "../Components/FetchingData/FetchingDataPro";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import { auth } from "@/Firebase/Firebase";

const EmployeeDashboard = () => {
  const [report, setReport] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [employeeData, setEmployeeData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    const sanitizedEmail = localStorage.getItem("sanitizedEmail")

    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees/fetch-data`, {
          // params: { employee: sanitizedEmail, range: "day" }
          params: { employee: localStorage.getItem("sanitizedEmail"),  _: Date.now()  },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setEmployeeData(response.data);
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };

    if (!localStorage.getItem("token")) {
      window.location.href = "/login";
    } else {
      fetchData();
    }
    }, []);

  const startMonitoring = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/start_monitoring`, {});
      console.log("Start Monitoring Response:", response.data);
      setIsMonitoring(true);
    } catch (error) {
      console.error("Error starting monitoring:", error.response ? error.response.data : error.message);
    }
  };

  const stopMonitoring = async () => {
    try {
      const email = localStorage.getItem("email"); // Retrieve email from localStorage
      if (!email) {
        console.error("Error: Email not found in localStorage");
        return;
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/stop_monitoring`, { email });
      console.log("Stop Monitoring Response:", response.data);
      setIsMonitoring(false);
    } catch (error) {
      console.error(
        "Error stopping monitoring:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleLogout = () => {
    // Clear ALL auth-related storage
    localStorage.clear();
    sessionStorage.clear();

    // Clear Firebase session
    auth.signOut();

    // Force full page reload
  window.location.href = "/login?nocache=" + Date.now();
  };

  let email = localStorage.getItem("email");
  const navigate = useNavigate();
  return (
    <div className="">
      <div style={{ background: "#2176ff" }} className="flex flex-col sm:flex-row sm:justify-between sm:h-[61px]"><span className="translate-y-4.5"
      // onClick={() => navigate("/login")}
      // onClick={handleLogout}
      >  {/* <ArrowBackIcon /> Go Back */}
        <button
          // onClick={handleLogout}
          onClick={() => navigate("/login")}
          className="text-white hover:text-gray-200 transition"
        >
          <ArrowBackIcon className="mr-1" /> Logout
        </button>
      
      </span>
        <h1 className="p-1.5 mt-2 text-3xl sm:text-4xl translate-x-5 font-medium sm:-translate-x-9">Employee Dashboard</h1><div></div> </div>
      <br />
      <h1 className="flex flex-col sm:flex-row justify-center text-2xl text-clamp-2 font-bold mb-4 p-4 mt-2.5">Displaying the Dashboard for user with email : &nbsp; <span className="text-blue-600">{email}</span> </h1>

      <div className="sm:flex flex-row hidden justify-center p-4 gap-26">
        <button
          onClick={startMonitoring}
          className={`px-4 py-2 rounded-lg ${isMonitoring ? "bg-gray-500" : "bg-green-500"} text-white`}
          disabled={isMonitoring}
        >
          {isMonitoring ? "Monitoring..." : "Start Working"}
        </button>

        <button
          onClick={stopMonitoring}
          className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg"
          disabled={!isMonitoring}
        >
          Stop Working
        </button>
      </div>


      {report && (
        <div className="mt-5 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Work Report</h2>
          <p>Total Time: {report.elapsed_time}</p>
          <p>Tab Switches: {report.tab_switched_count}</p>
          <p>Active Time: {report.active_duration}</p>
          <p>Inactive Time: {report.inactive_duration}</p>
          <p>Break Time: {report.break_time}</p>
          <p>Breaks Taken: {report.break_counter}</p>
        </div>
      )}
      <ElapsedTimeDisplay />
    </div>

  );
};

export default EmployeeDashboard;
