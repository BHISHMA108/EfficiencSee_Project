import "./ChartComponent.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const defaultFontFamily = "'Inter', sans-serif";

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: {
          size: 14,
          family: defaultFontFamily
        },
        padding: 20,
        usePointStyle: true,
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.85)',
      titleFont: { 
        size: 16,
        family: defaultFontFamily
      },
      bodyFont: { 
        size: 14,
        family: defaultFontFamily
      },
      padding: 12,
      cornerRadius: 8,
      displayColors: true
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0,0,0,0.05)'
      },
      title: {
        display: true,
        text: 'Hours',
        font: {
          size: 14,
          family: defaultFontFamily
        }
      }
    },
    x: {
      grid: {
        display: false
      },
      title: {
        display: true,
        text: 'Date',
        font: {
          size: 14,
          family: defaultFontFamily
        }
      }
    }
  }
};

//**Bar Chart Component**
export const BarChart = ({ data, xField, yField, color, title, stacked = false }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="chart-error">No data available</div>;
  }

  const chartData = {
    labels: data.map(item => item[xField] || 'N/A'),
    datasets: [
      {
        label: title || yField || 'Value',
        data: data.map(item => Number(item[yField]) || 0),
        backgroundColor: color || 'rgba(59, 130, 246, 0.7)',
        borderColor: color || 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: color ? `${color.replace(')', ', 0.9)')}` : 'rgba(59, 130, 246, 0.9)'
      }
    ]
  };

  return (
    <div className="chart-container">
      <Bar 
        data={chartData} 
        options={{
          ...chartOptions,
          scales: {
            ...chartOptions.scales,
            x: { ...chartOptions.scales.x, stacked },
            y: { ...chartOptions.scales.y, stacked }
          },
          plugins: {
            ...chartOptions.plugins,
            title: {
              display: !!title,
              text: title,
              font: { size: 18, family: defaultFontFamily },
              padding: { bottom: 20 }
            }
          }
        }} 
      />
    </div>
  );
};

// **Line Chart Component**
export const LineChart = ({ 
  data, 
  xField, 
  yField, 
  colors, 
  title,
  showPoints = true,
  fill = false,
  tension = 0.3
}) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="chart-error">No data available</div>;
  }

  const defaultColors = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(239, 68, 68, 0.8)'
  ];

  const chartData = {
    labels: data[0].values.map(item => item[xField] || 'N/A'),
    datasets: data.map((dataset, i) => ({
      label: dataset.name,
      data: dataset.values.map(item => Number(item[yField]) || 0),
      borderColor: colors?.[i] || defaultColors[i % defaultColors.length],
      backgroundColor: colors?.[i] || defaultColors[i % defaultColors.length],
      tension,
      fill,
      borderWidth: 3,
      pointRadius: showPoints ? 5 : 0,
      pointHoverRadius: showPoints ? 7 : 0,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 2
    }))
  };

  return (
    <div className="chart-container">
      <Line 
        data={chartData}
        options={{
          ...chartOptions,
          plugins: {
            ...chartOptions.plugins,
            title: {
              display: !!title,
              text: title,
              font: { size: 18, family: defaultFontFamily },
              padding: { bottom: 20 }
            }
          }
        }}
      />
    </div>
  );
};

// **Pie Chart Component**
export const PieChart = ({ 
  data, 
  colors, 
  title,
  showLegend = true,
  cutout = '0%'
}) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="chart-error">No data available</div>;
  }

  const defaultColors = [
    'rgba(59, 130, 246, 0.7)',
    'rgba(16, 185, 129, 0.7)',
    'rgba(245, 158, 11, 0.7)',
    'rgba(239, 68, 68, 0.7)',
    'rgba(139, 92, 246, 0.7)'
  ];

  const chartData = {
    labels: data.map(item => item.name || 'Unknown'),
    datasets: [
      {
        data: data.map(item => Number(item.value) || 0),
        backgroundColor: colors || defaultColors,
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 10,
        cutout
      }
    ]
  };

  return (
    <div className="chart-container">
      <Pie 
        data={chartData}
        options={{
          ...chartOptions,
          plugins: {
            ...chartOptions.plugins,
            legend: { ...chartOptions.plugins.legend, display: showLegend },
            title: {
              display: !!title,
              text: title,
              font: { size: 18, family: defaultFontFamily },
              padding: { bottom: 20 }
            }
          }
        }}
      />
    </div>
  );
};
