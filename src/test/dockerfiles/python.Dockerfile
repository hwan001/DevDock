FROM python:3.12-alpine

COPY . /app
COPY requirements.txt /app

WORKDIR /app

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8080 80
EXPOSE 443

VOLUME /data
VOLUME /data /tmp
VOLUME [ "/data" ]
VOLUME [ "/data", "/tmp2" ]

CMD ["python3", "main.py"]
