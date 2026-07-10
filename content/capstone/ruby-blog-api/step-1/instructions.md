# Step 1 — Health endpoint

This is the first ticket on the board: get a bare Ruby HTTP server running
and reachable before any database logic exists. Every later step assumes
your server is already listening and healthy, so this is the smoke test
the rest of the capstone builds on.

Your session has no bundled web framework — only the `pg` gem is
pre-installed, and there's no network access to fetch anything else per
redeploy. Notably, `webrick` is **not** available either: since Ruby 3.0 it
shipped as a bundled gem rather than a default one, and it was never
installed in this image. Build directly on `Socket`/`TCPServer` from the
standard library instead — it ships with every Ruby install, no gem
required.

## The task

Add a handler for `GET /health` that returns a JSON response with status
`200` and this exact body:

```json
{ "status": "ok" }
```

Sample request/response:

```
GET /health

200 OK
Content-Type: application/json

{"status":"ok"}
```

A minimal server shape to build on for the rest of the capstone:

```ruby
require "socket"
require "json"

server = TCPServer.new(8080)

loop do
  client = server.accept
  request_line = client.gets
  next unless request_line

  method, full_path, = request_line.split(" ")
  path, _query = full_path.split("?", 2)

  headers = {}
  while (line = client.gets) && line != "\r\n"
    key, value = line.split(":", 2)
    headers[key.downcase] = value.strip
  end

  body = ""
  if (len = headers["content-length"])
    body = client.read(len.to_i)
  end

  status, response_body = if method == "GET" && path == "/health"
    [200, { status: "ok" }.to_json]
  else
    [404, { error: "not found" }.to_json]
  end

  reason = { 200 => "OK", 404 => "Not Found" }.fetch(status, "")
  client.print "HTTP/1.1 #{status} #{reason}\r\n"
  client.print "Content-Type: application/json\r\n"
  client.print "Content-Length: #{response_body.bytesize}\r\n"
  client.print "\r\n"
  client.print response_body
  client.close
end
```

This is a single-threaded, sequential accept loop — one request is fully
handled before the next connection is accepted. That's sufficient here:
this API has no long-running requests, and the grading checks issue
requests one at a time.

Your entrypoint is `main.rb`, run via `ruby main.rb` — plain interpretation,
no build or compile step, so every redeploy just re-executes this file.

Requirements:

- The server must listen on port `8080`.
- No database connection is required for this step — this is a pure
  smoke test for your server setup.
- The response body must be valid JSON with a `status` key whose value is
  exactly `"ok"` (case-sensitive).
