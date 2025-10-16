import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const TodayDataChart = ({ data = [] }) => { // Ensure data is always an array
  if (!Array.isArray(data)) {
    console.error("Expected an array for data, received:", data);
    return <p className="text-red-500">Error: Data format is incorrect.</p>;
  }

  const today = new Date().toISOString().split("T")[0]; // Get today's date

  const todayData = data.filter(e => e?.date === today); // Ensure each entry has a 'date' field

  const convertTimeToHours = (timeString) => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours + minutes / 60;
  };

  const todaySummary = {
    todayElapsed: todayData.reduce((sum, e) => sum + convertTimeToHours(e?.elapsed_time), 0),
    todayActive: todayData.reduce((sum, e) => sum + convertTimeToHours(e?.active_duration), 0),
    todayBreak: todayData.reduce((sum, e) => sum + convertTimeToHours(e?.break_time), 0)
  };

  const chartData = [
    { name: "Elapsed Time", value: todaySummary.todayElapsed },
    { name: "Active Time", value: todaySummary.todayActive },
    { name: "Break Time", value: todaySummary.todayBreak }
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Today's Data</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#4F46E5" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TodayDataChart;
