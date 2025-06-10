# DevTools MCP Server

A comprehensive Model Context Protocol (MCP) server for Social Tippster project management, Docker monitoring, health checks, and development automation.

## 🚀 Features

### 🐳 Docker Management

- **Container Management**: List, start, stop, restart Docker containers
- **Real-time Monitoring**: Container stats, logs, and health status
- **Docker Compose**: Service status and management
- **Social Tippster Services**: Specialized endpoints for project containers

### 📊 Project Management

- **Project Overview**: Scan and monitor all project components
- **Service Discovery**: Automatic detection of microservices and their ports
- **File System Analysis**: Recent files, project statistics, code metrics
- **Git Integration**: Branch status, commit info, uncommitted changes

### 💚 Health Monitoring

- **Service Health**: Monitor all microservices and their endpoints
- **System Health**: CPU, memory, disk usage monitoring
- **Performance Metrics**: Response times and service performance
- **Critical Services**: Monitor essential services like auth, API gateway

### 🔧 MCP Protocol

- **Tool Execution**: Execute development tools via MCP protocol
- **Resource Access**: Access project data and configurations
- **VS Code Integration**: Ready for VS Code MCP extension

## 🏗️ Architecture

```
DevTools MCP Server (Port 3033)
├── Docker Module
│   ├── Container management
│   ├── Stats monitoring
│   └── Docker Compose integration
├── Project Module
│   ├── Service discovery
│   ├── File system analysis
│   └── Git integration
├── Health Module
│   ├── Service monitoring
│   ├── System metrics
│   └── Performance tracking
└── MCP Module
    ├── Protocol implementation
    ├── Tool registration
    └── Resource management
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker Desktop
- Git

### Installation

```bash
# Navigate to DevTools service
cd backend_new/services/devtools

# Install dependencies
npm install

# Build the application
npm run build

# Start in development mode
npm run start:dev

# Or start in production mode
npm start
```

### Environment Configuration

Create a `.env` file:

```env
PORT=3033
NODE_ENV=development
PROJECT_ROOT=c:\Users\bandi\Documents\code\social-tippster\social-tippster
FRONTEND_URL=http://localhost:3002
LOG_LEVEL=debug
```

## 📚 API Documentation

Once the server is running, access the Swagger documentation at:

- **Swagger UI**: http://localhost:3033/api/docs
- **API Base**: http://localhost:3033/api

### Available Endpoints

#### Docker Management

- `GET /api/docker/containers` - List all containers
- `GET /api/docker/containers/:name/logs` - Get container logs
- `POST /api/docker/containers/:name/restart` - Restart container
- `GET /api/docker/social-tippster/services` - Get Social Tippster services

#### Project Management

- `GET /api/project/overview` - Complete project overview
- `GET /api/project/scan` - Scan and refresh projects
- `GET /api/project/stats` - Project statistics
- `GET /api/project/microservices` - Microservices status

#### Health Monitoring

- `GET /api/health` - Overall health check
- `GET /api/health/services` - All services health
- `GET /api/health/system` - System resource usage
- `GET /api/health/summary` - Health summary

#### MCP Protocol

- `POST /api/mcp/request` - Handle MCP requests
- `GET /api/mcp/tools` - List available tools
- `GET /api/mcp/resources` - List available resources
- `POST /api/mcp/tools/:toolName/execute` - Execute specific tool

## 🛠️ MCP Tools

The server provides the following MCP tools:

### Docker Tools

- `list_containers` - List Docker containers
- `container_logs` - Get container logs
- `container_stats` - Get container statistics
- `restart_container` - Restart a container
- `execute_command` - Execute command in container

### Project Tools

- `project_overview` - Get complete project overview
- `scan_projects` - Scan and refresh projects
- `project_stats` - Get project statistics
- `recent_files` - Get recently modified files

### Health Tools

- `health_check` - Perform health check
- `service_health` - Get service health status
- `system_health` - Get system health metrics
- `docker_health` - Check Docker daemon health

## 🔧 VS Code Integration

To use with VS Code MCP extension, add to your VS Code settings:

```json
{
  "mcpServers": {
    "social-tippster-devtools": {
      "command": "node",
      "args": ["path/to/devtools/dist/main.js"],
      "env": {
        "NODE_ENV": "production",
        "PORT": "3033"
      }
    }
  }
}
```

## 📊 Monitoring Dashboard

The DevTools MCP server provides comprehensive monitoring:

### Project Status

- **Total Projects**: 16 (Frontend, Backend, Microservices)
- **Running Services**: Real-time service count
- **Git Status**: Branch, commits, uncommitted changes
- **Port Usage**: Active ports and availability

### Docker Containers

- **Container Status**: Running/stopped state
- **Resource Usage**: CPU, memory, network I/O
- **Logs**: Real-time log streaming
- **Health Checks**: Container health monitoring

### System Metrics

- **CPU Usage**: Real-time CPU monitoring
- **Memory Usage**: RAM usage and availability
- **Disk Usage**: Storage space monitoring
- **Performance**: Service response times

## 🔍 Example Usage

### Get Project Overview

```bash
curl http://localhost:3033/api/project/overview
```

### Monitor Docker Containers

```bash
curl http://localhost:3033/api/docker/containers
```

### Check System Health

```bash
curl http://localhost:3033/api/health/summary
```

### Execute MCP Tool

```bash
curl -X POST http://localhost:3033/api/mcp/tools/project_overview/execute
```

## 🏷️ Service Ports

The DevTools MCP server monitors these services:

| Service       | Port     | Type           | Status         |
| ------------- | -------- | -------------- | -------------- |
| API Gateway   | 3000     | Microservice   | ✅ Running     |
| Auth Service  | 3001     | Microservice   | ✅ Running     |
| Frontend New  | 3002     | Frontend       | ✅ Running     |
| User Service  | 3003     | Microservice   | ✅ Running     |
| Post Service  | 3004     | Microservice   | ✅ Running     |
| Stats Service | 3005     | Microservice   | ✅ Running     |
| Tipp Service  | 3006     | Microservice   | ✅ Running     |
| Notifications | 3007     | Microservice   | ✅ Running     |
| Chat Service  | 3008     | Microservice   | ✅ Running     |
| Data Service  | 3009     | Microservice   | ✅ Running     |
| Image Service | 3010     | Microservice   | ✅ Running     |
| Live Service  | 3011     | Microservice   | ✅ Running     |
| Log Service   | 3012     | Microservice   | ✅ Running     |
| Admin Service | 3013     | Microservice   | ✅ Running     |
| **DevTools**  | **3033** | **MCP Server** | **✅ Running** |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is part of the Social Tippster ecosystem and follows the same licensing terms.

## 🆘 Troubleshooting

### Common Issues

**Port 3033 already in use**

```bash
# Check what's using the port
netstat -an | findstr :3033

# Kill the process if needed
taskkill /F /PID <process-id>
```

**Docker connection issues**

```bash
# Check Docker is running
docker info

# Restart Docker Desktop if needed
```

**Build errors**

```bash
# Clean and rebuild
npm run build

# Check TypeScript errors
npx tsc --noEmit
```

### Debug Mode

Enable debug logging:

```env
LOG_LEVEL=debug
NODE_ENV=development
```

## 🔗 Related Services

- [Auth Service](../auth/README.md) - Authentication and authorization
- [API Gateway](../api-gateway/README.md) - Request routing and load balancing
- [Frontend New](../../frontend_new/README.md) - React/Next.js frontend
- [Docker Compose Setup](../../docker-compose.yml) - Container orchestration
