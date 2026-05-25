$baseFolder = Get-ChildItem "C:\Users\samirna.beltran\VELATIA" -Directory | Where-Object { $_.Name -like "*Sistemas de Gesti*n Integrados*Documentos*" }
if (-not $baseFolder) { Write-Host "Folder not found"; exit }

$operacionesPath = Join-Path $baseFolder.FullName "Operaciones"
$files = Get-ChildItem -Path $operacionesPath -Recurse -File | Where-Object { $_.FullName -match '2\. Interno' }

$report = @()

foreach ($file in $files) {
    # Extract Proceso from path: Operaciones\[Proceso]\2. Interno
    $pathParts = $file.FullName -split '\\'
    $operacionesIndex = [array]::IndexOf($pathParts, 'Operaciones')
    $proceso = 'Desconocido'
    if ($operacionesIndex -ge 0 -and $pathParts.Length -gt ($operacionesIndex + 1)) {
        $proceso = $pathParts[$operacionesIndex + 1]
    }
    
    # Extract Tipo Documental based on folder
    $tipo = 'Otro'
    if ($file.DirectoryName -match 'Procedimiento') { $tipo = 'Procedimiento' }
    elseif ($file.DirectoryName -match 'Formato') { $tipo = 'Formato' }
    elseif ($file.DirectoryName -match 'Manual') { $tipo = 'Manual' }
    elseif ($file.DirectoryName -match 'Caracterizaci') { $tipo = 'Caracterización' }
    
    $obj = [PSCustomObject]@{
        'Proceso' = $proceso
        'Tipo Documental' = $tipo
        'Nombre del Documento' = $file.Name
        'Ruta Completa' = $file.FullName
        'Extensión' = $file.Extension
        'Fecha de Modificación' = $file.LastWriteTime.ToString('yyyy-MM-dd HH:mm')
        'Responsable' = 'Sin asignar'
        'Objetivo' = 'Extracción automática pendiente'
        'Versión' = 'N/A'
        'Fecha Doc' = 'N/A'
        'Descripción del Documento' = 'Requiere análisis avanzado (NLP)'
    }
    $report += $obj
}

$csvPath = 'C:\Users\samirna.beltran\Desktop\Reporte_Documental.csv'
$report | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
Write-Host "Report generated at: $csvPath"
$report | Select-Object -First 5
