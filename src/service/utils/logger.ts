import { FastifyReply } from "fastify";

export class Logger {
	private requestId;
	constructor({ reply }: { reply: FastifyReply }) {
		this.requestId = Math.random().toString(36).substring(3);
		reply.header("chroma-request-id", this.requestId);
	}

	info(message: string) {
		console.log(this.requestId, message);
	}
}
