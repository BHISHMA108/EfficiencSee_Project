Go to firebase website and register the project then copy paste the code sample shown below
    💗. npm install firebase
        npm install -g firebase-tools


    💗. total we need 3 things a jsx file for showing the loginpage, a firebase.js file and a .env file

        💗.creating a firebase.js file in src>Firebase>Firebase.js and paste similar code 
        
        // Import the functions you need from the SDKs you need
        import { initializeApp } from "firebase/app";
        import { getAnalytics } from "firebase/analytics";
        // TODO: Add SDKs for Firebase products that you want to use
        // https://firebase.google.com/docs/web/setup#available-libraries

        // Your web app's Firebase configuration
        // For Firebase JS SDK v7.20.0 and later, measurementId is optional
        const firebaseConfig = {
        apiKey: "AIzaSyDIRlOwNAhJFU3ZpcjvECagWdclfaZB-Nc",
        authDomain: "efficiencee-aa10c.firebaseapp.com",
        projectId: "efficiencee-aa10c",
        storageBucket: "efficiencee-aa10c.firebasestorage.app",
        messagingSenderId: "316738593068",
        appId: "1:316738593068:web:2390b95a708e9f8b4e4c89",
        measurementId: "G-97X0N5D52D"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);

        💗.paste the following code in .env file in the root of the project, means at level of src and inside the root project
        /my-react-app
        │── /node_modules
        │── /public
        │── /src
        │── .env  ✅ (Place it here)
        │── .gitignore
        │── package.json
        │── README.md

        VITE_FIREBASE_API_KEY=AIzaSyDIRlOwNAhJFU3ZpcjvECagWdclfaZB-Nc
        VITE_FIREBASE_AUTH_DOMAIN=efficiencee-aa10c.firebaseapp.com
        VITE_FIREBASE_PROJECT_ID=efficiencee-aa10c
        VITE_FIREBASE_STORAGE_BUCKET=efficiencee-aa10c.firebasestorage.app
        VITE_FIREBASE_MESSAGING_SENDER_ID=316738593068
        VITE_FIREBASE_APP_ID=1:316738593068:web:2390b95a708e9f8b4e4c89
        VITE_FIREBASE_MEASUREMENT_ID=G-97X0N5D52D


        💗.now give information of .env and firebase.js to ai to make a login page and other changes for example shown below
        import React, { useState } from "react";
        import { auth } from "../../Firebase/Firebase"; // Updated import
        import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
        import "./LoginSignup.css";
        import PersonIcon from "@mui/icons-material/Person";
        import AlternateEmailSharpIcon from "@mui/icons-material/AlternateEmailSharp";
        import PasswordSharpIcon from "@mui/icons-material/PasswordSharp";

        const LoginSignup = () => {
            const [action, setAction] = useState("Sign up");
            const [email, setEmail] = useState("");
            const [password, setPassword] = useState("");
            const [name, setName] = useState("");
            const [error, setError] = useState("");
            const [showVideo, setShowVideo] = useState(false);

            const handleSignup = async () => {
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    await updateProfile(userCredential.user, { displayName: name }); 
                    alert("Signup successful! You can now log in.");
                    setAction("Login");
                } catch (error) {
                    setError(error.message.replace("Firebase:", "")); 
                }
            };

            const handleLogin = async () => {
                try {
                    await signInWithEmailAndPassword(auth, email, password);
                    setShowVideo(true); 
                } catch (error) {
                    setError(error.message.replace("Firebase:", ""));
                }
            };

            if (showVideo) {
                return <LoginVideo setShowVideo={setShowVideo} />;
            }

            return (
                <div className="loginsignup">
                    <video autoPlay loop muted className="background-video"></video>
                    <div>
                        <h1>Welcome!</h1>
                    </div>
                    <div className="container">
                        <div className="heading">
                            <div className="text">
                                <h2>{action}</h2>
                            </div>
                            <div className="underline"></div>
                        </div>

                        {action === "Sign up" && (
                            <div className="input">
                                <PersonIcon fontSize="large" className="icon" />
                                <input type="text" placeholder="Enter the Name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                        )}

                        <div className="input">
                            <AlternateEmailSharpIcon fontSize="large" className="icon" />
                            <input type="email" placeholder="Enter the Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div className="input">
                            <PasswordSharpIcon fontSize="large" className="icon" />
                            <input type="password" placeholder="Enter the password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        {action === "Login" && (
                            <div className="forgotpassword">
                                Forgot Password? <span>Click Here!</span>
                            </div>
                        )}

                        {error && <div className="error-message">{error}</div>}

                        <div className="submit-container">
                            {action === "Sign up" ? (
                                <div className="submit" onClick={handleSignup}>Sign Up</div>
                            ) : (
                                <div className="submit" onClick={handleLogin}>Login</div>
                            )}
                            <div className="submit gray" onClick={() => setAction(action === "Sign up" ? "Login" : "Sign up")}>
                                {action === "Sign up" ? "Switch to Login" : "Switch to Sign Up"}
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        export default LoginSignup;
    \end{code}

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

💗If we want to route to next page
    1. install
        npm install react-router-dom

    2. Create an router inside the app
        for ex
        import React from "react";
        import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
        import HomePage from "./HomePage";
        import AboutPage from "./AboutPage";

        function App() {
        return (
            <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
            </Routes>
            </Router>
        );
        }

        export default App;

    3.edit the page where you have to go from 
        import React from "react";
        import { useNavigate } from "react-router-dom";

        function HomePage() {
                const navigate = useNavigate();

        return (
            <div>
            <h1>Home Page</h1>
            <button onClick={() => navigate("/about")}>Go to About Page</button>
            </div>
         );
         }
