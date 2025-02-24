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

import { alertMessage } from "../utils/vscodeUtils";

suite("alerMessage test", () => {
	test("info", async () => {
		await alertMessage({ type: "info", message: "test" });
	});

	test("info, button1", async () => {
		await alertMessage({
			type: "info",
			message: "test",
			buttons: [{ label: "확인", action: () => console.log("진행함") }],
		});
	});

	test("info, button2", async () => {
		await alertMessage({
			type: "info",
			message: "test",
			buttons: [
				{ label: "확인", action: () => console.log("진행함") },
				{ label: "취소", action: () => console.log("취소함") },
			],
		});
	});
});
