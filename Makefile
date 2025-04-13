deploy:
	make bundle
	make upload_bundle
	make upload_deploy_script
	make execute_deploy_script

bundle:
	zip -r bundle.zip . -x node_modules/\* -x .git/\* -x .next/\* -x bundle.zip -x .env

upload_bundle:
	scp -i empregospara.pem bundle.zip ubuntu@${HOST}:

upload_deploy_script:
	scp -i empregospara.pem deploy.sh ubuntu@${HOST}:

execute_deploy_script:
	ssh -i C:/Users/paulo/Downloads/empregospara.pem ubuntu@18.223.186.178 "source ~/.nvm/nvm.sh; ./deploy.sh"
