import { redis } from "../config/redis.config.js";
import { nanoid } from "nanoid";
import { consumePaste } from "../utils/consume_paste.js";


export const createPaste = async (req, res) => {
  const { content, ttl_seconds, max_views } = req.body;

  if (typeof content !== "string" || content.trim() === "") {
    return res.status(400).json({ error: "content is required" });
  }

  if (
    ttl_seconds !== undefined &&
    (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
  ) {
    return res.status(400).json({ error: "invalid ttl_seconds" });
  }

  if (
    max_views !== undefined &&
    (!Number.isInteger(max_views) || max_views < 1)
  ) {
    return res.status(400).json({ error: "invalid max_views" });
  }

  const id = nanoid();
  const createdAt = Date.now();
  const expiresAtMs = ttl_seconds ? createdAt + ttl_seconds * 1000 : null;

  const key = `paste:${id}`;

  await redis.hset(key, {
    content,
    expiresAtMs: expiresAtMs ?? "",
    maxViews: max_views ?? "",
    viewsUsed: 0,
  });

  if (ttl_seconds) {
    await redis.expire(key, ttl_seconds + 300);
  }

  res.json({
    id,
    url: `${process.env.BASE_URL}/p/${id}`,
  });
};

export const getPaste = async (req, res) => {
  const result = await consumePaste(req.params.id, req);

  if (result.error) {
    return res.status(404).json({ error: result.error });
  }

  res.json(result);
};


export const htmlPasteView = async (req, res) => {
  const result = await consumePaste(req.params.id, req);

  if (result.error) {
    const message = {
      not_found: "Paste not found.",
      expired: "This paste has expired.",
      view_limit_exceeded: "This paste has reached its view limit.",
    }[result.error];

    return res.status(404).send(`
      <html>
        <body>
          <h2>${message}</h2>
        </body>
      </html>
    `);
  }

  res.setHeader("Content-Type", "text/html");
  res.send(`
    <html>
      <body>
        <pre>${escapeHtml(result.content)}</pre>
      </body>
    </html>
  `);
};

export const htmlCreateView = async (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pastebin Lite</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      padding: 40px;
    }
    .box {
      max-width: 700px;
      margin: auto;
      background: #fff;
      padding: 20px;
      border: 1px solid #ddd;
    }
    textarea {
      width: 100%;
      height: 200px;
      margin-bottom: 10px;
    }
    input {
      width: 100%;
      margin-bottom: 10px;
      padding: 6px;
    }
    button {
      padding: 8px 16px;
      cursor: pointer;
    }
    .result {
      margin-top: 15px;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="box">
    <h2>Create Paste</h2>

    <textarea id="content" placeholder="Paste your text here..."></textarea>

    <input id="ttl" type="number" placeholder="TTL seconds (optional)" />
    <input id="views" type="number" placeholder="Max views (optional)" />

    <button onclick="createPaste()">Create</button>

    <div class="result" id="result"></div>
  </div>

  <script>
    async function createPaste() {
      const content = document.getElementById("content").value;
      const ttl = document.getElementById("ttl").value;
      const views = document.getElementById("views").value;

      const payload = { content };
      if (ttl) payload.ttl_seconds = Number(ttl);
      if (views) payload.max_views = Number(views);

      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        document.getElementById("result").innerText =
          data.error || "Error creating paste";
        return;
      }

      document.getElementById("result").innerHTML =
        'Paste URL: <a href="' + data.url + '" target="_blank">' + data.url + '</a>';
    }
  </script>
</body>
</html>
  `);
}

function escapeHtml(str) {
  return str.replace(
    /[&<>"']/g,
    (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
      m
    ])
  );
}

export const checkHealth = async (req, res) => {
  try {
    await redis.ping();
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
};
