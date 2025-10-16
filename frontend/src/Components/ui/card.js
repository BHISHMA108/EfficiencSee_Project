import React from "react";

const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardContent = ({ children }) => <div className="p-4">{children}</div>;
export const CardHeader = ({ children }) => <div className="border-b p-4">{children}</div>;
export const CardTitle = ({ children }) => <h2 className="text-xl font-bold">{children}</h2>;
export const CardDescription = ({ children }) => <p className="text-sm text-gray-600">{children}</p>;

export default Card;
