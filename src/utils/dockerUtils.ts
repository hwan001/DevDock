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

import * as net from "net";

import fs from "fs/promises";
import { exec } from "child_process";
import { TerminalUtils, ConfigUtils, VscodeUtils } from ".";

const buildStatus: Map<string, boolean> = new Map();

export const DockerCommands = {
	checkImage: (imageName: string) => `docker images -q ${imageName}`,
	checkContainer: (containerName: string) =>
		`docker ps -a -q -f name=${containerName}`,
	getLatestContainer: (containerName: string) =>
		`docker ps --latest -q -a -f name=${containerName}`,
	removeContainers: (containerName: string) =>
		`docker ps -a --filter "name=${containerName}" --format "{{.ID}}"`,
	getDanglingContainers: () =>
		`docker images -q --filter "dangling=true" | xargs -I {} docker ps -a --filter "ancestor={}" -q`,
	getDanglingImages: () => `docker images -q --filter "dangling=true"`,
	getImagesByName: (imageNameFilter: string) =>
		`docker images --filter "reference=${imageNameFilter}" --format "{{.ID}}"`,
	removeImageById: (imageId: string) => `docker rmi -f ${imageId}`,
	removeContainerById: (containerId: string) => `docker rm -f ${containerId}`,
};

export async function run(language: string): Promise<void> {
	const activeFilePath = ConfigUtils.getActiveFilePath();
	if (!activeFilePath) {
		throw new Error("Unable to determine active file path.");
	}

	let Commands: string[] = [];
	let portOption = "";
	let volumeOption = "";

	const imageName = `${language}-dev-image:latest`;
	const containerName = `${language}-dev-container`;
	const dockerFilePath = `${activeFilePath}/${language}.Dockerfile`;
	const exec = require("child_process").execSync;

	const containers: string[] = exec(
		DockerCommands.removeContainers(containerName)
	)
		.toString()
		.trim()
		.split("\n");
	containers.forEach((containerId: string) => {
		if (containerId) {
			exec(DockerCommands.removeContainerById(containerId));
		}
	});

	if (buildStatus.get(imageName)) {
		VscodeUtils.alertMessage({
			type: "warn",
			message: `이미 ${imageName} 빌드 작업이 진행 중입니다.`,
		});
		return;
	}
	buildStatus.set(imageName, true);

	try {
		const dockerFileExist = await ConfigUtils.doesFileExist(dockerFilePath);
		if (!dockerFileExist) {
			VscodeUtils.alertMessage({
				type: "warn",
				message: `Not found ${dockerFilePath}`,
			});
			ConfigUtils.makeDockerfile(language);
		}

		Commands.push(
			`docker build --no-cache -f ${dockerFilePath} -t ${imageName} .`
		);

		portOption = await mapDockerPorts(dockerFilePath);
		volumeOption = await mapDockerVolumes(dockerFilePath);

		Commands.push(
			`docker run ${portOption} ${volumeOption} --name ${containerName} -d ${imageName}`
		);
		Commands.push(`docker logs ${containerName}`);

		TerminalUtils.runMultilineCommandsOnTerminal(containerName, Commands);
	} catch (error) {
		throw error;
	} finally {
		buildStatus.set(imageName, false);
	}
}

export async function logs(language: string): Promise<void> {
	let Commands: string[] = [];
	const containerName = `${language}-dev-container`;

	try {
		Commands.push(`docker logs -f ${containerName}`);
		TerminalUtils.runMultilineCommandsOnTerminal(containerName, Commands);
	} catch (error) {
		throw error;
	}
}

export async function removeContainer(language: string): Promise<void> {
	const containerName = `${language}-dev-container`;
	const exec = require("child_process").execSync;
	const containers: string[] = exec(
		DockerCommands.removeContainers(containerName)
	)
		.toString()
		.trim()
		.split("\n");

	containers.forEach((containerId: string) => {
		if (containerId) {
			exec(DockerCommands.removeContainerById(containerId));
			VscodeUtils.alertMessage({
				type: "info",
				message: `Deleted container: ${containerId}`,
			});
		}
	});
}

export async function removeImage(language: string): Promise<void> {
	const imageName = `${language}-dev-image:latest`;
	const exec = require("child_process").execSync;
	const danglingImages: string[] = exec(DockerCommands.getDanglingImages())
		.toString()
		.trim()
		.split("\n");
	const images: string[] = exec(DockerCommands.getImagesByName(imageName))
		.toString()
		.trim()
		.split("\n");

	images.forEach((imageId: string) => {
		if (imageId) {
			exec(DockerCommands.removeImageById(imageId));
			VscodeUtils.alertMessage({
				type: "info",
				message: `Deleted image: ${imageId}`,
			});
		}
	});

	danglingImages.forEach((imageId: string) => {
		if (imageId) {
			exec(DockerCommands.removeImageById(imageId));
			VscodeUtils.alertMessage({
				type: "info",
				message: `Deleted image: ${imageId}`,
			});
		}
	});
}

