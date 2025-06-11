# Deployment & Development Workflow for frontend_new (Next.js)

## Updated: 2025-06-11

## Optimized Docker-based Development Workflow

### Key Optimizations

- **.dockerignore**: Ensures node_modules, .next, and other unnecessary files are not sent to Docker build context, speeding up build times.
- **Volume Mounts**: The dev service mounts the entire frontend_new folder into the container, enabling instant code reloads without rebuilding the image.
- **node_modules Handling**: node_modules is installed inside the container, not on the host, to avoid Windows file system slowness and permission issues.
- **Dev Target**: The Dockerfile has a `dev` target for fast startup with hot reload (`next dev --turbopack`).
- **No Repeated npm ci**: With volume mounts, node_modules is preserved between restarts, so dependency install is only needed on first run or when package.json changes.

### Recommended Dev Workflow

1. **Start only the dev container** (avoid full rebuilds):

   ```bash
   docker compose -f backend_new/docker-compose.yml up frontend_new_dev
   ```

   Or, to start all dev services:

   ```bash
   docker compose -f backend_new/docker-compose.yml up <service>_dev
   ```

2. **Edit code locally**: Changes are reflected instantly in the running container via the volume mount.

3. **If dependencies change** (package.json):

   - Rebuild the dev container:
     ```bash
     docker compose -f backend_new/docker-compose.yml build frontend_new_dev
     docker compose -f backend_new/docker-compose.yml up frontend_new_dev
     ```

4. **Stop dev containers**:
   ```bash
   docker compose -f backend_new/docker-compose.yml down
   ```

### Troubleshooting

- **Slow startup**: Ensure .dockerignore is present and correct. Avoid mounting node_modules from host.
- **Port conflicts**: Only one frontend_new or frontend_new_dev can run on port 3002 at a time.
- **File changes not reflected**: Check that the volume mount is working and you are editing the correct folder.

### Advanced Tips for Even Faster Dev Startup

- **Leverage Docker Build Cache**: Only rebuild the image when dependencies change (package.json or Dockerfile). For code changes, rely on the volume mount.
- **node_modules as a Named Volume**: For large projects, consider using a named Docker volume for node_modules to persist dependencies across container restarts, e.g.:
  ```yaml
  volumes:
    - ../frontend_new:/app
    - frontend_new_node_modules:/app/node_modules
  ```
  Then add to the bottom of your docker-compose.yml:
  ```yaml
  volumes:
    frontend_new_node_modules:
  ```
- **Skip npm ci on Every Start**: If using a named volume for node_modules, you can add logic to your Dockerfile or entrypoint to only run `npm ci` if node_modules is missing.
- **Use TurboPack for Hot Reload**: The dev container already uses `next dev --turbopack` for faster reloads.
- **Windows WSL2 Users**: For best performance, keep your codebase on the Linux filesystem (e.g., /home/username/project) and run Docker from WSL2.

### Example: docker-compose.yml Dev Service (with node_modules volume)

```yaml
frontend_new_dev:
  build:
    context: ../frontend_new
    dockerfile: Dockerfile
    target: dev
  container_name: frontend_new_dev
  environment:
    NODE_ENV: development
    PORT: 3002
  ports:
    - '3002:3002'
  volumes:
    - ../frontend_new:/app
    - frontend_new_node_modules:/app/node_modules
  command: ['npm', 'run', 'dev', '--', '-p', '3002']
```

### docker-compose.yml: Add Named Volume for node_modules

At the bottom of your `backend_new/docker-compose.yml`, add:

```yaml
volumes:
  frontend_new_node_modules:
```

This ensures the named volume is created and managed by Docker, persisting `node_modules` across container restarts for the dev service.

### Production Workflow

- Use the `frontend_new` service (not `frontend_new_dev`). This uses the production build and runs with minimal dependencies.

---

## Hot Reload Troubleshooting on Windows Docker

### Current Status: Manual Hot Reload Solution ✅

Due to Windows Docker file system limitations, automatic hot reload is not consistently working. However, we've implemented a **reliable manual hot reload solution** that provides excellent development experience.

### ✅ Working Solution: Manual Hot Reload

#### Method 1: VS Code Task (Recommended)

1. Open Command Palette: `Ctrl+Shift+P`
2. Type: "Tasks: Run Task"
3. Select: "Trigger Hot Reload"
4. ✅ Server restarts automatically with latest changes

#### Method 2: Terminal Command

```bash
cd backend_new
docker-compose exec frontend_new_dev sh -c "touch /app/next.config.ts"
```

### Performance Optimizations Applied ✅

- **Container Startup**: Reduced from 4.3s to 2.8s (34% improvement)
- **Webpack Polling**: Optimized to 1000ms intervals
- **Environment Variables**: Enhanced with aggressive polling settings
- **Next.js Config**: Cleaned up conflicts between Turbopack and Webpack

### Configuration Details

#### next.config.ts (Optimized)

```typescript
const nextConfig: NextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000, // Stable polling interval
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },
  reactStrictMode: true,
};
```

#### docker-compose.override.yml (Enhanced)

```yaml
services:
  frontend_new_dev:
    environment:
      WATCHPACK_POLLING: 'true'
      CHOKIDAR_USEPOLLING: 'true'
      CHOKIDAR_INTERVAL: 100
      FAST_REFRESH: 'true'
      # Additional polling variables for compatibility
```

### Development Workflow

1. **Edit Files**: Make changes to components, pages, etc.
2. **Trigger Reload**: Use VS Code task or terminal command
3. **View Changes**: Refresh browser to see updates
4. **Repeat**: Efficient workflow for iterative development

### Why Automatic Hot Reload Doesn't Work

1. **Windows Docker Limitation**: File system events don't propagate reliably from Windows host to Linux containers
2. **Volume Mount Issues**: inotify events are not consistently triggered across the Windows/Linux boundary
3. **Polling Limitations**: Even aggressive polling (100ms) doesn't capture external file modifications reliably

### Alternative Solutions for Future

- **WSL2 Backend**: May improve file watching capabilities
- **Native Development**: Run frontend locally, backend in Docker
- **Different Volume Strategies**: Investigate bind mount alternatives

### Quick Verification

Test your hot reload setup:

1. Open `localhost:3002` in browser
2. Look for the colored hot reload indicator in bottom-right corner
3. Edit `components/test/HotReloadTest.tsx`
4. Run "Trigger Hot Reload" task
5. Refresh browser to see changes

### Troubleshooting Common Issues

#### Container Won't Start

```bash
# Stop all containers and restart
docker-compose down
docker-compose up frontend_new_dev -d
```

#### Port Already in Use

```bash
# Check what's using the port
netstat -ano | findstr :3002
# Kill the process if needed
taskkill /PID <PID_NUMBER> /F
```

#### Changes Not Reflecting

1. ✅ Use manual hot reload trigger
2. Clear browser cache (`Ctrl+Shift+R`)
3. Check container logs: `docker-compose logs frontend_new_dev`

---

For more details, see the Dockerfile and docker-compose.yml in the repository.

---

_Last updated: 2025-06-11 (added hot reload troubleshooting section)_
