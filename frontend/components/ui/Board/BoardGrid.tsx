import { SimpleGrid } from "@mantine/core";
import BoardCard, { CardData } from "./BoardCard";

interface BoardGridProps {
    addButton?: boolean;
    colCount?: number;
    cards: CardData[];
}

export default function BoardGrid({ cards, colCount=4, addButton }: BoardGridProps) {
    return (
        <SimpleGrid cols={colCount} spacing="md">
            {addButton && (
                <BoardCard key="add" card={{ id: "add", name: "Add Card", imageUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xOSAxMi45OThoLTZ2NmgtMnYtNkg1di0yaDZ2LTZoMnY2aDZ6Ii8+PC9zdmc+"}} onClick={() => {}} />
            )}
            {cards.map((card) => (
                <BoardCard key={card.id} card={card} onClick={() => {}} />
            ))}
        </SimpleGrid>
    )
}