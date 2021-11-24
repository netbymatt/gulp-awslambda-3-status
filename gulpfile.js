const gulp = require('gulp');
const { LambdaClient } = require('@aws-sdk/client-lambda');
const checkLambdaStatus = require('./index');

// configure lambda client
const lambdaClient = new LambdaClient({
	region: 'us-east-1',
});

// function name to query
const functionName = 'gulp-awslambda-3-status-test';

// create a task
gulp.task('check-status', async () => {
	await checkLambdaStatus(functionName, lambdaClient);
});
