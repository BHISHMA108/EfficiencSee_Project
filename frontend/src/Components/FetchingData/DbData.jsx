import React from "react";
import EmployeeEstimateTime from "./EmployeeEstimateTime";

function DbData({ selectedEmployee }) {
    const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/employees/fetch-data?employee=${selectedEmployee}&_=${Date.now()}`, 
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchData();
  }, [selectedEmployee]);
    return (
        <div>
            <EmployeeEstimateTime employee={selectedEmployee}
            data={data} // Add this line 
            />
        </div>
    );
}

export default DbData;
