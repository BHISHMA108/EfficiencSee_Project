import { useState, useEffect } from "react";
import { BarChart, LineChart, PieChart } from "../ui/ChartComponent.jsx";
import axios from "axios";
import { getAuth } from "firebase/auth";


const sanitizedEmail = localStorage.getItem("sanitizedEmail");

const convertTimeToHours = (timeString) => {
  if (!timeString) return 0;
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours + minutes / 60 + seconds / 3600;
};

const processData = (data, field) => {
  return data.map((entry) => ({
    date: entry.date,
    [field]: convertTimeToHours(entry[field]),
  }));
};

const exportToCSV = (data) => {
  const headers = Object.keys(data[0]).join(",");
  const rows = data
    .map((entry) =>
      Object.values(entry)
        .map((value) =>
          typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value
        )
        .join(",")
    )
    .join("\n");

  const csvContent = `${headers}\n${rows}`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "productivity_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToDOC = (data) => {
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>Productivity Data</title></head>
      <body>
        <h1>Productivity Data</h1>
        <table border="1">
          <tr>${Object.keys(data[0])
            .map((key) => `<th>${key}</th>`)
            .join("")}</tr>
          ${data
            .map(
              (entry) =>
                `<tr>${Object.values(entry)
                  .map((value) => `<td>${value}</td>`)
                  .join("")}</tr>`
            )
            .join("")}
        </table>
      </body>
    </html>
  `;

  const blob = new Blob(["\ufeff", htmlContent], {
    type: "application/msword",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "productivity_data.doc");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("week");

  useEffect(() => {
    const fetchData = async () => {

      setLoading(true);
      try {
        
        const auth = getAuth();
        const user = auth.currentUser;
        const token = await user.getIdToken(); // this is the Firebase ID token
        // console.log("This is the token ",token);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/employees/fetch-data`,
          {
            params: { employee: sanitizedEmail, range },
            headers:{
              Authorization : `Bearer ${token}`
            },
          }
        );
        setData(response.data);
        console.log("🚀 Full Data:", response.data);
      }catch (err) {
              setError(err.response ? err.response.data.error : "An error occurred");
            } finally {
              setLoading(false);
            }
          };
          fetchData();
        }, [range]);

  const summary = {
    totalElapsed: data.reduce(
      (sum, e) => sum + convertTimeToHours(e.elapsed_time),
      0
    ),
    totalActive: data.reduce(
      (sum, e) => sum + convertTimeToHours(e.active_duration),
      0
    ),
    totalInactive: data.reduce(
      (sum, e) => sum + convertTimeToHours(e.inactive_duration),
      0
    ),
    total_break: data.reduce(
      (sum, e) => sum + convertTimeToHours(e.total_break),
      0
    ),
    tab_switches: data.reduce(
      (sum, e) => sum + (parseInt(e.tab_switches) || 0),
      0
    ),
  };

  const todayISO = new Date().toISOString().split("T")[0];
  const todayData = data.find((entry) => entry.date === todayISO); // Changed to find
  console.log(todayData);
  console.log("📅 Today's Data:", todayData);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Productivity Dashboard
        </h1>
        <p className="text-gray-600">Monitor your performance metrics</p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">
          Loading...
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded-lg shadow-md">
          Error: {error}
        </div>
      ) : (
        <>
          <div className="p-6 bg-white rounded-xl shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-4">Today's Time Breakdown</h2>
            {todayData ? (
              <BarChart
                data={[
                  {
                    category: "Elapsed Time",
                    value: convertTimeToHours(todayData.elapsed_time),
                  },
                  {
                    category: "Active Time",
                    value: convertTimeToHours(todayData.active_duration),
                  },
                  {
                    category: "Inactive Time",
                    value: convertTimeToHours(todayData.inactive_duration),
                  },
                  // { category: 'Breaks', value: convertTimeToHours(todayData.total_break) }
                ]}
                xField="category"
                yField="value"
                title="Today's Time Breakdown"
                color="#3b82f6"
              />
            ) : (
              <p>No data available for today.</p>
            )}
          </div>

          <div className="m-4 mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {["day", "week", "month"].map((period) => (
                <button
                  key={period}
                  onClick={() => setRange(period)}
                  className={`px-6 py-2 rounded-lg transition duration-300 ${
                    range === period
                      ? "bg-blue-600 text-white"
                      : "bg-white text-blue-600 border border-blue-600"
                  }`}
                >
                  {`Last ${period}`}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 sm:justify-end">
              <button
                onClick={() => exportToCSV(data)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Export CSV
              </button>

              <button
                onClick={() => exportToDOC(data)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
                Export DOC
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Object.entries(summary).map(([key, value]) => (
              <div
                key={key}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200"
              >
                <h3 className="text-sm text-gray-500">
                  {key.replace(/avg|total/gi, "").replace(/_/g, " ")}
                </h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {value.toFixed(2)} {key.includes("tab_switches") ? " " : "hrs"}{" "}
                  {/* Conditional check for switches */}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <BarChart
              data={processData(data, "elapsed_time")}
              xField="date"
              yField="elapsed_time"
              title="Elapsed Time"
              color="#3b82f6"
            />
            <LineChart
              data={[
                {
                  name: "Active",
                  values: processData(data, "active_duration"),
                },
                {
                  name: "Inactive",
                  values: processData(data, "inactive_duration"),
                },
              ]}
              xField="date"
              yField="active_duration"
              title="Activity Trends"
              colors={["#10b981", "#ef4444"]}
            />
            <PieChart
              data={data.map((entry) => ({
                name: entry.date,
                value: convertTimeToHours(entry.total_break),
              }))}
              title="Break Time"
              colors={["#f59e0b", "#f97316"]}
            />
            <BarChart
              data={data.map((entry) => ({
                date: entry.date,
                tab_switches: parseInt(entry.tab_switches) || 0,
              }))}
              xField="date"
              yField="tab_switches"
              title="Tab Switches"
              color="#8b5cf6"
            />
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200 mt-8">
            <h2 className="text-2xl font-bold mb-4">Employee Data Table</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Elapsed Time (hrs)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry, index) => (
                  <tr key={index} className="border">
                    <td className="border p-2">{entry.date}</td>
                    <td className="border p-2">
                      {convertTimeToHours(entry.elapsed_time).toFixed(2)} hrs
                    </td>{" "}
                    {/* Added "hrs" here */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
