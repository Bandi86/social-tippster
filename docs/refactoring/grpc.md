[Frontend (Next.js)] ──────┐
                          ▼
               [API Gateway (REST/gRPC)]
                          │
──────────────────────────┼───────────────────────────
│     [auth-service]      │   [user-service]        │
│     REST + JWT          │   REST + Prisma         │
│                         │                         │
│     [post-service]      │   [comment-service]     │
│     REST + S3 uploads   │   REST                  │
│                         ▼                         │
│     [image-service]    ─┼─>  S3/Cloudinary        │
│                         │                         │
│     [chat-service]      │                         │
│     WS + Redis pub/sub  │                         │
│                         ▼                         │
│     [notification-svc]──┼─> RabbitMQ              │
│                         │                         │
│     [live-data-svc]     ┼─> gRPC stream            │
│     [historical-data]   ┼─> gRPC pull              │
│     [stats-service]     ┼─> Redis + gRPC           │
│     [bet-slip-svc]      ┼─> REST + MQ              │
│     [logging-service]   └─> gRPC or MQ             │
