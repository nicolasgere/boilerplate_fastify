import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import {
	ContextConfigDefault,
	FastifyReply,
	FastifySchema,
	RawReplyDefaultExpression,
	RawRequestDefaultExpression,
	RawServerDefault,
	RouteGenericInterface,
} from "fastify";

export type FastifyReplyTypebox<TSchema extends FastifySchema> = FastifyReply<
	RawServerDefault,
	RawRequestDefaultExpression,
	RawReplyDefaultExpression,
	RouteGenericInterface,
	ContextConfigDefault,
	TSchema,
	TypeBoxTypeProvider
>;
