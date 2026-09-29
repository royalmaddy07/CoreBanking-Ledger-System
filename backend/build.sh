#!/usr/bin/env bash
# Render Build Script
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input

# Reset migration history for 'base' app so tables get created properly
# (previous deploy recorded migrations as applied but managed=False meant no tables were created)
python manage.py migrate base zero --fake
python manage.py migrate
