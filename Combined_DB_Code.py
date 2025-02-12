import time
import cv2
import numpy as np
from pynput import keyboard, mouse
from keras.models import load_model
from PIL import Image, ImageOps
import pygetwindow as gw
import pymongo

client = pymongo.MongoClient("mongodb+srv://bhishmadandekar:lHaWRxmTs0Ya8M1O@cluster0.dppci.mongodb.net/")
db = client["edai_project"]
collection = db["employee2"]

model = load_model("efficiensee_Model.h5")
class_names = ["Face", "Not Face"]

start_time = 0
elapsed_time = 0
running = False
last_active_time = time.time()
active_duration = 0
inactive_duration = 0
IDLE_THRESHOLD = 1

previous_window = None
tab_switch_count = -1

cap = cv2.VideoCapture(0)

def preprocess_frame(frame):
    image = Image.fromarray(frame)
    image = ImageOps.fit(image, (224, 224), Image.Resampling.LANCZOS)
    image_array = np.asarray(image) / 255.0
    return np.expand_dims(image_array, axis=0)

def convert_to_hms(seconds):
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = int(seconds % 60)
    return f"{hours:02}:{minutes:02}:{seconds:02}"

def on_key_press(key):
    global last_active_time
    last_active_time = time.time()

def on_mouse_move(x, y):
    global last_active_time
    last_active_time = time.time()

keyboard_listener = keyboard.Listener(on_press=on_key_press)
mouse_listener = mouse.Listener(on_move=on_mouse_move)
keyboard_listener.start()
mouse_listener.start()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    input_data = preprocess_frame(frame)
    predictions = model.predict(input_data)
    predicted_class = np.argmax(predictions)
    confidence = predictions[0][predicted_class]

    current_time = time.time()
    if current_time - last_active_time > IDLE_THRESHOLD:
        inactive_duration += 1
    else:
        active_duration += 1

    if predicted_class == 0:
        if not running:
            start_time = time.time() - elapsed_time
            running = True
        elapsed_time = time.time() - start_time

        current_window = gw.getActiveWindow()
        if current_window:
            current_window_title = current_window.title
            if current_window_title != previous_window:
                tab_switch_count += 1
                previous_window = current_window_title

        cv2.putText(frame, f"Timer running: {elapsed_time:.2f} seconds", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(frame, f"Tab Switches: {tab_switch_count}", (10, 70),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
    else:
        if running:
            running = False
            elapsed_time = time.time() - start_time
        cv2.putText(frame, f"Timer stopped at: {elapsed_time:.2f} seconds", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    cv2.putText(frame, f"Active: {active_duration} sec | Inactive: {inactive_duration} sec", (10, 110),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
    cv2.putText(frame, f"Tab Switches: {tab_switch_count}", (10, 70),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)

    cv2.imshow("Face Detection and Monitoring", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        cap.release()
        cv2.destroyAllWindows()
        formatted_time = convert_to_hms(elapsed_time)
        
        time_window = 255 * np.ones(shape=[900, 1600, 3], dtype=np.uint8)
        cv2.putText(time_window, f"Time Elapsed: {formatted_time}", (50, 150),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 0), 3)
        cv2.putText(time_window, f"Tab Switches: {tab_switch_count}", (50, 70),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 255), 3)

        while True:
            cv2.imshow('Elapsed Time', time_window)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cv2.destroyAllWindows()

        mongo_record = {
            "Estimate_time": formatted_time,
            "Tab switched": tab_switch_count
        }
        collection.insert_one(mongo_record)
        
        keyboard_listener.stop()
        mouse_listener.stop()