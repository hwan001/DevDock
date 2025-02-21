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

let terminals: { [name: string]: vscode.Terminal } = {};

export function getOrCreateTerminal(name: string): vscode.Terminal {
	if (terminals[name]) {
		terminals[name].show(true);
		return terminals[name];
	}

	const terminal = vscode.window.createTerminal({
		name,
		shellPath: "/bin/bash",
	});
	terminals[name] = terminal;

	terminal.show(true);
	return terminal;
}

export async function terminalRun(containerName: string, command: string) {
	const terminal = getOrCreateTerminal(`${containerName}`);
	terminal.sendText(`${command}`);
	terminal.show();
}

export function runMultilineCommandsOnTerminal(
	containerName: string,
	commands: string[]
) {
	let cmd = "";
	const terminal = getOrCreateTerminal(`${containerName}`);

	commands.forEach((command) => {
		cmd += `${command};`;
	});

	console.log(cmd);

	terminal.sendText(`${cmd}`);
	terminal.show();
}
