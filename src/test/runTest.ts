import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
    try {
        await runTests({
            extensionDevelopmentPath: path.resolve(__dirname, '../../'), // 확장 개발 경로
            extensionTestsPath: path.resolve(__dirname, './dockerUtils.test.js'), // 올바른 테스트 파일 경로 설정
            launchArgs: ['--disable-extensions'], // 확장 없이 실행
        });
    } catch (err) {
        console.error('Failed to run tests:', err);
        process.exit(1);
    }
}

main();