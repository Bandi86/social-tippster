for d in backend_new/services/*; do
  if [ -f "$d/package.json" ]; then
    rm -rf "$d/node_modules" "$d/package-lock.json"
    cd "$d"
    npm install \
      @nestjs/core@latest \
      @nestjs/common@latest \
      @nestjs/platform-express@latest \
      @nestjs/swagger@latest \
      swagger-ui-express@latest \
      @prisma/client@latest \
      prisma@latest \
      reflect-metadata@latest \
      rxjs@latest \
      class-validator@latest \
      class-transformer@latest \
      redis@latest \
      cache-manager-ioredis \
      ioredis \
      amqplib@latest \
      @nestjs/config@latest \
      @nestjs/jwt@latest \
      @nestjs/passport@latest \
      passport@latest \
      passport-jwt@latest \
      passport-local@latest \
      @nestjs/testing@latest \
      @nestjs/mapped-types@latest \
      @nestjs/throttler@latest \
      @nestjs/serve-static@latest \
      @nestjs/schedule@latest \
      @nestjs/cqrs@latest \
      --save --force
    cd - > /dev/null
  fi
done

docker compose -f backend_new/docker-compose.yml build
