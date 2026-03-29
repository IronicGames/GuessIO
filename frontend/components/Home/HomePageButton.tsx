import { Button, Flex } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import Link from 'next/link';
import { buttonThemes, type ButtonThemeType } from '@styles/buttonThemes';

interface HomePageButtonProps {
  href: string;
  text: string;
  alternate?: boolean;
  theme?: ButtonThemeType;
  // When locked, the button is visible but non-navigating.
  // Clicking fires onLockedClick so the parent can explain why.
  locked?: boolean;
  onLockedClick?: () => void;
}

export default function HomePageButton({
  href,
  text,
  alternate = false,
  theme,
  locked = false,
  onLockedClick,
}: HomePageButtonProps) {
  const selectedTheme = theme
    ? buttonThemes[theme]
    : alternate
      ? buttonThemes.secondary
      : buttonThemes.primary;

  const height = alternate ? { base: 50, sm: 70, md: 90 } : { base: 80, sm: 100, md: 120 };

  const fontSize = alternate ? 'clamp(1rem, 3vw, 1.75rem)' : 'clamp(1.5rem, 4vw, 2.5rem)';

  if (locked) {
    return (
      <Button
        w="100%"
        h={height}
        radius="lg"
        onClick={onLockedClick}
        leftSection={<IconLock size={20} />}
        styles={{
          root: {
            fontSize,
            fontWeight: 600,
            backgroundColor: '#1f2a3a',
            borderColor: '#33465f',
            borderWidth: 2,
            color: '#6b7f96',
            cursor: 'pointer',
            opacity: 0.75,
          },
        }}
      >
        {text}
      </Button>
    );
  }

  const buttonContent = (
    <Button
      w="100%"
      h={height}
      radius="lg"
      color={selectedTheme.color}
      c={selectedTheme.textColor}
      variant={selectedTheme.variant}
      styles={{
        root: {
          fontSize,
          fontWeight: 600,
          borderColor: selectedTheme.borderColor,
          borderWidth: selectedTheme.variant === 'outline' ? 2 : undefined,
        },
      }}
    >
      {text}
    </Button>
  );

  if (alternate) {
    return (
      <Flex justify="center" w="100%">
        <Link href={href} style={{ width: '50%', display: 'block' }}>
          {buttonContent}
        </Link>
      </Flex>
    );
  }

  return (
    <Link href={href} style={{ width: '100%', display: 'block' }}>
      {buttonContent}
    </Link>
  );
}
