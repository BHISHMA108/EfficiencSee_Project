# EfficienSee: An Employee Productivity Monitoring System

This is a full-stack, hybrid SaaS application that combines machine learning, real-time productivity tracking, and clean data visualization. The project has evolved from a purely web-based application into a **Distributed Hybrid Architecture**. 

It utilizes a centralized cloud dashboard for managers (React + Node.js) and a lightweight, background **Windows Desktop Agent** that continuously tracks activity securely on the employee's machine via AI facial recognition, keystroke detection, and application context-switching.

## Key Features

*   **AI Facial Recognition:** Continuously verifies the employee's presence at their workstation using a pre-trained Keras Deep Learning model running completely locally.
*   **Active vs. Idle Tracking:** Monitors raw hardware events (mouse movement and keyboard strokes) to calculate precise active working time versus idle breaks.
*   **Application Context Switching:** Tracks the active window title to quantify how frequently an employee shifts context or switches tabs.
*   **Real-Time Monitoring:** Manager dashboards instantly update with employee monitoring status using Socket.io and Redis for ultra-fast state management.
*   **Cloud Dashboard:** A React-based web dashboard allowing managers to remotely start/stop monitoring sessions and view real-time productivity analytics per employee.
*   **Secure & Distributed:** The heavy AI processing happens locally on the Windows machine, sending only secure, sanitized metric data to the cloud via a REST API.

---

## Architecture & Tech Stack

### 1. The Cloud Hub (Frontend & Backend)
*   **Frontend**: React.js, ShadCN UI, TailwindCSS, Vite
*   **Backend**: Node.js (Express), Socket.io (WebSocket for real-time events)
*   **Database**: MongoDB (Persistent Storage), Redis (Fast In-Memory State)
*   **Authentication**: Firebase + JWT
*   **Security**: Mongo-Sanitize, CORS

### 2. The Edge Client (Windows Desktop Agent)
*   **Core Program**: Python 3.11 packaged into a standalone `.exe` using PyInstaller.
*   **AI Models**: TensorFlow, Keras (running the `.h5` model)
*   **Computer Vision**: OpenCV (`cv2`), Pillow
*   **OS Tracking**: Pynput (keyboard/mouse tracking), PyGetWindow (tab tracking)

---

## Project Structure

### Backend (`/backend`)
*   **`server.js`** – The main Node.js Express & WebSocket server. It handles API routes, processes tracking data uploads, and manages real-time socket connections.
*   **`routes/monitoring.js`** - Manages the Redis state of employees, broadcasts Socket.io events to dashboards, and handles Desktop Agent polling and uploads.

### Frontend (`/frontend`)
*   Built with React and styled using TailwindCSS and ShadCN UI components.
*   **EmployeePage** – Dashboard for individual users to trigger their desktop agents to start/stop tracking.
*   **ManagerPage** – Dashboard for managers with live WebSocket updates for monitoring status and detailed performance analytics charts.

### Desktop Agent (`/desktop_app`)
*   **`desktop_agent.py`** – The standalone Python background agent. It polls the Node.js server to know when to start monitoring, processes webcam and OS activity locally, and securely uploads the final metrics payload when stopped.

---

## Dataset & ML Model

The Keras AI model (`efficiensee_Model.h5`) was trained to classify two categories: `Face` and `Non-Face`.

*   **Training set:** 5000 images per class
*   **Validation set:** 1000 images per class

The final model was trained using **Google’s Teachable Machine** for optimized accuracy and fast deployment.

---

## How to Run the Project

### 1. Cloud Backend (Node.js)
You will need a `.env` file with `MONGO_URI` and Redis credentials.
```bash
cd backend
npm install
npm run dev 
```

### 2. Web Dashboard (React)
```bash
cd frontend
npm install
npm run dev 
```

### 3. Desktop Agent (Python)
The Desktop Agent can either be run directly via Python or built into a standalone `.exe` package for distribution.

#### To run directly in development:
```bash
cd desktop_app
pip install -r requirements.txt
python desktop_agent.py
```

#### To build the Standalone Windows Executable:
We use PyInstaller to compile the agent.

1. **For Debugging (Fast Build & Shows Errors):**
```powershell
pyinstaller --clean --noconfirm --onedir --console --add-data "model;model" desktop_agent.py
```
*Run the `.exe` inside `dist/desktop_agent/` to test.*

2. **For Final Production (Slow Build, Single File, Hidden Window):**
```powershell
pyinstaller --clean --noconfirm --onefile --windowed --add-data "model;model" desktop_agent.py
```
*(The generated executable will be saved directly inside `desktop_app/dist/desktop_agent.exe`)*
