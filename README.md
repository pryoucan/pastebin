minimal application that allows users to create text pastes and share a link to view them.
Pastes can optionally expire based on time-to-live (TTL) or a maximum number of views.

Deployed Link: https://pastebin-three-lake.vercel.app

**Features**

- Create a paste containing arbitrary text

- Receive a shareable URL for the paste

- View the paste via a public HTML page

**Optional constraints:**

- Time-based expiry (TTL)

- View-count limit

- Once a constraint is triggered, the paste becomes unavailable (HTTP 404)

**Deployed on Vercel**

**- API Endpoints**

Health Check
GET /api/healthz

Response:

{ "ok": true }

Create a Paste
POST /api/pastes


Request body:

{
  "content": "string",
  "ttl_seconds": 60,
  "max_views": 5
}

Response:

{
  "id": "string",
  "url": "https://<domain>/p/<id>"
}

Fetch a Paste (API)
GET /api/pastes/:id


Response:

{
  "content": "string",
  "remaining_views": 4,
  "expires_at": "2026-01-01T00:00:00.000Z"
}


Each successful fetch counts as a view.

Unavailable pastes return HTTP 404.

View a Paste (HTML)
GET /p/:id


Returns an HTML page containing the paste content

Paste content is safely escaped

Viewing the page consumes one view

Returns HTTP 404 if unavailable

Deterministic Time Testing

For automated tests, deterministic expiry is supported. If the environment variable TEST_MODE=1 is set: The request header x-test-now-ms (milliseconds since epoch) is used as the current time for expiry logic

If the header is absent, real system time is used

Persistence Layer

Redis is used as the persistence layer.

Provider: Upstash

Connection type: REST (HTTP-based)

Reason: Works reliably in serverless environments such as Vercel and persists data across requests

Running Locally
Prerequisites

Node.js 18 or higher

An Upstash Redis database

Environment Variables

Create a .env file:

UPSTASH_REDIS_REST_URL=your_upstash_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token
BASE_URL=http://localhost:3000

Install Dependencies
npm install

Start the Server
npm start


The server will run on:

http://localhost:3000

Deployment

The application is deployed on Vercel using the Node runtime.

Environment variables are configured in the Vercel dashboard:

- UPSTASH_REDIS_REST_URL

- UPSTASH_REDIS_REST_TOKEN

- BASE_URL
