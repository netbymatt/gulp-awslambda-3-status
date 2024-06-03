import { LambdaClient } from '@aws-sdk/client-lambda';
import log from 'fancy-log';
import checkLambdaStatus from './index.mjs';

// configure lambda client
const lambdaClient = new LambdaClient({
	region: 'us-east-1',
});

// function name to query
const functionName = 'gulp-awslambda-3-status-test';

// create a task
const checkStatus = async () => {
	// check status before making updates to function
	await checkLambdaStatus(functionName, lambdaClient);
	log(`Hooray! ${functionName} is ready for updates`);
	// lambda function is ready for changes
	// call code to upload, publish, etc on lambda function
};

export default checkStatus;
export {
	checkStatus,
};
