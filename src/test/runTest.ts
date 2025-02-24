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

import * as path from "path";
import { runTests } from "@vscode/test-electron";

async function main() {
	try {
		const extensionDevelopmentPath = path.resolve(__dirname, "../../"); // 확장 개발 경로

		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath: path.resolve(__dirname, "./dockerUtils.test.js"),
			launchArgs: ["--disable-extensions"],
		});

		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath: path.resolve(__dirname, "./vscodeUtils.test.ts"),
			launchArgs: ["--disable-extensions"],
		});
	} catch (err) {
		console.error("Failed to run tests:", err);
		process.exit(1);
	}
}

main();
