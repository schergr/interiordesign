# Interior Design Platform

This repository provides a starting point for an interior design platform. It contains a Flask backend and a Postgres database bundled together using Docker Compose. The backend exposes CRUD endpoints for many resources and now includes simple import/export helpers. A Next.js frontend offers a small dashboard and management screens.

## Running locally

Ensure you have Docker and Docker Compose installed. Build and start the stack using:

```bash
docker-compose up --build
```

The API will be available on port `5000` and the database on port `5432` inside the container network.
The Next.js frontend will be served on port `3000`.
The backend waits for the database to become available, so you may see connection attempts for a few seconds when starting the stack.
The `frontend` service mounts `/app/node_modules` as a volume so dependencies aren't lost when the source directory is mounted.

To work on the frontend independently:

```bash
cd frontend
npm install
npm run dev
```

To run the unit tests locally:

```bash
cd backend
pip install -r requirements.txt
pytest
```

## Data import and export

Each resource can be exported as JSON via `/export/<model>` and imported using
`/import/<model>`. The model name matches the plural form used by the normal
endpoints (e.g. `vendors`, `clients`).

## Environment

The application expects a `DATABASE_URL` environment variable which is already configured in `docker-compose.yml`. You can copy `.env.example` to `.env` and adjust it for other environments.

## Deploying to k3s

These manifests are designed for a k3s cluster (which uses Traefik by default).
Build and push the Docker images for `backend` and `frontend` to a registry
accessible by your cluster, then apply the manifests:

```bash
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
```

The frontend will be reachable via the ingress host `ids.212southadvisors.com`.
