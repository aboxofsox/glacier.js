import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "http";
import { contentTypes, requestMethods } from "./lib/request/index.js";

/**************************************************/
type Glacier = (options: Configuration) => void;

type Configuration = {
	port: number;
	routesDir: string;
};

type RouteHandler = (request: GlacierRequest, response: GlacierResponse) => Promise<void> | void;

type RoutingTable = {
	[pathname: string]: {
		before?: RouteHandler;
		handler: RouteHandler;
		after?: RouteHandler;
	};
};

type RequestMethod = (typeof requestMethods)[number];

type ContentType = (typeof contentTypes)[number];

type RequestHeaders = {
	[K in keyof IncomingHttpHeaders as string extends K
		? never
		: number extends K
		? never
		: K]: K extends "content-type" ? ContentType : IncomingHttpHeaders[K];
};

type SharedSendArgs<T extends keyof RequestHeaders> = {
	/**
	 * default: 200 (OK)
	 */
	status?: number;
	headers?: Omit<RequestHeaders, T>;
	customHeaders?: Record<string, string>;
};

interface GlacierRequest {
	/**
	 * node.js standard http.IncomingMessage
	 */
	readonly stdlib: IncomingMessage;
	readonly method: RequestMethod;
	readonly url: URL;
	readonly body: Record<string, string>;
	readonly cookies: IncomingHttpHeaders;
	readonly query: Record<string, string>;
	readonly params: Record<string, string>;
}

interface GlacierResponse {
	/**
	 * node.js standard http.ServerResponse
	 */
	readonly stdlib: ServerResponse;
	/**
	 * custom object to store values in
	 */
	custom?: Record<string, unknown>;
	readonly html: (data: string, options?: SharedSendArgs<"content-type">) => void;
	readonly text: (data: TextData, options?: SharedSendArgs<"content-type">) => void;
	readonly json: (data: JsonData, options?: SharedSendArgs<"content-type">) => void;
	readonly redirect: (url: string) => void;
}

// misc.
type TextData = string | number | boolean | null;
type JsonData = string | number | boolean | null | { [key: string]: JsonData } | JsonData[];
interface FStat {
	fullPath: string;
	isJsFile: boolean;
	isDirectory: boolean;
}
/**************************************************/

export {
	Glacier,
	GlacierRequest,
	GlacierResponse,
	RequestMethod,
	RoutingTable,
	RequestHeaders,
	ContentType,
	RouteHandler,
	FStat,
};
