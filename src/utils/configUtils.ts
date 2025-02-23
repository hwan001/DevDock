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
import * as path from "path";
import * as fsp from "fs/promises";

import { LogUtils, VscodeUtils } from ".";
import { Result } from "../types/gbInterface";
import { CONFIG_NAME, DEFAULT_CONFIG } from "../config/constants";

export async function doesFileExist(filePath: string): Promise<boolean> {
	try {
		await fsp.access(filePath);
		return true;
	} catch {
		return false;
	}
}

/**
 * 스택 기반 머지 로직 (iterative)
 * 사용자 config(userObj)와 defaultConfig(mergedObj)를 병합해 최종 결과 리턴
 * - userObj의 값이 우선 적용
 * - 중첩 객체면 내부 필드도 순회하며 병합
 */
export function mergeConfigsIterative(userObj: any, defaultObj: any): any {
	// defaultObj를 복제해서 merged를 만듦
	const merged = { ...defaultObj };

	// 스택에는 머지할 두 객체 쌍( user, merged )을 push
	const stack: Array<{ userRef: any; mergedRef: any }> = [];
	stack.push({ userRef: userObj, mergedRef: merged });

	while (stack.length > 0) {
		const { userRef, mergedRef } = stack.pop()!;

		for (const key in userRef) {
			// userRef[key]와 mergedRef[key]가 둘 다 "object"라면 내부 필드도 병합해야 함.
			const userVal = userRef[key];
			const mergedVal = mergedRef[key];

			if (
				userVal &&
				typeof userVal === "object" &&
				!Array.isArray(userVal) &&
				mergedVal &&
				typeof mergedVal === "object" &&
				!Array.isArray(mergedVal)
			) {
				// 중첩 객체이므로 스택에 push
				stack.push({
					userRef: userVal,
					mergedRef: mergedVal,
				});
			} else {
				// 그 외 경우(기본형, 배열 등) => userVal이 우선권
				mergedRef[key] = userVal;
			}
		}
	}

	return merged;
}

/**
 * 원자적(Atomic) 파일 쓰기
 * 1) 임시 파일에 먼저 write
 * 2) rename으로 최종 파일에 덮어쓰기
 */
export async function atomicWriteConfig(
	filePath: string,
	content: string
): Promise<void> {
	const tempFilePath = filePath + ".tmp";

	// 임시 파일에 먼저 쓴 뒤
	await fsp.writeFile(tempFilePath, content, "utf8");

	// rename으로 최종 파일 교체
	await fsp.rename(tempFilePath, filePath);
}

/**
 * config.ts의 DEFAULT_CONFIG를 파일에 저장 (비동기, Atomic)
 */
export async function saveConfig(
	config: any,
	configFilePath: string
): Promise<void> {
	const content = JSON.stringify(config, null, 4);
	await atomicWriteConfig(configFilePath, content);
	LogUtils.logDebug(`Config saved to ${configFilePath}`);
}

/**
 * 확장 경로에 저장된 config.json을 로드하여 JS 객체로 반환
 * 파일이 없거나 에러가 나면 DEFAULT_CONFIG 반환
 */
export async function loadConfig(configFilePath: string): Promise<Result<any>> {
	// 1) 파일 존재 여부 확인
	const fileExists = await doesFileExist(configFilePath);
	if (!fileExists) {
		// 파일이 없으면 실패 처리 + 기본값 반환
		return {
			success: false,
			data: DEFAULT_CONFIG,
			error: `Config file not found. Returning default config.`,
		};
	}

	try {
		// 2) 파일 읽고, JSON 파싱
		const content = await fsp.readFile(configFilePath, "utf8");
		const parsed = JSON.parse(content);

		// 3) 성공 반환
		return {
			success: true,
			data: parsed,
		};
	} catch (error: any) {
		// 4) 파싱/읽기 실패 시, 기본값 + 에러 메시지
		return {
			success: false,
			data: DEFAULT_CONFIG,
			error: `Failed to read or parse config file. \n${error}`,
		};
	}
}

/**
 * Extension 구동 시점에 Config파일 경로 설정 (비동기)
 * - context.globalStorageUri를 통해 안전한 경로 사용
 */
