import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type PaymentStatus = "pending" | "completed" | "failed";

const normalizeReceipt = (value: unknown) => {
  if (typeof value !== "string") return null;

  const cleanedValue = value.trim();
  if (!cleanedValue || cleanedValue.toUpperCase() === "N/A") return null;

  return cleanedValue;
};

const normalizeStatus = (payload: Record<string, unknown>): PaymentStatus => {
  const responseCode = String(
    payload.ResponseCode ??
      payload.response_code ??
      payload.ResultCode ??
      payload.result_code ??
      ""
  ).trim();

  const receipt = normalizeReceipt(
    payload.TransactionReceipt ?? payload.receipt ?? payload.MpesaReceiptNumber
  );

  const statusText = [
    payload.status,
    payload.payment_status,
    payload.TransactionStatus,
    payload.transaction_status,
    payload.ResultDesc,
    payload.result_desc,
    payload.message,
    payload.Message,
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join(" ")
    .toLowerCase();

  if (
    responseCode === "0" ||
    receipt ||
    statusText.includes("success") ||
    statusText.includes("complete")
  ) {
    return "completed";
  }

  if (
    ["1", "1032", "1037", "2001"].includes(responseCode) ||
    statusText.includes("fail") ||
    statusText.includes("cancel") ||
    statusText.includes("declin") ||
    statusText.includes("timeout") ||
    statusText.includes("expire")
  ) {
    return "failed";
  }

  return "pending";
};

const syncDonationStatus = async (
  supabase: ReturnType<typeof createClient>,
  donationId: string | null,
  status: PaymentStatus,
  receipt: string | null
) => {
  if (!donationId || status === "pending") return;

  const updatePayload = status === "completed"
    ? {
        status: "completed",
        transaction_code: receipt,
        verified_at: new Date().toISOString(),
        verification_type: "auto_mpesa",
      }
    : {
        status: "failed",
      };

  const { error } = await supabase
    .from("donations")
    .update(updatePayload)
    .eq("id", donationId);

  if (error) {
    console.error("Error updating linked donation:", error);
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("PesaFlux webhook received:", JSON.stringify(payload));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract fields - PesaFlux callback format
    const transactionRequestId = payload.TransactionID || payload.transaction_request_id || payload.transactionRequestId;
    const checkoutRequestId = payload.CheckoutRequestID || payload.checkout_request_id;
    const receipt = normalizeReceipt(payload.TransactionReceipt || payload.receipt || payload.MpesaReceiptNumber);
    const amount = payload.TransactionAmount || payload.amount || payload.Amount;
    const msisdn = payload.Msisdn || payload.msisdn || payload.PhoneNumber;
    const responseCode = String(payload.ResponseCode ?? payload.response_code ?? payload.ResultCode ?? "");
    const status = normalizeStatus(payload as Record<string, unknown>);

    if (!transactionRequestId && !checkoutRequestId) {
      console.error("No transaction identifiers in webhook payload");
      return new Response(
        JSON.stringify({ error: "Missing transaction identifiers" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const updatePayload: Record<string, unknown> = {
      response_code: responseCode,
      status,
      raw_callback: payload,
      updated_at: new Date().toISOString(),
    };

    if (receipt) {
      updatePayload.receipt = receipt;
    }

    if (amount) {
      updatePayload.amount = Number(amount);
    }

    if (msisdn) {
      updatePayload.msisdn = msisdn;
    }

    let matchedTransaction = null;

    if (transactionRequestId) {
      const { data, error } = await supabase
        .from("pesaflux_transactions")
        .update({
          ...updatePayload,
        })
        .eq("transaction_request_id", transactionRequestId)
        .select("id, donation_id, transaction_request_id, checkout_request_id")
        .maybeSingle();

      if (error) {
        console.error("Error updating transaction by transaction_request_id:", error);
      }

      matchedTransaction = data || matchedTransaction;
    }

    if (!matchedTransaction && checkoutRequestId) {
      const { data, error } = await supabase
        .from("pesaflux_transactions")
        .update({
          ...updatePayload,
        })
        .eq("checkout_request_id", checkoutRequestId)
        .select("id, donation_id, transaction_request_id, checkout_request_id")
        .maybeSingle();

      if (error) {
        console.error("Error updating transaction by checkout_request_id:", error);
      }

      matchedTransaction = data || matchedTransaction;
    }

    if (!matchedTransaction && receipt) {
      const { data, error } = await supabase
        .from("pesaflux_transactions")
        .update({
          ...updatePayload,
        })
        .eq("receipt", receipt)
        .select("id, donation_id, transaction_request_id, checkout_request_id")
        .maybeSingle();

      if (error) {
        console.error("Error updating transaction by receipt:", error);
      }

      matchedTransaction = data || matchedTransaction;
    }

    await syncDonationStatus(supabase, matchedTransaction?.donation_id || null, status, receipt);

    if (!matchedTransaction) {
      console.warn("Webhook processed but no matching transaction row was found", {
        transactionRequestId,
        checkoutRequestId,
      });
    }

    return new Response(
      JSON.stringify({ success: true, status, transaction_id: matchedTransaction?.id || null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
