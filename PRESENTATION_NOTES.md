# Proyecto Red Social - Guía Técnica para Presentación

Este documento detalla la arquitectura, el flujo de datos y las tecnologías utilizadas en el proyecto "Red Social", diseñado para explicar cómo funciona una aplicación moderna serverless en AWS.

## 1. Visión General del Proyecto
Es una aplicación de red social completa que permite a los usuarios registrarse, publicar contenido (texto e imágenes), seguir a otros usuarios, dar "me gusta", comentar y chatear en tiempo real. La aplicación está construida con una arquitectura **Serverless** (sin servidor), lo que significa que no administramos servidores físicos ni virtuales; AWS se encarga de la infraestructura.

## 2. Arquitectura del Sistema (AWS)

La aplicación utiliza los siguientes servicios de Amazon Web Services (AWS):

*   **AWS Amplify**: Es el "cerebro" que orquesta y conecta todos los servicios. Facilita la configuración del backend y el despliegue del frontend.
*   **Amazon Cognito (Auth)**: Maneja la autenticación y gestión de usuarios.
    *   **Función**: Permite el registro, inicio de sesión y control de acceso. Asegura que solo los usuarios autenticados puedan crear posts o chatear.
*   **AWS AppSync (API)**: Es la capa de API GraphQL.
    *   **Función**: Actúa como la puerta de entrada para todas las peticiones de datos desde el frontend. Gestiona las consultas (lectura), mutaciones (escritura) y suscripciones (tiempo real).
*   **Amazon DynamoDB (Base de Datos)**: Base de datos NoSQL de alto rendimiento.
    *   **Función**: Almacena toda la información de la aplicación: perfiles de usuario, posts, comentarios, likes, notificaciones y mensajes de chat.
*   **Amazon S3 (Almacenamiento)**: Servicio de almacenamiento de objetos.
    *   **Función**: Almacena archivos estáticos como las imágenes de los posts y los avatares de los usuarios.

## 3. Flujo de Datos

### Ejemplo 1: Crear un Post con Imagen
1.  **Frontend (React)**: El usuario selecciona una imagen y escribe texto.
2.  **Subida de Imagen (S3)**: La aplicación sube la imagen directamente a un "bucket" en Amazon S3. S3 devuelve una clave única (key) o URL de la imagen.
3.  **Petición API (AppSync)**: El frontend envía una mutación GraphQL (`createPost`) a AppSync con el texto y la referencia de la imagen.
4.  **Validación y Persistencia (DynamoDB)**: AppSync valida la petición (usando Cognito para verificar la identidad) y guarda los datos en una tabla de DynamoDB.
5.  **Actualización en Tiempo Real**: AppSync notifica a todos los usuarios conectados (vía Suscripción) que hay un nuevo post.

### Ejemplo 2: Chat en Tiempo Real
1.  **Envío**: El Usuario A envía un mensaje. Se ejecuta una mutación `createMessage` hacia AppSync.
2.  **Almacenamiento**: El mensaje se guarda en DynamoDB.
3.  **Distribución**: AppSync detecta el nuevo mensaje y, a través de una **Suscripción GraphQL** (WebSockets), empuja el mensaje instantáneamente al dispositivo del Usuario B.
4.  **Recepción**: El frontend del Usuario B recibe el dato y actualiza la interfaz sin necesidad de recargar la página.

## 4. El Papel de AWS Amplify

Amplify es fundamental en este proyecto por dos razones principales:

1.  **Infraestructura como Código (IaC)**:
    *   En lugar de configurar manualmente cada servicio en la consola de AWS, definimos qué necesitamos (ej. "quiero autenticación", "quiero una API") y Amplify genera automáticamente las plantillas de CloudFormation para crear estos recursos.
    *   El archivo `schema.graphql` es la fuente de verdad. Amplify analiza este esquema y crea automáticamente las tablas en DynamoDB y los resolutores en AppSync.

2.  **Librerías Cliente**:
    *   Provee librerías para React (`aws-amplify`) que facilitan enormemente la conexión con el backend. Por ejemplo, `client.graphql(...)` para llamar a la API o `uploadData` para subir archivos a S3.

## 5. Modelo de Datos (GraphQL)

El esquema (`schema.graphql`) define las entidades y sus relaciones. Gracias a las directivas de Amplify (como `@model`, `@auth`, `@hasMany`), la infraestructura se crea sola.

*   **UserProfile**: Perfil del usuario. Relacionado con sus posts, comentarios, likes, seguidores y seguidos.
*   **Post**: Contenido principal. Tiene relaciones con el autor (User), comentarios y likes.
*   **Comment / Like**: Interacciones asociadas a un Post y un User.
*   **Follow**: Relación muchos-a-muchos entre usuarios (seguidor/seguido).
*   **Notification**: Alertas generadas por eventos (alguien te siguió, comentó, etc.).
*   **Chat / Message**: Sistema de mensajería privada.

## 6. Tecnologías Utilizadas

*   **Frontend**:
    *   **React**: Librería de UI para construir la interfaz.
    *   **Tailwind CSS**: Framework de estilos para un diseño moderno y responsivo.
    *   **GraphQL**: Lenguaje de consulta para la API, permitiendo pedir exactamente los datos necesarios.
*   **Backend (AWS)**:
    *   Amplify, AppSync, Cognito, DynamoDB, S3.

---
*Esta documentación está diseñada para servir como guion base para tu presentación de Administración de Servidores.*
