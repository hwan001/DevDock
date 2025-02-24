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

type VscodeAlert = {
	type: "info" | "warn" | "error";
	message: string;
	buttons?: { label: string; action: () => void }[];
};

export function alertMessage(options: VscodeAlert): void {
	let showMessage: Function;

	switch (options.type) {
		case "info":
			showMessage = vscode.window.showInformationMessage;
			break;
		case "warn":
			showMessage = vscode.window.showWarningMessage;
			break;
		case "error":
			showMessage = vscode.window.showErrorMessage;
			break;
		default:
			throw new Error("Invalid alert type");
	}

	if (options.buttons && options.buttons.length > 0) {
		const buttonLabels = options.buttons.map((btn) => btn.label);
		showMessage(options.message, ...buttonLabels).then(
			(selection: string | undefined) => {
				const selectedButton = options.buttons?.find(
					(btn) => btn.label === selection
				);
				selectedButton?.action();
			}
		);
	} else {
		showMessage(options.message);
	}
}
