"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LucideUser, LucidePackage, LucideCreditCard, LucideCheck, LucideArrowLeft, LucideArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  sellingPrice: number;
  variants: { id: string; name: string; stock: number; price: number }[];
}

const steps = [
  { id: 1, title: "Customer", icon: LucideUser },
  { id: 2, title: "Product", icon: LucidePackage },
  { id: 3, title: "Payment", icon: LucideCreditCard },
  { id: 4, title: "Review", icon: LucideCheck }
];

export default function NewSalePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");

  // Mock products data
  const products: Product[] = [
    { id: "1", name: "iPhone 15 Pro Max", sellingPrice: 1200000, variants: [{ id: "1", name: "256GB", stock: 50, price: 1200000 }, { id: "2", name: "512GB", stock: 25, price: 1400000 }] },
    { id: "2", name: "Nike Air Max 90", sellingPrice: 85000, variants: [{ id: "3", name: "Black 42", stock: 15, price: 85000 }, { id: "4", name: "White 41", stock: 8, price: 85000 }] },
    { id: "3", name: "Samsung 55\" Smart TV", sellingPrice: 450000, variants: [] }
  ];

  const selectedVariantData = selectedProduct?.variants.find(v => v.id === selectedVariant);
  const unitPrice = selectedVariantData?.price || selectedProduct?.sellingPrice || 0;
  const subtotal = unitPrice * quantity;
  const total = subtotal - discount;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          items: [{
            productId: selectedProduct?.id,
            variantId: selectedVariant || undefined,
            quantity
          }],
          discount,
          paymentMethod,
          notes
        })
      });

      if (res.ok) {
        router.push("/worker/sales");
      }
    } catch (error) {
      console.error("Failed to create sale:", error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return customerName.length >= 3;
      case 2: return selectedProduct !== null && (selectedProduct.variants.length === 0 || selectedVariant !== "");
      case 3: return paymentMethod !== "";
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <LucideArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">New Sale</h1>
            <p className="text-sm text-muted-foreground">Create a new sale record</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted ? "bg-green-500 text-white" : isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {isCompleted ? <LucideCheck size={20} /> : <Icon size={20} />}
                  </div>
                  <span className={`text-xs mt-1 ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}>
                    {step.title}
                  </span>
                </div>
                {step.id < 4 && (
                  <div className={`w-12 md:w-20 h-0.5 mx-2 ${isCompleted ? "bg-green-500" : "bg-muted"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Steps */}
        <Card className="p-6">
          {/* Step 1: Customer Info */}
          {currentStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="text-lg font-semibold">Customer Information</h2>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Customer Name *</label>
                <Input
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
                <Input
                  placeholder="+2348012345678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-12"
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Product Selection */}
          {currentStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="text-lg font-semibold">Select Product</h2>
              <div className="space-y-3">
                {products.map(product => (
                  <div
                    key={product.id}
                    onClick={() => {
                      setSelectedProduct(product);
                      setSelectedVariant("");
                    }}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                      selectedProduct?.id === product.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.variants.length > 0
                            ? `${product.variants.length} variants available`
                            : "No variants"}
                        </p>
                      </div>
                      <p className="font-bold">{formatCurrency(product.sellingPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedProduct && selectedProduct.variants.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Select Variant *</label>
                  <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select variant" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProduct.variants.map(variant => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.name} - {formatCurrency(variant.price)} (Stock: {variant.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Quantity *</label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Unit Price</label>
                  <div className="h-12 px-3 py-2 bg-muted rounded-lg flex items-center">
                    {formatCurrency(unitPrice)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="text-lg font-semibold">Payment Details</h2>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Payment Method *</label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="pos">POS</SelectItem>
                    <SelectItem value="ussd">USSD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Discount</label>
                <Input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Notes</label>
                <textarea
                  className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background text-sm"
                  placeholder="Additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="text-lg font-semibold">Review Sale</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{customerName}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Phone</span>
                  <span>{customerPhone || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Product</span>
                  <span className="font-medium">{selectedProduct?.name}</span>
                </div>
                {selectedVariantData && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Variant</span>
                    <span>{selectedVariantData.name}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Quantity</span>
                  <span>{quantity}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Unit Price</span>
                  <span>{formatCurrency(unitPrice)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-red-500">-{formatCurrency(discount)}</span>
                </div>
                <div className="flex justify-between py-3 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Payment Method</span>
                  <Badge variant="outline">{paymentMethod}</Badge>
                </div>
              </div>
            </motion.div>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
              <LucideArrowLeft size={18} className="mr-2" />
              Back
            </Button>
          )}
          {currentStep < 4 && (
            <Button className="flex-1" onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceed()}>
              Continue
              <LucideArrowRight size={18} className="ml-2" />
            </Button>
          )}
          {currentStep === 4 && (
            <Button className="flex-1" onClick={handleSubmit} loading={loading}>
              Submit Sale
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}