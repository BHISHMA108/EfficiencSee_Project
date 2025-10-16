import logging
import os
import time
import threading
import re
import pymongo
import cv2
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from keras.models import load_model
from PIL import Image, ImageOps
from pynput import keyboard, mouse
import pygetwindow as gw
from datetime import datetime
from dotenv import load_dotenv
import atexit

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
MODEL_PATH = os.getenv("MODEL_PATH", r"D:\3rd YEAR\Sem-2\EDAI-6\Project EFFICIENCEE\Edai project\Final-Local-EfficienSee\efficiensee_Model.h5")

# Initialize logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Flask App Initialization
app = Flask(__name__)
CORS(app)

# MongoDB Connection
try:
    client = pymongo.MongoClient(MONGO_URI)
    db = client["newEfficienSee_DB"]
    logging.info("✅ Connected to MongoDB")
except Exception as e:
    logging.error(f"❌ MongoDB connection failed: {e}")
    exit(1)

# Load AI Model
try:
    model = load_model(MODEL_PATH)
    class_names = ["Face", "Not Face"]
    logging.info("✅ AI Model loaded successfully")
except Exception as e:
    logging.error(f"❌ Failed to load model: {e}")
    exit(1)

# Monitoring Variables
monitoring = False
active_duration = 0  # Face detected + user activity
inactive_duration = 0  # Face detected but no user activity
total_break_time = 0  # No face detected
break_counter = 0
tab_switch_count = -2  # Start at -1 to match original behavior
previous_window = None
last_activity_time = time.time()
monitoring_start_time = None
face_detected = False
session_start_time = 0
in_break = False
break_start_time = None
break_counted = False

# Constants
IDLE_THRESHOLD = 2  # Seconds of no activity to be considered inactive
BREAK_THRESHOLD = 3  # Seconds of no face to be considered a break
CHECK_INTERVAL = 0.1  # 100ms check interval for precise timing

# Helper Functions
def sanitize_email(email):
    if not email or not isinstance(email, str):
        return ""
    sanitized = email.lower().strip()
    sanitized = re.sub(r'@', '_at_', sanitized)
    sanitized = re.sub(r'\.', '_dot_', sanitized)
    return re.sub(r'[^a-z0-9_]', '', sanitized)

