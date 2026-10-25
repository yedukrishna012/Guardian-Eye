# GUARDIAN EYE

**Real-time multi-modal emergency detection for personal security and health monitoring.**

Guardian Eye watches over a person through a camera and a microphone at the same time. It runs fall detection, gesture recognition, and distress-keyword spotting entirely on the edge (Raspberry Pi, laptop, or desktop), then dispatches alerts over Telegram, SMS, and Firebase when an emergency is confirmed.

---

## 🧠 How it works

Guardian Eye fuses three independent signal sources before raising an alarm, which keeps false positives low:

| Signal | Module | What it detects |
| --- | --- | --- |
| Vision | `fall_process.py`, `fall.py` | Falls via YOLOv8 pose keypoints, with furniture-aware false-positive suppression |
| Gestures | `gesture_process.py` | Hands on chest, hands raised, crossed arms |
| Audio | `voice_process.py` | Distress keywords in English and Malayalam |

The **decision engine** (`decision_engine.py`) combines these streams using timed state-machine rules. For example, a fall that persists for several seconds triggers an alert, and a "hands on chest" gesture combined with a spoken "help" escalates to a critical alert.

When an emergency is confirmed, Guardian Eye:

- pushes the event to Firebase Firestore for the web dashboard,
- sends a Telegram message to emergency contacts,
- falls back to a GSM SMS through a SIM800L module if the network is unavailable.

---

## 🛠️ Architecture

```
main.py                  Entry point; spawns vision + audio processes and runs the decision loop
├── fall_process.py      Camera pipeline + YOLOv8 inference
│   └── fall.py          Pose-based fall detector and gesture math
├── voice_process.py     Continuous speech / keyword listener
├── decision_engine.py   Sensor fusion, timers, Firebase + Telegram alerts
├── gsm.py               Offline SMS failover over serial (SIM800L)
└── utils.py             Shared helpers
```

Python's `multiprocessing` is used so video inference and audio listening never block each other.

---

## 🚀 Installation

### Prerequisites

- Python 3.9+
- A webcam or Raspberry Pi Camera Module
- A microphone (for acoustic detection)
- Optional: SIM800L GSM module on `/dev/serial0`, Firebase project

### 1. Clone the repository

```bash
git clone https://github.com/yedukrishna012/Guardian-Eye.git
cd Guardian-Eye
```

### 2. Install dependencies

A virtual environment is recommended:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

On a Raspberry Pi, `requirements_pi.txt` contains a relaxed set of pins, and `setup_pi.sh` installs the required system libraries:

```bash
bash setup_pi.sh
```

### 3. Download the English speech model (optional)

Voice keyword detection uses [Vosk](https://alphacephei.com/vosk/). The model is not stored in the repository because of its size:

```bash
mkdir -p models
wget https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
unzip vosk-model-small-en-us-0.15.zip -d models
mv models/vosk-model-small-en-us-0.15 models/en
```

Without this model, Guardian Eye still runs the vision pipeline but skips acoustic detection.

### 4. Configure Firebase (optional)

1. Open your Firebase project and generate an **Admin SDK private key**.
2. Save it in the project root as `service_account.json`.
3. Copy the device config template and fill in your Firebase user ID:

```bash
cp device_config.example.json device_config.json
```

```json
{
  "user_id": "YOUR_FIREBASE_UID_HERE",
  "gemini_api_key": ""
}
```

`service_account.json` and `device_config.json` are git-ignored and must never be committed.

### 5. Configure alerts (optional)

Copy the environment template and fill in your own values:

```bash
cp .env.example .env
```

```dotenv
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_IDS=123456789,987654321
GUARDIAN_EMERGENCY_PHONE=+919876543210
```

Alternatively, export the same variables in your shell. If they are unset, Telegram and GSM alerts are skipped with a warning while the rest of the system keeps running.

---

## 🏃 Running

```bash
python main.py
```

Guardian Eye will:

1. Load the YOLOv8 pose model (`yolov8n-pose.pt`, included) and download the object-detection model on first run if needed.
2. Open the camera feed (OpenCV on desktop, Picamera2/GStreamer on a Pi).
3. Start listening on the microphone.
4. Print live events to the terminal and sync confirmed emergencies to the cloud.

---

## 📁 Repository layout

| Path | Purpose |
| --- | --- |
| `main.py` | Process orchestrator |
| `fall.py`, `fall_process.py` | Fall detection and camera pipeline |
| `gesture_process.py`, `gesture.py` | Gesture recognition |
| `voice_process.py`, `voice_malayalam.py` | Voice keyword detection |
| `decision_engine.py` | Alert rules and cloud sync |
| `gsm.py`, `telegram_alert.py` | Notification channels |
| `Guardian_Eye_Documentation.md` / `.pdf` | Full technical documentation |
| `yolov8n-pose.pt` | Pose model used by the vision pipeline |
| `models/en/` | Vosk speech model (downloaded during setup, git-ignored) |
| `.env.example`, `device_config.example.json` | Configuration templates |
| `old.py`, `fall1.py`, `fall_backup.py` | Earlier development iterations, kept for reference |

---

## 🔐 Security notes

- No credentials are stored in this repository. Use `.env`, `device_config.json`, and `service_account.json`, all of which are git-ignored.
- If you previously used an older deployment, revoke any bot tokens that may have been exposed and rotate your credentials with [@BotFather](https://t.me/BotFather).

---

## 📄 Documentation

See [Guardian_Eye_Documentation.md](Guardian_Eye_Documentation.md) for the full architecture deep dive, model details, and cloud synchronization flow.

---

## 📜 License

Released under the MIT License. See [LICENSE](LICENSE) for details.

Copyright (c) 2026 Yedukrishna R (@yedukrishna012)

---

## 👥 Credits

Built as a college project by **Yedukrishna**, **Jubin T Joseph**, and **Rishijith**.
