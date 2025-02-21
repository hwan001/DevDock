import { DEBUG } from "../config/constants";

export function getCurrentTimestamp(useSystemTime: boolean = false): string {
	const now = new Date();

	if (useSystemTime) {
		return now.toLocaleString("en-CA", {
			timeZoneName: "short",
			hour12: false,
		});
	}

	return now.toISOString(); // UTC
}

export function logDebug(message: string): void {
	if (DEBUG) {
		console.log(`[DEBUG][${getCurrentTimestamp(true)}] ${message}`);
	}
}

export function logInfo(message: string): void {
	console.log(`[INFO][${getCurrentTimestamp()}] ${message}`);
}

export function logError(message: string): void {
	console.error(`[ERROR][${getCurrentTimestamp()}] ${message}`);
}

export function logWarning(message: string): void {
	console.warn(`[WARNING][${getCurrentTimestamp()}] ${message}`);
}
