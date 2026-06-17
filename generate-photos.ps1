# generate-photos.ps1
# Run this script in PowerShell from the project root to update photos/photos.json when you add/remove photos.

$photosDir = Join-Path $PSScriptRoot "photos"
$outputFile = Join-Path $photosDir "photos.json"

# Create photos directory if it doesn't exist
if (-not (Test-Path $photosDir)) {
    New-Item -ItemType Directory -Path $photosDir | Out-Null
    Write-Host "Created photos/ directory."
}

# Scan for common image formats
$extensions = @("*.jpg", "*.jpeg", "*.png", "*.webp", "*.gif")
$files = Get-ChildItem -Path $photosDir -Include $extensions -Recurse | Select-Object -ExpandProperty Name

# Exclude photos.json if it matched somehow (it shouldn't)
$files = $files | Where-Object { $_ -ne "photos.json" }

# Convert to JSON array
if ($null -eq $files) {
    $json = "[]"
} else {
    $json = ConvertTo-Json @($files) -Compress
}

# Write to output file
Set-Content -Path $outputFile -Value $json -Encoding UTF8
Write-Host "Updated $outputFile with $($files.Count) photos."
Write-Host "Photos list: $json"
