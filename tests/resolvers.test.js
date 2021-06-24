const resolvers = require("../src/resolvers");

describe("resolvers", () => {
  test("feed", () => {
    const result = resolvers.Query.feed(null, null, {
      models: {
        Post: {
          findMany() {
            return ["Message"];
          },
        },
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toBe("Message");
  });
});
