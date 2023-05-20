import { schemaBuilder } from '../builder';

schemaBuilder.prismaNode('Movie', {
  id: { field: 'id' },
  fields: (t) => ({
    title: t.exposeString('title'),
    posterUrl: t.exposeString('posterUrl', { nullable: true }),
    runningTime: t.exposeInt('runningTime'),
    genres: t.relatedConnection('genres', { cursor: 'id' }),
    productionCompanies: t.relatedConnection('productionCompanies', {
      cursor: 'id',
    }),
    distributedCompanies: t.relatedConnection('distributionCompanies', {
      cursor: 'id',
    }),

    directors: t.relatedConnection('directors', { cursor: 'id' }),
    writers: t.relatedConnection('writers', { cursor: 'id' }),
    dops: t.relatedConnection('dops', { cursor: 'id' }),
    editors: t.relatedConnection('editors', { cursor: 'id' }),
    composers: t.relatedConnection('composers', { cursor: 'id' }),

    reviews: t.relatedConnection('reviews', { cursor: 'id' }),
    userScore: t.exposeFloat('userScore', { nullable: true }),
    userReviewCount: t.exposeInt('userReviewCount'),
    criticScore: t.exposeFloat('criticScore', { nullable: true }),
    criticReviewCount: t.exposeInt('criticReviewCount'),
    viewedUsers: t.relatedConnection('viewedUsers', { cursor: 'id' }),
    viewedUserCount: t.exposeInt('viewedUserCount'),
    collections: t.relatedConnection('collections', { cursor: 'id' }),
  }),
});
