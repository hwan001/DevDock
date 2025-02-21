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