def convert_to_hms(seconds):
    hours, remainder = divmod(int(seconds), 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{hours:02}:{minutes:02}:{seconds:02}"

def preprocess_frame(frame):
    image = Image.fromarray(frame)
    image = ImageOps.fit(image, (224, 224), Image.Resampling.LANCZOS)
    image_array = np.asarray(image) / 255.0
    return np.expand_dims(image_array, axis=0)

def update_last_activity():
    global last_activity_time
    last_activity_time = time.time()

# Core Monitoring Function
def monitor_activity():
    global monitoring, active_duration, inactive_duration, total_break_time, \
           break_counter, tab_switch_count, previous_window, last_activity_time, \
           monitoring_start_time, face_detected, session_start_time, in_break, \
           break_start_time, break_counted

    try:
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            raise RuntimeError("Could not open webcam")
    except Exception as e:
        logging.error(f"❌ Webcam error: {e}")
        return

    keyboard_listener = keyboard.Listener(on_press=lambda _: update_last_activity())
    mouse_listener = mouse.Listener(on_move=lambda x, y: update_last_activity())
    keyboard_listener.start()
    mouse_listener.start()
    
    monitoring = True
    monitoring_start_time = datetime.now().strftime("%H:%M:%S")
    session_start_time = time.time()
    last_check_time = session_start_time
    logging.info(f"🚀 Monitoring started at {monitoring_start_time}")

    try:
        while monitoring:
            current_time = time.time()
            elapsed_since_last_check = current_time - last_check_time
            
            # Process webcam frame
            ret, frame = cap.read()
            if not ret:
                logging.warning("⚠ Could not read frame from webcam")
                continue

            # Face detection
            input_data = preprocess_frame(frame)
            predictions = model.predict(input_data)
            current_face_detected = np.argmax(predictions) == 0

            # Activity tracking
            time_since_activity = current_time - last_activity_time
            
            if current_face_detected:
                face_detected = True
                # Reset break tracking when face reappears
                if in_break:
                    in_break = False
                    break_start_time = None
                    break_counted = False

                # Update active/inactive time
                if time_since_activity > IDLE_THRESHOLD:
                    inactive_duration += elapsed_since_last_check
                    status_text = "Face Detected (Inactive)"
                else:
                    active_duration += elapsed_since_last_check
                    status_text = "Face Detected (Active)"
            else:
                face_detected = False
                total_break_time += elapsed_since_last_check
                status_text = "No Face Detected"

                # Break detection logic
                if not in_break:
                    in_break = True
                    break_start_time = current_time
                else:
                    elapsed_break = current_time - break_start_time
                    if elapsed_break >= BREAK_THRESHOLD and not break_counted:
                        break_counter += 1
                        break_counted = True

            # Window tracking
            try:
                current_window = gw.getActiveWindow()
                if current_window and current_window.title != previous_window:
                    tab_switch_count += 1
                    previous_window = current_window.title
            except Exception as e:
                logging.debug(f"Window tracking error: {e}")

            # Update display
            display_texts = [
                f"Monitoring Start: {monitoring_start_time}",
                f"Elapsed Time: {convert_to_hms(current_time - session_start_time)}",
                f"Active Time: {convert_to_hms(active_duration)}",
                f"Inactive Time: {convert_to_hms(inactive_duration)}",
                f"Break Time: {convert_to_hms(total_break_time)}",
                f"Breaks Taken: {break_counter}",
                f"Tab Switches: {tab_switch_count}",
                f"Status: {status_text}"
            ]

            for i, text in enumerate(display_texts):
                cv2.putText(frame, text, (10, 30 + i * 30), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

            cv2.imshow("Employee Monitoring", frame)
            last_check_time = current_time

            if cv2.waitKey(1) == 27:  # ESC key
                break

    finally:
        monitoring = False
        monitoring_stop_time = datetime.now().strftime("%H:%M:%S")
        cap.release()
        cv2.destroyAllWindows()
        keyboard_listener.stop()
        mouse_listener.stop()
        logging.info(f"🛑 Monitoring stopped at {monitoring_stop_time}")

# API Endpoints
@app.route("/")
def home():
    return jsonify({"message": "EfficienSee Backend is Running!"})

@app.route("/start_monitoring", methods=["POST"])
def api_start_monitoring():
    global monitoring, active_duration, inactive_duration, total_break_time, \
           break_counter, tab_switch_count, monitoring_start_time, face_detected, \
           session_start_time, in_break, break_start_time, break_counted

    if not monitoring:
        # Reset all monitoring variables
        active_duration = 0
        inactive_duration = 0
        total_break_time = 0
        break_counter = 0
        tab_switch_count = -1
        face_detected = False
        in_break = False
        break_start_time = None
        break_counted = False
        
        threading.Thread(target=monitor_activity, daemon=True).start()
        return jsonify({
            "status": "success",
            "message": "Monitoring started",
            "start_time": monitoring_start_time
        })
    return jsonify({
        "status": "info",
        "message": "Monitoring already running",
        "start_time": monitoring_start_time
    })

@app.route("/stop_monitoring", methods=["POST"])
def api_stop_monitoring():
    global monitoring
    monitoring = False
    
    email = request.json.get("email", "").strip()
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    sanitized_email = sanitize_email(email)
    collection = db[sanitized_email]

    record = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "start_time": monitoring_start_time,
        "end_time": datetime.now().strftime("%H:%M:%S"),
        "elapsed_time": convert_to_hms(time.time() - session_start_time),
        "active_duration": convert_to_hms(active_duration),
        "inactive_duration": convert_to_hms(inactive_duration),
        "total_break": convert_to_hms(total_break_time),
        "break_count": break_counter,
        "tab_switches": tab_switch_count
    }

    try:
        result = collection.insert_one(record)
        record["_id"] = str(result.inserted_id)
        logging.info(f"✅ Saved session for {sanitized_email}")
        return jsonify({
            "status": "success",
            "user": sanitized_email,
            "session_data": record
        })
    except Exception as e:
        logging.error(f"❌ Database error: {e}")
        return jsonify({"error": str(e)}), 500

@atexit.register
def cleanup():
    global monitoring
    monitoring = False
    cv2.destroyAllWindows()
    logging.info("🧹 Cleaned up resources")

if __name__ == "__main__":
    logging.info("🚀 Starting Employee Monitoring System...")
    app.run(debug=True, port=5001)
