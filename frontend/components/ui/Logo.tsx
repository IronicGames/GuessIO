import { cva } from 'class-variance-authority';
import { cn } from '@/utils/cn';

type LogoProps = React.HTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export default function Logo({ className, variant, ...props }: LogoProps) {
  return (
    <button {...props} className={cn(logoVariants({ variant }), className)}>
      GuessIO
    </button>
  );
}

const logoVariants = cva(
  'max-w-100 h-15 text-4xl font-extrabold tracking-tight ',
  {
    variants: {
      variant: {
        primary: '',
        secondary: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);
