const {
  ApolloServer,
  PubSub,
  SchemaDirectiveVisitor,
} = require("apollo-server");
const gql = require("graphql-tag");

const { defaultFieldResolver, GraphQLString } = require("graphql");

const pubSub = new PubSub();
const NEW_ITEM = "NEW_ITEM";

class LogDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;

    field.args.push({
      type: GraphQLString,
      name: "message",
    });

    field.resolve = (root, { message, ...rest }, context, info) => {
      console.log(message, this.args.message);
      return resolver.call(this, root, rest, context, info);
    };
  }
}

const typeDefs = gql`
  directive @log(message: String = "Test message") on FIELD_DEFINITION

  type User {
    id: ID! @log
    username: String!
    createdAt: Int!
  }

  type Settings {
    user: User!
    theme: String!
  }

  input NewSettingsInput {
    user: ID!
    theme: String!
  }

  type Query {
    me: User!
    settings(user: ID!): Settings!
  }

  type Item {
    task: String
  }

  type Mutation {
    settings(input: NewSettingsInput!): Settings!
    createItem(task: String): Item!
  }

  type Subscription {
    newItem: Item
  }
`;

const resolvers = {
  Query: {
    me() {
      return {
        id: 1,
        username: "Shanjai",
        createdAt: 230234234982304,
      };
    },
    settings(_, { user }) {
      return {
        id: 1,
        username: "Shanjai",
        createdAt: 230234234982304,
      };
    },
  },
  Mutation: {
    settings(_, { input }) {
      return {
        user: 1,
        theme: "LIGHT",
      };
    },
    createItem(_, { task }) {
      pubSub.publish(NEW_ITEM, {
        newItem: { task },
      });
      return {
        task,
      };
    },
  },
  Settings: {
    user(settings) {
      return {
        id: 1,
        username: "Shanjai",
        createdAt: 230234234982304,
      };
    },
  },
  Subscription: {
    newItem: {
      subscribe: () => pubSub.asyncIterator(NEW_ITEM),
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    log: LogDirective,
  },
  context({ connection }) {
    if (connection) {
      return { ...connection.context };
    }
  },
  subscriptions: {
    onConnect(params) {
      console.log("Connected");
    },
  },
});

server.listen().then(({ url }) => console.log(`Server is running at ${url}`));
