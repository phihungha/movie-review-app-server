import { PrismaClient, UserType, Gender } from '@prisma/client';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const prisma = new PrismaClient();
initializeApp({ credential: applicationDefault() });

async function createCrewMember(name: string, avatarUrl?: string) {
  return await prisma.crewMember.create({
    data: { name, avatarUrl },
  });
}

async function createCompany(name: string) {
  return await prisma.company.create({
    data: { name },
  });
}

async function createFirebaseUser(
  name: string,
  email: string
): Promise<string> {
  let user;
  try {
    user = await getAuth().getUserByEmail(email);
  } catch (err) {
    user = await getAuth().createUser({
      email,
      displayName: name,
      password: '12345678',
    });
  }
  return user.uid;
}

async function main() {
  // Create users
  const johnRegular = await prisma.user.create({
    data: {
      id: await createFirebaseUser('John Xina', 'john@gmail.com'),
      username: 'john',
      avatarUrl:
        'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/userProfileImages/2.webp',
      email: 'john@gmail.com',
      name: 'John Xina',
      userType: UserType.Regular,
      gender: Gender.Male,
      dateOfBirth: new Date(1973, 3, 4),
      regularUser: { create: {} },
    },
  });

  const janeRegular = await prisma.user.create({
    data: {
      id: await createFirebaseUser('Jane Sauna', 'jane@gmail.com'),
      username: 'jane',
      avatarUrl:
        'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/userProfileImages/3.webp',
      email: 'jane@gmail.com',
      name: 'Jane Sauna',
      userType: UserType.Regular,
      gender: Gender.Female,
      dateOfBirth: new Date(2002, 1, 1),
      regularUser: { create: {} },
    },
  });

  const michikoRegular = await prisma.user.create({
    data: {
      id: await createFirebaseUser('Michiko Oumae', 'michiko@gmail.com'),
      username: 'michiko',
      email: 'michiko@gmail.com',
      name: 'Michiko Oumae',
      userType: UserType.Regular,
      dateOfBirth: new Date(1986, 3, 9),
      regularUser: { create: {} },
    },
  });

  const hungRegular = await prisma.user.create({
    data: {
      id: await createFirebaseUser('Hà Phi Hùng', 'hung@gmail.com'),
      username: 'hung',
      avatarUrl:
        'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/userProfileImages/4.webp',
      email: 'hung@gmail.com',
      name: 'Hà Phi Hùng',
      userType: UserType.Regular,
      gender: Gender.Male,
      dateOfBirth: new Date(2002, 5, 5),
      regularUser: { create: {} },
    },
  });

  const thanosRegular = await prisma.user.create({
    data: {
      id: await createFirebaseUser('Nguyễn Thị Thanos', 'thanos@gmail.com'),
      username: 'thanos',
      avatarUrl:
        'https://i.pinimg.com/280x280_RS/ec/09/6b/ec096b70b70811fa882422ac610b5fba.jpg',
      email: 'thanos@gmail.com',
      name: 'Nguyễn Thị Thanos',
      gender: Gender.Female,
      userType: UserType.Regular,
      dateOfBirth: new Date(1955, 2, 22),
      regularUser: { create: {} },
    },
  });

  const saulRegular = await prisma.user.create({
    data: {
      id: await createFirebaseUser('Saul Goodman', 'saul@gmail.com'),
      username: 'saul',
      avatarUrl:
        'https://upload.wikimedia.org/wikipedia/en/3/34/Jimmy_McGill_BCS_S3.png',
      email: 'saul@gmail.com',
      name: 'Saul Goodman',
      gender: Gender.Female,
      userType: UserType.Regular,
      dateOfBirth: new Date(1955, 2, 22),
      regularUser: { create: {} },
    },
  });

  const ebertCritic = await prisma.user.create({
    data: {
      id: await createFirebaseUser('Roger Ebert', 'ebert@gmail.com'),
      username: 'ebert',
      avatarUrl:
        'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/userProfileImages/1.webp',
      email: 'ebert@gmail.com',
      name: 'Roger Ebert',
      userType: UserType.Critic,
      gender: Gender.Male,
      dateOfBirth: new Date(1942, 6, 18),
      criticUser: { create: { blogUrl: 'rogerebert.com' } },
    },
  });

  const kermodeCritic = await prisma.user.create({
    data: {
      id: await createFirebaseUser('Mark Kemode', 'kemode@gmail.com'),
      username: 'kemode',
      avatarUrl:
        'https://filmnewforest.com/wp-content/uploads/2019/02/Mark-Kermode-image-2018-JE-200x300.jpg',
      email: 'kemode@gmail.com',
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
      { name: 'Adventure' },
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
  const columbiaCorp = await createCompany('Columbia Pictures');
  const sonyAnimationCorp = await createCompany('Sony Pictures Animation');
  const universalCorp = await createCompany('Universal Pictures');
  const appleCorp = await createCompany('Apple Studios');
  const paramountCorp = await createCompany('Paramount Pictures');
  const empiricialCorp = await createCompany('American Empirical Pictures');

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
  const caneActor = await createCrewMember(
    'Michael Caine',
    'https://www.themoviedb.org/t/p/original/klNx4UqkcE9u7P3vsg20AKwgplw.jpg'
  );
  const debickiActor = await createCrewMember(
    'Elizabeth Debicki',
    'https://www.themoviedb.org/t/p/original/nXXbGG1vCrHlscwqD55EGI9aHpA.jpg'
  );
  const tenet = await prisma.movie.create({
    data: {
      title: 'Tenet',
      synopsis:
        'Armed with only one word - Tenet - and fighting for the survival of the entire world, the Protagonist journeys through a twilight world of international espionage on a mission that will unfold in something beyond real time.',
      posterUrl:
        'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/moviePosters/tenet-2020-1.webp',
      releaseDate: new Date(2020, 9, 3),
      runningTime: 9053,
      genres: {
        connect: [{ name: 'Sci-Fi' }, { name: 'Action' }, { name: 'Thriller' }],
      },

      productionCompanies: {
        connect: [{ id: warnerBrosCorp.id }, { id: syncopyCorp.id }],
      },
      distributionCompanies: {
        connect: [{ id: warnerBrosCorp.id }],
      },

      workCredits: {
        createMany: {
          data: [
            { crewId: nolanDirector.id, role: 'Director' },
            { crewId: nolanDirector.id, role: 'Writer' },
            { crewId: hoytemaDop.id, role: 'DoP' },
            { crewId: lameEditor.id, role: 'Editor' },
            { crewId: goranssonComposer.id, role: 'Composer' },
          ],
        },
      },
      actingCredits: {
        createMany: {
          data: [
            { crewId: washingtonActor.id, characterName: 'Protagonist' },
            {
              crewId: pattingsonActor.id,
              characterName: 'Neil',
            },
            { crewId: caneActor.id, characterName: 'Michael' },
            { crewId: debickiActor.id, characterName: 'Kate' },
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
  const fergusonActor = await createCrewMember(
    'Rebecca Ferguson',
    'https://image.tmdb.org/t/p/original/lJloTOheuQSirSLXNA3JHsrMNfH.jpg'
  );
  const zandayaActor = await createCrewMember(
    'Zendaya',
    'https://www.themoviedb.org/t/p/original/vh6ZBemAyZaDA1mE2ckxxIk1MDU.jpg'
  );
  const chalametActor = await createCrewMember(
    'Timothée Chalamet',
    'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/crewProfileImages/timothee-chalamet-1.webp'
  );
  const isaacActor = await createCrewMember(
    'Oscar Isaac',
    'https://www.themoviedb.org/t/p/original/dW5U5yrIIPmMjRThR9KT2xH6nTz.jpg'
  );
  const dune = await prisma.movie.create({
    data: {
      title: 'Dune',
      posterUrl:
        'https://cinerate-movie-review-service.s3.ap-southeast-1.amazonaws.com/public/moviePosters/dune-2021-1.webp',
      synopsis:
        "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people. As malevolent forces explode into conflict over the planet's exclusive supply of the most precious resource in existence-a commodity capable of unlocking humanity's greatest potential-only those who can conquer their fear will survive.",
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

      workCredits: {
        createMany: {
          data: [
            { crewId: villeneuveDirector.id, role: 'Director' },
            { crewId: villeneuveDirector.id, role: 'Writer' },
            { crewId: spaihtsWriter.id, role: 'Writer' },
            { crewId: fraserDop.id, role: 'DoP' },
            { crewId: walkerEditor.id, role: 'Editor' },
            { crewId: zimmerComposer.id, role: 'Composer' },
          ],
        },
      },
      actingCredits: {
        createMany: {
          data: [
            { crewId: chalametActor.id, characterName: 'Paul Atreides' },
            {
              crewId: zandayaActor.id,
              characterName: 'Chani',
            },
            { crewId: fergusonActor.id, characterName: 'Lady Jessica' },
            { crewId: isaacActor.id, characterName: 'Leto Atreides' },
          ],
        },
      },

      regularScore: 9,
      regularReviewCount: 3,
      criticScore: 8,
      criticReviewCount: 1,
    },
  });

  const andersonDirector = await createCrewMember(
    'Wes Anderson',
    'https://www.themoviedb.org/t/p/original/5z2WroP0CgQ5vI17M0hzi8o5NAn.jpg'
  );
  const desplatComposer = await createCrewMember(
    'Alexandre Desplat',
    'https://www.themoviedb.org/t/p/original/vPsv5UYNLrQkzjOvng1OAAYCTIz.jpg'
  );
  const schwartzmanActor = await createCrewMember(
    'Jason Schwartzman',
    'https://www.themoviedb.org/t/p/original/gCjMdmW1DiPAClHVl4zHEIffIsE.jpg'
  );
  const johanssonActor = await createCrewMember(
    'Scarlett Johansson',
    'https://www.themoviedb.org/t/p/original/6NsMbJXRlDZuDzatN2akFdGuTvx.jpg'
  );
  const hanksActor = await createCrewMember(
    'Tom Hanks',
    'https://www.themoviedb.org/t/p/original/1UgDnFt3OteCJQPiUelWzIR5bvT.jpg'
  );
  const ryanActor = await createCrewMember(
    'Jake Ryan',
    'https://www.themoviedb.org/t/p/original/hsVgz0a7QvUHDHdqFEataZ766MB.jpg'
  );
  const asteroidCity = await prisma.movie.create({
    data: {
      title: 'Asteroid City',
      posterUrl:
        'https://www.themoviedb.org/t/p/original/tcKBclNUdkas4Jis8RYYZnPdTIm.jpg',
      synopsis:
        'In an American desert town circa 1955, the itinerary of a Junior Stargazer/Space Cadet convention is spectacularly disrupted by world-changing events.',
      releaseDate: new Date(2023, 7, 10),
      runningTime: 6305,
      genres: {
        connect: [{ name: 'Sci-Fi' }, { name: 'Comedy' }, { name: 'Romance' }],
      },

      productionCompanies: {
        connect: [{ id: empiricialCorp.id }],
      },
      distributionCompanies: {
        connect: [{ id: universalCorp.id }],
      },

      workCredits: {
        createMany: {
          data: [
            { crewId: andersonDirector.id, role: 'Director' },
            { crewId: desplatComposer.id, role: 'Composer' },
          ],
        },
      },
      actingCredits: {
        createMany: {
          data: [
            { crewId: schwartzmanActor.id, characterName: 'Augie Steenbeck' },
            {
              crewId: johanssonActor.id,
              characterName: 'Midge Campbell',
            },
            { crewId: hanksActor.id, characterName: 'Stanley Zak' },
            { crewId: ryanActor.id, characterName: 'Woodrow Steenbeck' },
          ],
        },
      },

      regularScore: 4.6,
      regularReviewCount: 3,
      criticScore: 9.5,
      criticReviewCount: 2,
    },
  });

  const santosDirector = await createCrewMember(
    'Joaquim Dos Santos',
    'https://www.themoviedb.org/t/p/original/qDxjKIWM61iLOF7H9dpIdYIiZLM.jpg'
  );
  const thompsonDirector = await createCrewMember(
    'Justin K. Thompson',
    'https://www.themoviedb.org/t/p/original/xGd7wF8E5ItRgUqHSGnzadGzqJM.jpg'
  );
  const powersDirector = await createCrewMember(
    'Kemp Powers',
    'https://www.themoviedb.org/t/p/original/t3GpaXDIo1vvx8DGrYtPgZo58ci.jpg'
  );
  const millerWriter = await createCrewMember(
    'Christopher Miller',
    'https://www.themoviedb.org/t/p/original/dr2yCgYtmNmO5vzjk9KNbjTpbzO.jpg'
  );
  const lordWriter = await createCrewMember(
    'Phil Lord',
    'https://www.themoviedb.org/t/p/original/yGLAUCnWwB0cQM0Ivb5FKzv3tr4.jpg'
  );
  const pembertonComposer = await createCrewMember(
    'Daniel Pemberton',
    'https://www.themoviedb.org/t/p/original/dPcjpSoCg1nraqCUD4tvRK3QtHQ.jpg'
  );
  const mooreActor = await createCrewMember(
    'Shameik Moore',
    'https://www.themoviedb.org/t/p/original/uJNaSTsfBOvtFWsPP23zNthknsB.jpg'
  );
  const steinfeldActor = await createCrewMember(
    'Hailee Steinfeld',
    'https://www.themoviedb.org/t/p/original/dxSDWkiVaC6JYjrV3XRAZI7HOSS.jpg'
  );
  const henryActor = await createCrewMember(
    'Brian Tyree Henry',
    'https://www.themoviedb.org/t/p/original/1UgDnFt3OteCJQPiUelWzIR5bvT.jpg'
  );
  const johnsonActor = await createCrewMember(
    'Jake Johnson',
    'https://www.themoviedb.org/t/p/original/3gASdJlbZYxTDYMaX6ALo4BDEjN.jpg'
  );
  const spiderverse = await prisma.movie.create({
    data: {
      title: 'Spider-Man: Across the Spider-Verse',
      posterUrl:
        'https://www.themoviedb.org/t/p/original/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
      synopsis:
        "After reuniting with Gwen Stacy, Brooklyn's full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider Society, a team of Spider-People charged with protecting the Multiverse’s very existence. But when the heroes clash on how to handle a new threat, Miles finds himself pitted against the other Spiders and must set out on his own to save those he loves most.",
      releaseDate: new Date(2023, 6, 2),
      runningTime: 8400,
      genres: {
        connect: [
          { name: 'Sci-Fi' },
          { name: 'Action' },
          { name: 'Adventure' },
          { name: 'Animation' },
        ],
      },

      productionCompanies: {
        connect: [{ id: columbiaCorp.id }, { id: sonyAnimationCorp.id }],
      },
      distributionCompanies: {
        connect: [{ id: columbiaCorp.id }],
      },

      workCredits: {
        createMany: {
          data: [
            { crewId: santosDirector.id, role: 'Director' },
            { crewId: thompsonDirector.id, role: 'Director' },
            { crewId: powersDirector.id, role: 'Director' },
            { crewId: millerWriter.id, role: 'Writer' },
            { crewId: lordWriter.id, role: 'Writer' },
            { crewId: pembertonComposer.id, role: 'Composer' },
          ],
        },
      },
      actingCredits: {
        createMany: {
          data: [
            { crewId: mooreActor.id, characterName: 'Miles Morales' },
            {
              crewId: steinfeldActor.id,
              characterName: 'Gwen Stacy',
            },
            { crewId: henryActor.id, characterName: 'Jeff Morales' },
            { crewId: johnsonActor.id, characterName: 'Peter B. Parker' },
          ],
        },
      },

      regularScore: 8.4,
      regularReviewCount: 3,
      criticScore: 9,
      criticReviewCount: 2,
    },
  });

  const scorseseDirector = await createCrewMember(
    'Martin Scorsese',
    'https://www.themoviedb.org/t/p/original/9U9Y5GQuWX3EZy39B8nkk4NY01S.jpg'
  );
  const rothWriter = await createCrewMember(
    'Eric Roth',
    'https://www.themoviedb.org/t/p/original/16WXnoU1NP2H732P0qAQUtetSI9.jpg'
  );
  const robertsonComposer = await createCrewMember(
    'Robbie Robertson',
    'https://www.themoviedb.org/t/p/original/pUhQhGrerErQGZKy0kKn6e6m1X7.jpg'
  );
  const dicaprioActor = await createCrewMember(
    'Leonardo DiCaprio',
    'https://www.themoviedb.org/t/p/original/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg'
  );
  const niroActor = await createCrewMember(
    'Robert De Niro',
    'https://www.themoviedb.org/t/p/original/cT8htcckIuyI1Lqwt1CvD02ynTh.jpg'
  );
  const gladstoneActor = await createCrewMember(
    'Lily Gladstone',
    'https://www.themoviedb.org/t/p/original/zYAN84WqZv2sbVE2JDkcWoXGoF7.jpg'
  );
  const flowerMoon = await prisma.movie.create({
    data: {
      title: 'Killers of the Flower Moon',
      posterUrl:
        'https://www.themoviedb.org/t/p/original/yKzDnjsuLhh9B4xc0vNgz1YzYsT.jpg',
      synopsis:
        'When oil is discovered in 1920s Oklahoma under Osage Nation land, the Osage people are murdered one by one—until the FBI steps in to unravel the mystery.',
      releaseDate: new Date(2023, 10, 6),
      runningTime: 12360,
      genres: {
        connect: [{ name: 'Crime' }, { name: 'Drama' }, { name: 'Thriller' }],
      },

      productionCompanies: {
        connect: [{ id: appleCorp.id }],
      },
      distributionCompanies: {
        connect: [{ id: paramountCorp.id }],
      },

      workCredits: {
        createMany: {
          data: [
            { crewId: scorseseDirector.id, role: 'Director' },
            { crewId: rothWriter.id, role: 'Writer' },
            { crewId: robertsonComposer.id, role: 'Composer' },
          ],
        },
      },
      actingCredits: {
        createMany: {
          data: [
            { crewId: dicaprioActor.id, characterName: 'Ernest Burkhart' },
            {
              crewId: niroActor.id,
              characterName: 'William Hale',
            },
            { crewId: gladstoneActor.id, characterName: 'Mollie Burkhart' },
          ],
        },
      },

      criticScore: 9.5,
      criticReviewCount: 2,
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
      content:
        'It is 100% designed as an experience for people who have unpacked films like The Prestige and Memento late into the night, hoping to give Nolan fans more to chew on than ever before.',
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
      content:
        "Denis Villeneuve has accomplished what was considered impossible for decades, to write and direct a faithful adaptation to the fantastic 1965 sci-fi novel by Frank Herbert. And I'm here to tell you, he has done it, he has actually done it.",
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
      content:
        "It's been amazing being back in cinemas after last year, I have seen some good films, and some shockers, this though, is the first great film of the year for me.",
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
      content:
        'This movie is quite slow but it focuses on characters and world-building is out-of-this-world',
      score: 8,
    },
  });

  await prisma.review.create({
    data: {
      authorType: UserType.Critic,
      author: { connect: { id: kermodeCritic.id } },
      movie: { connect: { id: dune.id } },
      title: 'Why Dune endures.',
      content:
        "Denis Villeneuve's new big-screen adaptation underlines why generations have been fascinated by the story.",
      score: 8,
      externalUrl:
        'https://www.vox.com/22629441/dune-review-villeneuve-lynch-jodorowsky-herbert',
    },
  });

  // Spiderverse
  await prisma.review.create({
    data: {
      authorType: UserType.Regular,
      author: { connect: { id: thanosRegular.id } },
      movie: { connect: { id: spiderverse.id } },
      title: 'Great follow up',
      content:
        'Great follow up, for the first movie, really a well-made animation movie.',
      score: 8,
    },
  });

  await prisma.review.create({
    data: {
      authorType: UserType.Regular,
      author: { connect: { id: michikoRegular.id } },
      movie: { connect: { id: spiderverse.id } },
      title: 'Amazing',
      content: 'Just amazing! A most watch for any Spider-Man fan!',
      score: 8,
    },
  });

  await prisma.review.create({
    data: {
      authorType: UserType.Regular,
      author: { connect: { id: hungRegular.id } },
      movie: { connect: { id: spiderverse.id } },
      title: 'SPIDERMAN!!!',
      content: 'It had Spider-Man in it',
      score: 9,
    },
  });

  await prisma.review.create({
    data: {
      authorType: UserType.Critic,
      author: { connect: { id: kermodeCritic.id } },
      movie: { connect: { id: spiderverse.id } },
      title: 'Worthy of ticket price',
      content:
        'Animated Spider-Man sequel is worth the price of admission in this four-star movie.',
      score: 9,
    },
  });

  await prisma.review.create({
    data: {
      authorType: UserType.Critic,
      author: { connect: { id: ebertCritic.id } },
      movie: { connect: { id: spiderverse.id } },
      title: 'Impressive',
      content:
        "It's really impressive how this movie has its cake while eating it, too.",
      score: 9,
    },
  });

  // Asteroid City
  await prisma.review.create({
    data: {
      authorType: UserType.Regular,
      author: { connect: { id: hungRegular.id } },
      movie: { connect: { id: asteroidCity.id } },
      title: 'I fell asleep',
      content:
        'Apart from stunning perfrormances by the cast it is a snooze fest.',
      score: 4,
    },
  });

  await prisma.review.create({
    data: {
      authorType: UserType.Regular,
      author: { connect: { id: saulRegular.id } },
      movie: { connect: { id: asteroidCity.id } },
      title: 'A treat to watch',
      content:
        "If you're new to watching Wes Anderson Movies, you'd be scratching your head trying to understand the story and how it is filmed. Otherwise, it's a treat to watch.",
      score: 8,
    },
  });

  await prisma.review.create({
    data: {
      authorType: UserType.Regular,
      author: { connect: { id: janeRegular.id } },
      movie: { connect: { id: asteroidCity.id } },
      title: 'Waste of money',
      content: 'Waste of $20 to rent.',
      score: 2,
    },
  });

  await prisma.review.create({
    data: {
      authorType: UserType.Critic,
      author: { connect: { id: kermodeCritic.id } },
      movie: { connect: { id: asteroidCity.id } },
      title: 'Very eye-opening',
      content:
        'A play within a film about learning to see the world and all its surprises with wide-awake eyes.',
      score: 10,
    },
  });

  await prisma.review.create({
    data: {
      authorType: UserType.Critic,
      author: { connect: { id: ebertCritic.id } },
      movie: { connect: { id: asteroidCity.id } },
      title: 'Wondrous',
      content:
        "A wondrous combination of 1950s Americana and Wes Anderson's signature style.",
      score: 9,
    },
  });

  // Killers of the flower moon
  await prisma.review.create({
    data: {
      authorType: UserType.Critic,
      author: { connect: { id: kermodeCritic.id } },
      movie: { connect: { id: flowerMoon.id } },
      title: 'Brutal and painful',
      content:
        'The brutality of violent bloodshed can be just as painful as the brutality of doubt.',
      score: 10,
      externalUrl:
        'https://www.bfi.org.uk/sight-and-sound/reviews/killers-flower-moon-martin-scorseses-latest-increasingly-enthralling-true-crime-epic',
    },
  });

  await prisma.review.create({
    data: {
      authorType: UserType.Critic,
      author: { connect: { id: ebertCritic.id } },
      movie: { connect: { id: flowerMoon.id } },
      title: 'Soulful and unsettling',
      content:
        'A soulful and unsettling movie that is self-aware about how storytellers twist and manipulate truth.',
      externalUrl:
        'https://www.cinemaexpress.com/english/features/2023/may/22/cannes-xpress-2023-in-scorsese-we-trust-43716.html',
      score: 10,
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
