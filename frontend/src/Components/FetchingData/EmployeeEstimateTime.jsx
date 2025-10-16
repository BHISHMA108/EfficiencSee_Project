// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const EmployeeEstimateTime = ({ employee }) => {
//     const [estimateTimes, setEstimateTimes] = useState([]);

//     useEffect(() => {
//         if (employee) { // Only fetch when employee prop is available
//             axios.get(`http://localhost:5000/api/employees/Estimate_time/${employee}`)
//                 .then(response => {
//                     setEstimateTimes(response.data); // response.data = ["07:15:23", "06:45:12", ...]
//                 })
//                 .catch(error => {
//                     console.error("❌ Error fetching data:", error);
//                 });
//         }
//     }, [employee]); // Dependency so it refetches on employee change

//     return (
//         <div>
//             <h2>Estimate Times for {employee}</h2>
//             <ul>
//                 {estimateTimes.length > 0 ? (
//                     estimateTimes.map((emp, index) => (
//                         <li key={index}>Estimate Time: {emp}</li> // Directly use emp (it's string)
//                     ))
//                 ) : (
//                     <p>No data found</p>
//                 )}
//             </ul>
//         </div>
//     );
// };

// export default EmployeeEstimateTime;

