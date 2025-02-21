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
import { ErrorUtils, ConfigUtils } from "../utils";

export async function openConfigFile(
	context: vscode.ExtensionContext
): Promise<void> {
	try {
		const configFilePath = await ConfigUtils.getConfigFilePath(context);
		const document = await vscode.workspace.openTextDocument(configFilePath);
		await vscode.window.showTextDocument(document);
	} catch (error) {
		ErrorUtils.handleError(error);
	}
}
