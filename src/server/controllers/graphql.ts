import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';

var schema = buildSchema(`
    type Query {
        getBlogs: String
    }
`);

// The root provides a resolver function for each API endpoint
var root = {
    getBlogs: () => {
    return 'to be implemented';
    },
};

const graphql = graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
});

export default graphql;