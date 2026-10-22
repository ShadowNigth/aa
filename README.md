# Bloque

Sandbox 3D voxel original creado con Three.js: mundo procedural por semilla, biomas, texturas pixeladas generadas por código, 4 criaturas con IA sencilla, ciclo día/noche, física de movimiento y colisión, 42 bloques colocables y 17 recetas. No incluye código fuente ni texturas propietarias de Minecraft; implementa sistemas propios y ampliables.

## Ejecutar

```bash
npm install
npm run dev
```

## Controles

- **WASD / flechas:** moverse; **Espacio:** saltar.
- **Arrastrar con el ratón:** girar la cámara; **rueda:** acercar o alejar.
- **Clic:** minar; **Mayús + clic** o **B** para alternar el modo de colocar.
- **1–8:** elegir la barra rápida; **I:** inventario y taller; **Esc:** cerrar.
- En pantallas táctiles aparecen controles en pantalla.
- El botón de dado crea otra isla con una semilla nueva.

Mina para recoger materiales y fabrica objetos desde **Inventario y taller**. El mundo y las cantidades se guardan en este navegador; **Guardar mundo** descarga un `.json`, que puedes importar desde el inventario.

## Compilar

```bash
npm run build
```
