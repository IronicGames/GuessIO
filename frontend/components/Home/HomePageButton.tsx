import { Button, Flex } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import Link from 'next/link';
import { buttonThemes, type ButtonThemeType } from '@styles/buttonThemes';

interface HomePageButtonProps {
  href?: string;
  text: string;
  alternate?: boolean;
  theme?: ButtonThemeType;
  loading?: boolean;
  // When provided on an unlocked button, overrides Link navigation entirely.
  onClick?: () => void;
  // When locked, the button is visible but non-navigating.
  // Clicking fires onLockedClick so the parent can explain why.
  locked?: boolean;
  onLockedClick?: () => void;
  // Grayed out with "Coming soon" sub-label — completely non-interactive.
  comingSoon?: boolean;
}

export default function HomePageButton({
  href,
  text,
  alternate = false,
  theme,
  loading = false,
  onClick,
  locked = false,
  onLockedClick,
  comingSoon = false,
}: HomePageButtonProps) {
  const selectedTheme = theme
    ? buttonThemes[theme]
    : alternate
      ? buttonThemes.secondary
      : buttonThemes.primary;

  const height = alternate ? { base: 50, sm: 70, md: 90 } : { base: 80, sm: 100, md: 120 };

  const fontSize = alternate ? 'clamp(1rem, 3vw, 1.75rem)' : 'clamp(1.5rem, 4vw, 2.5rem)';

  const dimmedStyles = {
    root: {
      fontSize,
      fontWeight: 600,
      backgroundColor: '#1f2a3a',
      borderColor: '#33465f',
      borderWidth: 2,
      color: '#6b7f96',
      opacity: 0.75,
    },
  };

  if (comingSoon) {
    return (
      <Button
        w="100%"
        h={height}
        radius="lg"
        style={{ pointerEvents: 'none' }}
        styles={{ root: { ...dimmedStyles.root, cursor: 'default' } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span>{text}</span>
          <span style={{ fontSize: '0.45em', fontWeight: 400, letterSpacing: '0.08em', color: '#4a5d73' }}>
            COMING SOON
          </span>
        </div>
      </Button>
    );
  }

  if (locked) {
    return (
      <Button
        w="100%"
        h={height}
        radius="lg"
        onClick={onLockedClick}
        leftSection={<IconLock size={20} />}
        styles={{ root: { ...dimmedStyles.root, cursor: 'pointer' } }}
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
      loading={loading}
      color={selectedTheme.color}
      c={selectedTheme.textColor}
      variant={selectedTheme.variant}
      onClick={onClick}
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

  // onClick override — skip Link wrapper, button handles navigation itself
  if (onClick) {
    if (alternate) {
      return (
        <Flex justify="center" w="100%">
          {buttonContent}
        </Flex>
      );
    }
    return <>{buttonContent}</>;
  }

  if (alternate) {
    return (
      <Flex justify="center" w="100%">
        {href ? (
          <Link href={href} style={{ width: '50%', display: 'block' }}>
            {buttonContent}
          </Link>
        ) : (
          buttonContent
        )}
      </Flex>
    );
  }

  if (!href) return <>{buttonContent}</>;

  return (
    <Link href={href} style={{ width: '100%', display: 'block' }}>
      {buttonContent}
    </Link>
  );
}
