# [gulp](https://github.com/gulpjs/gulp)-awslambda-3-status

[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://raw.githubusercontent.com/netbymatt/gulp-awslambda-3-status/master/LICENSE)

> A wrapper for checking the status of an AWS Lambda function

## Install

```bash
$ npm install --save-dev gulp-awslambda-3-status
```

## Rationale
As of October 2021 the AWS Lambda interface has been updated to require querying the Function State before performing an update of function code. See https://docs.aws.amazon.com/lambda/latest/dg/functions-states.html. A typical Lambda gulp tool-chain will contain multiple Lambda commands in sequence such as upload, publish and update function configuration. Between each of these steps the Function State must be checked. This module simplifies the checking of this status and automatically checks the status of the function up to 10 times (default) at 1 second intervals.

The method used to check status is as follows:
- Call `checkLambdaStatus(FunctionName, lambda) before running any Lambda command that would modify the function
- Check status will monitor the result of `GetFunctionConfigurationCommand` for `State = 'Active'` and `LastUpdateStatus !== 'InProgress'`.
- If the state requirements are not met, up to 10 retries at a 1 second interval are tried to allow AWS Lambda to complete it's initialization of the previous update.
- This function will throw an error if the 10 retires are exhausted or if the Lambda function returns an error state.
- This function will log `'Waiting for update to complete "${FunctionName}"'` to the console each time a retry situation is encountered.

## Usage

### AWS Credentials and Configuration

As this function is called as part of an AWS Lambda tool chain a pre-configured LambdaClient must be provided to this function as its second argument. Details for configuring the client can be found in the [AWS SDK documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-lambda/interfaces/lambdaclientconfig.html). At a bare minimum region and credentials should be provided, although credentials will be pulled from environment variables or an ini file if present in the environment.

### Basic Workflow

checkLambdaStatus returns a promise so it is critical that the gulp task calling this funcition be async and that the function is called with await.

```js
const gulp = require('gulp');
const {LambdaClient} = require('@aws-sdk/client-lambda');
const checkLambdaStatus = require('gulp-awslambda-3-status');

const functionName = 'test-lambda-function';

const opts = {
	region: 'us-east-1',
};

// configure the lambda client
const lambdaClient = new LambdaClient(opts);

gulp.task('upload-and-publish', async () => {
	// check the status of the function
	await checkLambdaStatus(functionName, lambdaClient);
	
	// code to upload the lambda function
	
	await checkLambdaStatus(functionName, lambdaClient);

	// code to publish the lambda function
});
```
Code similar to the example is provided in the gulp task `check-status`. You will need to set the function name and region in this file before running gulp.

``` bash
npx gulp check-status
```

## API

```js
checkLambdaStatus(functionName, lambdaClient)
```

### `functionName`

A string with the name of the Lambda function to be queried.

### `lambdaClient`

A pre-configured LambdaClient instance.