import Fastify from 'fastify';
import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import fastifyPostgres from '@fastify/postgres';
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';

const fastify = Fastify({
    logger: true,
}).withTypeProvider<JsonSchemaToTsProvider>();

fastify.register(require('@fastify/schema'));

fastify.get("/", {
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
        return { message: "hello world" };
    }
});

async function userRoutes(fastify: FastifyInstance) {
    fastify.addHook("onRequest", (request: FastifyRequest, reply: FastifyReply, done) => {
        fastify.log.info("Got request");
        done();
    })
    
    fastify.addHook("onResponse", async (request: FastifyRequest, reply: FastifyReply) => {
        fastify.log.info(`Responding: ${reply.elapsedTime}ms`);
    })

    fastify.addSchema({
        $id: "createUserSchema",
        type: "object",
        required: ["name", "password"],
        properties: {
            name: {type: "string"},
            email: {type: "string"},
            password: {type: "string"}
        },
    })

    fastify.post("/", {
        schema: {
            body: {$ref: "createUserSchema#"},
            response: {
                201: {
                    type: "object",
                    properties: {
                        name: {type: "string"},
                        email: {type: "string"},
                        password: {type: "string"}
                    }
                }
            },
        },
        
        handler: async (request: FastifyRequest<{
            Body: {
                name: string;
                email: string;
                password: string;
            }
        }>, reply: FastifyReply) => {
            const body = request.body;

            const jwt = fastify.signJwt();
            const verified = fastify.verifyJwt();
            console.log(body)
            return reply.code(201).send(body);
        }
    });
}

fastify.get('/err', () => {
    return {message: "error"}
})

async function dbConnecter(fastify: FastifyInstance) {
    fastify.register(fastifyPostgres, {
        connectionString: process.env.DATABASE_URL
    });

    fastify.log.info("Connected to database");
}

declare module "fastify" {
    interface FastifyRequest {
        user: string;
    }

    interface FastifyInstance {
        signJwt: () => string;
        verifyJwt: () => {
            name: string;
        }
    }
}

fastify.decorateRequest("user", "");

fastify.addHook(
    "preHandler",
    (request: FastifyRequest, reply: FastifyReply, done) => {
        request.user = "Bob Jones"
        done();
    }
)

fastify.decorate('signJwt', () => {
    return "Signed JWT"
})

fastify.decorate('verifyJwt', () => {
    return {
        name: "Tom"
    }
})

fastify.register(dbConnecter);

fastify.register(userRoutes, {prefix: "/api/users"});

async function main() {
    await fastify.listen({
        port: 3000,
        host: "0.0.0.0"
        });
}



["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, async () => {
        await fastify.close();
        process.exit(0);
    });
});

main();