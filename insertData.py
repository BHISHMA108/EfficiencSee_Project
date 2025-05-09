from pymongo import MongoClient
from datetime import datetime, timedelta
import random

# Connect to MongoDB
client = MongoClient("mongodb+srv://bhishmadandekar:lHaWRxmTs0Ya8M1O@cluster0.dppci.mongodb.net/newEfficienSee_DB?retryWrites=true&w=majority")

# Select DB and collection
db = client["newEfficienSee_DB"]
collection = db["bhishmadandekar_at_gmail_dot_com"]

# Date range: 2025-03-27 to 2025-05-08
start_date = datetime(2025, 3, 27)
end_date = datetime(2025, 5, 8)
delta_days = (end_date - start_date).days + 1  # +1 to include end_date

sample_entries = []

for i in range(delta_days):
    current_date = start_date + timedelta(days=i)
    # Random start time between 8 AM and 11 AM
    hour = random.randint(8, 11)
    minute = random.randint(0, 59)
    start_time = datetime(current_date.year, current_date.month, current_date.day, hour, minute, 0)

    # Random elapsed time between 5 and 9 hours
    elapsed_seconds = random.randint(5 * 3600, 9 * 3600)
    stop_time = start_time + timedelta(seconds=elapsed_seconds)

    active_duration_seconds = random.randint(int(0.6 * elapsed_seconds), elapsed_seconds)
    inactive_duration_seconds = elapsed_seconds - active_duration_seconds
    break_time_seconds = random.randint(300, 1800)  # 5 to 30 mins

    entry = {
        "date": current_date.strftime("%Y-%m-%d"),
        "start_time": start_time.strftime("%H:%M:%S"),
        "stop_time": stop_time.strftime("%H:%M:%S"),
        "elapsed_time": str(timedelta(seconds=elapsed_seconds)),
        "active_duration": str(timedelta(seconds=active_duration_seconds)),
        "inactive_duration": str(timedelta(seconds=inactive_duration_seconds)),
        "break_time": str(timedelta(seconds=break_time_seconds)),
        "break_counter": random.randint(7, 15),
        "tab_switched_count": random.randint(600, 1000)
    }

    sample_entries.append(entry)

# Insert into MongoDB
result = collection.insert_many(sample_entries)
print(f"Inserted {len(result.inserted_ids)} documents successfully.")
