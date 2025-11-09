# Why `/src` and `/mobile`? - Quick Answer

## TL;DR

This is a **monorepo** (single repository) containing two separate applications:

| Directory | What It Is | Technology |
|-----------|-----------|------------|
| `/src` | Backend API Server | Python, FastAPI, PostgreSQL |
| `/mobile` | Universal Mobile App | React Native, Expo, TypeScript |

They communicate via REST API:

```
Mobile App (iOS/Android/Web) → HTTP Requests → Backend API → Database
```

## Common Questions

### Q: Why not just one codebase?

**A**: They're fundamentally different technologies:
- **Backend** uses Python (good for AI, data processing, APIs)
- **Mobile** uses React Native (good for iOS/Android/Web UIs)

You can't run Python in a mobile app, and you can't build native mobile UIs with FastAPI.

### Q: Why not a `/frontend` directory?

**A**: The `/mobile` app **IS the frontend**!

Expo allows one React Native codebase to run on:
- iOS (native app)
- Android (native app)
- Web (progressive web app)

So we don't need a separate web frontend - the mobile app runs in browsers too!

### Q: How do they work together?

**A**: Classic client-server architecture:

1. **Mobile app** makes HTTP requests to `http://localhost:8000/api/v1/*`
2. **Backend** processes the request, queries the database, runs AI agents
3. **Backend** sends JSON response back to mobile app
4. **Mobile app** displays the data to the user

### Q: Where is the database?

**A**: The backend (`/src`) manages the PostgreSQL database using SQLAlchemy ORM. Mobile app never touches the database directly - always through the API.

### Q: Can I run just the mobile app?

**A**: Technically yes (it will start), but it won't have any data without the backend API running. You need both:

```bash
# Terminal 1: Start backend
uv run uvicorn src.api.main:app --reload

# Terminal 2: Start mobile app
cd mobile && npm start
```

## Full Documentation

For detailed architecture, development workflows, and API documentation, see:
- [ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md) - Complete technical architecture
- [mobile/README.md](mobile/README.md) - Mobile app documentation
- [CLAUDE.md](CLAUDE.md) - Backend Python development guide

---

**Still confused?** Read [ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md) for the full explanation with diagrams!
