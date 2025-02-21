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
		// { command: "devdock.check", handler: check },
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
