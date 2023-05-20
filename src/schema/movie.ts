import { schemaBuilder } from '../builder';

schemaBuilder.prismaNode('Movie', {
  id: { field: 'id' },
  fields: (t) => ({
    title: t.exposeString('title'),
    posterUrl: t.exposeString('posterUrl', { nullable: true }),
    releaseDate: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.releaseDate,
    }),
    runningTime: t.exposeInt('runningTime'),
    genres: t.relation('genres'),
    productionCompanies: t.relation('productionCompanies'),
    distributedCompanies: t.relation('distributionCompanies'),

    directors: t.relation('directors'),
    writers: t.relation('writers'),
    dops: t.relation('dops'),
    editors: t.relation('editors'),
    composers: t.relation('composers'),
    actingCredits: t.relation('actingCredits'),

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
