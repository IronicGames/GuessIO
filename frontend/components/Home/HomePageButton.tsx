import { Button, Flex } from '@mantine/core';
import Link from 'next/link';
import { buttonThemes, ButtonThemeType } from '@styles/buttonThemes';

interface HomePageButtonProps {
  href: string;
  text: string;
  alternate?: boolean;
  theme?: ButtonThemeType;
}

export default function HomePageButton({
  href,
  text,
  alternate = false,
  theme,
}: HomePageButtonProps) {
  // Determine theme: custom > alternate > primary
  const selectedTheme = theme
    ? buttonThemes[theme]
    : alternate
      ? buttonThemes.secondary
      : buttonThemes.primary;

  const buttonContent = (
    <Button
      w="100%"
      h={
        alternate
          ? { base: 50, sm: 70, md: 90 }
          : { base: 80, sm: 100, md: 120 }
      }
      radius="lg"
      color={selectedTheme.color}
      c={selectedTheme.textColor}
      variant={selectedTheme.variant}
      styles={{
        root: {
          fontSize: alternate
            ? 'clamp(1rem, 3vw, 1.75rem)'
            : 'clamp(1.5rem, 4vw, 2.5rem)',
          fontWeight: 600,
          borderColor: selectedTheme.borderColor,
          borderWidth: selectedTheme.variant === 'outline' ? 2 : undefined,
        },
      }}
    >
      {text}
    </Button>
  );

  // Wrap in Flex for centering if alternate
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
