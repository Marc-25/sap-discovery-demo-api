# Analyze service

`POST /analyze` with `{"text": "hello world"}` returns `{"summary": "Received hello world", "length": 11}`.

## Run locally

```bash
pip install -r requirements.txt
python app.py
```

## Render settings

- Language: Python 3
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`
