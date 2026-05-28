Add-Type -AssemblyName System.Drawing

$srcPath = "c:\Users\Usuario\Desktop\Proyectos\Promociones\public\logoMercurio.png"
$destPath = "c:\Users\Usuario\Desktop\Proyectos\Promociones\public\logoMercurio.png"

if (-not (Test-Path $srcPath)) {
    Write-Host "Error: No se encontró logoMercurio.png en $srcPath" -ForegroundColor Red
    exit
}

try {
    # Cargar la imagen original
    # Usamos [System.Drawing.Image]::FromFile pero para evitar bloqueo de archivo
    # leemos los bytes y creamos un stream para poder sobreescribir el archivo original
    $fileBytes = [System.IO.File]::ReadAllBytes($srcPath)
    $ms = New-Object System.IO.MemoryStream(,$fileBytes)
    $original = [System.Drawing.Image]::FromStream($ms)
    
    $width = $original.Width
    $height = $original.Height
    Write-Host "Imagen original: ${width}x${height} px"

    # Obtener el color de fondo del píxel superior izquierdo (0, 0)
    $bmpTmp = New-Object System.Drawing.Bitmap($original)
    $bgColor = $bmpTmp.GetPixel(0, 0)
    $bmpTmp.Dispose()
    Write-Host "Color de fondo detectado (A,R,G,B): $($bgColor.A),$($bgColor.R),$($bgColor.G),$($bgColor.B)"

    # El tamaño del cuadrado será el ancho de la imagen original
    $squareSize = $width

    # Crear imagen intermedia cuadrada
    $squareBmp = New-Object System.Drawing.Bitmap($squareSize, $squareSize)
    $g = [System.Drawing.Graphics]::FromImage($squareBmp)
    
    # Configurar calidad
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Limpiar con el color de fondo detectado
    $g.Clear($bgColor)

    # Dibujar la imagen centrada verticalmente
    $yOffset = [math]::Round(($squareSize - $height) / 2)
    $g.DrawImage($original, 0, $yOffset, $width, $height)

    # Escalar a 512x512 para un rendimiento y peso óptimo en móviles
    $finalBmp = New-Object System.Drawing.Bitmap(512, 512)
    $gFinal = [System.Drawing.Graphics]::FromImage($finalBmp)
    $gFinal.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gFinal.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gFinal.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $gFinal.Clear($bgColor)
    $gFinal.DrawImage($squareBmp, 0, 0, 512, 512)

    # Liberar recursos de lectura
    $original.Dispose()
    $ms.Dispose()
    $g.Dispose()
    $squareBmp.Dispose()
    $gFinal.Dispose()

    # Guardar sobreescribiendo el archivo
    $finalBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $finalBmp.Dispose()

    Write-Host "¡El logo fue convertido a cuadrado (512x512 px) y guardado con éxito en $destPath!" -ForegroundColor Green
} catch {
    Write-Host "Ocurrió un error al procesar la imagen: $_" -ForegroundColor Red
}
