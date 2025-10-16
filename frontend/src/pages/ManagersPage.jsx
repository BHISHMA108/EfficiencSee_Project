import React, { useEffect, useState, useRef, useMemo } from "react";
import Header from "@/Components/Header";
import Table from "@/Components/Table";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";  
import { BarChart, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line } from 'recharts';
import { db } from '@/Firebase/Firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Helper function to unsanitize email
const unsanitizeEmail = (sanitizedEmail) => {
  return sanitizedEmail.replace(/_at_/g, '@').replace(/_dot_/g, '.');
};

function ManagerPage() {
  const [mongoData, setMongoData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [employeeLoading, setEmployeeLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sortOrder, setSortOrder] = useState('asc'); // New sort state

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

  // Sort data based on sortOrder
  const sortedData = useMemo(() => {
    return [...mongoData].sort((a, b) => {
      return sortOrder === 'asc' 
        ? a.Date.localeCompare(b.Date)
        : b.Date.localeCompare(a.Date);
    });
  }, [mongoData, sortOrder]);

  // Fetch employee data on component mount
  useEffect(() => {
    // In the fetchEmployees function
    const fetchEmployees = async () => {
      try {
        setEmployeeLoading(true);
        const response = await axios.get("https://efficiensee-back-end.onrender.com/api/employees");
        const collections = response.data;

        // Filter out empty collections and test entries
        const validCollections = collections.filter(name =>
          name !== "e_at_g_dot_com" &&
          name.length > 10
        );

        const employeesData = await Promise.all(
          validCollections.map(async (collectionName) => {
            const email = unsanitizeEmail(collectionName);
            try {
              const usersRef = collection(db, 'users');
              const q = query(usersRef, where('email', '==', email));
              const querySnapshot = await getDocs(q);

              if (querySnapshot.empty) {
                console.warn(`No Firestore record for: ${email}`);
                return null;
              }

              const userData = querySnapshot.docs[0].data();
              return {
                collection: collectionName,
                email: email,
                name: userData.name || "Unnamed Employee"
              };
            } catch (firestoreError) {
              console.error(`Firestore error for ${email}:`, firestoreError);
              return null;
            }
          })
        );

        // Filter out null values and set state
        const filteredEmployees = employeesData.filter(e => e !== null);
        setEmployees(filteredEmployees);

        if (filteredEmployees.length > 0) {
          setSelectedEmployee(filteredEmployees[0].collection);
        } else {
          setError("No valid employees found in database");
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        setError(`Failed to load employee list: ${error.response?.data?.error || error.message}`);
      } finally {
        setEmployeeLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Update calculateMetrics to use numerical values:
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
    }, {
      totalHours: 0,
      totalBreaks: 0,
      avgProductivity: 0,
      totalTabSwitches: 0
    });
  };

  // Time parsing helper
  const parseTimeToHours = (timeString) => {
    if (!timeString) return 0;
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours + (minutes / 60) + (seconds / 3600);
  };

  // Add this function before render:
const formatChartData = (data) => {
  return data.map(item => ({
    ...item,
    Active_duration: parseTimeToHours(item.Active_duration),
    Inactive_duration: parseTimeToHours(item.Inactive_duration),
    Total_break_time: parseTimeToHours(item.Total_break_time)
  }));
};

  const metrics = calculateMetrics(mongoData);

  // Date range handlers
  const setDateRange = (range) => {
    const today = new Date();
    switch (range) {
      case 'today':
        setStartDate(today);
        setEndDate(today);
        break;
      case 'week':
        setStartDate(new Date(today.setDate(today.getDate() - 7)));
        setEndDate(new Date());
        break;
      case 'month':
        setStartDate(new Date(today.setMonth(today.getMonth() - 1)));
        setEndDate(new Date());
        break;
      default:
        break;
    }
  };

  // Export functions
  const exportToPDF = () => {
    const input = tableRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape");
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save("employee_report.pdf");
    });
  };

  const exportToCSV = () => {
    if (!mongoData.length) return;

    const csvContent = [
      Object.keys(mongoData[0]).join(','),
      ...mongoData.map(item => Object.values(item).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_data.csv';
    a.click();
  };

  // Fetch performance data when filters change
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedEmployee) return;

      try {
        setLoading(true);
        const params = {
          employee: selectedEmployee,
          // Use simple YYYY-MM-DD format without time
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        };

        const response = await axios.get("https://efficiensee-back-end.onrender.com/api/test", { params });
        setMongoData(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch performance data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedEmployee, startDate, endDate]);

  // Derived values
  const productivityPercentage = mongoData.length > 0
    ? Math.round((metrics.avgProductivity / mongoData.length) * 100)
    : 0;
  const formattedTotalHours = metrics.totalHours.toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center">Employee Performance Dashboard</h1>
          <p className="text-gray-600 text-center">Monitor and analyze employee productivity metrics</p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Employee
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                disabled={employeeLoading}
              >
                {employeeLoading ? (
                  <option>Loading employees...</option>
                ) : employees.length > 0 ? (
                  employees.map((employee) => (
                    <option key={employee.collection} value={employee.collection}>
                      {employee.name} ({employee.email})
                    </option>
                  ))
                ) : (
                  <option>No employees found</option>
                )}
              </select>
            </div>

            {/* Date picker section remains the same */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="flex gap-3">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholderText="Start Date"
                />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholderText="End Date"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setDateRange('today')}
                  className="text-sm px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  Today
                </button>
                <button
                  onClick={() => setDateRange('week')}
                  className="text-sm px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  Last Week
                </button>
                <button
                  onClick={() => setDateRange('month')}
                  className="text-sm px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  Last Month
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Detailed Data
              </button>
            </nav>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
              <div>
                {/* Metrics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Hours</p>
                        <p className="mt-1 text-3xl font-semibold text-blue-600">{formattedTotalHours}h</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Productivity</p>
                        <p className="mt-1 text-3xl font-semibold text-green-600">{productivityPercentage}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Breaks</p>
                        <p className="mt-1 text-3xl font-semibold text-red-600">{metrics.totalBreaks}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tab Switches</p>
                        <p className="mt-1 text-3xl font-semibold text-purple-600">{metrics.totalTabSwitches}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                {mongoData.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Productivity Trends</h3>
                      <div className="overflow-x-auto">
                        <LineChart
                          width={500}
                          height={300}
                          data={formatChartData(mongoData)}
                          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="Date" angle={-45} textAnchor="end" height={60} />
                          <YAxis />
                          <Tooltip contentStyle={{ borderRadius: '8px' }} />
                          <Legend verticalAlign="top" height={36} />
                          <Line
                            type="monotone"
                            dataKey="Active_duration"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            activeDot={{ r: 6 }}
                            name="Active Duration"
                          />
                          <Line
                            type="monotone"
                            dataKey="Inactive_duration"
                            stroke="#ef4444"
                            strokeWidth={2}
                            name="Inactive Duration"
                          />
                        </LineChart>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Break Analysis</h3>
                      <div className="overflow-x-auto">
                        <BarChart
                          width={500}
                          height={300}
                          data={formatChartData(mongoData)}
                          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="Date" angle={-45} textAnchor="end" height={60} />
                          <YAxis />
                          <Tooltip contentStyle={{ borderRadius: '8px' }} />
                          <Legend verticalAlign="top" height={36} />
                          <Bar dataKey="Breaks" fill="#8b5cf6" name="Number of Breaks" />
                          <Bar dataKey="Total_break_time" fill="#10b981" name="Total Break Time" />
                        </BarChart>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Updated Details Tab Content */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200" ref={tableRef}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 md:mb-0">Detailed Activity Data</h2>
              <div className="flex gap-3 flex-wrap">
                {/* Sort Dropdown */}
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="asc">Date: Ascending</option>
                  <option value="desc">Date: Descending</option>
                </select>

                {/* Export Buttons */}
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
                  disabled={!mongoData.length}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </button>
                <button
                  onClick={exportToPDF}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                  disabled={!mongoData.length}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Export PDF
                </button>
              </div>
            </div>
          </div>

                <div className="p-6">
                  {mongoData.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="mt-4 text-lg font-medium">No data available</p>
                      <p className="mt-2">Try adjusting your filters or selecting a different employee</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table columns={columns} data={sortedData} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ManagerPage; //MonicaAi