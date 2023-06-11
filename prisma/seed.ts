import { PrismaClient, UserType, Gender } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createCrewMember(name: string, avatarUrl?: string) {
  return await prisma.crewMember.create({
    data: {
      name,
      avatarUrl,
    },
  });
}

async function createCompany(name: string) {
  return await prisma.company.create({
    data: {
      name,
    },
  });
}

async function main() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('12345678', salt);

  // Create users
  const johnRegular = await prisma.user.create({
    data: {
      username: 'john',
      avatarUrl:
        'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/userProfileImages/2.webp',
      email: 'john@gmail.com',
      hashedPassword,
      name: 'John Xina',
      userType: UserType.Regular,
      gender: Gender.Male,
      dateOfBirth: new Date(1995, 3, 4),
      regularUser: { create: {} },
    },
  });

  const janeRegular = await prisma.user.create({
    data: {
      username: 'jane',
      avatarUrl:
        'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/userProfileImages/3.webp',
      email: 'jane@gmail.com',
      hashedPassword,
      name: 'Jane Sauna',
      userType: UserType.Regular,
      gender: Gender.Female,
      dateOfBirth: new Date(2002, 1, 1),
      regularUser: { create: {} },
    },
  });

  const michikoRegular = await prisma.user.create({
    data: {
      username: 'michiko',
      email: 'michiko@gmail.com',
      hashedPassword,
      name: 'Michiko Oumae',
      userType: UserType.Regular,
      dateOfBirth: new Date(1986, 3, 9),
      regularUser: { create: {} },
    },
  });

  const hungRegular = await prisma.user.create({
    data: {
      username: 'hung',
      avatarUrl:
        'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/userProfileImages/4.webp',
      email: 'hung@gmail.com',
      hashedPassword,
      name: 'Hà Phi Hùng',
      userType: UserType.Regular,
      gender: Gender.Male,
      dateOfBirth: new Date(2002, 5, 5),
      regularUser: { create: {} },
    },
  });

  const thanosRegular = await prisma.user.create({
    data: {
      username: 'thanos',
      avatarUrl: 'aws-s3/abcd',
      email: 'thanos@gmail.com',
      hashedPassword,
      name: 'Nguyễn Thị Thanos',
      userType: UserType.Regular,
      dateOfBirth: new Date(1995, 2, 14),
      regularUser: { create: {} },
    },
  });

  const ebertCritic = await prisma.user.create({
    data: {
      username: 'ebert',
      avatarUrl:
        'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/userProfileImages/1.webp',
      email: 'ebert@gmail.com',
      hashedPassword,
      name: 'Roger Ebert',
      userType: UserType.Critic,
      gender: Gender.Male,
      dateOfBirth: new Date(1942, 6, 18),
      criticUser: { create: { blogUrl: 'rogerebert.com' } },
    },
  });

  const kermodeCritic = await prisma.user.create({
    data: {
      username: 'kemode',
      avatarUrl:
        'https://filmnewforest.com/wp-content/uploads/2019/02/Mark-Kermode-image-2018-JE-200x300.jpg',
      email: 'kemode@gmail.com',
      hashedPassword,
      name: 'Mark Kemode',
      userType: UserType.Critic,
      gender: Gender.Male,
      dateOfBirth: new Date(1963, 7, 2),
      criticUser: { create: { blogUrl: 'markkermode.co.uk' } },
    },
  });

  // Create movie genres
  await prisma.genre.createMany({
    data: [
      { name: 'Action' },
      { name: 'Animation' },
      { name: 'Comedy' },
      { name: 'Crime' },
      { name: 'Drama' },
      { name: 'Fantasy' },
      { name: 'Sci-Fi' },
      { name: 'Romance' },
      { name: 'Thriller' },
      { name: 'Psychological' },
      { name: 'Biography' },
    ],
  });

  // Create companies
  const syncopyCorp = await createCompany('Syncopy Inc');
  const legendaryCorp = await createCompany('Legendary Pictures');
  const warnerBrosCorp = await createCompany('Warner Bros. Pictures');

  // Create movies
  const nolanDirector = await createCrewMember(
    'Christopher Nolan',
    'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/crewProfileImages/christopher-nolan-1.webp'
  );
  const hoytemaDop = await createCrewMember(
    'Hoyte van Hoytema',
    'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/crewProfileImages/hoyte-van-hoytema-1.webp'
  );
  const lameEditor = await createCrewMember(
    'Jennifer Lame',
    'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/crewProfileImages/jennifer-lame-1.webp'
  );
  const goranssonComposer = await createCrewMember(
    'Ludwig Göransson',
    'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/crewProfileImages/ludwig-goransson-1.webp'
  );
  const washingtonActor = await createCrewMember(
    'John David Washington',
    'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/crewProfileImages/john-david-washington-1.webp'
  );
  const pattingsonActor = await createCrewMember(
    'Robert Pattinson',
    'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/crewProfileImages/robert-pattingson-1.webp'
  );
  const caneActor = await createCrewMember('Michael Caine');
  const tenet = await prisma.movie.create({
    data: {
      title: 'Tenet',
      posterUrl:
        'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/moviePosters/tenet-2020-1.webp',
      releaseDate: new Date(2020, 9, 3),
      runningTime: 9000,
      genres: {
        connect: [{ name: 'Sci-Fi' }, { name: 'Action' }, { name: 'Thriller' }],
      },

      productionCompanies: {
        connect: [{ id: warnerBrosCorp.id }, { id: syncopyCorp.id }],
      },
      distributionCompanies: {
        connect: [{ id: warnerBrosCorp.id }],
      },

      directors: { connect: [{ id: nolanDirector.id }] },
      writers: { connect: [{ id: nolanDirector.id }] },
      dops: { connect: [{ id: hoytemaDop.id }] },
      editors: { connect: [{ id: lameEditor.id }] },
      composers: { connect: [{ id: goranssonComposer.id }] },
      actingCredits: {
        createMany: {
          data: [
            { crewId: washingtonActor.id, characterName: 'Protagonist' },
            {
              crewId: pattingsonActor.id,
              characterName: 'Neil',
            },
            { crewId: caneActor.id, characterName: 'Sir Michael Crosby' },
          ],
        },
      },

      regularScore: 6.6,
      regularReviewCount: 3,
      criticScore: 6.5,
      criticReviewCount: 2,
    },
  });

  const villeneuveDirector = await createCrewMember(
    'Denis Villeneuve',
    'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/crewProfileImages/denis-villeneuve-1.webp'
  );
  const spaihtsWriter = await createCrewMember(
    'Jon Spaihts',
    'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/crewProfileImages/jon-spaihts-1.webp'
  );
  const fraserDop = await createCrewMember(
    'Greig Fraser',
    'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/crewProfileImages/greig-fraser-1.webp'
  );
  const walkerEditor = await createCrewMember(
    'Joe Walker',
    'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/crewProfileImages/joe-walker-1.webp'
  );
  const zimmerComposer = await createCrewMember(
    'Hans Zimmer',
    'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/crewProfileImages/hans-zimmer-1.webp'
  );
  const fergusonActor = await createCrewMember('Rebecca Ferguson');
  const zandayaActor = await createCrewMember('Zendaya');
  const chalametActor = await createCrewMember(
    'Timothée Chalamet',
    'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/crewProfileImages/timothee-chalamet-1.webp'
  );
  const dune = await prisma.movie.create({
    data: {
      title: 'Dune',
      posterUrl:
        'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/moviePosters/dune-2021-1.webp',
      releaseDate: new Date(2021, 10, 22),
      runningTime: 9360,
      genres: {
        connect: [{ name: 'Sci-Fi' }, { name: 'Drama' }],
      },

      productionCompanies: {
        connect: [{ id: warnerBrosCorp.id }, { id: legendaryCorp.id }],
      },
      distributionCompanies: {
        connect: [{ id: warnerBrosCorp.id }],
      },

      directors: { connect: [{ id: villeneuveDirector.id }] },
      writers: {
        connect: [{ id: villeneuveDirector.id }, { id: spaihtsWriter.id }],
      },
      dops: { connect: [{ id: fraserDop.id }] },
      editors: { connect: [{ id: walkerEditor.id }] },
      composers: { connect: [{ id: zimmerComposer.id }] },
      actingCredits: {
        createMany: {
          data: [
            { crewId: chalametActor.id, characterName: 'Paul Atreides' },
            {
              crewId: zandayaActor.id,
              characterName: 'Chani',
            },
            { crewId: fergusonActor.id, characterName: 'Lady Jessica' },
          ],
        },
      },

      regularScore: 9,
      regularReviewCount: 3,
      criticScore: 8,
      criticReviewCount: 1,
    },
  });

  // Create reviews
  // Tenet
  await prisma.review.create({
    data: {
      authorType: UserType.Regular,
      author: { connect: { id: johnRegular.id } },
      movie: { connect: { id: tenet.id } },
      title: 'Over-complicated, way too long, and not all that exciting.',
      content:
        'It is a pretty good, entertaining movie, but often very confusing.',
      score: 6,
      thankUsers: {
        connect: [
          { id: janeRegular.id },
          { id: michikoRegular.id },
          { id: hungRegular.id },
        ],
      },
      thankCount: 3,
      comments: {
        createMany: {
          data: [
            {
              authorId: michikoRegular.id,
              content: 'Same',
            },
            {
              authorId: thanosRegular.id,
              content: 'Nah you need to watch it again 100 times',
            },
            {
              authorId: hungRegular.id,
              content: 'Funny',
            },
            {
              authorId: janeRegular.id,
              content: 'I have watched it 8 times and I still dont understand',
            },
          ],
        },
      },
      commentCount: 4,
    },
  });

  await prisma.review.create({
    data: {
      authorType: UserType.Regular,
      author: { connect: { id: thanosRegular.id } },
      movie: { connect: { id: tenet.id } },
      title: 'This is peak cinema.',
      content: "People that don't understand this movie is just stupid.",
      score: 9,
      thankUsers: { connect: [{ id: hungRegular.id }] },
      thankCount: 1,
    },
  });

  await prisma.review.create({
    data: {
      authorType: UserType.Regular,
      author: { connect: { id: michikoRegular.id } },
      movie: { connect: { id: tenet.id } },
      title: 'Terrible movie.',
      content: 'Nolan was drunk when he was writing this script.',
      score: 5,
    },
  });

  await prisma.review.create({
    data: {
      authorType: UserType.Critic,
      author: { connect: { id: ebertCritic.id } },
      movie: { connect: { id: tenet.id } },
      title: 'Good for Nolan fans.',
      content: `It is 100% designed as an experience for people who have unpacked films
         like The Prestige and Memento late into the night, hoping to give Nolan fans
         more to chew on than ever before.`,
      score: 7,
      externalUrl: 'https://www.rogerebert.com/reviews/tenet-movie-review-2020',
    },
  });

  await prisma.review.create({
    data: {
      authorType: UserType.Critic,
      author: { connect: { id: kermodeCritic.id } },
      movie: { connect: { id: tenet.id } },
      title: 'Tenet is an empty puzzle box.',
      content: `Tenet is a locked puzzle box with nothing inside.`,
      score: 6,
      externalUrl:
        'https://www.vulture.com/2020/08/tenet-movie-review-christopher-nolan-s-locked-puzzle-box.html',
    },
  });

  // Dune
  await prisma.review.create({
    data: {
      authorType: UserType.Regular,
      author: { connect: { id: janeRegular.id } },
      movie: { connect: { id: dune.id } },
      title: 'A Great Modern Sci-Fi',
      content: `Denis Villeneuve has accomplished what was considered impossible for decades,
        to write and direct a faithful adaptation to the fantastic 1965 sci-fi novel by Frank Herbert.
        And I'm here to tell you, he has done it, he has actually done it.`,
      score: 9,
      thankUsers: {
        connect: [
          { id: johnRegular.id },
          { id: michikoRegular.id },
          { id: hungRegular.id },
          { id: thanosRegular.id },
        ],
      },
      thankCount: 4,
      comments: {
        createMany: {
          data: [
            {
              authorId: johnRegular.id,
              content: 'Same',
            },
            {
              authorId: thanosRegular.id,
              content: "Villeneuve doesn't disappoint",
            },
          ],
        },
      },
      commentCount: 2,
    },
  });

  await prisma.review.create({
    data: {
      authorType: UserType.Regular,
      author: { connect: { id: thanosRegular.id } },
      movie: { connect: { id: dune.id } },
      title: 'My movie of 2021, so far',
      content: `It's been amazing being back in cinemas after last year,
        I have seen some good films, and some shockers,
        this though, is the first great film of the year for me.`,
      score: 10,
      thankUsers: {
        connect: [{ id: thanosRegular.id }, { id: johnRegular.id }],
      },
      thankCount: 2,
    },
  });

  await prisma.review.create({
    data: {
      authorType: UserType.Regular,
      author: { connect: { id: michikoRegular.id } },
      movie: { connect: { id: dune.id } },
      title: 'A bit slow but good',
      content: `This movie is quite slow but it focuses on
      characters and world-building is out-of-this-world`,
      score: 8,
    },
  });

  await prisma.review.create({
    data: {
      authorType: UserType.Critic,
      author: { connect: { id: kermodeCritic.id } },
      movie: { connect: { id: dune.id } },
      title: 'Why Dune endures.',
      content: `Denis Villeneuve's new big-screen adaptation underlines
        why generations have been fascinated by the story.`,
      score: 8,
      externalUrl:
        'https://www.vox.com/22629441/dune-review-villeneuve-lynch-jodorowsky-herbert',
    },
  });

  await prisma.collection.create({
    data: {
      name: 'Favorite Sci-Fi Movies',
      author: { connect: { id: hungRegular.id } },
      movies: { connect: [{ id: dune.id }, { id: tenet.id }] },
      likeUsers: {
        connect: [
          { id: johnRegular.id },
          { id: janeRegular.id },
          { id: thanosRegular.id },
          { id: michikoRegular.id },
        ],
      },
      likeCount: 4,
    },
  });

  await prisma.collection.create({
    data: {
      name: 'Favorite bad movies',
      author: { connect: { id: thanosRegular.id } },
      movies: { connect: [{ id: tenet.id }] },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
