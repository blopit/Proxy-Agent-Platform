# 🌍 Remote Access Guide - ngrok Setup

This guide shows you how to access your local development environment from anywhere in the world with hot reloading active!

## 🚀 Quick Start

### One-Command Setup

```bash
./start-ngrok.sh
```

This script will:
1. Start ngrok tunnel for your backend (port 8001)
2. Update frontend `.env.local` with the ngrok URL
3. Display all access URLs

### Current Configuration

**Backend ngrok URL:** `https://0ea8f81747ed.ngrok-free.app`
**Frontend (local):** `http://localhost:3000`

## 📱 Access Your Mobile App

### From Your Local Network
- Open: `http://localhost:3000/mobile`
- Backend: Automatically connects via ngrok

### From Anywhere in the World
Since the frontend connects to the ngrok backend URL, you can:
1. **Share localhost via network:** Use your local IP (e.g., `http://192.168.50.112:3000/mobile`)
2. **Use ngrok for both** (requires paid plan for 2+ tunnels)

## 🔥 Hot Reloading is Active!

Both frontend and backend have hot reloading enabled:
- **Frontend:** Changes to React/TypeScript auto-reload (Next.js Fast Refresh)
- **Backend:** Changes to Python/FastAPI auto-reload (uvicorn --reload)
- **ngrok:** Tunnel stays persistent, no need to restart

## 📊 Monitor Traffic

View all API requests in real-time:
```
http://127.0.0.1:4040
```

This ngrok dashboard shows:
- All HTTP requests
- Request/response headers
- Timing information
- Status codes

## 🎯 How It Works

### Architecture
```
┌─────────────────┐
│   Your Phone    │
│   (anywhere)    │
└────────┬────────┘
         │
         │ https://0ea8f81747ed.ngrok-free.app
         │
         ▼
┌─────────────────┐
│     ngrok       │
│   (tunnel)      │
└────────┬────────┘
         │
         │ localhost:8001
         │
         ▼
┌─────────────────┐      Hot Reload      ┌─────────────────┐
│  FastAPI Backend│ ◄──────────────────► │  Python Files   │
│  (port 8001)    │                       │  src/api/**/*.py│
└─────────────────┘                       └─────────────────┘
```

### Frontend Configuration

The frontend `.env.local` is automatically updated:
```bash
NEXT_PUBLIC_API_URL=https://0ea8f81747ed.ngrok-free.app
```

This means all API calls from the frontend go through ngrok to your local backend.

## 🛑 Stop ngrok

```bash
pkill -f ngrok
```

Or press `Ctrl+C` if running in foreground.

## 🔄 Restart Setup

If ngrok URL changes (on restart):

1. Run the script again:
   ```bash
   ./start-ngrok.sh
   ```

2. It will automatically update `.env.local` with the new URL

3. Next.js will hot-reload with the new configuration

## ⚠️ ngrok Free Plan Limitations

- **1 tunnel only:** We use it for the backend
- **URL changes on restart:** Each time ngrok restarts, you get a new URL
- **Browser warning:** First-time visitors see ngrok warning page
  - Add header `ngrok-skip-browser-warning: true` to bypass in API calls
  - Browsers: Just click "Visit Site"

### Upgrade to ngrok Pro

For production-like setup:
- **Multiple tunnels:** Expose both frontend and backend
- **Custom domains:** Get a permanent URL like `your-app.ngrok.app`
- **No browser warning:** Direct access for users

## 🧪 Testing the Setup

### Test Backend Health
```bash
curl -H "ngrok-skip-browser-warning: true" https://0ea8f81747ed.ngrok-free.app/health
```

Expected response:
```json
{"status":"healthy"}
```

### Test from Mobile Browser
1. Open your browser (Safari/Chrome on phone)
2. Go to: `http://localhost:3000/mobile` (if on same network)
3. Or share your local IP: `http://192.168.50.112:3000/mobile`

### Test Hot Reload
1. Make a change to any file in `src/app/mobile/page.tsx`
2. Save the file
3. Watch your browser automatically refresh!

## 📂 Files Created

- [start-ngrok.sh](start-ngrok.sh) - Main setup script
- [frontend/.env.local](frontend/.env.local) - Auto-updated with ngrok URL
- `ngrok-backend.log` - ngrok logs
- `ngrok-backend.pid` - Process ID for ngrok

## 🎨 Current Mobile App Features

Access these from anywhere:
- ✅ Solarized Dark theme
- ✅ Swipeable biological modes (Hunter/Scout/Mender/Mapper/Rebirth)
- ✅ Hold gesture with ring animation (1s to view details)
- ✅ Swipe left to dismiss, right to delegate/do
- ✅ Smart tutorials that auto-dismiss
- ✅ Mode switcher at bottom
- ✅ Real-time WebSocket updates
- ✅ Hot reloading for instant changes

## 🔧 Troubleshooting

### Backend not responding via ngrok

1. Check if backend is running:
   ```bash
   curl http://localhost:8001/health
   ```

2. Restart backend:
   ```bash
   source .venv/bin/activate
   python -m uvicorn src.api.main:app --host 127.0.0.1 --port 8001 --reload
   ```

3. Check ngrok status:
   ```bash
   curl http://127.0.0.1:4040/api/tunnels | python3 -m json.tool
   ```

### Frontend not connecting to backend

1. Check `.env.local`:
   ```bash
   cat frontend/.env.local
   ```

2. Should show the ngrok URL:
   ```
   NEXT_PUBLIC_API_URL=https://[your-id].ngrok-free.app
   ```

3. Restart frontend if needed:
   ```bash
   cd frontend && npm run dev
   ```

### ngrok tunnel expired

Free ngrok tunnels are temporary. Restart:
```bash
./start-ngrok.sh
```

## 🌐 Alternative: Cloudflare Tunnel

For a permanent free solution, consider Cloudflare Tunnel:
- Permanent URLs
- No expiration
- Multiple tunnels
- Built-in DDoS protection

## 📚 Resources

- [ngrok Documentation](https://ngrok.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

**Current Status:** ✅ Active and running with hot reload!

Backend: `https://0ea8f81747ed.ngrok-free.app`
Frontend: `http://localhost:3000/mobile`
Monitor: `http://127.0.0.1:4040`
