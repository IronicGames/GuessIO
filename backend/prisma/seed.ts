import prisma from '../src/lib/prisma';
import { createBoard } from '../src/services/board.service';
import { createCharacter } from '../src/services/character.service';
import { createUser } from '../src/repositories/user.repository';
import { type CreateCharacterDto } from '@shared/types/character.types';

async function main() {
  // Create Users
  const user1 = await createUser(
    'prince',
    `prince-${crypto.randomUUID()}@ironic.com`,
    'googleId1',
    'images.com/prince.jpg',
  );
  const user2 = await createUser('kevin');

  // Create Boards
  const board1 = await createBoard(user1!.id, {
    name: 'Board 1',
    description: 'A default board for testing',
    isPublic: true,
    imageUrl: 'images.com/board1.jpg',
  });
  const board2 = await createBoard(user2!.id, {
    name: 'Board 2',
  });

  const board1Id = board1!;
  const board2Id = board2!;

  // Create Characters on board1, then add them to board2
  const characterDtos = [
    {
      name: 'Alpha',
      description: 'First character',
      imageUrl: 'images.com/alpha.jpg',
      tags: ['tag', 'tag2'],
    },
    {
      name: 'Bravo',
      description: 'Second character',
      imageUrl: 'images.com/bravo.jpg',
    },
    {
      name: 'Charlie',
      description: 'Third character',
      imageUrl: 'images.com/charlie.jpg',
      tags: ['tag3', 'tag4'],
    },
    { name: 'Delta' },
    { name: 'Echo' },
    { name: 'Foxtrot' },
    { name: 'Golf' },
    { name: 'Hotel' },
    { name: 'India' },
    { name: 'Juliet' },
    { name: 'Kilo' },
    { name: 'Lima' },
    { name: 'Mike' },
    { name: 'November' },
    { name: 'Oscar' },
    { name: 'Papa' },
    { name: 'Quebec' },
    { name: 'Romeo' },
    { name: 'Sierra' },
    { name: 'Tango' },
    { name: 'Uniform' },
    { name: 'Victor' },
    { name: 'Whiskey' },
    { name: 'Xray' },
  ] as CreateCharacterDto[];

  for (const dto of characterDtos) {
    // Create on board1
    const { characterId } = await createCharacter(board1Id, dto);

    // Add the same character to board2
    await createCharacter(board2Id, { characterId });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
