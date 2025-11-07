"""
Database connection management with PostgreSQL and SQLite support

This module provides database connection and session management
with support for both PostgreSQL (production) and SQLite (development/testing).
"""

import os
from collections.abc import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool, QueuePool

from src.database.models import Base


def get_database_url() -> str:
    """
    Get database URL from environment

    Returns:
        Database URL string

    Defaults to SQLite if DATABASE_URL not set
    """
    return os.getenv("DATABASE_URL", "sqlite:///./proxy_agents_enhanced.db")


def create_db_engine():
    """
    Create database engine with appropriate settings

    For PostgreSQL: Uses connection pooling
    For SQLite: No pooling, enables WAL mode and foreign keys
    """
    database_url = get_database_url()

    if database_url.startswith("postgresql"):
        # PostgreSQL: Use connection pooling
        engine = create_engine(
            database_url,
            poolclass=QueuePool,
            pool_size=int(os.getenv("DB_POOL_SIZE", "10")),
            max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "20")),
            pool_pre_ping=True,  # Verify connections before using
            echo=os.getenv("DB_ECHO", "false").lower() == "true",
        )
    elif database_url.startswith("sqlite"):
        # SQLite: No pooling, enable WAL mode
        engine = create_engine(
            database_url,
            poolclass=NullPool,
            connect_args={"check_same_thread": False},
            echo=os.getenv("DB_ECHO", "false").lower() == "true",
        )

        # Enable WAL mode and foreign keys for SQLite
        @event.listens_for(engine, "connect")
        def set_sqlite_pragma(dbapi_conn, connection_record):
            cursor = dbapi_conn.cursor()
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.execute("PRAGMA synchronous=NORMAL")
            cursor.execute("PRAGMA cache_size=10000")
            cursor.execute("PRAGMA temp_store=MEMORY")
            cursor.close()
    else:
        raise ValueError(f"Unsupported database URL: {database_url}")

    return engine


# Create engine
engine = create_db_engine()

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency injection for database session

    Usage in FastAPI:
        @app.get("/tasks")
        def get_tasks(db: Session = Depends(get_db)):
            return db.query(Task).all()

    Yields:
        SQLAlchemy session

    Ensures:
        Session is closed after use
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database (create tables if not exist)

    Note: In production, use Alembic migrations instead
    This is mainly for development and testing
    """
    Base.metadata.create_all(bind=engine)


def drop_db() -> None:
    """
    Drop all tables

    WARNING: This will delete all data!
    Only use in development/testing
    """
    Base.metadata.drop_all(bind=engine)


# Alias for consistency with naming convention
get_db_session = get_db
