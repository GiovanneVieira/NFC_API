param(
  [Parameter(Mandatory = $true)]
  [string]$Name
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$delphiRoot = (Resolve-Path (Join-Path $repoRoot '..\delphi-ai')).Path

$template = Join-Path $delphiRoot 'templates\todo_template.md'
if (-not (Test-Path $template)) {
  throw "Template nao encontrado: $template"
}

$safeName = ($Name -replace '[^a-zA-Z0-9\-_\/]', '-').ToLowerInvariant()
$relativeTarget = "foundation_documentation\todos\active\$safeName.md"
$target = Join-Path $repoRoot $relativeTarget
$targetDir = Split-Path -Parent $target

New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

if (Test-Path $target) {
  throw "TODO ja existe: $relativeTarget"
}

Copy-Item -Path $template -Destination $target
Write-Host "TODO criado em: $relativeTarget"
