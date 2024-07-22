#! /usr/bin/env bash

version=latest
if [ $1 = 'cpu' ]
then 
	docker image rm cons-cpu:$version
	helmfile='./casoCpu'
elif [ $1 = 'P' ]
then 
	docker image rm cons-p:$version
	helmfile='./casoP'
else
	docker image rm cons-keda:$version
	helmfile='./casoKeda'
fi

docker image rm locust:$version
docker image rm api-cola:$version
docker image rm dash-cola:$version

helmfile destroy -f $helmfile/helmfile.yaml

kind delete cluster -n rabbit
