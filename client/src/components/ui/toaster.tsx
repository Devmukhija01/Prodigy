"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastAccent,
  ToastIcon,
  ToastProgress,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant,
        duration,
        ...props
      }) {
        return (
          <Toast key={id} variant={variant} duration={duration} {...props}>
            {/* LEFT COLOR BAR */}
            {/* <ToastAccent variant={variant} /> */}

            {/* ICON + TEXT */}
            <div className="flex gap-3 items-start">
              <ToastIcon variant={variant} />
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>

            {action}

            {/* CLOSE BUTTON */}
            <ToastClose />

            {/* BOTTOM PROGRESS ANIMATION */}
            {/* <ToastProgress variant={variant} /> */}
          </Toast>
        );
      })}

      <ToastViewport />
    </ToastProvider>
  );
}
