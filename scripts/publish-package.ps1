# UI Thing - NPM Publishing Script (PowerShell)

Write-Host "📦 UI Thing - NPM Publishing Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if logged in to NPM
Write-Host "🔐 Checking NPM authentication..." -ForegroundColor Yellow
try {
    $npmUser = npm whoami 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ You are not logged in to NPM" -ForegroundColor Red
        Write-Host "Please run: npm login" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Logged in as: $npmUser" -ForegroundColor Green
} catch {
    Write-Host "❌ Error checking NPM authentication" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check for uncommitted changes
Write-Host "🔍 Checking for uncommitted changes..." -ForegroundColor Yellow
$gitStatus = git status -s
if ($gitStatus) {
    Write-Host "⚠️  Warning: You have uncommitted changes" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne 'y') {
        exit 1
    }
}

Write-Host ""

# Build the CLI
Write-Host "🔨 Building the CLI..." -ForegroundColor Yellow
bun run build:cli
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ CLI build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ CLI built successfully" -ForegroundColor Green
Write-Host ""

# Dry run
Write-Host "🧪 Running dry-run..." -ForegroundColor Yellow
npm publish --dry-run
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Dry run failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Dry run successful" -ForegroundColor Green
Write-Host ""

# Confirm publishing
$confirm = Read-Host "Ready to publish to NPM? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "❌ Publishing cancelled" -ForegroundColor Red
    exit 1
}

# Publish
Write-Host ""
Write-Host "🚀 Publishing to NPM..." -ForegroundColor Cyan
npm publish --access public

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 Package published successfully!" -ForegroundColor Green
    Write-Host ""
    
    $version = (Get-Content package.json | ConvertFrom-Json).version
    
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Create a git tag: git tag v$version" -ForegroundColor White
    Write-Host "  2. Push the tag: git push --tags" -ForegroundColor White
    Write-Host "  3. Create a GitHub release" -ForegroundColor White
    Write-Host "  4. Update documentation" -ForegroundColor White
} else {
    Write-Host "❌ Publishing failed" -ForegroundColor Red
    exit 1
}
