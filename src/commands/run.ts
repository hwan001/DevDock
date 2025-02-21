import * as vscode from "vscode";

import { ConfigUtils, ErrorUtils, DockerUtils } from "../utils";

export async function run(context: vscode.ExtensionContext): Promise<void> {
	try {
		const isDockerAvailable = await DockerUtils.checkDockerAvailability();
		if (!isDockerAvailable) {
			throw new Error(
				"Docker is not installed or not available in PATH. Please install Docker: https://www.docker.com/products/docker-desktop"
			);
		}

		const detectLanguageResult = ConfigUtils.detectLanguage();
		if (!detectLanguageResult.success) {
			throw new Error(detectLanguageResult.error);
		}

		const language = String(detectLanguageResult.data);
		DockerUtils.oneRun(language);
	} catch (error) {
		ErrorUtils.handleError(error);
	}
}
