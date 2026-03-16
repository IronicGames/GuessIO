import { CreateBoardDto } from './../../shared/types/board.types';
import prisma from '../src/lib/prisma';
import { createBoard } from '../src/services/board.service';
import { createCharacterInstance } from '../src/repositories/character.repository';
import { createUser } from '../src/repositories/user.repository';

async function main() {
  // Create Users
  const user1 = await createUser(
    'prince',
    'prince@ironic.com',
    'googleId1',
    'images.com/prince.jpg'
  );
  const user1ID = user1!.id;
  const user2 = await createUser('kevin');
  const user2ID = user2!.id;

  // Create Boards
  const board1 = await createBoard({
    name: 'Board 1',
    userId: user1ID,
    description: 'A default board for testing',
    isPublic: true,
    imageUrl: 'images.com/board1.jpg',
  } as CreateBoardDto);
  const board2 = await createBoard({
    name: 'Board 2',
    userId: user2ID,
  } as CreateBoardDto);

  // Create CharacterInstances
  const characterInstances = await Promise.all([
    createCharacterInstance(
      board1!,
      undefined,
      'Alpha',
      'First character',
      'images.com/alpha.jpg',
      ['tag1', 'tag2']
    ),
    createCharacterInstance(
      board1!,
      undefined,
      'Bravo',
      'Second character',
      'images.com/bravo.jpg'
    ),
    createCharacterInstance(
      board1!,
      undefined,
      'Charlie',
      'Third character',
      'images.com/charlie.jpg',
      ['tag3', 'tag4']
    ),
    createCharacterInstance(board1!, undefined, 'Delta'),
    createCharacterInstance(board1!, undefined, 'Echo'),
    createCharacterInstance(board1!, undefined, 'Foxtrot'),
    createCharacterInstance(board1!, undefined, 'Golf'),
    createCharacterInstance(board1!, undefined, 'Hotel'),
    createCharacterInstance(board1!, undefined, 'India'),
    createCharacterInstance(board1!, undefined, 'Juliet'),
    createCharacterInstance(board1!, undefined, 'Kilo'),
    createCharacterInstance(board1!, undefined, 'Lima'),
    createCharacterInstance(board1!, undefined, 'Mike'),
    createCharacterInstance(board1!, undefined, 'November'),
    createCharacterInstance(board1!, undefined, 'Oscar'),
    createCharacterInstance(board1!, undefined, 'Papa'),
    createCharacterInstance(board1!, undefined, 'Quebec'),
    createCharacterInstance(board1!, undefined, 'Romeo'),
    createCharacterInstance(board1!, undefined, 'Sierra'),
    createCharacterInstance(board1!, undefined, 'Tango'),
    createCharacterInstance(board1!, undefined, 'Uniform'),
    createCharacterInstance(board1!, undefined, 'Victor'),
    createCharacterInstance(board1!, undefined, 'Whiskey'),
    createCharacterInstance(board1!, undefined, 'Xray'),
  ]);

  characterInstances.forEach((ci) => {
    createCharacterInstance(board2!, ci!.characterId);
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
