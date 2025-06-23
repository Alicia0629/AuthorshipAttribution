# Authorship Attribution
Web application designed to facilitate authorship attribution of texts, allowing the identification of the author within a group of possible candidates. This project aims to make this task accessible to users without technical knowledge in AI or programming, such as counselors, police officers, and philologists, while also simplifying it for technical users.

## Index

- [Technologies](#technologies)
- [Code Quality](#code-quality)
- [How to Test the Application](#how-to-test-the-application)
- [Deployment](#deployment)
- [Project Execution](#project-execution)
  - [Execution with Docker](#execution-with-docker)
  - [Local Execution](#local-execution)
- [Environment Variables](#environment-variables)
  - [Backend (.env)](#backend-env)
  - [Frontend (.env)](#frontend-env)
  - [CI/CD (GitHub Secrets)](#cicd-github-secrets)

# Technologies

The application is divided into two main parts:

- **FrontEnd:** Interface developed with TypeScript, React, and MUI, communicating with the backend through REST APIs.
- **BackEnd:** Secure API built with Python and FastAPI, handling business logic, database access, and interaction with AI models.

Both components run in Docker containers and are deployed on Render. The database used is PostgreSQL, hosted on Aiven and managed with SQLAlchemy. AI models are trained and executed on RunPod using Python and Torch.

## Code Quality

The project uses SonarCloud for continuous code quality analysis, integrated with GitHub Actions. Analysis results are available at:

[https://sonarcloud.io/project/overview?id=Alicia0629_AuthorshipAttribution](https://sonarcloud.io/project/overview?id=Alicia0629_AuthorshipAttribution)

This system helps detect bugs, vulnerabilities, and improve maintainability in both frontend and backend code.

## How to Test the Application

To test authorship attribution, open the app and upload a .csv file with text and author columns.

We provide an example file at `Examples/tweets.csv` containing tweets from various celebrities to train and test models.

Just log in, upload this file, and follow the steps to select columns and train your model.


## Deployment

- **Frontend:** [https://authorshipattributionfrontend.onrender.com](https://authorshipattributionfrontend.onrender.com)
- **Backend:** [https://authorshipattributionbackend.onrender.com](https://authorshipattributionbackend.onrender.com)


## Project Execution

### Execution with Docker
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

### Local Execution
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
## Environment Variables

### Backend (`BackEnd/.env`)

| Variable                     | Description                                                                 |
|------------------------------|-----------------------------------------------------------------------------|
| `SECRET_KEY`                 | Secret key used to sign and verify JWT tokens.                             |
| `ALGORITHM`                  | Cryptographic algorithm for JWTs, usually `HS256`.                        |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| Token expiration time in minutes.                                          |
| `URL_TRAIN`                  | RunPod endpoint URL to start training.                                    |
| `URL_PREDICT`                | RunPod endpoint URL to make predictions.                                  |
| `URL_DELETE`                 | RunPod endpoint URL to delete models.                                     |
| `RUNPOD_KEY`                 | API key to authenticate requests to RunPod.                              |
| `DB_URL`                     | PostgreSQL connection string including user, password, and host.          |

---

### Frontend (`FrontEnd/.env`)

| Variable               | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| `VITE_API_URL`         | Base URL of the backend (FastAPI) to make requests from the frontend.       |

---

### CI/CD (`GitHub Secrets`)

These variables must be set in **GitHub Secrets** to enable the pipelines to work correctly.

| Variable                  | Description                                                              |
|---------------------------|--------------------------------------------------------------------------|
| `SECRET_KEY`              | Secret key used by the backend to sign JWT tokens.                      |
| `ALGORITHM`               | JWT token algorithm (e.g., `HS256`).                                    |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token expiration time in minutes.                              |
| `DB_URL`                  | Database connection URL used for testing (`sqlite:///:memory:`).        |
| `PYTHONPATH`              | Path used by `pytest` to resolve imports correctly.                     |
| `SONAR_PROJECT_KEY`       | Unique project ID in SonarCloud.                                        |
| `SONAR_TOKEN`             | Personal token to authenticate with SonarCloud.                        |
| `SONAR_ORGANIZATION`      | Name of the organization in SonarCloud.                                |
| `SONAR_HOST_URL`          | Base URL of SonarCloud (default: `https://sonarcloud.io`).             |
