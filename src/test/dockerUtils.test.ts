import * as assert from "assert";

import fs from "fs/promises";
import {
	parseDockerfile,
	mapDockerPorts,
	mapDockerVolumes,
} from "../utils/dockerUtils"; // 실제 파일 경로 확인 필요

suite("Dockerfile Parsing Test Suite", () => {
	test("Should parse exposed ports from Dockerfile", async () => {
		const parse = await parseDockerfile(
			"./src/test/dockerfiles/python.Dockerfile"
		);

		const ports = parse.ports;
		const volumes = parse.volumes;

		console.log("Parsed Ports:", ports);
		console.log("Parsed Volumes:", volumes);
	});

	// 1. mapDockerPorts 테스트
	test("Should map exposed ports from Dockerfile to external ports", async () => {
		const dockerFilePath = "./src/test/dockerfiles/python.Dockerfile";
		const result = await mapDockerPorts(dockerFilePath);

		console.log("Mapped Ports:", result);
	});

	// 2. volumeDockermount 테스트 - 설정 파일이 없는 경우
	test("Should generate default mount config and map volumes when config file does not exist", async () => {
		const dockerFilePath = "./src/test/dockerfiles/python.Dockerfile";
		const configPath = `${dockerFilePath}.mount.json`;

		const result = await mapDockerVolumes(dockerFilePath);
		console.log("Mapped Volumes (default):", result);

		// 설정 파일이 생성되었는지 확인
		const configExists = await fs
			.stat(configPath)
			.then(() => true)
			.catch(() => false);
		assert.ok(configExists, "Mount config file should be generated");
	});
});
