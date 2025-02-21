export const DEBUG = false;
export const CONFIG_NAME = "devDockConfig.json";
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

RUN pip install --no-cache-dir -r requirements.txt

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
