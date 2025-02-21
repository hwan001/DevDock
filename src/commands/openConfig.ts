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
