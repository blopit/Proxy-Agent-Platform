"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider data-oid="67wfyd4">
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} data-oid="v4dy9ai">
            <div className="grid gap-1" data-oid="wnh5_5o">
              {title && <ToastTitle data-oid="coc12wu">{title}</ToastTitle>}
              {description && (
                <ToastDescription data-oid="fldikkq">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose data-oid="9gb_ik_" />
          </Toast>
        );
      })}
      <ToastViewport data-oid="4plwcnc" />
    </ToastProvider>
  );
}
