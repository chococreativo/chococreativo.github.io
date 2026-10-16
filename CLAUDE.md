# CLAUDE.md

@/mnt/project-files/blueprint.md

## Blueprint del proyecto
- El blueprint de arriba es `/mnt/project-files/blueprint.md`, en la carpeta compartida del proyecto. Léelo antes de proponer o tocar nada.
- No va en el repositorio: está en `.gitignore`. Nunca lo subas.
- Si no carga (por ejemplo, en una sesión sin la carpeta compartida), dilo y no lo reconstruyas de memoria.

## Cuándo reescribirlo
- **Al terminar un paso:** pásalo a la sección 4, deja la 2 al día, quítalo de la 6 y agrega el siguiente si ya se sabe.
- **Al fallar un intento:** agrega una línea en la 5. También cuenta cuando Edgar descarta una propuesta.
- **Al cambiar el objetivo:** reescribe la 1 y revisa la 2, la 3 y la 6 para que concuerden. Lo que ya no sirva sale de la 6. La 5 no se borra.
- **Al cerrar la sesión** (cuando Edgar se despide o deja el trabajo por hoy): repasa las seis secciones y deja la 2 como está en ese momento.
- Cada vez que lo reescribas, actualiza la línea `Actualizado` con la fecha y la hora de Barranquilla (America/Bogota).

## Cómo se llena
- Los seis encabezados van exactos y en el mismo orden. No agregues secciones.
- Solo lo que se puede ver en el proyecto. Si algo no se sabe, va vacío: un hueco es mejor que una suposición.
- Sección 2: un estado ("el login ya corre, falta el correo de confirmación"), no el relato de cómo se llegó ahí.
- Sección 3: una línea por archivo, con la ruta y para qué sirve. Sin código.
- Sección 5: cada línea con este formato:
  `- [AAAA-MM-DD] Probé <qué> para <qué buscaba> → falló porque <qué pasó>. No repetir.`
- Sección 6: máximo cinco pasos, y cada uno nombra un archivo.
- Antes de escribir, vuelve a leer el archivo, porque otra sesión pudo cambiarlo. Haz cambios pequeños y revisa después que quedaron.
