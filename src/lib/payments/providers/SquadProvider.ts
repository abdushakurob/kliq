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
    const amountInKobo = Math.round(request.amount * 100);
    const secretKey = process.env.SQAD_TEST_KEY;

    if (!secretKey) {
      throw new Error("Squad Secret Key is not configured in environment variables.");
    }
    
    try {
      const response = await fetch("https://sandbox-api-d.squadco.com/transaction/initiate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInKobo,
          email: request.customerEmail || "customer@example.com",
          currency: "NGN",
          initiate_type: "inline",
          transaction_ref: `KLIQ_${request.invoiceNumber}_${Date.now()}`,
          customer_name: request.customerName,
          callback_url: `${process.env.NEXTAUTH_URL}/pay-success?invoice_id=${request.invoiceId}`,
          metadata: {
            invoiceId: request.invoiceId,
            invoiceNumber: request.invoiceNumber,
            description: request.description
          }
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status !== 200) {
        throw new Error(data.message || `Squad API error: ${response.statusText}`);
      }

      return {
        paymentLinkId: data.data.transaction_ref,
        paymentLinkUrl: data.data.checkout_url,
      };
    } catch (error: any) {
      console.error("[SquadProvider] Failed to create payment link:", error);
      throw error;
    }
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
