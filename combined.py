#7 parameters with insertion in mongo - Date, Total time, tab switch, active time, inactive time, break time, break counter
import time
import cv2
import numpy as np
from pynput import keyboard, mouse
from keras.models import load_model
from PIL import Image, ImageOps
import pygetwindow as gw
from datetime import datetime
import pymongo

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

# Connect to MongoDB
client = pymongo.MongoClient(MONGO_URI)
db = client["edai_project"]
collection = db["employee4"]#5,6

# Load the model and set class names
model = load_model(r"D:\TY\SEM-II\EDAI6\EfficienSee\efficiensee_Model.h5")
class_names = ["Face", "Not Face"]

# Timer variables
start_time = 0
elapsed_time = 0
running = False
last_active_time = time.time()
active_duration = 0
inactive_duration = 0
total_break_time = 0  # Total break time across all breaks
break_counter = 0
IDLE_THRESHOLD = 1  # Threshold for inactivity in seconds
BREAK_THRESHOLD = 5  # Threshold for break counter in seconds

# Tab switching variables
previous_window = None
tab_switch_count = 0

# Video capture setup
cap = cv2.VideoCapture(0)

# Preprocessing function for frames
def preprocess_frame(frame):
    image = Image.fromarray(frame)
    image = ImageOps.fit(image, (224, 224), Image.Resampling.LANCZOS)
    image_array = np.asarray(image) / 255.0
    return np.expand_dims(image_array, axis=0)

# Convert seconds to HH:MM:SS format
def convert_to_hms(seconds):
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = int(seconds % 60)
    return f"{hours:02}:{minutes:02}:{seconds:02}"

# Keyboard and mouse activity handlers
def on_key_press(key):
    global last_active_time
    last_active_time = time.time()

def on_mouse_move(x, y):
    global last_active_time
    last_active_time = time.time()

def on_scroll(x, y, dx, dy):
    global last_active_time
    last_active_time = time.time()

# Start monitoring keyboard and mouse activity
keyboard_listener = keyboard.Listener(on_press=on_key_press)
mouse_listener = mouse.Listener(on_move=on_mouse_move, on_scroll=on_scroll)
keyboard_listener.start()
mouse_listener.start()

# Face detection state
face_detected_prev = False
break_counter_timer = 0  # Timer to track break duration for counter logic

while True:
    # Capture video frame
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame")
        break

    # Preprocess the frame and make predictions
    input_data = preprocess_frame(frame)
    predictions = model.predict(input_data)
    predicted_class = np.argmax(predictions)
    confidence = predictions[0][predicted_class]

    # Check activity state
    current_time = time.time()

    # Face detection logic
    if predicted_class == 0:  # Face detected
        if not running:
            start_time = time.time() - elapsed_time
            running = True
            if not face_detected_prev:
                # Check if the break duration was more than 5 seconds
                if break_counter_timer > BREAK_THRESHOLD:
                    break_counter += 1  # Increment break counter
                break_counter_timer = 0  # Reset break counter timer
            face_detected_prev = True
        elapsed_time = time.time() - start_time

        # Increment active and inactive durations only if face is detected
        if current_time - last_active_time > IDLE_THRESHOLD:
            inactive_duration += 0.1
        else:
            active_duration += 0.1

        # Tab switching logic
        current_window = gw.getActiveWindow()
        if current_window and current_window.title != previous_window:
            tab_switch_count += 1
            previous_window = current_window.title

        cv2.putText(frame, f"Timer: {convert_to_hms(elapsed_time)}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(frame, f"Tab Switches: {tab_switch_count}", (10, 70),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    else:  # Face not detected
        if running:
            running = False
            elapsed_time = time.time() - start_time
            face_detected_prev = False
        # Increment break counter timer and total break time
        break_counter_timer += 0.1
        total_break_time += 0.1
        cv2.putText(frame, f"Timer paused: {convert_to_hms(elapsed_time)}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    # Display activity durations
    cv2.putText(frame, f"Active: {convert_to_hms(active_duration)} | Inactive: {convert_to_hms(inactive_duration)}", (10, 110),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
    cv2.putText(frame, f"Total Break Time: {convert_to_hms(total_break_time)} | Breaks: {break_counter}", (10, 150),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)

    cv2.imshow("Face Detection and Monitoring", frame)

    # Break on 'q' key
    if cv2.waitKey(1) & 0xFF == ord('q'):
        cv2.destroyAllWindows()
        formatted_time = convert_to_hms(elapsed_time)
        time_window = 255 * np.ones(shape=[900, 1600, 3], dtype=np.uint8)
        cv2.putText(time_window, f"Time Elapsed: {formatted_time}", (50, 150),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 0), 3)
        cv2.imshow('Elapsed Time', time_window)
        cv2.waitKey(0)
        break

cap.release()
cv2.destroyAllWindows()
# Insert data into MongoDB
mongo_record = {
            "Date": datetime.now().strftime("%Y-%m-%d"),
            "Estimate_time": formatted_time,
            "Tab_switched": tab_switch_count,
            "Active_duration": active_duration,
            "Inactive_duration": inactive_duration,
            "Total_break_time": total_break_time,
            "Breaks": break_counter
        }
collection.insert_one(mongo_record)
keyboard_listener.stop()
mouse_listener.stop()
