import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

// Function to convert HH:MM:SS to total minutes
const convertToMinutes = (timeString) => {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 60 + minutes + seconds / 60;
};

const FetchingDataPro = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">No data available for graph.</p>;
  }

  // Process data for the chart
  const processedData = data.map(item => ({
    date: item.date,
    elapsedMinutes: convertToMinutes(item.elapsed_time),
  }));

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Employee Work Hours Over Time</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" />
          <YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Line type="monotone" dataKey="elapsedMinutes" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
      <br />
    </div>
  );
};

export default FetchingDataPro;
