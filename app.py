from flask import Flask, request

app = Flask(__name__)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
def analyze():
    data = request.get_json(silent=True) or {}
    text = data.get("text")
    if not isinstance(text, str):
        return {"error": "text must be a string"}, 400
    return {"summary": f"Received {text}", "length": len(text)}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)
