# ================================================================
# ExamHub Tanzania — Force Pull (fixes stale local files)
# Run this in PowerShell when git pull fails or shows old code
#   cd "C:\Users\DELL\Documents\EXAMS HUB"
#   .\ExamHub-Force-Pull.ps1
# ================================================================

$base = "C:\Users\DELL\Documents\EXAMS HUB"
Set-Location $base
Write-Host ""
Write-Host "ExamHub Tanzania — Force Pull from GitHub" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Stash any local changes (don't lose them)
Write-Host "Step 1: Stashing local changes..." -ForegroundColor Yellow
git stash push -m "auto-stash before force pull $(Get-Date -Format 'yyyy-MM-dd HH:mm')" 2>&1

# 2. Fetch latest from origin
Write-Host "Step 2: Fetching latest from GitHub..." -ForegroundColor Yellow
git fetch origin 2>&1

# 3. Hard reset to origin/main (gets EXACTLY what's in GitHub)
Write-Host "Step 3: Resetting to origin/main..." -ForegroundColor Yellow
git reset --hard origin/main 2>&1

# 4. Clean untracked files (removes old generated files)
Write-Host "Step 4: Cleaning untracked files..." -ForegroundColor Yellow
git clean -fd --exclude=".env" --exclude="node_modules" 2>&1

# 5. Verify key files are real Supabase (not demo)
Write-Host ""
Write-Host "Step 5: Verifying Supabase connection..." -ForegroundColor Yellow
$phase1 = Get-Content "src\pages\Phase1-Landing-Auth.jsx" -Raw
if ($phase1 -match "Connect Supabase") {
  Write-Host "  ✗ Phase1 still has demo code! Pull failed." -ForegroundColor Red
} elseif ($phase1 -match "supabase.auth.signInWithPassword") {
  Write-Host "  ✓ Phase1 uses real Supabase Auth" -ForegroundColor Green
}

# 6. Check .env exists
Write-Host ""
Write-Host "Step 6: Checking .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
  $env = Get-Content ".env" -Raw
  if ($env -match "VITE_SUPABASE_URL=https://klmmmkxanuvabcixnjrl") {
    Write-Host "  ✓ .env has correct Supabase URL" -ForegroundColor Green
  } else {
    Write-Host "  ✗ .env missing or wrong URL — recreating..." -ForegroundColor Red
    $envContent = @"
# ExamHub Tanzania — Environment Variables
VITE_SUPABASE_URL=https://klmmmkxanuvabcixnjrl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbW1ta3hhbnV2YWJjaXhuanJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NDk5MTgsImV4cCI6MjA5OTAyNTkxOH0.mtsmb_1vfIOavRfN5-Lf5o68JDCN5bCEdyB1KeMUnfk
VITE_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbW1ta3hhbnV2YWJjaXhuanJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzQ0OTkxOCwiZXhwIjoyMDk5MDI1OTE4fQ.qFdec6yqkjI_uyjjscw8q1CE0zdK20lvcDL09RKoCnw
VITE_SUPABASE_PUBLISHABLE=sb_publishable_LEoa31eXkSXQloklmtYG0Q_fUhcBGXI
VITE_APP_NAME=ExamHub Tanzania
VITE_APP_URL=http://localhost:3000
VITE_TSID_ANON_KEY=
"@
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText("$base\.env", $envContent, $utf8NoBom)
    Write-Host "  ✓ .env recreated with Supabase keys" -ForegroundColor Green
  }
} else {
  Write-Host "  ✗ .env missing — creating it now..." -ForegroundColor Red
  $envContent = @"
VITE_SUPABASE_URL=https://klmmmkxanuvabcixnjrl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbW1ta3hhbnV2YWJjaXhuanJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NDk5MTgsImV4cCI6MjA5OTAyNTkxOH0.mtsmb_1vfIOavRfN5-Lf5o68JDCN5bCEdyB1KeMUnfk
VITE_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbW1ta3hhbnV2YWJjaXhuanJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzQ0OTkxOCwiZXhwIjoyMDk5MDI1OTE4fQ.qFdec6yqkjI_uyjjscw8q1CE0zdK20lvcDL09RKoCnw
VITE_SUPABASE_PUBLISHABLE=sb_publishable_LEoa31eXkSXQloklmtYG0Q_fUhcBGXI
VITE_APP_NAME=ExamHub Tanzania
VITE_APP_URL=http://localhost:3000
VITE_TSID_ANON_KEY=
"@
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText("$base\.env", $envContent, $utf8NoBom)
  Write-Host "  ✓ .env created" -ForegroundColor Green
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Done! Run: npm run dev" -ForegroundColor Green
Write-Host "  Open:     http://localhost:3000" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
