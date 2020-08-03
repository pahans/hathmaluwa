import faker from 'faker';

export const posts = [];

for (let i = 0; i < 100; i++) {
    posts.push({
        id: faker.random.uuid(),
        title: faker.lorem.words(),
        summary: faker.lorem.text(),
    });
}
