export class ServerError extends Error {
	public readonly name: string;
	public readonly httpCode: number;
	public readonly description: string;

	constructor(name: string, httpCode: number, description: string) {
		super(description);
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = name;
		this.httpCode = httpCode;
		this.description = description;
		Error.captureStackTrace(this);
	}
}
