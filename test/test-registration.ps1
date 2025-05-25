$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$testData = @{
    firstName = "Test"
    lastName = "User"
    email = "test$timestamp@example.com"
    password = "password123"
    username = "testuser$timestamp"
} | ConvertTo-Json

Write-Host "Testing registration with timestamp: $timestamp"
Write-Host "Data: $testData"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method Post -Body $testData -ContentType "application/json"
    Write-Host "Registration successful!"
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)"
} catch {
    Write-Host "Registration failed!"
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
