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
import * as fs from "fs";


import { LogUtils, VscodeUtils } from ".";
import {
	DEFAULT_CONFIG,
	CONFIG_NAME,
	userConfig,
	setUserConfig
} from "../config/constants";


export function doesFileExist(filePath: string): boolean {
	return fs.existsSync(filePath);
}


export async function getConfigFilePath(
	context: vscode.ExtensionContext
): Promise<string> {
	const configDir = context.globalStorageUri.fsPath;
	await fsp.mkdir(configDir, { recursive: true });
	return path.join(configDir, CONFIG_NAME);
}

export function detectLanguage(): string {
	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		throw new Error(`No active file selected.`);
	}

	const fileExtension = activeEditor.document.fileName.split(".").pop();
	if (!fileExtension) {
		throw new Error(`Failed to detect file extension.`);
	}

	const language = userConfig.languageMap[fileExtension];
	if (!(language in userConfig.dockerTemplates)) {
		throw new Error(`No template found for '${language} (.${fileExtension})'`);
	}

	return language;
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
	if (!activeEditor) {
		VscodeUtils.alertMessage({
			type: "warn",
			message: "활성화된 파일이 없습니다.",
		});
		return null;
	}

	return path.dirname(activeEditor.document.uri.fsPath);
}

export async function makeDockerfile(language: string): Promise<void> {
	const template = userConfig.dockerTemplates[language];
	if (!template) {
		throw new Error(`"${language}"에 대한 Dockerfile 템플릿이 없습니다.`);
	}

	const directoryPath = getActiveFilePath();
	const dockerfilePath = `${directoryPath}/${language}.Dockerfile`;

	await fsp.writeFile(dockerfilePath, template, { encoding: "utf8" });

	VscodeUtils.alertMessage({
		type: "info",
		message: `Dockerfile 생성 완료: ${dockerfilePath}`,
	});
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
 * config.ts의 DEFAULT_CONFIG를 파일에 저장 (비동기, Atomic)
 */
export async function saveConfig(
	config: any,
	configFilePath: string
): Promise<void> {
	const content = JSON.stringify(config, null, 4);
	await atomicWriteConfig(configFilePath, content);
	LogUtils.logMessage("debug", `Config saved to ${configFilePath}`);
}

export async function atomicWriteConfig(
	filePath: string,
	content: string
): Promise<void> {
	const tempFilePath = filePath + ".tmp";

	try {
		await fsp.writeFile(tempFilePath, content, "utf8");
		await fsp.rename(tempFilePath, filePath);
	} catch (error: any) {
		throw new Error(
			`[atomicWriteConfig] Failed to save config to ${filePath}: ${error.message}`
		);
	}
}


/**
 * 확장 경로에 저장된 config.json을 로드하여 JS 객체로 반환
 * 파일이 없거나 에러가 나면 DEFAULT_CONFIG 반환
 */
export async function loadConfig(configFilePath: string): Promise<any> {
    const fileExists = await doesFileExist(configFilePath);
    if (!fileExists) {
        console.warn(`[loadConfig] Config file not found. Returning default config.`);
        return { success: false, data: DEFAULT_CONFIG }; // 파일이 없으면 기본 설정 반환
    }

    try {
        const content = await fsp.readFile(configFilePath, "utf8");
        const parsed = JSON.parse(content);
        return { success: true, data: parsed }; // 성공적으로 읽었으면 JSON 반환
    } catch (error) {
        console.error(`[loadConfig] Failed to parse config: ${error}`);
        return { success: false, data: DEFAULT_CONFIG }; // 파싱 에러 시 기본 설정 반환
    }
}

export async function ensureConfigFile(context: vscode.ExtensionContext) {
    const configFilePath = await getConfigFilePath(context);
    try {
        const loadConfigResult = await loadConfig(configFilePath);

        const userConfig = loadConfigResult.data;
        const mergedConfig = mergeConfigsIterative(DEFAULT_CONFIG, userConfig); // 병합 시 기본값 우선 적용

        await saveConfig(mergedConfig, configFilePath);
        LogUtils.logMessage("debug", `Merged config: ${JSON.stringify(mergedConfig, null, 4)}`);
    } catch (error) {
        console.error(`[ensureConfigFile] Error: ${error}`);
        const defaultConfig = { ...DEFAULT_CONFIG };
        await saveConfig(defaultConfig, configFilePath);
    }
}

export async function updateUserConfig(context: vscode.ExtensionContext) {
    const configFilePath = await getConfigFilePath(context);
    console.log("Config File Path:", configFilePath);

    const loadConfigResult = await loadConfig(configFilePath);
    console.log("Load Config Result:", loadConfigResult);

    if (!loadConfigResult.success) {
        console.error("Failed to load config. Using default settings.");
    }

    setUserConfig(loadConfigResult.data);
}