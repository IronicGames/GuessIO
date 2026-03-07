import {cva} from 'class-variance-authority';
import "../../styles/globals.css";
import { cn } from '@/utils/cn';

type ButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary';
};

export default function TextButton({ className, variant, ...props}: ButtonProps){
    return <button {...props} className={cn(textButtonVariants({variant}), className)}/>;
}

const textButtonVariants = cva(
    'max-w-100 h-15 font-semibold button-text-blue text-3xl',
    {
        variants:{
            variant:{
                primary: '',
                secondary: '',
            },
        },
        defaultVariants: {
            variant: 'primary',
        },
    },
); 