# Deployment instructions for Railway:

# 1. Start by adding a PostgreSQL Service in your project.
# 2. Add two "GitHub Repo" services with the same repository.
# 3. For the Backend service:
#    - Root Directory: /backend
#    - Healthcheck path: /health
#    - Environment Variables:
#      - SPRING_PROFILES_ACTIVE: prod
#      - JWT_SECRET: (Add a secure long string)
#      - FRONTEND_URL: (The URL Railway gives your frontend once deployed)
# 4. For the Frontend service:
#    - Root Directory: /frontend
#    - Environment Variables (Variables are build-time args in the Dockerfile!):
#      - REACT_APP_API_URL: (The URL Railway gives your backend service)
