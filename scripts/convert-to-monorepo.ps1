param(
  [switch]$Commit,
  [string]$CommitMessage = "chore: init monorepo"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Move-EmbeddedGitRepo {
  param(
    [Parameter(Mandatory = $true)]
    [string]$RepoDir,
    [Parameter(Mandatory = $true)]
    [string]$BackupName
  )

  $gitDir = Join-Path $RepoDir ".git"
  if (-not (Test-Path $gitDir)) {
    return
  }

  $backupRoot = Join-Path $root ".git-backup"
  if (-not (Test-Path $backupRoot)) {
    New-Item -ItemType Directory -Path $backupRoot | Out-Null
  }

  $dest = Join-Path $backupRoot $BackupName
  if (Test-Path $dest) {
    throw "Backup destination already exists: $dest"
  }

  Write-Host "Moving embedded repo '$gitDir' -> '$dest'"
  Move-Item -Path $gitDir -Destination $dest
}

Move-EmbeddedGitRepo -RepoDir (Join-Path $root "backend") -BackupName "backend.git"
Move-EmbeddedGitRepo -RepoDir (Join-Path $root "frontend") -BackupName "frontend.git"

if (-not (Test-Path (Join-Path $root ".git"))) {
  Write-Host "Initializing Git at repo root: $root"
  git init | Out-Null
}

git add -A
git status

if ($Commit) {
  git commit -m $CommitMessage
}

Write-Host ""
Write-Host "Next steps:"
Write-Host "  git remote add origin <YOUR_REPO_URL>"
Write-Host "  git branch -M main"
Write-Host "  git push -u origin main"

