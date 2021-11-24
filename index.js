const { GetFunctionConfigurationCommand } = require('@aws-sdk/client-lambda');
const log = require('fancy-log');

// get the function configuration and test up to 10 times at 1s intervals for the function to be Active
const checkLambdaStatus = (FunctionName, lambda, count = 10) => new Promise((resolve, reject) => {
	lambda.send(new GetFunctionConfigurationCommand({
		FunctionName,
	})).then((config) => {
		if (config.State === 'Error') reject(new Error(`${FunctionName} is in error state`));
		if (count <= 0) reject(new Error(`Ran out of retries waiting for ${FunctionName} to become Active`));
		if (config.State === 'Active' && config.LastUpdateStatus !== 'InProgress') {
			resolve(true);
			return true;
		}
		log(`Waiting for update to complete "${FunctionName}"`);
		// call again in 1 second
		setTimeout(() => {
			checkLambdaStatus(FunctionName, lambda, count - 1).then((result) => {
				if (result) {
					resolve(true);
				} else {
					reject();
				}
			});
		}, 1000);
	});
});

module.exports = checkLambdaStatus;
