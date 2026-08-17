#!/bin/bash
# supermake — starts pages (Jekyll), studentflask, and studentspring together
# Usage: ./supermake

PAGES_DIR="$(cd "$(dirname "$0")" && pwd)"
FLASK_DIR="/home/rudra/coding/studentflask"
SPRING_DIR="/home/rudra/coding/studentspring"

FLASK_LOG="/tmp/supermake_flask.log"
SPRING_LOG="/tmp/supermake_spring.log"

cleanup() {
  echo ""
  echo "Stopping all services..."
  kill "$FLASK_PID" "$SPRING_PID" 2>/dev/null
  wait "$FLASK_PID" "$SPRING_PID" 2>/dev/null
  echo "Done."
  exit 0
}
trap cleanup INT TERM

# ── Spring ──────────────────────────────────────────
echo "[spring] Starting Spring Boot on :8585..."
cd "$SPRING_DIR"
./mvnw spring-boot:run > "$SPRING_LOG" 2>&1 &
SPRING_PID=$!

# ── Flask ───────────────────────────────────────────
echo "[flask]  Starting Flask on :8587..."
cd "$FLASK_DIR"
source venv/bin/activate
python main.py > "$FLASK_LOG" 2>&1 &
FLASK_PID=$!

# ── Pages deps ─────────────────────────────────────
echo "[pages]  Installing Python dependencies..."
cd "$PAGES_DIR"
pip3 install -r requirements.txt -q

# ── Pages (foreground so logs stream to terminal) ───
echo "[pages]  Starting Jekyll (make)..."
echo ""
echo "Logs:  flask → $FLASK_LOG   spring → $SPRING_LOG"
echo "Stop:  Ctrl+C"
echo ""
cd "$PAGES_DIR"
make

# If make exits, clean up the background services
cleanup
