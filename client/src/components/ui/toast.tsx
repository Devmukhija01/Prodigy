// Toast.tsx — Redesigned toast with success/error variants and 4s auto-close
import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckCircle, X, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

// Viewport: bottom-right on desktop, bottom on mobile
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed z-[9999] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-6 sm:right-6 sm:top-auto sm:w-auto md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

// variants: success (green accent on white card), error (red accent on white card), default (neutral)
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-4 overflow-hidden rounded-lg border p-4 pr-10 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-100 text-slate-900",
        success: "bg-white border-green-100 text-slate-900",
        error: "bg-white border-red-100 text-slate-900",
        destructive: "bg-white border-red-100 text-slate-900",
      },
      // optional size / severity etc can be added later
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type ToastRootProps = React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>;

// Root: default duration 4000ms
const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, ToastRootProps>(
  ({ className, variant = "default", duration = 4000, ...props }, ref) => {
    return (
      <ToastPrimitives.Root
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        duration={duration}
        {...props}
      />
    );
  }
);
Toast.displayName = ToastPrimitives.Root.displayName;

// Left accent / icon wrapper
const ToastAccent = ({ variant }: { variant?: string }) => {
  const base = "flex h-9 w-9 shrink-0 items-center justify-center rounded-md";
  if (variant === "success") {
    return (
      <div className={cn(base, "bg-green-50 border border-green-100")}>
        <CheckCircle className="h-5 w-5 text-green-600" />
      </div>
    );
  }
  if (variant === "error" || variant === "destructive") {
    return (
      <div className={cn(base, "bg-red-50 border border-red-100")}>
        <AlertCircle className="h-5 w-5 text-red-600" />
      </div>
    );
  }
  return (
    <div className={cn(base, "bg-slate-50 border border-slate-100")}>
      <CheckCircle className="h-5 w-5 text-slate-500" />
    </div>
  );
};

// Action (optional) — keeps previous API shape
const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

// Close button (top-right)
const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:text-slate-900 focus:outline-none focus:ring-2",
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn("mt-1 text-sm text-slate-700", className)} {...props} />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

// A small wrapper component that renders icon + content, exposes same props as Root
export type ToastProps = React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
