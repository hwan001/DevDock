/**
 * Copyright 2025 hwan001
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
