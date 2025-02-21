import { LogUtils, VscodeUtils } from ".";

export function handleError(error: unknown): void {
	let Message: string;
	const errorMessage = error instanceof Error ? error.message : String(error);
	const stackTrace =
		error instanceof Error && error.stack
			? error.stack
			: "No stack trace available.\n";

	if (error instanceof SyntaxError) {
		Message = `Syntax Error: ${errorMessage}\n\nStack Trace:\n${stackTrace}`;
	} else if (error instanceof TypeError) {
		Message = `Type Error: ${errorMessage}\n\nStack Trace:\n${stackTrace}`;
	} else {
		Message = `Unexpected Error: ${errorMessage}`; //\n\nStack Trace:\n${stackTrace}`
	}

	LogUtils.logError(Message);
	VscodeUtils.alertMessage({
		type: "error",
		message: Message,
	});
}
