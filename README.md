# Atribución de Autoría
Aplicación web diseñada para facilitar la atribución de autoría de textos, permitiendo identificar el autor dentro de un grupo de posibles candidatos. Este proyecto busca hacer accesible esta tarea a usuarios sin conocimientos técnicos en IA o programación, como orientadores, policías y filólogos, además de simplificarla para usuarios técnicos.

## Índice

- [Tecnologías](#tecnologías)
- [Calidad del Código](#calidad-del-código)
- [Despliegue](#despliegue)
- [Ejecución del Proyecto](#ejecución-del-proyecto)
  - [Ejecución con Docker](#ejecución-con-docker)
- [Variables de Entorno](#variables-de-entorno)
  - [Backend (.env)](#backend-env)
  - [Frontend (.env)](#frontend-env)
  - [CI/CD (GitHub Secrets)](#cicd-github-secrets)

## Tecnologías

La aplicación está dividida en dos partes principales:

- **FrontEnd:** Interfaz desarrollada con TypeScript, React y Mui que se comunica con el backend mediante APIs REST.
- **BackEnd:** API segura construida con Python y FastAPI, que gestiona la lógica de negocio, el acceso a la base de datos y la interacción con los modelos de IA.

Ambos componentes corren en contenedores Docker y se despliegan en Render. La base de datos usada es PostgreSQL alojada en Aiven y gestionada con SQLAlchemy. Los modelos de IA se entrenan y ejecutan en RunPod usando Python y Torch.

## Calidad del Código

El proyecto utiliza SonarCloud para el análisis continuo de calidad del código, integrado con GitHub Actions. Los resultados del análisis están disponibles en:

[https://sonarcloud.io/project/overview?id=Alicia0629_AuthorshipAttribution](https://sonarcloud.io/project/overview?id=Alicia0629_AuthorshipAttribution)

Este sistema ayuda a detectar bugs, vulnerabilidades y mejorar la mantenibilidad del código en el frontend y backend.

## Despliegue

- **Frontend:** [https://authorshipattributionfrontend.onrender.com](https://authorshipattributionfrontend.onrender.com)
- **Backend:** [https://authorshipattributionbackend.onrender.com](https://authorshipattributionbackend.onrender.com)


## Ejecución del Proyecto

### Ejecución con Docker
#### BackEnd
```bash
cd BackEnd
docker build -t authorship-attribution-backend .
docker run -p 8000:8000 authorship-attribution-backend
```
#### Frontend
```bash
cd FrontEnd
docker build -t authorship-attribution-frontend .
docker run -p 4173:4173 authorship-attribution-frontend
```

### Ejecución local
#### BackEnd
```bash
cd BackEnd
pip install -r requirements.txt
uvicorn app.main:app --reload
```
#### Frontend
```bash
cd FrontEnd
npm install
npm run dev
```


## Variables de entorno

### Backend (`BackEnd/.env`)

| Variable                     | Descripción                                                                 |
|-----------------------------|-----------------------------------------------------------------------------|
| `SECRET_KEY`                | Clave secreta usada para firmar y validar tokens JWT.                       |
| `ALGORITHM`                 | Algoritmo criptográfico para los JWT, normalmente `HS256`.                 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Tiempo de validez del token (en minutos).                                |
| `URL_TRAIN`                 | URL del endpoint de RunPod para iniciar el entrenamiento.                  |
| `URL_PREDICT`               | URL del endpoint de RunPod para hacer predicciones.                        |
| `URL_DELETE`                | URL del endpoint de RunPod para eliminar modelos.                          |
| `RUNPOD_KEY`                | API Key para autenticar peticiones a RunPod.                               |
| `DB_URL`                    | Cadena de conexión a PostgreSQL. Incluye usuario, contraseña y host.       |

---

### Frontend (`FrontEnd/.env`)

| Variable              | Descripción                                                                  |
|-----------------------|------------------------------------------------------------------------------|
| `VITE_API_URL`        | URL base del backend (FastAPI) para hacer peticiones desde el frontend.     |

---

### CI/CD (`GitHub Secrets`)

Estas variables deben definirse en **GitHub Secrets** para que los pipelines funcionen correctamente.

| Variable                        | Descripción                                                                 |
|----------------------------------|-----------------------------------------------------------------------------|
| `SECRET_KEY`                    | Clave secreta usada por el backend para firmar tokens JWT.                 |
| `ALGORITHM`                     | Algoritmo de los tokens JWT (por ejemplo, `HS256`).                        |
| `ACCESS_TOKEN_EXPIRE_MINUTES`  | Minutos de validez del token JWT.                                          |
| `DB_URL`                        | URL de conexión a base de datos usada en testing. En este caso: `sqlite:///:memory:` |
| `PYTHONPATH`                    | Ruta usada por `pytest` para resolver los imports correctamente.           |
| `SONAR_PROJECT_KEY`             | ID único del proyecto en SonarCloud.                                       |
| `SONAR_TOKEN`                   | Token personal para autenticar en SonarCloud.                              |
| `SONAR_ORGANIZATION`           | Nombre de la organización en SonarCloud.                                   |
| `SONAR_HOST_URL`               | URL base de SonarCloud (por defecto: `https://sonarcloud.io`).             |
