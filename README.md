# Sahrul Adicandra Effendy — Celestial Data Line Portfolio

A cinematic, scroll-driven personal portfolio built with **Django 5.2**. The visual direction combines a floating sky railway, abstract cloud islands, glass interfaces, and data constellations. It is designed to feel distinctive while remaining responsive, accessible, and easy to maintain.

## Included

- Seven full-screen scroll-snap chapters with smooth wheel/keyboard navigation
- Original SVG sky-rail illustration and six original project cover illustrations
- Responsive layout that switches to normal document scrolling on mobile
- Reduced-motion support, keyboard navigation, semantic sections, and accessible labels
- Curated profile, skills, experience, achievements, and six detailed projects
- Horizontal project carousel with drag, buttons, keyboard access, and detail dialogs
- Working Django contact form with CSRF protection, validation, honeypot field, SQLite storage, and Django Admin access
- WhiteNoise static delivery, Gunicorn configuration, Dockerfile, and Docker Compose setup
- Automated Django tests

## Quick start — Windows

Double-click:

```text
run_portfolio.bat
```

Or run manually:

```powershell
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Open `http://127.0.0.1:8000`.

## Quick start — macOS / Linux

```bash
./run_portfolio.sh
```

Or:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Docker

```bash
docker compose up --build
```

Open `http://127.0.0.1:8000`.

## Create an admin account

```bash
python manage.py createsuperuser
```

Then open `http://127.0.0.1:8000/admin/` to review contact messages.

## Update portfolio content

Most content is centralized in:

```text
portfolio/data.py
```

Main visual files:

```text
portfolio/templates/portfolio/home.html
portfolio/static/portfolio/css/style.css
portfolio/static/portfolio/js/main.js
portfolio/static/portfolio/img/
```

## Production checklist

1. Copy `.env.example` to `.env` or configure environment variables in the hosting platform.
2. Replace `DJANGO_SECRET_KEY` with a secure value.
3. Set `DJANGO_DEBUG=False`.
4. Set `DJANGO_ALLOWED_HOSTS` to the public domain.
5. Run `python manage.py migrate` and `python manage.py collectstatic --noinput`.
6. Use Gunicorn or the supplied Docker image rather than Django's development server.

## Validation completed

```text
python manage.py check
python manage.py migrate --noinput
python manage.py test
python manage.py collectstatic --noinput
```

The project was also started locally and returned HTTP 200 from the homepage.
