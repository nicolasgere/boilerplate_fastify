import { run } from "node:test";
import { spec, tap } from "node:test/reporters";
import { globSync } from "glob";

let testReporter = tap;
if (!process.env.CI) {
	// Node type is wrong
	// @ts-ignore
	testReporter = spec;
}

run({
	files: globSync("src/**/*.test.ts"),
	concurrency: true
})
	.compose(testReporter)
	.pipe(process.stdout);
