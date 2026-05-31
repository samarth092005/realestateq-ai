"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createBrokerLead } from "@/services/lead";
import toast from "react-hot-toast";

interface ContactBrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  brokerId: string;
  userId: string;
  userProfileName?: string;
  userProfileEmail?: string;
}

export function ContactBrokerModal({
  isOpen,
  onClose,
  ...props
}: ContactBrokerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-[32px] border border-border bg-card p-8 text-foreground shadow-2xl transition-all duration-300">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>📩</span> Contact Broker
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Send an inquiry for <span className="text-primary font-semibold">{props.propertyTitle}</span>. The broker will respond to you shortly.
          </DialogDescription>
        </DialogHeader>

        {/* Conditionally mount/unmount the form to cleanly reset state and avoid useEffect sync warnings */}
        {isOpen && <ContactBrokerForm onClose={onClose} {...props} />}
      </DialogContent>
    </Dialog>
  );
}

interface ContactBrokerFormProps {
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  brokerId: string;
  userId: string;
  userProfileName?: string;
  userProfileEmail?: string;
}

function ContactBrokerForm({
  onClose,
  propertyId,
  propertyTitle,
  brokerId,
  userId,
  userProfileName = "",
  userProfileEmail = "",
}: ContactBrokerFormProps) {
  const [name, setName] = useState(userProfileName);
  const [email, setEmail] = useState(userProfileEmail);
  const [message, setMessage] = useState(
    `Hi, I am highly interested in "${propertyTitle}" (Ref: ${propertyId}) and would like to receive pricing, site visit options, and availability details. Please contact me.`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  const validateForm = () => {
    const tempErrors: typeof errors = {};
    let isValid = true;

    if (!name.trim()) {
      tempErrors.name = "Name is required.";
      isValid = false;
    } else if (name.trim().length < 3) {
      tempErrors.name = "Name must be at least 3 characters.";
      isValid = false;
    }

    if (!email.trim()) {
      tempErrors.email = "Email is required.";
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        tempErrors.email = "Enter a valid email address.";
        isValid = false;
      }
    }

    if (!message.trim()) {
      tempErrors.message = "Message is required.";
      isValid = false;
    } else if (message.trim().length < 10) {
      tempErrors.message = "Message should be at least 10 characters.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please correct the validation errors in the form.");
      return;
    }

    try {
      setIsSubmitting(true);

      await createBrokerLead({
        propertyId,
        propertyTitle,
        brokerId: brokerId || "unassigned",
        userId,
        userName: name.trim(),
        userEmail: email.trim(),
        message: message.trim(),
      });

      toast.success("Your inquiry has been sent to the broker.");
      onClose();
    } catch (error) {
      console.error("Firestore submit lead failed:", error);
      toast.error("Failed to send inquiry. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-5">
      {/* Name Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Full Name
        </label>
        <Input
          type="text"
          placeholder="Your Full Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          className={`h-11 rounded-xl border bg-background px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60 ${
            errors.name ? "border-red-500/50 focus:border-red-500/80" : "border-border"
          }`}
        />
        {errors.name && (
          <p className="text-xs text-red-500 font-medium px-1 mt-1">{errors.name}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Email Address
        </label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          className={`h-11 rounded-xl border bg-background px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60 ${
            errors.email ? "border-red-500/50 focus:border-red-500/80" : "border-border"
          }`}
        />
        {errors.email && (
          <p className="text-xs text-red-500 font-medium px-1 mt-1">{errors.email}</p>
        )}
      </div>

      {/* Message Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Your Message
        </label>
        <Textarea
          placeholder="Write down any specific details or questions..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
          }}
          rows={4}
          className={`min-h-[120px] rounded-xl border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60 ${
            errors.message ? "border-red-500/50 focus:border-red-500/80" : "border-border"
          }`}
        />
        {errors.message && (
          <p className="text-xs text-red-500 font-medium px-1 mt-1">{errors.message}</p>
        )}
      </div>

      {/* Modal Footer with Actions */}
      <DialogFooter className="mt-6 flex flex-row gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-xl border border-border bg-muted/50 hover:bg-muted text-foreground transition px-5 text-sm h-11 cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition px-6 text-sm h-11 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md shadow-primary/10"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              Sending...
            </>
          ) : (
            "Send Inquiry"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
