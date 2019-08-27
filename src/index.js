'use strict';

const aws = require('aws-sdk');
const axios = require('axios');

const BaseURL = 'https://api.github.com/repos';

const codepipeline = new aws.CodePipeline();

const Password = process.env.ACCESS_TOKEN;

exports.handler = async (event) => {
  const region = event.region;
  const pipelineName = event.detail.pipeline;
  const executionId = event.detail['execution-id'];
  const state = transformState(event.detail.state);

  if (state === null) {
    return;
  }

  const result = await this.getPipelineExecution(pipelineName, executionId);
  const payload = createPayload(pipelineName, region, state);
  await this.postStatusToGitHub(result.owner, result.repository, result.sha, payload);

  return null;
};

function transformState (state) {
  if (state === 'STARTED') {
    return 'pending';
  }
  if (state === 'SUCCEEDED') {
    return 'success';
  }
  if (state === 'FAILED') {
    return 'failure';
  }

  return null;
}

function createPayload (pipelineName, region, status) {
  let description;
  if (status === 'pending') {
    description = 'Build started';
  } else if (status === 'success') {
    description = 'Build succeeded';
  } else if (status === 'failure') {
    description = 'Build failed!';
  }

  return {
    state: status,
    'target_url': buildCodePipelineUrl(pipelineName, region),
    description: description,
    context: 'continuous-integration/codepipeline'
  };
}

function buildCodePipelineUrl (pipelineName, region) {
  return `https://${region}.console.aws.amazon.com/codepipeline/home?region=${region}#/view/${pipelineName}`;
}

exports.getPipelineExecution = async (pipelineName, executionId) => {
  const params = {
    pipelineName: pipelineName,
    pipelineExecutionId: executionId
  };

  const result = await codepipeline.getPipelineExecution(params).promise();
  const artifactRevision = result.pipelineExecution.artifactRevisions[0];

  const revisionURL = artifactRevision.revisionUrl;
  const sha = artifactRevision.revisionId;

  const pattern = /github.com\/(.+)\/(.+)\/commit\//;
  const matches = pattern.exec(revisionURL);

  return {
    owner: matches[1],
    repository: matches[2],
    sha: sha
  };
};

exports.postStatusToGitHub = async (owner, repository, sha, payload) => {
  const url = `/${owner}/${repository}/statuses/${sha}`;

  const config = {
    baseURL: BaseURL,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: {
      password: Password
    }
  };

  await axios.post(url, payload, config);
};
