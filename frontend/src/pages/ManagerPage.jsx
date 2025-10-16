import React, { useState } from "react";
import DbData from "../Components/FetchingData/DbData";

const ManagerPage = () => {
    const [selectedEmployee, setSelectedEmployee] = useState("Employee1");

    const handleChange = (e) => {
        setSelectedEmployee(e.target.value);
    };

    return (
        <>
            <div className="w-full h-[40px] bg-blue-600 p-2 text-white">
                <h1>Manager Dashboard</h1>
            </div>
            <div className="p-4">
                <label>Select Employee: </label>
                <select value={selectedEmployee} onChange={handleChange} className="ml-2 p-1 border">
                    <option value="Employee1">Employee 1</option>
                    <option value="Employee2">Employee 2</option>
                    <option value="Employee3">Employee 3</option>
                    <option value="Employee4">Employee 4</option>
                    <option value="Employee5">Employee 5</option>
                </select>
            </div>
            <DbData selectedEmployee={selectedEmployee} />
        </>
    );
};

export default ManagerPage;
