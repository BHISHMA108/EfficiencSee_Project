
---

# Project Overview

This is a full-stack application that combines machine learning, real-time productivity tracking, and clean data visualization. It’s built with React on the frontend, Node.js and Flask on the backend, and uses MongoDB for data storage. The app tracks employee productivity using webcam input and system activity.

# Tech Stack

* **Frontend**: React.js, ShadCN UI
* **Backend**: Node.js (Express) and Flask
* **Database**: MongoDB (credentials stored securely in `.env`)
* **Authentication**: Firebase + JWT
* **ML Tools**: TensorFlow, Keras

# Project Structure

### Backend

* **`server.js`** – This is the main backend server written in Node.js with Express. It handles all API routes, connects to MongoDB, and sets up the necessary middleware.
* **`app.py`** – This Flask server runs the ML model used to analyze productivity based on webcam data and system behavior.

### Frontend

* Built with React and styled using ShadCN UI components.
* Two main pages:

  * **EmployeePage** – Dashboard for individual users to track their own productivity.
  * **ManagerPage** – Dashboard for managers to view and compare employee performance.

### Authentication

* **`firebase.js`** handles user authentication using Firebase and secures endpoints with JWT tokens.

# Dataset & Model

The model was trained to classify two categories: `Face` and `Non-Face`.

* Training set: 1724 images per class
* Validation set: 101 images per class

Although a local dataset was prepared, the final model was trained using **Google’s Teachable Machine** for better accuracy and faster development.

# How to Run the Project

1. Start the **Flask server** by running `app.py`
2. Start the **Node.js server** by running `server.js`
3. Launch the **React frontend**

---
