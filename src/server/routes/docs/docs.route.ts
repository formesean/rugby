import { OpenAPIHono } from "@hono/zod-openapi";

const router = new OpenAPIHono();

router.get("/", (c) => {
  if (process.env.NODE_ENV !== "development") return c.notFound();
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rugby API Documentation</title>
</head>
<body>
  <div id="app"></div>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  <script>
    Scalar.createApiReference('#app', {
      url: '/api/openapi.json',
    })
  </script>
</body>
</html>`;

  return c.html(html);
});

export default router;
