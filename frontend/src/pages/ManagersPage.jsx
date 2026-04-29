import React, { useEffect, useState, useRef, useMemo } from "react";
import Header from "@/Components/Header";
import Table from "@/Components/Table";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { BarChart, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line, ResponsiveContainer } from 'recharts';
import { db } from '@/Firebase/Firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import socket from "../socket"

// Helper function to unsanitize email
const unsanitizeEmail = (sanitizedEmail) => {
  return sanitizedEmail.replace(/_at_/g, '@').replace(/_dot_/g, '.');
};

function ManagerPage() {
  const [viewMode, setViewMode] = useState('live'); 
  const [allUsers, setAllUsers] = useState([]); 
  const [adminFilter, setAdminFilter] = useState('all'); // New filter state
  const [mongoData, setMongoData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [employeeLoading, setEmployeeLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sortOrder, setSortOrder] = useState('asc');
  const [refresh, setRefresh] = useState(0);

  const tableRef = useRef(null);

  const columns = [
    { Header: "Date", accessor: "Date" },
    { Header: "Start Time", accessor: "start_time" },
    { Header: "Stop Time", accessor: "stop_time" },
    { Header: "Total Working Time", accessor: "Estimate_time" },
    { Header: "Tab Switched", accessor: "Tab_switched" },
    { Header: "Active Duration", accessor: "Active_duration" },
    { Header: "Inactive Duration", accessor: "Inactive_duration" },
    { Header: "Total Break Time", accessor: "Total_break_time" },
    { Header: "Breaks", accessor: "Breaks" },
  ];

  const sortedData = useMemo(() => {
    return [...mongoData].sort((a, b) => {
      return sortOrder === 'asc' 
        ? a.Date.localeCompare(b.Date)
        : b.Date.localeCompare(a.Date);
    });
  }, [mongoData, sortOrder]);

  // Filtered logic for Admin list
  const filteredUsers = useMemo(() => {
    if (adminFilter === 'all') return allUsers;
    return allUsers.filter(user => user.role === adminFilter);
  }, [allUsers, adminFilter]);

  const handleRoleChange = async(id, role)=>{
    try{
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/update-user-role`, {
        id: id,
        role: role
      });
      if(res.status === 200){
        alert("Role updated successfully");
        setRefresh(prev => prev + 1);
      } else {
        alert("Failed to update role");
      }
    } catch(err){
      console.log("this is the error", err);
      alert("Failed to update role");
    }
  }

  useEffect(() => {
    const onConnect = () => {
      console.log("Connected to Socket.IO server");
    };

    let onMonitoringStatusUpdated = (data)=>{
      setEmployees((employee)=>{
        return employee.map((emp)=>{
          // data.email sent from the backend is actually the sanitizedEmail, so we match it against emp.collection
          if(data.email === emp.email || data.email === emp.collection){
            return {
              ...emp,
              status : data.status
            }
          } else {
            return emp;
          }
        })
      })
      console.log("Monitoring status updated", data);
      console.log("employee data", employees);
    }

    const onDisconnect = () => {
      console.log("Disconnected from Socket.IO server");
    };

    socket.on("connect", onConnect);
    socket.on("monitoring-status", onMonitoringStatusUpdated);
    socket.on("disconnect", onDisconnect);

    const fetchEmployees = async () => {
      try {
        setEmployeeLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/get-all-users`);

        setAllUsers(res.data.users);
        
        const mappedEmployees = res.data.users
          .filter(u => u.role === "employee")
          .map(u => ({
            _id: u._id,
            status : u.status,
            collection: u.sanitizedEmail || u.email.toLowerCase().replace(/@/g, '_at_').replace(/\./g, '_dot_'),
            email: u.email,
            name: u.name || "Unnamed Employee",
            role : u.role
          }));

        setEmployees(mappedEmployees);
        if (mappedEmployees.length > 0) setSelectedEmployee(mappedEmployees[0].collection);
        else setError("No valid employees found in database");
      } catch (error) {
        console.error("Error fetching employees:", error);
        setError(`Failed to load employee list: ${error.response?.data?.error || error.message}`);
      } finally {
        setEmployeeLoading(false);
      }
    };
    fetchEmployees();
    return () => {
      socket.off("connect", onConnect);
      socket.off("monitoring-status", onMonitoringStatusUpdated);
      socket.off("disconnect", onDisconnect);
    };
  }, [refresh]);

  // ... (rest of your existing helper functions: calculateMetrics, parseTimeToHours, etc remain unchanged)
  const calculateMetrics = (data) => {
    return data.reduce((acc, curr) => {
      const estimateHours = parseTimeToHours(curr.Estimate_time);
      const activeHours = parseTimeToHours(curr.Active_duration);
      return {
        totalHours: acc.totalHours + estimateHours,
        totalBreaks: acc.totalBreaks + curr.Breaks,
        avgProductivity: acc.avgProductivity + (activeHours / estimateHours || 0),
        totalTabSwitches: acc.totalTabSwitches + curr.Tab_switched
      };
    }, { totalHours: 0, totalBreaks: 0, avgProductivity: 0, totalTabSwitches: 0 });
  };

  const parseTimeToHours = (timeString) => {
    if (!timeString) return 0;
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours + (minutes / 60) + (seconds / 3600);
  };

  const formatChartData = (data) => {
    return data.map(item => ({
      ...item,
      Active_duration: parseTimeToHours(item.Active_duration),
      Inactive_duration: parseTimeToHours(item.Inactive_duration),
      Total_break_time: parseTimeToHours(item.Total_break_time)
    }));
  };

  const metrics = calculateMetrics(mongoData);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedEmployee) return;
      try {
        setLoading(true);
        const params = {
          employee: selectedEmployee,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        };
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/test`, { params });
        setMongoData(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Either Data is not present or there is an issue in fetching performance data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedEmployee, startDate, endDate]);

  const productivityPercentage = mongoData.length > 0 ? Math.round((metrics.avgProductivity / mongoData.length) * 100) : 0;
  const formattedTotalHours = metrics.totalHours.toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* --- Top Level View Switcher --- */}
        <div className="flex justify-center mb-8">
            <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex flex-wrap justify-center gap-1">
                <button onClick={() => setViewMode('live')} className={`px-6 py-2 rounded-md font-medium transition-all ${viewMode === 'live' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>Live Monitoring</button>
                <button onClick={() => setViewMode('dashboard')} className={`px-6 py-2 rounded-md font-medium transition-all ${viewMode === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>Performance Dashboard</button>
                <button onClick={() => setViewMode('admin')} className={`px-6 py-2 rounded-md font-medium transition-all ${viewMode === 'admin' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>Admin</button>
            </div>
        </div>

        {/* --- SECTION 2: PERFORMANCE DASHBOARD --- */}
        {viewMode === 'dashboard' && (
          <section className="animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Employee Performance Dashboard</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    disabled={employeeLoading}
                  >
                    {employees.map((employee) => (
                      <option key={employee.collection} value={employee.collection}>
                        {employee.name} ({employee.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <div className="flex gap-3">
                    <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} selectsStart startDate={startDate} endDate={endDate} className="w-full p-3 border border-gray-300 rounded-lg" />
                    <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} selectsEnd startDate={startDate} endDate={endDate} minDate={startDate} className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 border-b border-gray-200 overflow-x-auto">
                <nav className="flex whitespace-nowrap">
                <button onClick={() => setActiveTab('overview')} className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Overview</button>
                <button onClick={() => setActiveTab('details')} className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Detailed Data</button>
                </nav>
            </div>

            {loading && <div className="flex justify-center items-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}
            {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">{error}</div>}

            {!loading && !error && (
              <>
                {activeTab === 'overview' && (
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"><p className="text-gray-500">Total Hours</p><p className="text-3xl font-semibold text-blue-600">{formattedTotalHours}h</p></div>
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"><p className="text-gray-500">Productivity</p><p className="text-3xl font-semibold text-green-600">{productivityPercentage}%</p></div>
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"><p className="text-gray-500">Total Breaks</p><p className="text-3xl font-semibold text-red-600">{metrics.totalBreaks}</p></div>
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"><p className="text-gray-500">Tab Switches</p><p className="text-3xl font-semibold text-purple-600">{metrics.totalTabSwitches}</p></div>
                    </div>
                    {mongoData.length > 0 && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 w-full h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={formatChartData(mongoData)}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="Date"/>
                                <YAxis/>
                                <Tooltip/>
                                <Legend/>
                                <Line type="monotone" dataKey="Active_duration" stroke="#3b82f6" name="Active"/>
                                <Line type="monotone" dataKey="Inactive_duration" stroke="#ef4444" name="Inactive"/>
                              </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 w-full h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={formatChartData(mongoData)}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="Date"/>
                                <YAxis/>
                                <Tooltip/>
                                <Legend/>
                                <Bar dataKey="Breaks" fill="#8b5cf6" name="Breaks"/>
                                <Bar dataKey="Total_break_time" fill="#10b981" name="Break Time"/>
                              </BarChart>
                            </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'details' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" ref={tableRef}>
                    <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
                      <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="border p-2 rounded"><option value="asc">Asc</option><option value="desc">Desc</option></select>
                      <div className="flex gap-2">
                        <button onClick={exportToCSV} className="bg-green-500 text-white px-4 py-2 rounded">CSV</button>
                        <button onClick={exportToPDF} className="bg-blue-500 text-white px-4 py-2 rounded">PDF</button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                        <Table columns={columns} data={sortedData} />
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        )}


        {viewMode === 'live' && (
           <section className="animate-in fade-in duration-500">
             <h2 className="text-xl font-bold text-gray-800 mb-6">Live Monitoring Status</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
               {employeeLoading ? <p>Loading Employees...</p> : employees.map((employee) => (
                 <div key={employee._id} className="bg-white w-full p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                   <div>
                     <p className="font-semibold text-gray-800 truncate">{employee.name}</p>
                     <p className="text-xs text-gray-500">{employee.email}</p>
                   </div>
                   <div className="flex items-center">
                     <span className={`w-2.5 h-2.5 ${employee.status === 'active' ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-2 animate-pulse`}></span>
                     <span className={`text-xs font-medium ${employee.status === 'active' ? 'text-green-600' : 'text-red-600'} uppercase`}>{employee.status}</span>
                   </div>
                 </div>
               ))}
             </div>
           </section>
        )}

        {viewMode === 'dashboard' && (
            <section className="animate-in fade-in duration-500">
                {/* ... (Your existing Dashboard JSX) ... */}
            </section>
        )}

        {/* --- ADMIN SECTION WITH FILTERS --- */}
        {viewMode === 'admin' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Employees</h1>
              <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition" onClick={() => setRefresh(refresh + 1)}>Refresh</button>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 mb-2">
              {['all', 'employee', 'manager'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setAdminFilter(filter)}
                  className={`px-4 py-2 rounded-lg capitalize transition-all ${adminFilter === filter ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {filteredUsers.map((employee) => (
              <div key={employee._id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div>
                  <p className="font-semibold">{employee.name}</p>
                  <p className="text-gray-500">{employee.email}</p>
                </div>
                <select
                  value={employee.role}
                  onChange={(e) => handleRoleChange(employee._id, e.target.value)}
                  className="bg-blue-600 text-white px-4 py-2 rounded outline-none cursor-pointer hover:bg-blue-700 transition"
                >
                  <option value="employee" className="text-black bg-white">employee</option>
                  <option value="manager" className="text-black bg-white">manager</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManagerPage;