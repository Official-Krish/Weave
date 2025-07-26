# Weave - Advanced Video Conferencing Platform

**High-quality video conferencing with intelligent local recording technology**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)


## 🚀 Overview

Weave is a next-generation video conferencing platform that revolutionizes meeting recording by implementing **local recording technology**. Unlike traditional platforms like Zoom that depend on internet quality for recording, Weave Pro captures high-quality video and audio directly on each participant's device, then intelligently merges and processes recordings in the cloud.

### 🎯 Key Innovation

**Local Recording Technology**: Recordings happen locally on each user's device in 60-second chunks, ensuring:
- **No quality loss** due to internet connectivity issues
- **Consistent recording quality** regardless of network conditions
- **Reduced bandwidth usage** during meetings
- **Automatic chunk upload** and cloud processing

## ✨ Features

### 🎥 Core Functionality
- **Real-time video conferencing** with Jitsi Meet integration
- **Local recording** with automatic chunk upload
- **Screen sharing** capabilities
- **Participant management** with host controls
- **Meeting scheduling** and passcode protection

### 🔧 Technical Features
- **Chunk-based recording** (60-second intervals)
- **Automatic video merging** using FFmpeg
- **Grid layout generation** for multi-participant recordings
- **Cloud storage integration** (Google Cloud Storage)
- **Real-time processing** with Kubernetes workers
- **Database tracking** of recording chunks and final outputs

### 🛡️ Security & Performance
- **End-to-end encryption** for sensitive meetings
- **JWT authentication** system
- **Role-based access control**
- **Automatic cleanup** of temporary files
- **Scalable microservices architecture**

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Worker        │
│   (React/TS)    │◄──►│   (Express)     │◄──►│   (Chunk Upload)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Jitsi Meet    │    │   PostgreSQL    │    │   Redis Queue   │
│   Integration   │    │   Database      │    │   Orchestrator  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Local         │    │   Merger        │    │   K8s Worker    │
│   Recording     │    │   Worker        │    │   (FFmpeg)      │
│   (Chunks)      │    │   (Video Merge) │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Google Cloud  │    │   Final Video   │    │   User Dashboard│
│   Storage       │    │   (Grid Layout) │    │   (Recordings)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Redux Toolkit** for state management
- **Jitsi Meet SDK** for video conferencing

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** with Prisma ORM
- **Redis** for queue management
- **JWT** for authentication

### Infrastructure
- **Google Cloud Storage** for file storage
- **Kubernetes** for container orchestration
- **FFmpeg** for video processing
- **Docker** for containerization

## 📦 Project Structure

```
video_voice_confrence/
├── apps/
│   ├── client/                 # React frontend application
│   ├── backend/                # Express API server
│   ├── worker/                 # Chunk upload worker
│   ├── merger-worker/          # Video merging service
│   ├── k8s-worker/             # Kubernetes video processor
│   ├── redis-orchastrator/     # Queue management
│   └── ws-relayer/             # WebSocket relay service
├── packages/
│   ├── db/                     # Database schema and migrations
│   ├── types/                  # Shared TypeScript types
│   ├── ui/                     # Shared UI components
│   └── eslint-config/          # ESLint configurations
├── docker/                     # Docker configurations
├── ops/                        # Kubernetes deployments
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL 14+
- Redis 6+
- Docker & Kubernetes (for production)
- Google Cloud Storage account

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Official-Krish/weave
   cd weave
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment templates
   cp apps/backend/.env.example apps/backend/.env
   cp apps/client/.env.example apps/client/.env
   
   # Configure your environment variables
   # See Environment Variables section below
   ```

4. **Database Setup**
   ```bash
   cd packages/db
   npx prisma generate
   npx prisma db push
   ```

5. **Start Development Servers**
   ```bash
   # Start all services
   npm run dev
   
   # Or start individually
   npm run dev:backend
   npm run dev:client
   npm run dev:worker
   ```

## 🔧 Environment Variables

### Backend
```env
DATABASE_URL="postgresql://user:password@localhost:5432/weave"
JWT_SECRET="your-jwt-secret"
REDIS_URL="redis://localhost:6379"
GOOGLE_CLOUD_PROJECT="your-gcp-project"
GOOGLE_CLOUD_BUCKET="your-storage-bucket"
```

### Client
```env
VITE_API_URL="http://localhost:3000"
VITE_WORKER_URL="http://localhost:3001"
VITE_JITSI_DOMAIN="meet.jit.si"
```

### Worker Services
```env
BUCKET_NAME="your-storage-bucket"
PROJECT_ID="your-gcp-project"
K8S_WORKER_URL="http://k8s-worker-service"
```

## 📱 Usage

### For Users

1. **Create Account**: Sign up at the landing page
2. **Start Meeting**: Create a new meeting or join with a meeting ID
3. **Automatic Recording**: Only host can start and stop recording 
4. **Access Recordings**: View processed recordings in your dashboard

### For Developers

1. **API Integration**: Use the REST API for meeting management
2. **WebSocket Events**: Listen for real-time meeting updates
3. **Custom Recording**: Implement custom recording logic using the chunk system

## 🔄 Recording Process

### 1. Local Recording
- Each participant's device records video/audio in 60-second chunks
- Chunks are automatically uploaded to cloud storage
- No quality loss due to internet issues

### 2. Chunk Processing
- Worker services monitor for new chunks
- Chunks are validated and stored in database
- Queue system manages processing order

### 3. Video Merging
- Merger worker downloads all chunks for a meeting
- FFmpeg processes and concatenates video chunks
- Grid layout is generated for multi-participant view

### 4. Final Output
- Processed video is uploaded to cloud storage
- Database is updated with final recording links
- Users can access recordings through dashboard


## 📊 Performance

- **Recording Quality**: 1920x1080 @ 60fps
- **Chunk Size**: 60 seconds per chunk
- **Processing Time**: ~2-3 minutes for 1-hour meeting
- **Storage**: Automatic cleanup of temporary files
- **Scalability**: Kubernetes-based auto-scaling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🙏 Acknowledgments

- **Jitsi Meet** for the video conferencing foundation
- **FFmpeg** for video processing capabilities
- **Google Cloud Platform** for scalable infrastructure
- **Open Source Community** for various dependencies

---

