default: buildCPU

buildCPU:
	./init.sh cpu

buildP:
	./init.sh P

buildKeda:
	./init.sh Keda
	
cleanCPU:
	./finPruebas.sh cpu

cleanP:
	./finPruebas.sh P

cleanKeda:
	./finPruebas.sh Keda

forward:
	./forwardSvc.sh
