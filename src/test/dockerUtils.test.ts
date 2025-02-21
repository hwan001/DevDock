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

import * as assert from "assert";

import fs from "fs/promises";
import {
	parseDockerfile,
	mapDockerPorts,
	mapDockerVolumes,
} from "../utils/dockerUtils";

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

	test("Should map exposed ports from Dockerfile to external ports", async () => {
		const dockerFilePath = "./src/test/dockerfiles/python.Dockerfile";
		const result = await mapDockerPorts(dockerFilePath);

		console.log("Mapped Ports:", result);
	});

	test("Should generate default mount config and map volumes when config file does not exist", async () => {
		const dockerFilePath = "./src/test/dockerfiles/python.Dockerfile";
		const configPath = `${dockerFilePath}.mount.json`;

		const result = await mapDockerVolumes(dockerFilePath);
		console.log("Mapped Volumes (default):", result);

		const configExists = await fs
			.stat(configPath)
			.then(() => true)
			.catch(() => false);
		assert.ok(configExists, "Mount config file should be generated");
	});
});
