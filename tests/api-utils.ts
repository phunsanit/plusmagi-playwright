import axios from 'axios';

/**
 * Utility class for handling all backend API interactions.
 * Use this module to validate REST endpoints before running UI tests.
 */
export const ApiClient = {
	/**
	 * Generic function to get data from a specified endpoint.
	 * @param url The full API URL (e.g., 'https://api.example.com/users').
	 * @returns A Promise that resolves with the response data.
	 */
	get: async (url: string): Promise<any> => {
		console.log(`[API Test] Fetching data from: ${url}`);
		try {
			const response = await axios.get(url);
			return response.data;
		} catch (error: any) {
			console.error(`[API Test Error] Failed to fetch ${url}:`, error.message);
			throw new Error(`API Failure: Could not reach endpoint ${url}.`);
		}
	},
	/**
	 * Generic function to send data via POST request.
	 * @param url The API endpoint URL.
	 * @param data The payload object to send.
	 * @returns A Promise that resolves with the server's response.
	 */
	post: async (url: string, data: any): Promise<any> => {
		console.log(`[API Test] Posting data to: ${url}`);
		try {
			const response = await axios.post(url, data);
			return response.data;
		} catch (error: any) {
			console.error(`[API Test Error] Failed to post to ${url}:`, error.message);
			throw new Error(`API Failure: Could not post to endpoint ${url}.`);
		}
	},
};