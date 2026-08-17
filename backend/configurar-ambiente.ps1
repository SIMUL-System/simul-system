$env:DB_URL="jdbc:postgresql://localhost:5432/simul_db"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="1234"

$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
$rng.Dispose()

$env:JWT_EXPIRATION_SECONDS="3600"

$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_USERNAME="simul.sistema@gmail.com"
$env:SMTP_PASSWORD="huxr jwcp kcxn ldcc"
$env:SMTP_FROM="simul.sistema@gmail.com"

$env:SIMUL_TIME_ZONE="America/Sao_Paulo"
$env:NOTIFICACAO_SCHEDULER_ENABLED="false"

Write-Host "Variáveis de ambiente do SIMUL configuradas com sucesso."