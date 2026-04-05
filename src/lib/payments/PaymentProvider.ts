export interface CreatePaymentLinkRequest {
  invoiceId: string;
  invoiceNumber?: string;
  amount: number;
  currency?: string;
  customerName: string;
  customerEmail?: string;
  description: string;
}

export interface CreatePaymentLinkResponse {
  paymentLinkId: string;
  paymentLinkUrl: string;
  rawResponse?: any;
}

export interface VerifyPaymentResponse {
  isPaid: boolean;
  amountPaid: number;
  currency: string;
  transactionId: string;
  rawResponse?: any;
}

/**
 * Core Interface for the Pluggable Payment Architecture.
 * This ensures we can easily swap or add new payment providers (Squad, Paystack, Flutterwave)
 * without rewriting the Invoice Service logic.
 */
export interface PaymentProvider {
  /**
   * The unique technical identifier for this provider (e.g. "squad", "paystack")
   */
  readonly providerId: string;

  /**
   * Generate a sharable checkout link for a specific invoice
   */
  createPaymentLink(request: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse>;

  /**
   * Verify the status of a transaction (typically used by webhooks or manual check)
   */
  verifyPayment(transactionId: string): Promise<VerifyPaymentResponse>;
}
