# Sahrul Adicandra Effendy — Personal Portfolio Website

![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.2-092E20?style=for-the-badge&logo=django&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![WebGL](https://img.shields.io/badge/WebGL-990000?style=for-the-badge&logo=webgl&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Gunicorn](https://img.shields.io/badge/Gunicorn-499848?style=for-the-badge&logo=gunicorn&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A personal portfolio website built to present my background, skills, work experience, achievements, and selected projects. Developed with **Django 5.2**, vanilla HTML/CSS/JavaScript, and a custom WebGL 3D environment. Fully responsive, accessible, and deployable via Docker.

---

## Screenshots

**Overview**

![Hero](docs/screenshots/01-hero.png)

**About & Profile**

![About](docs/screenshots/02-about.png)

**Skills**

![Skills](docs/screenshots/03-skills.png)

**Selected Projects**

![Projects](docs/screenshots/04-projects.png)

**Experience**

![Experience](docs/screenshots/05-experience.png)

**Achievements**

![Achievements](docs/screenshots/06-achievements.png)

**Contact**

![Contact](docs/screenshots/07-contact.png)

---

## Features

- Seven-section scroll navigation: Overview, About, Skills, Projects, Experience, Achievements, Contact
- Interactive 3D background powered by a custom WebGL procedural world engine
- Profile section with photo, education, current role, and key stats
- Project showcase with case-detail view, tech tags, and GitHub links
- Experience and achievement timeline
- Contact form with CSRF protection, server-side validation, and honeypot anti-spam
- Django Admin panel for reviewing contact submissions
- Fully responsive layout for desktop and mobile
- Keyboard navigation and reduced-motion accessibility support
- WhiteNoise for static file delivery
- Gunicorn-ready for production deployment
- Docker and Docker Compose support
- Automated Django tests

---

## Getting Started

### Windows

Double-click `run_portfolio.bat`, or run manually:

```powershell
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000).

### macOS / Linux

```bash
./run_portfolio.sh
```

Or manually:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000).

### Docker

```bash
docker compose up --build
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

## Admin Panel

Create a superuser to review contact form submissions:

```bash
python manage.py createsuperuser
```

Access the admin panel at [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/).

---

## Project Structure

Portfolio content is centralized in:

```
portfolio/data.py
```

Main template and asset files:

```
portfolio/templates/portfolio/home.html
portfolio/static/portfolio/css/style.css
portfolio/static/portfolio/js/main.js
portfolio/static/portfolio/js/world-engine.js
portfolio/static/portfolio/img/
```

---

## Production Deployment

1. Copy `.env.example` to `.env` and fill in the required values.
2. Set a secure `DJANGO_SECRET_KEY`.
3. Set `DJANGO_DEBUG=False`.
4. Set `DJANGO_ALLOWED_HOSTS` to your domain.
5. Run `python manage.py migrate` and `python manage.py collectstatic --noinput`.
6. Serve with Gunicorn or use the provided Docker image.

---

## Running Tests

```bash
python manage.py test
```

---

## License

This project is licensed under the [MIT License](LICENSE).
