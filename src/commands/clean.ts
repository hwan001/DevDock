import * as vscode from "vscode";
import { ErrorUtils, ConfigUtils, DockerUtils } from "../utils";

export async function clean(context: vscode.ExtensionContext): Promise<void> {
	try {
		const detectLanguageResult = ConfigUtils.detectLanguage();
		if (!detectLanguageResult.success) {
			throw new Error(detectLanguageResult.error);
		}

		const language = String(detectLanguageResult.data);
		DockerUtils.removeContainer(language);
		DockerUtils.removeImage(language);
	} catch (error) {
		ErrorUtils.handleError(error);
	}
}
