import path from "node:path";
import { readdir, stat } from "node:fs/promises";
import { RoutingTable } from "../types.js";
import { pathToFileURL } from "node:url";

async function traverseDir(dir: string): Promise<string[]> {
	const files = await readdir(dir);
	const stats = await Promise.all(
		files.map(async file => {
			const fullPath = path.join(dir, file);

			return {
				fullPath,
				isJsFile: path.extname(file) === ".js",
				isDirectory: (await stat(fullPath)).isDirectory(),
			};
		})
	);

	const dirs = [];
	const routeFiles = [];

	for (const { fullPath, isJsFile, isDirectory } of stats) {
		if (isDirectory) {
			dirs.push(fullPath);
		} else if (isJsFile) {
			routeFiles.push(fullPath);
		}
	}

	const subDirs = await Promise.all(dirs.map(traverseDir));
	return routeFiles.concat(...subDirs);
}

async function buildRoutingTable(dir: string) {
	const table: RoutingTable = {};
	const routeFiles = await traverseDir(dir);

	for (const filePath of routeFiles) {
		let normalPath = path.normalize(filePath.replace(dir, "")).replaceAll("\\", "/");

		const esModule = await import(pathToFileURL(normalPath).toString());

		normalPath = normalPath.replace(".js", "").replace("index", "");
		if (normalPath !== "/" && normalPath.endsWith("/"))
			normalPath = normalPath.slice(0, normalPath.length - 1);

		normalPath = normalPath.replace(dir, "");

		if (!esModule.main) throw "Expected a 'main' HTTP handler function.";

		if (!table[normalPath]) {
			table[normalPath] = {} as RoutingTable[number];
		}

		if (esModule.before) {
			table[normalPath].before = esModule.before;
		}

		table[normalPath].main = esModule.main;

		if (esModule.after) {
			table[normalPath].after = esModule.after;
		}
	}

	return table;
}

export { buildRoutingTable };
