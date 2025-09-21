web: cd backend && python manage.py runserver 0.0.0.0:$PORT
worker: cd backend && celery -A ecosystia worker -l info
beat: cd backend && celery -A ecosystia beat -l info
