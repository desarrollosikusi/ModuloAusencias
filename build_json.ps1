$baseSGI = "C:\Users\samirna.beltran\VELATIA\Sistemas de Gestión Integrados (SGI) Colombia - Documentos"
$report = New-Object System.Collections.ArrayList
$global:next_id = 1

function Process-Directory {
    param([System.IO.DirectoryInfo]$dir, $intranet, $proceso, $baseDir)
    
    $subDirs = $dir.GetDirectories()
    $files = $dir.GetFiles()
    
    # Calculate carpetaInterna
    $relativePath = $dir.FullName.Substring($baseDir.FullName.Length + 1)
    $parts = $relativePath -split '\\'
    $carpetaInterna = if ($parts.Length -gt 1) { ($parts[1..($parts.Length-1)]) -join '/' } else { "" }
    
    # If Financiera, there's no proceso folder, so $parts[0] is the first folder (like '1. Publico')
    if ($intranet -eq 'Financiera') {
        $carpetaInterna = $relativePath -replace '\\', '/'
    }

    if ($subDirs.Count -eq 0) {
        if ($files.Count -eq 0) {
            $obj = @{
                id = $global:next_id++
                intranet = $intranet
                proceso = $proceso
                carpeta = $carpetaInterna
                documento = $null
                version = "-"
                fecha = "-"
                descripcion = "-"
            }
            [void]$report.Add($obj)
        } else {
            foreach ($f in $files) {
                if ($f.Name.StartsWith('~') -or $f.Name.StartsWith('.')) { continue }
                $obj = @{
                    id = $global:next_id++
                    intranet = $intranet
                    proceso = $proceso
                    carpeta = $carpetaInterna
                    documento = $f.Name
                    version = "-"
                    fecha = $f.LastWriteTime.ToString('yyyy-MM-dd')
                    descripcion = "-"
                }
                [void]$report.Add($obj)
            }
        }
    } else {
        if ($files.Count -gt 0) {
            foreach ($f in $files) {
                if ($f.Name.StartsWith('~') -or $f.Name.StartsWith('.')) { continue }
                $obj = @{
                    id = $global:next_id++
                    intranet = $intranet
                    proceso = $proceso
                    carpeta = $carpetaInterna
                    documento = $f.Name
                    version = "-"
                    fecha = $f.LastWriteTime.ToString('yyyy-MM-dd')
                    descripcion = "-"
                }
                [void]$report.Add($obj)
            }
        }
        foreach ($subDir in $subDirs) {
            Process-Directory -dir $subDir -intranet $intranet -proceso $proceso -baseDir $baseDir
        }
    }
}

# 1. Process Operaciones
$opFolder = Get-Item (Join-Path $baseSGI "Operaciones")
if ($opFolder.Exists) {
    foreach ($procesoDir in $opFolder.GetDirectories()) {
        Process-Directory -dir $procesoDir -intranet "Operaciones" -proceso $procesoDir.Name -baseDir $opFolder
    }
}

# 2. Process Financiera
$finFolder = Get-Item (Join-Path $baseSGI "Financiera")
if ($finFolder.Exists) {
    # Financiera has no Proceso subfolders. The direct children are the carpetas (1. Publico, 2. Interno).
    # We will map "proceso" = "Financiera" or just "General".
    foreach ($folder in $finFolder.GetDirectories()) {
        Process-Directory -dir $folder -intranet "Financiera" -proceso "Financiera" -baseDir $finFolder
    }
}

$json = $report | ConvertTo-Json -Depth 10 -Compress
[System.IO.File]::WriteAllText('C:\Users\samirna.beltran\gestion_ausencias\frontend\src\documentos.json', $json, [System.Text.Encoding]::UTF8)
Write-Host "Generated JSON with $($report.Count) entries."
