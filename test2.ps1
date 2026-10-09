$body = @{ tenDangNhap="bs_an"; matKhau="Medicare@123" } | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:8082/api/auth/login" -Method Post -ContentType "application/json" -Body $body -SessionVariable session
Write-Host "Login Status: " $response.StatusCode
Write-Host "Login Body: " $response.Content

$response2 = Invoke-WebRequest -Uri "http://localhost:8082/api/doctor/medical-record/LK007" -WebSession $session
Write-Host "Record Status: " $response2.StatusCode
Write-Host "Record Body: " $response2.Content

# Test wrong ID
try {
    $response3 = Invoke-WebRequest -Uri "http://localhost:8082/api/doctor/medical-record/LK999" -WebSession $session
} catch {
    Write-Host "Wrong ID Error: " $_.Exception.Response.StatusCode
}

# Test unauthenticated
try {
    $response4 = Invoke-WebRequest -Uri "http://localhost:8082/api/doctor/medical-record/LK007"
} catch {
    Write-Host "Unauth Error: " $_.Exception.Response.StatusCode
}