export async function checkDockerAvailability(): Promise<Boolean> {
	return new Promise((resolve) => {
		exec("docker --version", (error) => {
			if (error) {
				resolve(false);
			} else {
				resolve(true);
			}
		});
	});
}

export async function checkContainerExists1(
	containerName: string
): Promise<Boolean> {
	return new Promise((resolve) => {
		exec(`docker ps -a -q -f name=${containerName}`, (error, stdout) => {
			resolve(stdout.trim().length > 0); // 컨테이너 이름이 존재하면 true 반환
		});
	});
}

export async function parseDockerfile(
	dockerfilePath: string
): Promise<{ ports: number[]; volumes: string[] }> {
	try {
		const dockerfileContent = await fs.readFile(dockerfilePath, "utf-8");

		// EXPOSE 파싱
		const exposeRegex = /EXPOSE\s+(.+)/g;
		const ports: number[] = [];

		let exposeMatch: RegExpExecArray | null;
		while ((exposeMatch = exposeRegex.exec(dockerfileContent)) !== null) {
			const portString = exposeMatch[1];
			const portNumbers = portString
				.split(/[\s,]+/)
				.map((port) => parseInt(port, 10))
				.filter((port) => !isNaN(port));
			ports.push(...portNumbers);
		}

		// VOLUME 파싱
		const volumeRegex = /VOLUME\s+(.+)/g;
		const volumes: string[] = [];

		let volumeMatch: RegExpExecArray | null;
		while ((volumeMatch = volumeRegex.exec(dockerfileContent)) !== null) {
			const volumeString = volumeMatch[1].trim();

			if (volumeString.startsWith("[") && volumeString.endsWith("]")) {
				try {
					const volumePaths = JSON.parse(volumeString) as string[];
					volumes.push(...volumePaths);
				} catch (e) {
					console.warn(`Invalid JSON in VOLUME: ${volumeString}`);
				}
			} else {
				const volumePaths = volumeString.split(/[\s,]+/).filter(Boolean);
				volumes.push(...volumePaths);
			}
		}

		return {
			ports: [...new Set(ports)], // 포트 중복 제거
			volumes: [...new Set(volumes)], // 볼륨 중복 제거
		};
	} catch (error) {
		console.error(`Failed to parse Dockerfile at ${dockerfilePath}:`, error);
		return { ports: [], volumes: [] };
	}
}

export async function mapDockerVolumes(
	dockerFilePath: string
): Promise<string> {
	const { volumes } = await parseDockerfile(dockerFilePath);
	if (volumes.length === 0) {
		return "";
	}

	const configPath = `${dockerFilePath}.mount.json`; // 예: Dockerfile.mount.json
	let hostMounts: { [key: string]: string } = {};

	// 설정 파일이 없으면 기본값으로 생성
	if (!(await fs.stat(configPath).catch(() => false))) {
		// 기본 경로를 /app/<파싱한 경로>로 설정
		hostMounts = Object.fromEntries(
			volumes.map((containerVolume) => [
				containerVolume,
				`./${containerVolume}`,
			])
		);
		await fs.writeFile(
			configPath,
			JSON.stringify({ volumes: hostMounts }, null, 2)
		);
		console.log(
			`Generated default mount config at ${configPath}. Please edit it.`
		);
	} else {
		hostMounts = (
			JSON.parse(await fs.readFile(configPath, "utf-8")) as {
				volumes: { [key: string]: string };
			}
		).volumes;
	}

	const mappingList: string[] = volumes.map((containerVolume) => {
		const hostVolume = hostMounts[containerVolume] || `/app${containerVolume}`; // 설정 파일에 없으면 기본값 사용
		return `-v ${hostVolume}:${containerVolume}`;
	});

	return mappingList.join(" ");
}

export async function mapDockerPorts(dockerFilePath: string): Promise<string> {
	const exposedPorts = (await parseDockerfile(dockerFilePath)).ports;
	if (exposedPorts.length === 0) {
		return "";
	}

	const mappingList: string[] = [];

	for (const internalPort of exposedPorts) {
		const randomHighPort = getRandomHighPort();
		const externalPort = await findAvailablePort(randomHighPort);

		mappingList.push(`-p ${externalPort}:${internalPort}`);
	}

	return mappingList.join(" ");
}

function getRandomHighPort(): number {
	const min = 30000;
	const max = 60000;
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function findAvailablePort(startPort: number): Promise<number> {
	return new Promise((resolve, reject) => {
		const server = net.createServer();
		server.on("error", () => {
			findAvailablePort(startPort + 1)
				.then(resolve)
				.catch(reject);
		});

		server.listen(startPort, () => {
			const port = (server.address() as net.AddressInfo).port;
			server.close(() => resolve(port));
		});
	});
}
