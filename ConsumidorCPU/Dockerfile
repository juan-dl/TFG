FROM python:3.9-slim
RUN pip3 install pika
COPY ./ConsumidorCPU.py  ./
ENTRYPOINT python3 -u ConsumidorCPU.py

