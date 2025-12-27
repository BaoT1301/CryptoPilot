import { cn } from "@/lib/utils";

export function FieldSet({
  className,
  ...props
}: React.HTMLAttributes<HTMLFieldSetElement>) {
  return <fieldset className={cn("space-y-6", className)} {...props} />;
}

export function FieldGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function Field({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col", className)} {...props} />;
}

export function FieldLabel({
  className,
  children,
  required = false,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 flex items-center",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {required ? (
        <span className="ml-1 text-destructive" aria-hidden>
          *
        </span>
      ) : null}
    </label>
  );
}

export function FieldDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)} {...props} />
  );
}

export function FieldError({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs font-medium text-red-500", className)}
      {...props}
    />
  );
}
