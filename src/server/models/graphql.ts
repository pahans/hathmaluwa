import { graphqlHTTP } from 'express-graphql';
const { makeExecutableSchema } = require('@graphql-tools/schema');
import { posts } from './postMocks';

const typeDefs = `
    type Post {
        id: ID!
        title: String,
        summary: String,
    }

    type Query {
        posts: [Post]
    }

    # we need to tell the server which types represent the root query
    # and root mutation types. We call them RootQuery and RootMutation by convention.
    schema {
        query: Query
    }
`;

const resolvers = {
    Query: {
        posts() {
            return posts;
        },
    },
};

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});


const graphql = graphqlHTTP({
    schema,
    graphiql: true,
});

export default graphql;
