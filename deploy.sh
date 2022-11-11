#!/usr/bin/env bash

S3_BUCKET=
INPUT_FILE=template.yaml
OUTPUT_FILE=template-output.yaml
REGION=eu-west-1
STACK_NAME=github-commit-status-bot

cd src && npm install && npm run-script lint && npm test && npm prune --production && cd ..

aws cloudformation package --template-file $INPUT_FILE --s3-bucket $S3_BUCKET --output-template-file $OUTPUT_FILE
aws cloudformation deploy --template-file $OUTPUT_FILE --stack-name $STACK_NAME --capabilities CAPABILITY_NAMED_IAM --region $REGION
