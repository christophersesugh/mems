import { cn } from "~/shadcn";
type CProps = {
  className?: string;
  children: React.ReactNode;
};

export function Container({ className, children }: CProps) {
  return (
    <section className={cn("max-w-5xl  mx-auto px-4 py-8", className)}>
      {children}
    </section>
  );
}
