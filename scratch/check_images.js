const fs = require('fs');
const path = require('path');

function checkImage(filename) {
  const filePath = path.join(__dirname, '..', 'public', filename);
  if (!fs.existsSync(filePath)) {
    console.log(`${filename} no existe.`);
    return;
  }
  const stats = fs.statSync(filePath);
  console.log(`${filename}:`);
  console.log(`  Tamaño: ${stats.size} bytes`);
  
  // Intentar leer las dimensiones leyendo la cabecera PNG
  const buffer = fs.readFileSync(filePath);
  if (buffer.toString('ascii', 1, 4) === 'PNG') {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    console.log(`  Tipo: PNG`);
    console.log(`  Dimensiones: ${width}x${height} px`);
    console.log(`  Relación de aspecto: ${(width/height).toFixed(2)}:1`);
  } else {
    console.log(`  Tipo: No es PNG o cabecera diferente`);
  }
}

checkImage('logoMercurio.png');
checkImage('logoMercurioBlanco.png');
