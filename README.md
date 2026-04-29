# EfficienSee: An Employee Productivity Monitoring System

This is a full-stack, hybrid SaaS application that combines machine learning, real-time productivity tracking, and clean data visualization. The project has evolved from a purely web-based application into a **Distributed Hybrid Architecture**. 

It utilizes a centralized cloud dashboard for managers (React + Node.js) and a lightweight, background **Windows Desktop Agent** that continuously tracks activity securely on the employee's machine via AI facial recognition, keystroke detection, and application context-switching.

## Key Features

*   **AI Facial Recognition:** Continuously verifies the employee's presence at their workstation using a pre-trained Keras Deep Learning model running completely locally.
*   **Active vs. Idle Tracking:** Monitors raw hardware events (mouse movement and keyboard strokes) to calculate precise active working time versus idle breaks.
*   **Application Context Switching:** Tracks the active window title to quantify how frequently an employee shifts context or switches tabs.
*   **Cloud Dashboard:** A React-based web dashboard allowing managers to remotely start/stop monitoring sessions and view real-time productivity analytics per employee.
*   **Secure & Distributed:** The heavy AI processing happens locally on the Windows machine, sending only secure, sanitized metric data to the cloud via a REST API.

---

## Architecture & Tech Stack

### 1. The Cloud Hub (Frontend & Backend)
*   **Frontend**: React.js, ShadCN UI, TailwindCSS, Vite
*   **Backend**: Node.js (Express)
*   **Database**: MongoDB (credentials stored securely in `.env`)
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
*   **`server.js`** – The main Node.js Express server. It handles all API routes, processes tracking data uploads from the Desktop Agents, and connects to MongoDB securely.

### Frontend (`/frontend`)
*   Built with React and styled using TailwindCSS and ShadCN UI components.
*   **EmployeePage** – Dashboard for individual users to connect their desktop agents and start/stop tracking.
*   **ManagerPage** – Dashboard for managers to view and compare employee performance analytics.

### Authentication (`/firebase.js`)
*   Handles user authentication using Firebase and secures endpoints with JWT tokens.

### Desktop Agent (`/desktop_app`)
*   **`desktop_agent.py`** – The new standalone Python agent that replaces the old Flask backend. It silently runs in the background, polls the cloud server, processes the AI tracking locally, and uploads the metrics payload when the session ends.

---

## Dataset & ML Model

The Keras AI model (`efficiensee_Model.h5`) was trained to classify two categories: `Face` and `Non-Face`.

*   **Training set:** 5000 images per class
*   **Validation set:** 1000 images per class

Although a local dataset was prepared, the final model was trained using **Google’s Teachable Machine** for better accuracy and faster development.

---

## How to Run the Project

### 1. Cloud Backend (Node.js)
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
The Desktop Agent can either be run directly via Python or built into a standalone `.exe` package for employees.
```bash
cd desktop_app
pip install -r requirements.txt

# Run directly in development:
python desktop_agent.py

Ran command: `pyinstaller --noconfirm --onefile --windowed --add-data "model\\efficiensee_Model.h5;model" desktop_agent.py`
Viewed README.md:86-95
Listed directory model

```
Everything in your `desktop_app` folder looks correct! The `model` folder contains `efficiensee_Model.h5`, and your `desktop_agent.py` code correctly points to it using the `get_resource_path()` function.

The reason your previous command took over 13 minutes and why you likely aborted it is because **`--onefile` takes a very long time to build** when you are importing massive libraries like `tensorflow`, `keras`, and `cv2`. It also takes a long time to start up when double-clicked because it has to extract gigabytes of libraries to a temporary folder every single time.

Here are the exact commands you should use:

### 1. Command for Debugging (Fast Build & Shows Errors)
Run this command to test if your app works without any missing imports or errors. 
```powershell
pyinstaller --clean --noconfirm --onedir --console --add-data "model;model" desktop_agent.py
```
**Why use this for debugging?**
*   **`--onedir`**: Instead of a single file, it creates a folder containing the `.exe` and all its library files. This **builds much faster** and the app **starts instantly**, making it perfect for rapid testing.
*   **`--console`**: Keeps the terminal open so if the app crashes, you can read the error logs instead of the app just disappearing.

*(After this finishes, run `dist\desktop_agent\desktop_agent.exe` and check the console window for any errors).*

---

### 2. Command for Final Production Build (Slow Build, Single File, No Console)
Only run this command **after** you have confirmed the `--onedir` debugging version works perfectly.

```powershell
pyinstaller --clean --noconfirm --onefile --windowed --add-data "model;model" desktop_agent.py
```
**Why use this for final production?**
*   **`--onefile`**: Packages your entire app and all dependencies into one single portable `.exe` file (this will take a while to build and will be a large file).
*   **`--windowed`**: Hides the ugly console window so the app runs smoothly in the background like a normal background agent.

### A Quick Note on Machine Learning Libraries:
If your debugging app crashes immediately and says something like `ModuleNotFoundError: No module named 'tensorflow...'` in the console window, you might need to explicitly tell PyInstaller to grab everything for those heavy libraries by adding `--collect-all` tags. If that happens, you would run:

```powershell
pyinstaller --clean --noconfirm --onedir --console --add-data "model;model" --collect-all tensorflow --collect-all keras desktop_agent.py
```
But for now, try the standard Debugging command first and see if it works!

```
*(The generated executable will be saved inside `desktop_app/dist/desktop_agent/desktop_agent.exe`)*
