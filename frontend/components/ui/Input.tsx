import {cva} from 'class-variance-authority';
import "../../styles/globals.css";
import { cn } from '@/utils/cn';

type InputProps = React.HTMLAttributes<HTMLInputElement> & {
    variant?: 'primary' | 'secondary';
};

export default function Input({ className, variant, ...props}: InputProps){
    return <input {...props} className={cn(inputVariants({variant}), className)}/>;
}

const inputVariants = cva(
    'w-full bg-white/5 border border-white/10 focus:border-violet-500/60 focus:bg-violet-500/5 rounded-xl px-4 py-3 '+
    'text-sm text-white placeholder-gray-600 outline-none transition-all',
    {
        variants:{
            variant:{
                primary: 'bg-blue',
                secondary: 'text-blue border bg-darkblue',
            },
        },
        defaultVariants: {
            variant: 'primary',
        },
    },
); 