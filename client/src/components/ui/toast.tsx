// components/ui/toast.tsx
import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckCircle, X, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

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

/**
 * Base toast card. We added:
 *  - rounded-2xl + shadow for polish
 *  - relative so the left accent and progress can be absolutely positioned
 *  - pl-4 (left padding) to make room for the left accent
 *  - --toast-duration CSS variable populated from the `duration` prop below
 */
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-4 overflow-visible rounded-xl p-4 pr-10 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      variant: {
        default: "bg-white text-slate-900",

        // FULL GREEN SUCCESS TOAST
        success: "bg-green-50 text-black font-600",

        // FULL RED ERROR TOAST
        error: "bg-red-50 text-white",
        destructive: "bg-red-50 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);



type ToastRootProps = React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>;

const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, ToastRootProps>(
  ({ className, variant = "default", duration = 3000, style, ...props }, ref) => {
    // expose the duration to CSS so the progress bar animation matches the toast duration
    const styleWithDuration = { ...style, ["--toast-duration" as any]: `${duration}ms` } as React.CSSProperties;

    return (
      <ToastPrimitives.Root
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        duration={duration}
        style={styleWithDuration}
        {...props}
      />
    );
  }
);
Toast.displayName = ToastPrimitives.Root.displayName;

/** Left accent strip (thin vertical bar) so the toast reads as colored even on white card */
const ToastAccent = ({ variant }: { variant?: string }) => {
  const color =
    variant === "success"
      ? "bg-green-500"
      : variant === "error" || variant === "destructive"
      ? "bg-red-500"
      : "bg-slate-400";

  return (
    // absolute vertical bar on the left; rounded on top/bottom to match card
    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${color} opacity-95`} aria-hidden />
  );
};

const ToastIcon = ({ variant }: { variant?: string }) => {
  if (variant === "success") return <CheckCircle className="h-5 w-5 text-green-600" />;
  if (variant === "error" || variant === "destructive") return <AlertCircle className="h-5 w-5 text-red-600" />;
  return <CheckCircle className="h-5 w-5 text-slate-500" />;
};

// Action (same API)
const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 items-center justify-center rounded-md border px-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
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
      "absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2",
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
  <ToastPrimitives.Title ref={ref} className={cn("text-sm font-semibold leading-tight", className)} {...props} />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn("mt-1 text-sm text-slate-700", className)} {...props} />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

/** Progress bar matching the variant color. Uses --toast-duration for animation length */
const ToastProgress = ({ variant }: { variant?: string }) => {
  const bg =
    variant === "success" ? "bg-green-500" : variant === "error" || variant === "destructive" ? "bg-red-500" : "bg-slate-400";

  return (
    <div className="absolute left-0 bottom-0 h-1 w-full overflow-hidden rounded-b-2xl">
      <div className={`progress-bar h-full transform origin-left ${bg}`} aria-hidden />
    </div>
  );
};

export type ToastProps = React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastAccent,
  ToastIcon,
  ToastProgress,
};
