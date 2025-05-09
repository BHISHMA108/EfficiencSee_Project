import './App.css'
import LoginSignup from './Components/LoginSignup/LoginSignup.jsx'
import LandingPage from './pages/LandingPage.jsx'
import EmployeePage from './pages/EmployeePage.jsx';
import ManagersPage from './pages/ManagersPage.jsx'; // Update import
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Changed to HashRouter



export default function App(){
  return (
    <Router>
      <Routes>
          <Route path="/" element={<LandingPage/>}/>
          <Route path="/login" element={<LoginSignup/>}/>
          <Route path="/manager" element={<ManagersPage />} /> 
          <Route path="/employee/*" element={<EmployeePage/>}/>
          <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}//working frontend with updated manager's dashboard
