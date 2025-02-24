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
import { ConfigUtils, ErrorUtils, DockerUtils } from "../utils";
import { setUserConfig } from "../config/constants";

export async function run(context: vscode.ExtensionContext): Promise<void> {
	try {
		const configFilePath = await ConfigUtils.getConfigFilePath(context);
		const loadConfigResult = await ConfigUtils.loadConfig(configFilePath);
		if (!loadConfigResult.success) {
			throw new Error(loadConfigResult.error);
		}

		setUserConfig(loadConfigResult.data);

		const detectLanguageResult = ConfigUtils.detectLanguage();
		if (!detectLanguageResult.success) {
			throw new Error(detectLanguageResult.error);
		}

		const language = String(detectLanguageResult.data);

		DockerUtils.run(language);
	} catch (error) {
		ErrorUtils.handleError(error);
	}
}
