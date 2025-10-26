FROM python:3.11-slim
ENV DATABASE_URL=postgresql://test:test@host/db
CMD ["sh", "-c", "echo $DATABASE_URL"]
