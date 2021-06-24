const { SchemaDirectiveVisitor } = require("apollo-server");
const { defaultFieldResolver, GraphQLString } = require("graphql");
const { formatDate } = require("./utils");

class DateFormatDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;

    const { format: defaultFormat } = this.args;
    field.args.push({
      type: GraphQLString,
      name: "format",
    });

    field.resolve = (root, { format, ...rest }, ctx, info) => {
      const result = resolver.call(this, root, rest, ctx, info);
      return formatDate(result, format || defaultFormat);
    };

    field.type = GraphQLString;
  }
}

class AuthenticateDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;

    field.resolve = async (root, args, ctx, info) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }
      return resolver(root, args, ctx, info);
    };
  }
}

class AuthorizationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;

    const { role } = this.args;

    field.resolve = async (root, args, ctx, info) => {
      if (ctx.user.role !== role) {
        throw new Error("Wrong role!");
      }
      return resolver(root, args, ctx, info);
    };
  }
}

module.exports = {
  DateFormatDirective,
  AuthenticateDirective,
  AuthorizationDirective,
};
