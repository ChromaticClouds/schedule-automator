import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      jti: string;
      sid: string;
      sub: string;
      type: 'access';
    };
    user: {
      jti: string;
      sid: string;
      sub: string;
      type: 'access';
    };
  }
}
