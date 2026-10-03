# COMUNI-AI — primera versión funcional

Esta es una primera versión de interfaz funcional para comenzar el desarrollo del proyecto de grado. Incluye navegación entre secciones, selección de perfil, pictogramas, frases, construcción de mensajes, sugerencias locales basadas en el historial, lectura en voz alta del navegador, traducción mediante un servicio externo y ajustes básicos de accesibilidad.

## Requisitos
- Node.js instalado (versión LTS recomendada).
- Visual Studio Code.

## Cómo ejecutarla
1. Descomprime `comuni-ai-inicial.zip`.
2. Abre la carpeta `comuni-ai` en Visual Studio Code.
3. Abre la terminal: **Terminal > New Terminal**.
4. Ejecuta:

   ```bash
   npm install
   npm run dev
   ```

5. Abre en el navegador la dirección local que muestre Vite (normalmente `http://localhost:5173`).

## Importante sobre el alcance actual
- Las sugerencias son una lógica local inicial que prioriza frases usadas anteriormente; todavía no es un modelo de IA entrenado.
- La traducción utiliza MyMemory y requiere internet. Es un servicio externo de demostración; debe revisarse su disponibilidad, límites y privacidad antes de una entrega formal.
- La voz utiliza la función de síntesis de voz del navegador y depende de las voces instaladas.
- Los datos del historial se guardan en el almacenamiento local del navegador; todavía no hay cuentas ni base de datos de servidor.
- El avatar, perfiles con permisos, backend, PostgreSQL, seguridad y evaluación formal quedan para siguientes avances.

## Siguiente paso del equipo
Validar este prototipo con el compañero de diseño, ajustar requisitos con el diagnóstico y luego integrar backend, base de datos y un motor de predicción evaluable.
