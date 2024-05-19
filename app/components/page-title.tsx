import { cn } from "~/shadcn";

type TitleProps = {
  className?: string;
  title: string;
};

export function PageTitle({ className, title }: TitleProps) {
  return (
    <h1
      aria-label={title}
      className={cn(
        "underline underline-offset-8 text-xl  w-full capitalize",
        className
      )}
    >
      {title}
    </h1>
  );
}
