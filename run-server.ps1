# run-server.ps1
# Double-click or run in PowerShell to start a local web server on http://localhost:3000

$port = 3000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

Write-Host "--------------------------------------------------------"
Write-Host "   MuddyBoard Local Web Server (Zero Dependencies)     "
Write-Host "--------------------------------------------------------"

try {
    $listener.Start()
    Write-Host "Server successfully started on http://localhost:$port/"
    Write-Host "Press Ctrl+C in this window to stop the server."
    Write-Host "--------------------------------------------------------"
    
    # Automatically open local browser
    Start-Process "http://localhost:$port/"
} catch {
    Write-Host "ERROR: Could not start the server. Is port $port already in use?"
    Write-Host $_.Exception.Message
    Exit
}

# Keep serving requests
while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response

        $urlPath = $req.Url.LocalPath
        if ($urlPath -eq "/" -or $urlPath -eq "") {
            $urlPath = "/index.html"
        }

        # Normalize windows path separators
        $subPath = $urlPath.Replace("/", "\").TrimStart("\")
        $localFile = Join-Path $PSScriptRoot $subPath

        # Check if file exists
        if (Test-Path $localFile -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localFile).ToLower()
            
            # Map Content-Type MIME headers (critical for ES modules)
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".webp" { "image/webp" }
                ".gif"  { "image/gif" }
                ".svg"  { "image/svg+xml" }
                default { "application/octet-stream" }
            }
            
            $res.ContentType = $mime
            
            # Read and output binary data (supports photos and images correctly)
            $bytes = [System.IO.File]::ReadAllBytes($localFile)
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            # 404 handler
            $res.StatusCode = 404
            $res.ContentType = "text/plain"
            $bytes = [System.Text.Encoding]::UTF8.GetBytes("File Not Found: $urlPath")
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        $res.OutputStream.Close()
    } catch {
        # Handle connection drops gracefully
    }
}
