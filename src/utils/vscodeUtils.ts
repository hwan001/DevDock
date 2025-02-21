import * as vscode from "vscode";

type AlertWithButton = {
	type: "info" | "warn" | "error";
	message: string;
	isButton: true;
	onConfirm: () => void;
	onCancel: () => void;
};

type AlertWithoutButton = {
	type: "info" | "warn" | "error";
	message: string;
	isButton?: false;
};

// 두 타입을 합친 유니온 타입
type AlertOptions = AlertWithButton | AlertWithoutButton;

export function alertMessage(options: AlertOptions): void {
	let showMessage: Function;

	// 알림 유형에 따라 적절한 함수 선택
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

	if (options.isButton) {
		// 버튼이 있는 경우, onConfirm과 onCancel을 강제 사용
		showMessage(options.message, "확인", "취소").then(
			(selection: string | undefined) => {
				if (selection === "확인") {
					options.onConfirm(); // 확인 버튼 동작 호출
				} else if (selection === "취소") {
					options.onCancel(); // 취소 버튼 동작 호출
				}
			}
		);
	} else {
		// 버튼이 없는 경우
		showMessage(options.message);
	}
}
