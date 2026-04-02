import { Card, Center, Text, AspectRatio } from '@mantine/core';
import { type ReactNode, useState } from 'react';

export interface GridItemData {
  id: string;
  name: string;
  imageUrl?: string;
  tags?: string[];
  badge?: { label: string; color: string };
  selected?: boolean;
}

export interface ActionCardConfig {
  id: string;
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

// Discriminated union — no ambiguous optional props
type GridCardProps =
  | {
      variant: 'item';
      item: GridItemData;
      selected?: boolean;
      disabled?: boolean;
      onClick?: () => void;
    }
  | {
      variant: 'action';
      icon: ReactNode;
      label: string;
      disabled?: boolean;
      onClick?: () => void;
    };

export default function GridCard(props: GridCardProps) {
  const [hovered, setHovered] = useState(false);
  const { disabled = false, onClick } = props;
  // selected can come from the item data (when going through ItemGrid) or as a direct prop
  const selected = props.variant === 'item' ? (props.selected ?? props.item.selected ?? false) : false;
  const badge = props.variant === 'item' ? props.item.badge : undefined;
  const isClickable = !!onClick && !disabled;

  return (
    <AspectRatio ratio={1} w="100%">
      <Card
        shadow="sm"
        p="lg"
        radius="md"
        withBorder
        onClick={isClickable ? onClick : undefined}
        onMouseEnter={() => isClickable && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        bg="#2f3e55"
        style={{
          borderColor: selected ? '#8ecae6' : '#33465f',
          cursor: isClickable ? 'pointer' : disabled ? 'not-allowed' : 'default',
          transform: hovered ? 'scale(1.02)' : 'scale(1)',
          transition: 'transform 0.2s ease, opacity 0.2s ease',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          opacity: disabled ? 0.4 : 1,
          filter: disabled ? 'grayscale(40%)' : 'none',
          position: 'relative',
        }}
      >
        {/* Optional status badge — used e.g. to show character count on board cards */}
        {badge && (
          <Center
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              zIndex: 2,
              backgroundColor: badge.color + '22',
              border: `1px solid ${badge.color}`,
              borderRadius: 4,
              padding: '1px 6px',
            }}
          >
            <Text size="xs" c={badge.color} fw={600} style={{ lineHeight: 1.4 }}>
              {badge.label}
            </Text>
          </Center>
        )}

        <Card.Section style={{ flex: 1, overflow: 'hidden' }}>
          {props.variant === 'action' ? (
            <Center h="100%">{props.icon}</Center>
          ) : props.item.imageUrl ? (
            <img
              src={props.item.imageUrl}
              alt={props.item.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <Center h="100%" bg="#1f2a3a">
              {/* TODO: Replace with default character image */}
              <Text c="dimmed">No Image</Text>
            </Center>
          )}
        </Card.Section>

        <Card.Section p="xs" style={{ flexShrink: 0 }}>
          <Text c="white" fw={500} ta="center" lineClamp={2} size="lg">
            {props.variant === 'action' ? props.label : props.item.name}
          </Text>
        </Card.Section>
      </Card>
    </AspectRatio>
  );
}
