import { Issuer } from "openid-client";
import { Configuration, ConfigurationService } from "./configuration";

export interface OpenIdUser {
	email: string;
	uuid: string;
}
export type oauthProviderName = "google";
export interface oauthProviderConfig {
	name: oauthProviderName;
	discoveryUrl: string;
	clientId: string;
	clientSecret: string;
	scopes: string[];
}

export class OpenIdService {
	private configuration: Configuration;
	private openidProviders: Record<oauthProviderName, oauthProviderConfig>;
	constructor({
		configurationService,
	}: { configurationService: ConfigurationService }) {
		this.configuration = configurationService.get();
		this.openidProviders = {
			google: {
				name: "google",
				discoveryUrl: "https://accounts.google.com",
				clientId: this.configuration.google_client_id,
				clientSecret: this.configuration.google_client_secret,
				scopes: [
					"https://www.googleapis.com/auth/userinfo.email",
					"https://www.googleapis.com/auth/userinfo.profile",
				],
			},
		};
	}
	private async getClientForProvider(providerName: oauthProviderName) {
		const provider = this.openidProviders[providerName];
		const issuer = await Issuer.discover(provider.discoveryUrl);
		return await new issuer.Client({
			client_id: provider.clientId,
			client_secret: provider.clientSecret,
			redirect_uris: [
				`${this.configuration.server_domain}/auth/${provider.name}/callback`,
			],
			response_types: ["code"],
		});
	}
	async exchangeCode(
		providerName: oauthProviderName,
		code: string,
		state: string,
	): Promise<OpenIdUser> {
		const client = await this.getClientForProvider(providerName);
		const tokenSet = await client.callback(
			`${this.configuration.server_domain}/auth/google/callback`,
			{ code, state },
			{ state },
		);
		const user = await client.userinfo(tokenSet);
		if (!user.email) {
			throw "email is missing from user ingo";
		}
		return { email: user.email, uuid: user.sub };
	}
	async getRedirectUrl(
		providerName: oauthProviderName,
		state: "signup" | "login",
	): Promise<string> {
		const client = await this.getClientForProvider(providerName);
		const providerConfig = this.openidProviders[providerName];
		return client.authorizationUrl({
			scope: providerConfig.scopes.join(" "),
			state,
		});
	}
}
