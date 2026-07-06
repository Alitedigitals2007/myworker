"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import { motion } from "framer-motion";

const cardVariants = cva(
  "border rounded-xl shadow-sm transition-all",
  {
    variants: {
      variant: {
        default: "bg-card border-none hover:shadow-md",
        interactive: "bg-card/50 hover:border-primary/30",
        selected: "border-2 border-primary shadow-lg",
        outline: "bg-background border"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>>(
  ({ className, variant, children, ...props }, ref) => {
    return variant === "interactive" ? (
      <motion.div
        whileHover={{ y: -2, scale: 1.002 }}
        transition={{ ease: "easeOut", duration: 0.15 }}
        className={cn(cardVariants({ variant, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </motion.div>
    ) : (
      <div
        className={cn(cardVariants({ variant, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  )
);

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };