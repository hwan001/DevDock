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

import * as vscode from "vscode";
import { ErrorUtils, DockerUtils } from "../utils";

export async function check(context: vscode.ExtensionContext): Promise<void> {
	try {
		const isDockerAvailable = await DockerUtils.checkDockerAvailability();
		if (!isDockerAvailable) {
			throw new Error(
				"Docker is not installed or not available in PATH. \nPlease install Docker: https://www.docker.com/products/docker-desktop"
			);
		}
	} catch (error) {
		ErrorUtils.handleError(error);
	}
}
