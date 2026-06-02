# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Build the Next.js frontend (static export)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy source and build
COPY frontend/ .

# Generate individual product images from the catalogue (build-time)
RUN apk add --no-cache python3 py3-pip py3-pillow
RUN python3 scripts/crop_catalogue.py

# NEXT_PUBLIC_API_URL must point to the same origin since FastAPI serves both.
# At runtime the browser hits /api/v1 on the same domain.
ENV NEXT_PUBLIC_API_URL=/api/v1

RUN npm run build
# `next build` with output:"export" writes static files to /frontend/out


# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Python / FastAPI production image
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.10-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# System deps for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ .

# Copy the built frontend static export from stage 1
COPY --from=frontend-builder /frontend/out ./frontend_build

# Tell FastAPI where to find the frontend static files
ENV FRONTEND_BUILD_DIR=/app/frontend_build

# Render injects PORT; default to 8000 locally
ENV PORT=8000

EXPOSE 8000

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
