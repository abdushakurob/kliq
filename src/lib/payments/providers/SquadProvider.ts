import { PaymentProvider, CreatePaymentLinkRequest, CreatePaymentLinkResponse, VerifyPaymentResponse } from "../PaymentProvider";

/**
 * Squad Payment Provider implementation.
 * API Docs: https://squadco.com/api-documentation/
 */
export class SquadProvider implements PaymentProvider {
  readonly providerId = "squad";

  private get headers() {
    return {
      "Authorization": `Bearer ${process.env.SQUAD_SECRET_KEY}`,
      "Content-Type": "application/json",
    };
  }

  async createPaymentLink(request: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse> {
    // Note: Squad API typically expects amount in kobo (multiply by 100)
    const amountInKobo = Math.round(request.amount * 100);
    
    // In a real implementation we might call specific Squad endpoints
    // For now we simulate the API call structure conceptually
    console.log(`[SquadProvider] Creating payment link for ${request.invoiceId} of amount ${amountInKobo}`);

    // Example Mock Response for now
    return {
      paymentLinkId: `sq_link_${Date.now()}`,
      paymentLinkUrl: `https://sandbox.squadco.com/pay/sq_link_${Date.now()}`,
    };
  }

  async verifyPayment(transactionId: string): Promise<VerifyPaymentResponse> {
    console.log(`[SquadProvider] Verifying transaction ${transactionId}`);
    
    // Example Mock Response
    return {
      isPaid: true,
      amountPaid: 0, // Will be fetched from verified data
      currency: "NGN",
      transactionId: transactionId,
    };
  }
}
