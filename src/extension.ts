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

import { run, clean, openConfigFile, check, logs } from "./commands";
import { LogUtils, ConfigUtils } from "./utils";

export async function activate(
	context: vscode.ExtensionContext
): Promise<void> {
	await ConfigUtils.ensureConfigFile(context);

	const commands = [
		{ command: "devdock.run", handler: run },
		{ command: "devdock.clean", handler: clean },
        { command: "devdock.logs", handler: logs },
		{ command: "devdock.openConfig", handler: openConfigFile },
		{ command: "devdock.check", handler: check },
	];

	commands.forEach(({ command, handler }) => {
		context.subscriptions.push(
			vscode.commands.registerCommand(command, () => handler(context))
		);
	});

	LogUtils.logDebug("DevDock extension is now active.");
}

export function deactivate(): void {
	LogUtils.logDebug("DevDock extension is now deactivated.");
}
