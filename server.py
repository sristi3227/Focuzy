from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os
import sys
from detect_focus import announce_alert

app = Flask(__name__)
CORS(app)

process = None
distracted_flag = False
distraction_count = 0  # Track total distractions


@app.route('/start-detection', methods=['GET'])
def start_detection():
    global process
    if process is not None:
        try:
            process.terminate()
            process = None
            print("Previous detection process terminated.")
        except Exception as e:
            print(f"Error terminating previous process: {e}")
    try:
        script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'detect_focus.py')
        process = subprocess.Popen([sys.executable, script_path])
        print("Detection process started.")
        return {'status': 'Detection started'}
    except Exception as e:
        print(f"Error starting detection process: {e}")
        return {'status': 'Failed to start detection', 'error': str(e)}, 500


@app.route('/stop-detection', methods=['GET'])
def stop_detection():
    global process
    if process is not None:
        try:
            process.terminate()
            print("Detection process terminated.")
        except Exception as e:
            print(f"Error terminating detection process: {e}")
        process = None
        return {'status': 'Detection stopped'}
    else:
        return {'status': 'No detection running'}


@app.route('/pause-detection', methods=['GET'])
def pause_detection():
    global process
    if process is not None:
        try:
            process.terminate()
            process = None
            print("Detection paused for break time.")
        except Exception as e:
            print(f"Error pausing detection process: {e}")
        return {'status': 'Detection paused'}
    return {'status': 'No detection running'}


@app.route('/distracted', methods=['POST'])
def distracted():
    global distracted_flag, distraction_count
    distracted_flag = True
    distraction_count += 1
    return {'status': 'Distracted flag set'}


@app.route('/check-distracted', methods=['GET'])
def check_distracted():
    global distracted_flag
    if distracted_flag:
        distracted_flag = False
        return jsonify({'distracted': True})
    else:
        return jsonify({'distracted': False})


@app.route('/get-alerts', methods=['GET'])
def get_alerts():
    global distraction_count
    return jsonify({'alerts': distraction_count})


@app.route('/reset-alerts', methods=['POST'])
def reset_alerts():
    global distraction_count
    distraction_count = 0
    return jsonify({'status': 'Alert count reset'})


@app.route('/alert', methods=['POST'])
def alert():
    data = request.get_json()
    message = data.get('message', 'Alert!')
    announce_alert(message)
    return jsonify({'status': 'success', 'message': message})


if __name__ == '__main__':
    app.run(debug=True)
