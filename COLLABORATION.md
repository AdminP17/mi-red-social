# Guía de Colaboración

Para trabajar en este proyecto en tu propia máquina, sigue estos pasos:

## 1. Prerrequisitos
Asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (versión 14 o superior)
- [Git](https://git-scm.com/)
- Una cuenta de AWS (si necesitas acceso al backend)

## 2. Configuración Inicial

### Clonar el repositorio
```bash
git clone https://github.com/AdminP17/mi-red-social.git
cd mi-red-social
```

### Instalar dependencias
Instala las librerías del proyecto:
```bash
npm install
```

### Instalar Amplify CLI
Necesitarás la herramienta de línea de comandos de Amplify:
```bash
npm install -g @aws-amplify/cli
```

## 3. Conectar con el Backend (Amplify)
Este paso es crucial para descargar la configuración de la nube (Cognito, API, Base de datos) a tu máquina.

Ejecuta:
```bash
amplify pull
```
- Se abrirá el navegador para iniciar sesión en AWS.
- Si no tienes acceso a la cuenta AWS del proyecto, pide al administrador que te cree un usuario IAM o te dé acceso a Amplify Studio.
- Sigue las instrucciones en la terminal (selecciona tu editor de texto, tipo de app 'javascript', framework 'react', etc.).

## 4. Ejecutar el Proyecto
Una vez que `amplify pull` termine exitosamente, se generará el archivo `src/aws-exports.js` (o `amplifyconfiguration.json`). Ahora puedes correr la app:

```bash
npm start
```
La aplicación debería abrirse en `http://localhost:3000`.

## Notas Importantes
- **NO subas** `src/aws-exports.js` o `amplifyconfiguration.json` al repositorio (ya están en .gitignore).
- Si haces cambios en el backend (schema.graphql), ejecuta `amplify push` para subir los cambios a la nube.
