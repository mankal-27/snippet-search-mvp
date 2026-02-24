# 🚀 Snippet Search Engine (Backend API)

A robust, fully containerized backend architecture for managing and fuzzy-searching code snippets. Built to support high-speed developer workflows, this API utilizes PostgreSQL as the primary source of truth and Elasticsearch for advanced text-scoring and fuzzy matching.



## 🛠 Tech Stack

* **Server:** Node.js, Express.js
* **Primary Database:** PostgreSQL 14
* **Search Engine:** Elasticsearch 7.17
* **Validation & Security:** Zod (Schema Validation), JWT (Authentication)
* **Infrastructure:** Docker & Docker Compose (with persistent volume mounts)

## ✨ Key Features

* **Containerized Environment:** Run the entire API, Postgres, and Elasticsearch locally with a single command. No manual database installations required.
* **Fuzzy Search:** Elasticsearch integration allows for typo-tolerant, lightning-fast code retrieval based on relevancy scores.
* **Hot-Reloading:** Configured with Nodemon and Docker bind-mounts for seamless local development.
* **Strict Validation:** All incoming payloads are strictly verified via Zod to prevent malicious injections.

## 🚦 Getting Started

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running.

### 1. Setup Environment
Clone the repository and create a `.env` file in the root directory:

```
env
PORT=3000
DATABASE_URL=postgres://postgres:password@postgres:5432/snippet_search
ELASTICSEARCH_URL=http://elasticsearch:9200
JWT_SECRET=your_super_secret_dev_key
```
### 2. Boot the Infrastructure
Start the API, PostgreSQL, and Elasticsearch containers in the background:

```
docker-compose up -d --build
```

### 3. Initialize the Database
Run the initialization script inside the container to create your PostgreSQL tables (you only need to do this once):
```
docker-compose exec api node db/init.js
```
The API is now fully operational and listening at http://localhost:3000.

## 📖 Core API Endpoints
| Method | Endpoint                     | Description                                      |
|--------|------------------------------|--------------------------------------------------|
| POST   | /api/auth/test-token         | Generate a local testing JWT.                    |
| POST   | /api/snippets                | Save a new code snippet.                         |
| GET    | /api/search?q={query}        | Retrieve fuzzy-matched snippets via Elasticsearch. |
| DELETE | /api/snippets/:id            | Delete a specific snippet.                       |

## 🛑 Shutting Down
To safely stop the environment without losing your database data:
```
docker-compose down
```