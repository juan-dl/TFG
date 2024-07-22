FROM locustio/locust:2.29.0
RUN pip3 install pika
RUN echo 0 > health.txt 
COPY ./locustfile.py ./
ENTRYPOINT locust

