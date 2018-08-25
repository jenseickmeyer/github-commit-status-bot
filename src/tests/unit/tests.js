'use strict';

const app = require('../../index.js');
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

describe('Status update tests', function () {
  let getPipelineExecutionStub;
  let postStatusToGitHubStub;

  beforeEach(function () {
    getPipelineExecutionStub = sinon.stub(app, 'getPipelineExecution').callsFake(function (pipelineName, executionId) {
      return {
        owner: 'some-owner',
        repository: 'some-repo',
        sha: 'f94d5b6565659d4b84c59b641b811254a2588e4e'
      };
    });
    postStatusToGitHubStub = sinon.stub(app, 'postStatusToGitHub');
  });

  afterEach(function () {
    getPipelineExecutionStub.restore();
    postStatusToGitHubStub.restore();
  });

  it('verifies a pending status update', async () => {
    let event = require('./started-event.json');

    postStatusToGitHubStub.callsFake((owner, repository, sha, payload) => {
      expect(owner).to.equal('some-owner');
      expect(repository).to.equal('some-repo');
      expect(sha).to.equal('f94d5b6565659d4b84c59b641b811254a2588e4e');
      expect(payload).to.be.an('object');
      expect(payload.state).to.equal('pending');
      expect(payload['target_url']).to.equal('https://us-east-1.console.aws.amazon.com/codepipeline/home?region=us-east-1#/view/some-pipeline');
      expect(payload.context).to.equal('codepipeline/some-pipeline');
    });

    let result = await app.handler(event);

    expect(result).to.be.null;
  });

  it('verifies a successful status update', async () => {
    let event = require('./succeeded-event.json');

    postStatusToGitHubStub.callsFake((owner, repository, sha, payload) => {
      expect(owner).to.equal('some-owner');
      expect(repository).to.equal('some-repo');
      expect(sha).to.equal('f94d5b6565659d4b84c59b641b811254a2588e4e');
      expect(payload).to.be.an('object');
      expect(payload.state).to.equal('success');
      expect(payload['target_url']).to.equal('https://us-east-1.console.aws.amazon.com/codepipeline/home?region=us-east-1#/view/some-pipeline');
      expect(payload.context).to.equal('codepipeline/some-pipeline');
    });

    let result = await app.handler(event);

    expect(result).to.be.null;
  });

  it('verifies a failure status update', async () => {
    let event = require('./failed-event.json');

    postStatusToGitHubStub.callsFake((owner, repository, sha, payload) => {
      expect(owner).to.equal('some-owner');
      expect(repository).to.equal('some-repo');
      expect(sha).to.equal('f94d5b6565659d4b84c59b641b811254a2588e4e');
      expect(payload).to.be.an('object');
      expect(payload.state).to.equal('failure');
      expect(payload['target_url']).to.equal('https://us-east-1.console.aws.amazon.com/codepipeline/home?region=us-east-1#/view/some-pipeline');
      expect(payload.context).to.equal('codepipeline/some-pipeline');
    });

    let result = await app.handler(event);

    expect(result).to.be.null;
  });
});
