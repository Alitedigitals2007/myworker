"use strict";
import { z } from "zod";
import { CommissionType, Status, ComplaintStatus, TargetType, MessageType, Gender } from "@prisma/client";

// Base schemas
const phoneSchema = z.string().regex(/^\+?[0-9\s\-\(\)]{10,15}$/, "Invalid phone number");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(32, "Password too long");
const imageUrlSchema = z.string().url("Must be a valid URL").max(2000);

// Auth
export const loginSchema = z.object({
  email: z.string().email("Invalid email").optional(),
  workerId: z.string().optional(),
  password: passwordSchema,
  loginType: z.enum(["admin", "worker"]),
}).refine(data => data.loginType === "admin" ? data.email : data.workerId, {
  message: "Email is required for admin login"
});

export const workerLoginFirstSchema = z.object({
  workerId: z.string().min(1, "Worker ID is required"),
  password: passwordSchema,
  faceVerification: z.boolean().optional()
}).refine(data => data.faceVerification !== undefined, {
  message: "Face verification required",
  path: ["faceVerification"]
});

// Workers
const commissionSchema = z.object({
  percent: z.coerce.number().min(0).max(100, "Percentage must be between 0-100"),
  type: z.nativeEnum(CommissionType).default("PERCENTAGE")
});

export const workerSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters").max(100),
  email: z.string().email("Invalid email"),
  phone: phoneSchema.optional(),
  department: z.string().max(50).optional(),
  position: z.string().max(50).optional(),
  address: z.string().max(200).optional(),
  gender: z.nativeEnum(Gender).optional(),
  dateOfBirth: z.coerce.date().max(new Date(), "Date cannot be in the future").optional(),
  employmentDate: z.coerce.date().max(new Date(), "Date cannot be in the future").optional(),
  profilePicture: imageUrlSchema.optional(),
  commission: commissionSchema,
  status: z.nativeEnum(Status).default("ACTIVE"),
  password: passwordSchema.optional()
});

// Products
const productVariantSchema = z.object({
  name: z.string().min(1, "Variant name required"),
  sku: z.string().max(50),
  image: imageUrlSchema.optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  price: z.coerce.number().positive(),
  attributes: z.record(z.string())
});

export const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  category: z.string().max(50),
  sku: z.string().max(50),
  sellingPrice: z.coerce.number().positive(),
  costPrice: z.coerce.number().positive(),
  description: z.string().max(1000).optional(),
  images: z.array(imageUrlSchema).max(6, "Maximum 6 product images"),
  commissionType: z.nativeEnum(CommissionType),
  commissionValue: z.coerce.number().optional(),
  variants: z.array(productVariantSchema).optional(),
  status: z.nativeEnum(Status).default("ACTIVE")
});

// Sales
const saleItemSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional(),
  quantity: z.coerce.number().int().positive()
});

export const saleSchema = z.object({
  customerName: z.string().min(3, "Customer name required"),
  customerPhone: phoneSchema.optional(),
  items: z.array(saleItemSchema),
  discount: z.coerce.number().min(0).default(0),
  paymentMethod: z.string().max(50),
  receiptUrl: imageUrlSchema.optional(),
  notes: z.string().max(1000).optional()
});

// Payments
const paymentMethodSchema = z.enum(["Bank", "Cash", "USSD", "POS", "Transfer"]);

export const paymentSchema = z.object({
  workerId: z.string().cuid(),
  amount: z.coerce.number().positive(),
  paymentMethod: paymentMethodSchema,
  reference: z.string().max(100).optional(),
  notes: z.string().max(1000).optional()
});

// Complaints
const complaintStatusSchema = z.nativeEnum(ComplaintStatus).default("PENDING");

export const complaintSchema = z.object({
  title: z.string().min(5, "Title too short").max(100),
  description: z.string().min(10, "Description too short"),
  images: z.array(imageUrlSchema).max(3, "Maximum 3 images").optional(),
  status: complaintStatusSchema
});

// Announcements
export const announcementSchema = z.object({
  title: z.string().min(5, "Title required").max(100),
  content: z.string().min(10, "Content required"),
  images: z.array(imageUrlSchema).max(3).optional(),
  targetType: z.nativeEnum(TargetType).default("ALL"),
  targetIds: z.array(z.string().cuid()).optional()
});

// Messages
const messageTypeSchema = z.nativeEnum(MessageType);

export const messageSchema = z.object({
  content: z.string().max(2000),
  type: messageTypeSchema.default("TEXT"),
  attachments: z.array(imageUrlSchema).max(5).optional(),
  chatId: z.string().cuid()
});

// Utility schemas
export const filterSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  department: z.string().optional(),
  category: z.string().optional()
});