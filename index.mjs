import { GetFunctionConfigurationCommand } from '@aws-sdk/client-lambda';
import log from 'fancy-log';

// get the function configuration and test up to 10 times at 1s intervals for the function to be Active
const checkLambdaStatus = (FunctionName, lambda, count = 10, _verbose = false) => new Promise((resolve, reject) => {
	const firstRun = (typeof _verbose === 'boolean');
	// alter verbose flag for log message updates
	const verbose = _verbose ? count : 0;
	lambda.send(new GetFunctionConfigurationCommand({
		FunctionName,
	})).then((config) => {
		if (config.State === 'Error') {
			reject(new Error(`${FunctionName} is in error state`));
			return;
		}
		if (count <= 0) {
			log.error(`Status at Timeout: State: ${config.state}, LastUpdateStatus: ${config.LastUpdateStatus}`);
			reject(new Error(`Ran out of retries waiting for ${FunctionName} to become Active`));
			return;
		}
		if (config.State === 'Active' && config.LastUpdateStatus !== 'InProgress') {
			// post message
			log(`Update complete for "${FunctionName}"`);
			resolve(true);
			return;
		}
		if (firstRun && !verbose) {
			log(`Waiting for update to complete "${FunctionName}"`);
		} else if (verbose) {
			log(`Waiting for update to complete "${FunctionName}, Seconds remaining: ${count}`);
		}
		// call again in 1 second
		setTimeout(() => {
			checkLambdaStatus(FunctionName, lambda, count - 1, verbose)
				.then((result) => {
					resolve(result);
				})
				.catch((e) => {
					log.error(e);
					reject(e);
				});
		}, 1000);
	});
});

export default checkLambdaStatus;
