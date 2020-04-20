set S3_BUCKET=5stream-bot
set INPUT_FILE=template.yaml
set OUTPUT_FILE=template-output.yaml
set REGION=ap-southeast-2
set STACK_NAME=github-commit-status-bot

cd src && npm install && npm run-script lint && npm test && npm prune --production && cd ..

aws cloudformation package --template-file %INPUT_FILE% --s3-bucket %S3_BUCKET% --output-template-file %OUTPUT_FILE%
aws cloudformation deploy --template-file %OUTPUT_FILE% --stack-name %STACK_NAME% --capabilities CAPABILITY_NAMED_IAM --region %REGION%
