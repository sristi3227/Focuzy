from flask import Flask
from flask_cors import CORS
import cv2
import time
import pyttsx3
import threading
import sys

app = Flask(__name__)
CORS(app)

# Global variables
camera = None
is_running = True

# Initialize Text-to-Speech engine with error handling
try:
    engine = pyttsx3.init()
    engine.setProperty('rate', 160)
    engine.setProperty('volume', 1.0)
except Exception as e:
    print(f"Error initializing Text-to-Speech: {e}")
    sys.exit(1)

# Load cascades with error handling
try:
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")
    if face_cascade.empty() or eye_cascade.empty():
        raise Exception("Error loading cascade files")
except Exception as e:
    print(f"Error loading cascades: {e}")
    sys.exit(1)

def init_camera():
    """Initialize camera with multiple attempts"""
    for i in range(3):  # Try 3 times
        try:
            cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)  # Use DirectShow backend
            if cap.isOpened():
                # Set camera properties
                cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                cap.set(cv2.CAP_PROP_FPS, 30)
                return cap
        except Exception as e:
            print(f"Attempt {i+1}: Failed to initialize camera - {e}")
            time.sleep(1)  # Wait before retrying
    return None

def speak_alert(message):
    """Handle text-to-speech in a non-blocking way"""
    try:
        engine.endLoop()  # Stop any ongoing speech
        engine.say(message)
        engine.runAndWait()
    except:
        pass  # Ignore TTS errors to prevent hanging

def run_detection():
    global camera, is_running
    
    camera = init_camera()
    if camera is None:
        print("Error: Could not initialize camera after multiple attempts")
        is_running = False
        return

    last_seen_time = time.time()
    alert_threshold = 3
    alerted = False
    frame_count = 0
    
    while is_running:
        try:
            ret, frame = camera.read()
            if not ret:
                print("Error: Failed to grab frame")
                time.sleep(0.1)  # Add small delay
                continue  # Try next frame instead of breaking

            frame_count += 1
            # Process every 2nd frame to reduce CPU load
            if frame_count % 2 != 0:
                continue

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.3, 5)
            eyes_detected = False

            if len(faces) == 0:
                if time.time() - last_seen_time > alert_threshold:
                    cv2.putText(frame, "⚠ LOOK AT THE SCREEN!", (50, 50),
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    if not alerted:
                        threading.Thread(target=speak_alert, 
                                      args=("Please look at the screen",), 
                                      daemon=True).start()
                        alerted = True
            else:
                for (x, y, w, h) in faces:
                    roi_gray = gray[y:y+h, x:x+w]
                    eyes = eye_cascade.detectMultiScale(roi_gray)
                    if len(eyes) > 0:
                        eyes_detected = True
                        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                    break

                if eyes_detected:
                    last_seen_time = time.time()
                    alerted = False
                elif time.time() - last_seen_time > alert_threshold:
                    cv2.putText(frame, "⚠ EYES NOT DETECTED!", (50, 50),
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    if not alerted:
                        threading.Thread(target=speak_alert, 
                                      args=("Eyes not detected",), 
                                      daemon=True).start()
                        alerted = True

            cv2.imshow("Focus Detection", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        except Exception as e:
            print(f"Error during detection: {e}")
            time.sleep(0.1)  # Add small delay on error
            continue  # Try to recover instead of breaking

    if camera:
        camera.release()
    cv2.destroyAllWindows()

@app.route('/stop', methods=['GET'])
def stop():
    global is_running
    is_running = False
    return {'status': 'stopping detection'}

if __name__ == '__main__':
    # Start detection in a separate thread
    detection_thread = threading.Thread(target=run_detection)
    detection_thread.start()
    
    # Run Flask app
    app.run(debug=False, use_reloader=False)