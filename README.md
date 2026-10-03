# Taski

Учебное приложение для задач: создание, изменение, отметка выполнения и удаление. React 18 показывает список задач, Django REST Framework предоставляет API, PostgreSQL хранит данные. Локальный Docker Compose собирает backend, frontend и Nginx из исходников этого репозитория.

## Запуск через Docker Compose

Нужны Docker и Compose. Из корня проекта:

```sh
cp .env.example .env
docker compose up --build -d
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py collectstatic --noinput
```

Перед запуском замените в `.env` заглушки `POSTGRES_PASSWORD` и `SECRET_KEY`. Приложение доступно по `http://localhost:8000/`, API — по `http://localhost:8000/api/tasks/`, Django admin — по `/admin/`. Для входа в admin можно создать пользователя командой `docker compose exec backend python manage.py createsuperuser`.

База хранится в томе `pg_data`, собранный фронтенд и статика Django — в `static_volume`. Контейнер frontend копирует сборку в общий том и завершается; это ожидаемое поведение. `docker compose down` сохраняет тома. Не используйте `down -v`, если данные нужны.

## Локальные проверки без PostgreSQL

Для backend используйте Python 3.9 (как в Dockerfile) или проверенный здесь Python 3.11 и зависимости из `backend/requirements.txt`. С тестовыми значениями окружения можно запустить Django с временной SQLite-базой. Пример для PowerShell из корня проекта:

```powershell
$env:SECRET_KEY = 'test-only-local-key'
$env:DB_ENGINE = 'django.db.backends.sqlite3'
$env:DB_NAME = ':memory:'
python backend/manage.py check
python backend/manage.py test api
```

Для проверки frontend:

```sh
cd frontend
npm ci
CI=true npm test -- --watch=false --runInBand
npm run build
```

Реальное окружение `.env` не требуется для этих проверок. `docker compose --env-file .env.example config --quiet` проверяет конфигурацию Compose без запуска контейнеров. Закреплённые версии backend-зависимостей и frontend lockfile находятся в соответствующих папках.

## Структура

- `backend/` — Django API и модель Task.
- `frontend/` — React-интерфейс.
- `gateway/` — конфигурация Nginx.
- `docker-compose.yml` — локальный запуск; `docker-compose.production.yml` — отдельная конфигурация опубликованных образов.

В `.github/workflows/main.yml` тесты запускаются при push в `main`. Публикация Docker-образов и развёртывание запускаются только вручную через GitHub Actions (`workflow_dispatch`) из ветки `main`; для них нужны настроенные секреты и сервер. Публичное развёртывание этой версии не проверялось.
