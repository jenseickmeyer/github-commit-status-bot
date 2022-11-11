# GitHub Commit Status Bot

This serverless application provides a solution for integrating AWS CodePipeline with the GitHub Commit Status API. This way the success or failure of a build pipeline can be shown in the GitHub Commit history.

The application is based on the *Serverless Application Model* (SAM) provided by AWS. Basically, it simply consists of a Lambda function which subscribes to CloudWatch Events to get notified once states for CodePipeline pipelines change.

## Install
Installing the application is pretty straight-forward. As a pre-requiste, the AWS CLI needs to be installed on the machine from which the deployment should be performed.

First, you need to create a *Personal Access Token* in GitHub and store it to the Parameter Store of the AWS Systems Manager. You need to do this in the AWS region into which you want to deploy the application. This can either be done via the AWS Console or the following AWS CLI command:

```bash
aws ssm put-parameter --name /github/personal_access_token --value TOKEN --type String
```

It's important to use the key `/github/personal_access_token` since this is used in the SAM template.

Next, the deployment script deploy.sh must be changed slightly. The variable `S3_BUCKET` must be set to the name of the S3 bucket into which deployment artifacts should be stored.

Do not forget to fetch fresh credentials for desired AWS account and set them as default.

Finally, the deployment script can just be executed

```bash
bash deploy
```

At the moment `github-commit-status-bot` stack is deployed to `honeycomb-dev2` and `honeycomb-dev4` accounts.
The corresponding configuration is:
```yaml
honeycomb-dev2:
  S3_BUCKET: bgch-dev2-provisioning
honeycomb-dev4:
  S3_BUCKET: shared-serverless-deploys-eu-west-1
```

## Maintainers
PLAT Team