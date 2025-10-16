import React from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="bg-blue-600 text-white p-4">
      <span className="translate-y-4.5" onClick={()=>navigate("/login")}> <ArrowBackIcon/> Logout</span>
      <h1 className="text-2xl font-bold text-center" >EfficienSee - Manager's Dashboard</h1>
    </header>
  );
};

export default Header;
