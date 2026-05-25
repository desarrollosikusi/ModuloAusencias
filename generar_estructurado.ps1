$baseFolder = Get-Item "C:\Users\samirna.beltran\VELATIA\Sistemas de Gestión Integrados (SGI) Colombia - Documentos\Operaciones"
$report = New-Object System.Collections.ArrayList

function Process-Folder {
    param([System.IO.DirectoryInfo]$dir, $proceso)
    
    $subDirs = $dir.GetDirectories()
    $files = $dir.GetFiles()
    
    # Calculate carpetaInterna
    $relativePath = $dir.FullName.Substring($baseFolder.FullName.Length + 1)
    $parts = $relativePath -split '\\'
    $carpetaInterna = if ($parts.Length -gt 1) { ($parts[1..($parts.Length-1)]) -join '/' } else { "" }
    
    if ($subDirs.Count -eq 0) {
        # Leaf directory
        if ($files.Count -eq 0) {
            $obj = [PSCustomObject]@{
                Proceso = $proceso
                Carpeta = $carpetaInterna
                Documento = $null
                Ruta = $dir.FullName
                Fecha = $null
            }
            [void]$report.Add($obj)
        } else {
            foreach ($f in $files) {
                $obj = [PSCustomObject]@{
                    Proceso = $proceso
                    Carpeta = $carpetaInterna
                    Documento = $f.Name
                    Ruta = $f.FullName
                    Fecha = $f.LastWriteTime.ToString('yyyy-MM-dd')
                }
                [void]$report.Add($obj)
            }
        }
    } else {
        # Non-leaf directory
        if ($files.Count -gt 0) {
            foreach ($f in $files) {
                $obj = [PSCustomObject]@{
                    Proceso = $proceso
                    Carpeta = $carpetaInterna
                    Documento = $f.Name
                    Ruta = $f.FullName
                    Fecha = $f.LastWriteTime.ToString('yyyy-MM-dd')
                }
                [void]$report.Add($obj)
            }
        }
        foreach ($subDir in $subDirs) {
            Process-Folder -dir $subDir -proceso $proceso
        }
    }
}

foreach ($procesoDir in $baseFolder.GetDirectories()) {
    Process-Folder -dir $procesoDir -proceso $procesoDir.Name
}

$report | Export-Csv -Path 'C:\Users\samirna.beltran\gestion_ausencias\Reporte_Documental_Estructurado.csv' -NoTypeInformation -Encoding UTF8