export async function getConfigFilePath(
	context: vscode.ExtensionContext
): Promise<string> {
	const configDir = context.globalStorageUri.fsPath;

	try {
		await fsp.mkdir(configDir, { recursive: true });
	} catch (error) {
		throw error;
	}

	return String(path.join(configDir, CONFIG_NAME));
}

/**
 * 언어 감지 함수
 */
export function detectLanguage(): Result<string> {
	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		return {
			success: false,
			error: "No active file selected.",
		};
	}

	const fileExtension = activeEditor.document.fileName.split(".").pop();
	if (!fileExtension) {
		return {
			success: false,
			error: "Failed to detect file extension.",
		};
	}

	const languageMap = DEFAULT_CONFIG.languageMap;

	if (languageMap[fileExtension]) {
		const language = languageMap[fileExtension];
		return {
			success: true,
			data: language,
		};
	}

	return {
		success: false,
		error: `Unsupported file type: .${fileExtension}`,
	};
}

/**
 * Extension 초기화 시
 * 1) config 파일이 존재하면 로딩하여 userConfig로 얻음
 * 2) DEFAULT_CONFIG와 병합 (스택 기반 머지 사용)
 * 3) 병합 결과를 Atomic 방식으로 최종 저장
 */
export async function ensureConfigFile(context: vscode.ExtensionContext) {
	const configFilePath = await getConfigFilePath(context);
	try {
		const loadConfigResult = await loadConfig(configFilePath);
		if (!loadConfigResult.success) {
			throw new Error(loadConfigResult.error);
		}

		const userConfig = loadConfigResult.data;
		const mergedConfig = mergeConfigsIterative(userConfig, DEFAULT_CONFIG);

		await saveConfig(mergedConfig, configFilePath);
		LogUtils.logDebug(
			`Merged config: ${JSON.stringify(mergedConfig, null, 4)}`
		);
	} catch (error) {
		await saveConfig(DEFAULT_CONFIG, configFilePath);
		LogUtils.logError(
			`Failed to read or parse config file. Overwriting with default config.`
		);
	}
}

export function getRootPath(): string | null {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) {
		vscode.window.showErrorMessage(
			"No workspace folder is open. Please open a folder or workspace to proceed."
		);
		return null;
	}
	return workspaceFolders[0].uri.fsPath;
}

export function getActiveFilePath(): string | null {
	const activeEditor = vscode.window.activeTextEditor;

	if (activeEditor) {
		const document = activeEditor.document;
		const filePath = document.uri.fsPath;
		const directoryPath = path.dirname(filePath);
		return directoryPath;
	} else {
		VscodeUtils.alertMessage({
			type: "warn",
			message: "활성화된 파일이 없습니다.",
		});
		return null;
	}
}

export async function makeDockerfile(language: string): Promise<void> {
	const template = DEFAULT_CONFIG.dockerTemplates[language];
	if (!template) {
		VscodeUtils.alertMessage({
			type: "error",
			message: `"${language}"에 대한 Dockerfile 템플릿이 없습니다.`,
		});
		return;
	}

	const directoryPath = getActiveFilePath();
	const dockerfilePath = `${directoryPath}/${language}.Dockerfile`;

	try {
		const fileExists = await fsp
			.access(dockerfilePath)
			.then(() => true)
			.catch(() => false);

		if (fileExists) {
			const overwrite = await vscode.window.showQuickPick(["Yes", "No"], {
				placeHolder: `Dockerfile이 이미 존재합니다. 덮어쓰시겠습니까?`,
			});
			if (overwrite !== "Yes") {
				VscodeUtils.alertMessage({
					type: "info",
					message: "Dockerfile 생성이 취소되었습니다.",
				});
				return;
			}
		}

		await fsp.writeFile(dockerfilePath, template, { encoding: "utf8" });
		VscodeUtils.alertMessage({
			type: "info",
			message: `Dockerfile 생성 완료: ${dockerfilePath}`,
		});
	} catch (error) {
		VscodeUtils.alertMessage({
			type: "error",
			message: `Dockerfile 생성 중 오류 발생`,
		});
	}
}
