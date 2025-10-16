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
  
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: "'Inter', sans-serif"
          },
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.85)',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== undefined) {
              label += context.parsed.y.toFixed(2) + ' hrs';
            } else if (context.parsed !== undefined) {
              label += context.parsed.toFixed(2) + ' hrs';
            }
            return label;
          }
        }
      }
    }
  };
  
  export const BarChart = ({ data, xField, yField, title, color }) => {
    if (!data || !Array.isArray(data)) {
      return <div className="chart-error">No data available</div>;
    }
  
    const chartData = {
      labels: data.map(item => item[xField]),
      datasets: [{
        label: title || yField,
        data: data.map(item => item[yField]),
        backgroundColor: color || 'rgba(59, 130, 246, 0.7)',
        borderColor: color || 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: color ? `${color.replace(')', ', 0.9)')}` : 'rgba(59, 130, 246, 0.9)'
      }]
    };
  
    const options = {
      ...commonOptions,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Hours',
            font: { size: 12 }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date',
            font: { size: 12 }
          }
        }
      },
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: !!title,
          text: title,
          font: { size: 16 },
          padding: { bottom: 20 }
        }
      }
    };
  
    return <Bar data={chartData} options={options} />;
  };
  
  export const LineChart = ({ data, xField, yField, colors, title }) => {
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
      labels: data[0].values.map(item => item[xField]),
      datasets: data.map((dataset, i) => ({
        label: dataset.name,
        data: dataset.values.map(item => item[yField]),
        borderColor: colors?.[i] || defaultColors[i % defaultColors.length],
        backgroundColor: colors?.[i] || defaultColors[i % defaultColors.length],
        tension: 0.3,
        fill: false,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 2
      }))
    };
  
    const options = {
      ...commonOptions,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Hours',
            font: { size: 12 }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date',
            font: { size: 12 }
          }
        }
      },
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: !!title,
          text: title,
          font: { size: 16 },
          padding: { bottom: 20 }
        }
      }
    };
  
    return <Line data={chartData} options={options} />;
  };
  
  export const PieChart = ({ data, colors, title }) => {
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
      labels: data.map(item => item.name),
      datasets: [{
        data: data.map(item => item.value),
        backgroundColor: colors || defaultColors,
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 10
      }]
    };
  
    const options = {
      ...commonOptions,
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: !!title,
          text: title,
          font: { size: 16 },
          padding: { bottom: 20 }
        }
      }
    };
  
    return <Pie data={chartData} options={options} />;
  };