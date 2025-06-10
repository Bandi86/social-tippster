# DevTools MCP Server - Production Deployment

## Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build for production
npm run build

# Start in production mode
npm start
```

## Production Configuration

### Environment Variables

```env
NODE_ENV=production
PORT=3033
PROJECT_ROOT=/path/to/your/project
FRONTEND_URL=https://your-frontend.com
LOG_LEVEL=info
HEALTH_CHECK_INTERVAL=30000
SERVICE_TIMEOUT=5000
MCP_PROTOCOL_VERSION=2024-11-05
```

### Docker Production Setup

```dockerfile
# Production Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copy built application
COPY dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3033

CMD ["node", "dist/main"]
```

### Docker Compose Production

```yaml
version: '3.8'
services:
  devtools-mcp:
    build: .
    ports:
      - '3033:3033'
    environment:
      - NODE_ENV=production
      - PROJECT_ROOT=/app/project
      - LOG_LEVEL=info
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./project:/app/project:ro
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3033/api/health']
      interval: 30s
      timeout: 10s
      retries: 3
```

## VS Code MCP Integration

### Settings Configuration

Add to your VS Code `settings.json`:

```json
{
  "mcp.servers": {
    "social-tippster-devtools": {
      "command": "node",
      "args": ["path/to/devtools/dist/main.js"],
      "env": {
        "NODE_ENV": "production",
        "PORT": "3033",
        "PROJECT_ROOT": "/path/to/your/project"
      }
    }
  }
}
```

### MCP Tools Available

1. **Docker Management**

   - `list_containers` - List all containers
   - `container_logs` - Get container logs
   - `container_stats` - Container statistics
   - `restart_container` - Restart containers

2. **Project Management**

   - `project_overview` - Complete project status
   - `scan_projects` - Refresh project data
   - `project_stats` - Detailed statistics
   - `recent_files` - Recently modified files

3. **Health Monitoring**
   - `health_check` - Overall health status
   - `service_health` - Specific service health
   - `system_health` - System resources
   - `docker_health` - Docker daemon status

## Security Considerations

### File System Access

The server includes built-in security measures:

- **Directory Exclusions**: Automatically excludes sensitive directories
- **Permission Handling**: Graceful handling of permission denied errors
- **Path Validation**: Prevents directory traversal attacks
- **Read-only Operations**: No write operations on project files

### Network Security

- **Local Access**: Default configuration for localhost only
- **CORS Configuration**: Restricted to trusted origins
- **Rate Limiting**: Consider adding rate limiting for production
- **Authentication**: Add authentication middleware if needed

## Monitoring & Logging

### Log Levels

- `error`: Critical errors only
- `warn`: Warnings and errors
- `info`: General information (recommended for production)
- `debug`: Detailed debugging (development only)

### Health Endpoints

Monitor these endpoints for production health:

- `GET /api/health` - Overall health status
- `GET /api/health/services` - All services status
- `GET /api/health/system` - System resources
- `GET /api/health/critical` - Critical services only

### Alerting

Set up monitoring for:

- Service downtime (unhealthy status)
- High CPU usage (>90%)
- High memory usage (>95%)
- Disk space low (<5% free)
- Docker daemon issues

## Performance Tuning

### Optimization Settings

```env
# Increase health check interval for production
HEALTH_CHECK_INTERVAL=60000

# Reduce service timeout for faster responses
SERVICE_TIMEOUT=3000

# Enable Node.js performance optimizations
NODE_OPTIONS="--max-old-space-size=512"
```

### Scaling Considerations

- **Memory Usage**: ~50MB base, plan for 100MB+ with full monitoring
- **CPU Usage**: <5% during normal operation
- **Network**: Minimal local traffic only
- **Disk**: Small footprint, mostly read operations

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**

   - Ensure proper Docker socket permissions
   - Check project directory read access
   - Verify user permissions for log directories

2. **Port Conflicts**

   - Change PORT environment variable
   - Check for existing services on port 3033
   - Use Docker network isolation

3. **Docker Connection Issues**
   - Verify Docker daemon is running
   - Check Docker socket permissions
   - Ensure Docker API is accessible

### Debug Mode

For troubleshooting, temporarily enable debug logging:

```env
LOG_LEVEL=debug
```

This will provide detailed information about:

- File system operations
- Docker API calls
- Service health checks
- MCP protocol messages

## Backup & Recovery

### Configuration Backup

Important files to backup:

- `.env` - Environment configuration
- `mcp-config.json` - MCP configuration
- `package.json` - Dependencies

### Data Recovery

The DevTools server is stateless and doesn't store persistent data. Recovery involves:

1. Restore configuration files
2. Rebuild and redeploy
3. Verify all monitored services are accessible

## Support

For issues or questions:

1. Check server logs for errors
2. Verify health endpoints are responding
3. Test individual API endpoints
4. Review Docker and project permissions
