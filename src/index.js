const { ApolloServer } = require("apollo-server");
const typeDefs = require("./typedefs");
const resolvers = require("./resolvers");
const { createToken, getUserFromToken } = require("./auth");
const db = require("./db");
const {
  DateFormatDirective,
  AuthenticateDirective,
  AuthorizationDirective,
} = require("./directives");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    formatDate: DateFormatDirective,
    authenticated: AuthenticateDirective,
    authorized: AuthorizationDirective,
  },
  context({ req, connection }) {
    if (connection) {
      return { ...db, ...connection.context };
    }
    const token = req.headers.authorization;
    const user = getUserFromToken(token);
    return { ...db, user, createToken };
  },
  subscriptions: {
    onConnect(connectionParams) {
      const token = connectionParams.Authorization;
      const user = getUserFromToken(token);
      if (!user) {
        throw new Error("No access");
      }

      return { user };
    },
  },
});

server.listen(4000).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
