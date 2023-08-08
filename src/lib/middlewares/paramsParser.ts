import { RoutingTable } from "../../types.js";

function paramsParser(routingTable: RoutingTable, pathname: string) {
	const params: Record<string, string> = {};

	for (const staticRoute in routingTable) {
		const staticParts = staticRoute.split("/").filter(Boolean);
		const dynamicParts = pathname.split("/").filter(Boolean);

		if (staticParts.length !== dynamicParts.length) return params;

		for (const [i, staticPart] of staticParts.entries()) {
			const dynamicPart = dynamicParts[i];

			if (staticPart.startsWith("[") && staticPart.endsWith("]")) {
				const paramName = staticPart.replace(/[[\]]/g, "");
				params[paramName] = dynamicPart;
			}
		}
	}

	return params;
}

export { paramsParser };
