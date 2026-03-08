import {cva} from 'class-variance-authority';
import "../../styles/globals.css";
import { cn } from '@/utils/cn';

type ButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'red';
};

export default function Button({ className, variant, ...props}: ButtonProps){
    return <button {...props} className={cn(buttonVariants({variant}), className)}/>;
}

const buttonVariants = cva(
    'max-w-100 h-20 items-center justify-center rounded-xl font-semibold hover:opacity-80 text-3xl dark-text shadow-lg/30',
    {
        variants:{
            variant:{
                primary: 'bg-blue',
                secondary: 'text-blue border bg-darkblue',
                red: 'bg-red h-10 text-sm hover:bg-white/10 transition-all rounded-xl',
            },
        },
        defaultVariants: {
            variant: 'primary',
        },
    },
); 