# Docker Quick Reference Commands

> **Project:** Social Tippster
> **Updated:** June 11, 2025

## 🚀 Essential Commands

### **Start Development Environment**

```bash
# Navigate to backend_new directory first
cd backend_new

# Start all services (full stack)
docker-compose up -d

# Start only essential services for development
docker-compose up api-gateway_dev auth_dev user_dev frontend_new_dev redis rabbitmq postgres_auth postgres_user -d

# Start with build (when Dockerfile changes)
docker-compose up --build -d
```

### **Check Service Status**

```bash
# List all running containers
docker ps

# Check specific service logs
docker logs -f api-gateway_dev
docker logs -f frontend_new_dev
docker logs -f auth_dev

# Follow logs for multiple services
docker-compose logs -f api-gateway_dev frontend_new_dev
```

### **Stop Services**

```bash
# Stop all services
docker-compose down

# Stop specific services
docker-compose stop frontend_new_dev api-gateway_dev

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### **Rebuild Services**

```bash
# Rebuild specific service
docker-compose build frontend_new_dev
docker-compose up frontend_new_dev -d

# Rebuild all services
docker-compose build
docker-compose up -d
```

## 🐳 Service-Specific Commands

### **Frontend (frontend_new_dev)**

```bash
# Restart frontend only
docker-compose restart frontend_new_dev

# View frontend logs
docker logs -f frontend_new_dev

# Execute commands in frontend container
docker exec -it frontend_new_dev npm run build
docker exec -it frontend_new_dev npm install package-name
```

### **Backend Services**

```bash
# Restart API Gateway
docker-compose restart api-gateway_dev

# Check auth service
docker logs -f auth_dev

# Execute NestJS commands
docker exec -it auth_dev npm run start:dev
docker exec -it auth_dev nest generate module module-name
```

### **Database Management**

```bash
# Connect to specific database
docker exec -it postgres_auth psql -U auth_user -d auth_db
docker exec -it postgres_user psql -U user_user -d user_db

# View all databases
docker exec -it postgres_auth psql -U auth_user -c "\l"

# Backup database
docker exec postgres_auth pg_dump -U auth_user auth_db > auth_backup.sql
```

### **Redis Management**

```bash
# Connect to Redis
docker exec -it redis redis-cli

# Connect with password
docker exec -it redis redis-cli -a your_secure_password

# Monitor Redis
docker exec -it redis redis-cli monitor
```

### **RabbitMQ Management**

```bash
# Access RabbitMQ Management UI
# http://localhost:15672
# Username: guest, Password: guest

# Check RabbitMQ logs
docker logs -f rabbitmq
```

## 🔧 Development Workflow

### **Full Stack Development**

```bash
# 1. Start infrastructure
docker-compose up redis rabbitmq postgres_auth postgres_user -d

# 2. Start backend services
docker-compose up api-gateway_dev auth_dev user_dev -d

# 3. Start frontend
docker-compose up frontend_new_dev -d

# 4. Check everything is running
docker ps
```

### **Quick Frontend-Only Development**

```bash
# If backend is stable, just restart frontend
docker-compose restart frontend_new_dev
docker logs -f frontend_new_dev
```

### **Debug Specific Service**

```bash
# Stop service
docker-compose stop service_name_dev

# Rebuild and restart with logs
docker-compose build service_name_dev
docker-compose up service_name_dev

# Or restart existing
docker-compose restart service_name_dev
docker logs -f service_name_dev
```

## 🚨 Troubleshooting

### **Port Conflicts**

```bash
# Check what's using a port
netstat -ano | findstr :3000
netstat -ano | findstr :3002

# Kill process using port (Windows)
taskkill /PID <PID> /F
```

### **Container Issues**

```bash
# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove everything (nuclear option)
docker system prune -a --volumes
```

### **Database Reset**

```bash
# Stop services
docker-compose down

# Remove volumes (data will be lost!)
docker volume rm backend_new_postgres_auth_data
docker volume rm backend_new_postgres_user_data

# Restart services (fresh databases)
docker-compose up postgres_auth postgres_user -d
```

### **Service Won't Start**

```bash
# Check service configuration
docker-compose config

# Check specific service logs
docker-compose logs service_name_dev

# Rebuild from scratch
docker-compose build --no-cache service_name_dev
docker-compose up service_name_dev -d
```

## 📊 Monitoring

### **Health Checks**

```bash
# Check all service endpoints
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002         # Frontend

# Check database connections
docker exec postgres_auth pg_isready -U auth_user
```

### **Resource Usage**

```bash
# Monitor resource usage
docker stats

# Check specific container
docker stats frontend_new_dev
```

## 🎯 Common Development Scenarios

### **Adding New Feature**

1. Start relevant services only
2. Make code changes
3. Hot-reload should pick up changes
4. Check logs for errors
5. Test endpoints/UI

### **Database Changes**

1. Update Prisma schema
2. Generate migration
3. Apply to development database
4. Restart affected services

### **Environment Issues**

1. Check environment variables in docker-compose.yml
2. Verify service dependencies
3. Check port availability
4. Review Docker logs

---

**💡 Pro Tips:**

- Use `docker-compose logs -f service_name` for real-time debugging
- Keep `docker ps` open in a separate terminal
- Use service health endpoints to verify connectivity
- RabbitMQ Management UI is great for debugging message queues
- Redis CLI is useful for checking cache status
