/////////////////////////////////////////// CheckTimer /////////////////////////////////////////////

This Python program is designed to manage a timer that starts when the q key is held down and stops when the key is released. The program runs indefinitely and updates the timer in real-time. Here's how it works:

Importing Libraries:
The program uses the time library for handling time-related functions like measuring elapsed time and introducing delays. It also uses the keyboard library to detect when specific keys are pressed or released.

Variable Initialization:

A start_time variable is initialized to store the current time when the timer starts.
An elapsed_time variable keeps track of the total time the timer has been running.
A running flag is set to False to indicate whether the timer is actively running or paused.
Infinite Loop:
The program enters a continuous loop where it checks the state of the q key and manages the timer accordingly.

Handling Key Press (q is pressed):

If the q key is held down and the timer is not already running, the program records the current time as start_time. If the timer was previously paused, it adjusts the start_time to account for the time already elapsed.
The running flag is set to True to indicate the timer is active.
The elapsed time is calculated by subtracting start_time from the current time.
The program continuously prints the elapsed time while the key is held down.
Handling Key Release (q is not pressed):

If the timer is running and the q key is released, the program sets the running flag to False to pause the timer.
The total elapsed time is updated to include the time accumulated while the timer was running.
The program prints the final elapsed time when the timer stops.
Adding a Delay:
A short delay is added to the loop to reduce CPU usage and avoid overly frequent checks for key presses.

Key Features
The timer starts and updates in real-time while the q key is held down.
It pauses and displays the elapsed time when the key is released.
It resumes from the last paused state when the key is pressed again.
