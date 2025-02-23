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

export const DEBUG = false;
export const CONFIG_NAME = "devdockConfig.json";
export const DEFAULT_CONFIG = {
	languageMap: {
		py: "python",
		js: "node",
		go: "go",
		ts: "typescript",
		java: "java",
		cpp: "cpp",
	} as Record<string, string>,
	dockerTemplates: {
		python: `
FROM python:3.10-slim

WORKDIR /app
COPY . /app

# RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "/app/main.py"]
        `.trim(),
		node: `
FROM node:18

WORKDIR /app
COPY . /app

RUN npm install

CMD ["node", "/app/main.js"]
        `.trim(),
		go: `
FROM golang:1.20

WORKDIR /app
COPY . /app

RUN go build -o main .

CMD ["./main"]
        `.trim(),
		typescript: `
FROM node:18

WORKDIR /app
COPY . /app

RUN npm install -g ts-node && npm install

CMD ["ts-node", "/app/main.ts"]
        `.trim(),
		java: `
FROM openjdk:17

WORKDIR /app
COPY . /app
RUN javac Main.java

CMD ["java", "-cp", "/app", "Main"]
        `.trim(),
		cpp: `
FROM gcc:latest

WORKDIR /app
COPY . /app

RUN g++ -o /app/main /app/main.cpp

CMD ["./main"]
        `.trim(),
	} as Record<string, string>,
};
