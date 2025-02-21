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
