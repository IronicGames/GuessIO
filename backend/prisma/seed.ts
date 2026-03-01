import prisma from '../src/lib/prisma';
import { createBoard } from '../src/repositories/board.repository';
import { createCharacterInstance } from '../src/repositories/character.repository';
import { createUser } from '../src/repositories/user.repository';

async function main() {
  const user1 = await createUser(
    'prince',
    'prince@ironic.com',
    'googleId1',
    'images.com/prince.jpg'
  );
  const user1ID = user1!.id;

  const user2 = await createUser('kevin');
  const user2ID = user2!.id;

  const board1 = await createBoard(
    'Board 1',
    user1ID,
    'A default board for testing',
    true,
    'images.com/board1.jpg'
  );
  const board1ID = board1!.id;
  const board2 = await createBoard('Board 2', user2ID);
  const board2ID = board2!.id;

  const characterInstances = await Promise.all([
    createCharacterInstance(
      board1ID,
      undefined,
      'Alpha',
      'First character',
      'images.com/alpha.jpg',
      ['tag1', 'tag2']
    ),
    createCharacterInstance(
      board1ID,
      undefined,
      'Bravo',
      'Second character',
      'images.com/bravo.jpg'
    ),
    createCharacterInstance(
      board1ID,
      undefined,
      'Charlie',
      'Third character',
      'images.com/charlie.jpg',
      ['tag3', 'tag4']
    ),
    createCharacterInstance(board1ID, undefined, 'Delta'),
    createCharacterInstance(board1ID, undefined, 'Echo'),
    createCharacterInstance(board1ID, undefined, 'Foxtrot'),
    createCharacterInstance(board1ID, undefined, 'Golf'),
    createCharacterInstance(board1ID, undefined, 'Hotel'),
    createCharacterInstance(board1ID, undefined, 'India'),
    createCharacterInstance(board1ID, undefined, 'Juliet'),
    createCharacterInstance(board1ID, undefined, 'Kilo'),
    createCharacterInstance(board1ID, undefined, 'Lima'),
    createCharacterInstance(board1ID, undefined, 'Mike'),
    createCharacterInstance(board1ID, undefined, 'November'),
    createCharacterInstance(board1ID, undefined, 'Oscar'),
    createCharacterInstance(board1ID, undefined, 'Papa'),
    createCharacterInstance(board1ID, undefined, 'Quebec'),
    createCharacterInstance(board1ID, undefined, 'Romeo'),
    createCharacterInstance(board1ID, undefined, 'Sierra'),
    createCharacterInstance(board1ID, undefined, 'Tango'),
    createCharacterInstance(board1ID, undefined, 'Uniform'),
    createCharacterInstance(board1ID, undefined, 'Victor'),
    createCharacterInstance(board1ID, undefined, 'Whiskey'),
    createCharacterInstance(board1ID, undefined, 'Xray'),
  ]);

  characterInstances.forEach((ci) => {
    createCharacterInstance(board2ID, ci!.characterId);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
