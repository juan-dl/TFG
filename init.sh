#! /usr/bin/env bash

version='latest'
cluster='rabbit'

kind create cluster -n $cluster --config kind-config.yaml

if [ $1 = 'cpu' ]
then
	tag='cons-cpu'
	dir='./ConsumidorCPU'
	helmfile='./casoCpu'
elif [ $1 = 'P' ]
then
	tag='cons-p'
	dir='./ConsumidorP'
	helmfile='./casoP'
else	
	tag='cons-keda'
	dir='./ConsumidorKeda'
	helmfile='./casoKeda'
fi

docker build -t locust:$version -f ./Locust/Dockerfile ./Locust
kind load docker-image -n $cluster locust:$version

docker build -t $tag:$version -f $dir/Dockerfile $dir
kind load docker-image -n $cluster $tag:$version

docker build -t api-cola:$version -f ./apiCola/Dockerfile ./apiCola
kind load docker-image -n $cluster api-cola:$version

docker build -t dash-cola:$version -f ./dashCola/Dockerfile.deploy ./dashCola
kind load docker-image -n $cluster dash-cola:$version

helmfile sync -e dev -f $helmfile/helmfile.yaml

for kubeletcsr in `kubectl -n kube-system get csr | grep kubernetes.io/kubelet-serving | awk '{ print $1 }'` 
do 
	kubectl certificate approve $kubeletcsr; 
done
