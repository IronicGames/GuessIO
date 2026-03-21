import prisma from '../src/lib/prisma';
import { createBoard } from '../src/services/board.service';
import { createCharacter } from '../src/services/character.service';
import { createUser } from '../src/repositories/user.repository';

async function main() {
  // Create Users
  const user1 = await createUser(
    'prince',
    `prince-${crypto.randomUUID()}@ironic.com`,
    'googleId1',
    'images.com/prince.jpg'
  );
  const user1ID = user1!.id;
  const user2 = await createUser('kevin');
  const user2ID = user2!.id;

  // Create Boards
  const boards = [
    await createBoard({
      name: 'Board 1',
      userId: user1ID,
      description: 'A default board for testing',
      isPublic: true,
      imageUrl: 'images.com/board1.jpg',
    }),
    await createBoard({
      name: 'Board 2',
      userId: user2ID,
    }),
  ];

  // Create Characters
  for (const boardId of boards) {
    await createCharacter({
      boardId: boardId!,
      name: 'Alpha',
      description: 'First character',
      imageUrl: 'images.com/alpha.jpg',
      tags: ['tag', 'tag2'],
    });
    await createCharacter({
      boardId: boardId!,
      name: 'Bravo',
      description: 'Second character',
      imageUrl: 'images.com/bravo.jpg',
    });
    await createCharacter({
      boardId: boardId!,
      name: 'Charlie',
      description: 'Third character',
      imageUrl: 'images.com/charlie.jpg',
      tags: ['tag3', 'tag4'],
    });
    await createCharacter({ boardId: boardId!, name: 'Delta' });
    await createCharacter({ boardId: boardId!, name: 'Echo' });
    await createCharacter({ boardId: boardId!, name: 'Foxtrot' });
    await createCharacter({ boardId: boardId!, name: 'Golf' });
    await createCharacter({ boardId: boardId!, name: 'Hotel' });
    await createCharacter({ boardId: boardId!, name: 'India' });
    await createCharacter({ boardId: boardId!, name: 'Juliet' });
    await createCharacter({ boardId: boardId!, name: 'Kilo' });
    await createCharacter({ boardId: boardId!, name: 'Lima' });
    await createCharacter({ boardId: boardId!, name: 'Mike' });
    await createCharacter({ boardId: boardId!, name: 'November' });
    await createCharacter({ boardId: boardId!, name: 'Oscar' });
    await createCharacter({ boardId: boardId!, name: 'Papa' });
    await createCharacter({ boardId: boardId!, name: 'Quebec' });
    await createCharacter({ boardId: boardId!, name: 'Romeo' });
    await createCharacter({ boardId: boardId!, name: 'Sierra' });
    await createCharacter({ boardId: boardId!, name: 'Tango' });
    await createCharacter({ boardId: boardId!, name: 'Uniform' });
    await createCharacter({ boardId: boardId!, name: 'Victor' });
    await createCharacter({ boardId: boardId!, name: 'Whiskey' });
    await createCharacter({ boardId: boardId!, name: 'Xray' });
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
