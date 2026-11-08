# Step 1 — Health endpoint

This is the first ticket on the board. You start a bare Ruby HTTP server
before any database logic exists. Every later step needs this server, so
this step is the smoke test for the capstone.

Your session has no web framework. The session has only the `pg` gem,
and it has no network access to get other gems. `webrick` is not
available either. Ruby 3.0 removed WEBrick from the standard library,
and this image does not have the gem. Use `Socket` and `TCPServer` from
the standard library. Every Ruby install has them.

## The task

Add a handler for `GET /health`. It returns status `200` and this exact
JSON body:

```json
{ "status": "ok" }
```

Sample request and response:

```
GET /health

200 OK
Content-Type: application/json

{"status":"ok"}
```

Use this minimal server as the base for the rest of the capstone:

```ruby
require "socket"
require "json"

server = TCPServer.new(8080)

loop do
  client = server.accept
  request_line = client.gets
  next unless request_line

  method, full_path, = request_line.split
  path, _query = full_path.split("?", 2)

  headers = {}
  while (line = client.gets) &&
        line != "\r\n"
    key, value = line.split(":", 2)
    headers[key.downcase] = value.strip
  end

  body = ""
  if (len = headers["content-length"])
    body = client.read(len.to_i)
  end

  if method == "GET" && path == "/health"
    status = 200
    response_body =
      { status: "ok" }.to_json
  else
    status = 404
    response_body =
      { error: "not found" }.to_json
  end

  reasons = { 200 => "OK",
              404 => "Not Found" }
  reason = reasons.fetch(status, "")
  size = response_body.bytesize
  client.print "HTTP/1.1 #{status} " \
               "#{reason}\r\n"
  client.print "Content-Type: " \
               "application/json\r\n"
  client.print "Content-Length: " \
               "#{size}\r\n"
  client.print "\r\n"
  client.print response_body
  client.close
end
```

This accept loop is single-threaded and sequential. The server handles
one request completely before it accepts the next connection. That is
enough here: this API has no long requests, and the checks send one
request at a time.

Your entrypoint is `main.rb`, and the platform runs it with
`ruby main.rb`. Ruby interprets the file directly. There is no build or
compile step, so each redeploy runs this file again.

Requirements:

- The server must listen on port `8080`.
- This step needs no database connection. It is only a smoke test for
  your server setup.
- The response body must be valid JSON. Its `status` key must have the
  value `"ok"` exactly (case-sensitive).
