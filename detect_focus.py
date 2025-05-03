import cv2
import time
import pyttsx3
import requests

# Initialize Text-to-Speech engine
engine = pyttsx3.init()
engine.setProperty('rate', 160)  # Speed of speech
engine.setProperty('volume', 1.0)  # Max volume

# Alert voice function
alert_index = 0
alert_messages = [
    "Please look at the screen. Stay focused!",
    "You're losing focus. Eyes on screen!",
    "Come on! Stay sharp and don’t drift away!"
]

def announce_alert(message):
    engine = pyttsx3.init()
    engine.say(message)
    engine.runAndWait()

def speak_alert():
    global alert_index
    message = alert_messages[alert_index % len(alert_messages)]
    print(f"[ALERT] {message}")
    announce_alert(message)
    alert_index += 1

    # Notify Flask server
    try:
        requests.post('http://127.0.0.1:5000/distracted')
    except Exception as e:
        print("Error notifying server about distraction:", e)

def main():
    # Load cascades
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")

    # Start webcam
    print("Attempting to open webcam...")
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("ERROR: Could not open webcam. Exiting.")
        exit(1)
    print("Webcam opened successfully.")

    last_seen_time = time.time()
    alert_threshold = 3  # seconds before triggering alert
    alerted = False

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        eyes_detected = False

        if len(faces) == 0:
            if time.time() - last_seen_time > alert_threshold:
                cv2.putText(frame, "⚠️ LOOK AT THE SCREEN!", (50, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                if not alerted:
                    speak_alert()
                    alerted = True
        else:
            for (x, y, w, h) in faces:
                roi_gray = gray[y:y+h, x:x+w]
                eyes = eye_cascade.detectMultiScale(roi_gray)
                if len(eyes) > 0:
                    eyes_detected = True
                break

            if eyes_detected:
                last_seen_time = time.time()
                alerted = False
            elif time.time() - last_seen_time > alert_threshold:
                cv2.putText(frame, "⚠️ EYES NOT DETECTED!", (50, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                if not alerted:
                    speak_alert()
                    alerted = True

        cv2.imshow("Focuzy - Eye Tracker", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
