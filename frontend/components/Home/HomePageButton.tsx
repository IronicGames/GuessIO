import { Button } from '@mantine/core';
import Link from 'next/link';

interface HomePageButton {
  href: string;
  text: string;
  alternate?: boolean;
}
export default function HomePageButton({
  href,
  text,
  alternate = false,
}: HomePageButton) {
  return (
    <Link
      href={href}
      style={{ width: alternate ? '50%' : '100%', display: 'block' }}
    >
      <Button
        w="100%"
        h={
          alternate
            ? { base: 50, sm: 70, md: 90 }
            : { base: 80, sm: 100, md: 120 }
        }
        radius="lg"
        color={alternate ? '#2f3e55' : '#8ecae6'}
        c={alternate ? '#e6edf3' : 'black'}
        variant="filled"
        styles={{
          root: {
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: 600,
            borderColor: '#8ecae6',
          },
        }}
      >
        {text}
      </Button>
    </Link>
  );
}
