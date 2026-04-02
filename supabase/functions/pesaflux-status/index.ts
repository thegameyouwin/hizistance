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

const normalizeStatus = (payload: Record<string, unknown> | null | undefined): PaymentStatus => {
  if (!payload) return "pending";

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
    console.error("Error syncing donation status from status check:", error);
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      transaction_request_id,
      transaction_id,
      checkout_request_id,
      force_refresh = false,
    } = await req.json();

    if (!transaction_request_id && !transaction_id && !checkout_request_id) {
      return new Response(
        JSON.stringify({ error: "transaction_request_id, transaction_id or checkout_request_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const filters = [
      typeof transaction_id === "string" ? `id.eq.${transaction_id}` : null,
      typeof transaction_request_id === "string" ? `transaction_request_id.eq.${transaction_request_id}` : null,
      typeof checkout_request_id === "string" ? `checkout_request_id.eq.${checkout_request_id}` : null,
    ].filter(Boolean).join(",");

    const { data: localTransaction, error: localTransactionError } = filters
      ? await supabase
          .from("pesaflux_transactions")
          .select("id, donation_id, status, receipt, response_code, transaction_request_id, checkout_request_id")
          .or(filters)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : { data: null, error: null };

    if (localTransactionError) {
      console.error("Error reading local transaction status:", localTransactionError);
    }

    const currentLocalStatus = localTransaction?.status;
    if (currentLocalStatus === "completed" || currentLocalStatus === "failed") {
      await syncDonationStatus(supabase, localTransaction.donation_id, currentLocalStatus, localTransaction.receipt);

      return new Response(
        JSON.stringify({
          success: true,
          status: currentLocalStatus,
          transaction_id: localTransaction.id,
          transaction_request_id: localTransaction.transaction_request_id,
          donation_id: localTransaction.donation_id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!force_refresh && localTransaction) {
      return new Response(
        JSON.stringify({
          success: true,
          status: localTransaction.status,
          transaction_id: localTransaction.id,
          transaction_request_id: localTransaction.transaction_request_id,
          donation_id: localTransaction.donation_id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: settings } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["pesaflux_api_key", "pesaflux_email"]);

    const settingsMap: Record<string, string> = {};
    settings?.forEach((s: any) => { settingsMap[s.key] = s.value || ""; });

    const settingsMap: Record<string, string> = {};
    settings?.forEach((s: any) => { settingsMap[s.key] = s.value || ""; });

    if (!settingsMap.pesaflux_api_key || !settingsMap.pesaflux_email) {
      return new Response(
        JSON.stringify({ error: "PesaFlux API settings are missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestId =
      (typeof transaction_request_id === "string" && transaction_request_id) ||
      localTransaction?.transaction_request_id ||
      null;

    if (!requestId) {
      return new Response(
        JSON.stringify({
          success: true,
          status: localTransaction?.status || "pending",
          transaction_id: localTransaction?.id || null,
          transaction_request_id: null,
          donation_id: localTransaction?.donation_id || null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.pesaflux.co.ke/v1/transactionstatus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: settingsMap.pesaflux_api_key,
        email: settingsMap.pesaflux_email,
        transaction_request_id: requestId,
      }),
    });

    const providerData = await response.json();

    if (!response.ok) {
      console.error("PesaFlux status API returned an error:", providerData);

      return new Response(
        JSON.stringify({
          success: false,
          status: localTransaction?.status || "pending",
          transaction_id: localTransaction?.id || transaction_id || null,
          transaction_request_id: requestId,
          donation_id: localTransaction?.donation_id || null,
          message: providerData?.error || providerData?.message || providerData?.Message || "Unable to refresh status right now",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedStatus = normalizeStatus(providerData);
    const receipt = normalizeReceipt(
      providerData.TransactionReceipt ?? providerData.receipt ?? providerData.MpesaReceiptNumber ?? localTransaction?.receipt
    );
    const responseCode = String(
      providerData.ResponseCode ??
        providerData.response_code ??
        providerData.ResultCode ??
        providerData.result_code ??
        localTransaction?.response_code ??
        ""
    ).trim();

    const updatePayload: Record<string, unknown> = {
      status: normalizedStatus,
      updated_at: new Date().toISOString(),
      raw_callback: {
        source: "status_check",
        checked_at: new Date().toISOString(),
        payload: providerData,
      },
    };

    if (receipt) {
      updatePayload.receipt = receipt;
    }

    if (responseCode) {
      updatePayload.response_code = responseCode;
    }

    let syncedTransaction = localTransaction;
    const transactionIdToUse =
      (typeof transaction_id === "string" && transaction_id) ||
      localTransaction?.id ||
      null;
    const checkoutRequestIdToUse =
      (typeof checkout_request_id === "string" && checkout_request_id) ||
      localTransaction?.checkout_request_id ||
      null;

    if (transactionIdToUse) {
      const { data: updatedTransaction } = await supabase
        .from("pesaflux_transactions")
        .update(updatePayload)
        .eq("id", transactionIdToUse)
        .select("id, donation_id, status, receipt, response_code, transaction_request_id, checkout_request_id")
        .maybeSingle();

      syncedTransaction = updatedTransaction || syncedTransaction;
    }

    if (!syncedTransaction && requestId) {
      const { data: updatedTransaction } = await supabase
        .from("pesaflux_transactions")
        .update(updatePayload)
        .eq("transaction_request_id", requestId)
        .select("id, donation_id, status, receipt, response_code, transaction_request_id, checkout_request_id")
        .maybeSingle();

      syncedTransaction = updatedTransaction || syncedTransaction;
    }

    if (!syncedTransaction && checkoutRequestIdToUse) {
      const { data: updatedTransaction } = await supabase
        .from("pesaflux_transactions")
        .update(updatePayload)
        .eq("checkout_request_id", checkoutRequestIdToUse)
        .select("id, donation_id, status, receipt, response_code, transaction_request_id, checkout_request_id")
        .maybeSingle();

      syncedTransaction = updatedTransaction || syncedTransaction;
    }

    await syncDonationStatus(
      supabase,
      syncedTransaction?.donation_id || null,
      syncedTransaction?.status || normalizedStatus,
      syncedTransaction?.receipt || receipt
    );

    return new Response(
      JSON.stringify({
        success: true,
        status: syncedTransaction?.status || normalizedStatus,
        transaction_id: syncedTransaction?.id || transactionIdToUse,
        transaction_request_id: syncedTransaction?.transaction_request_id || requestId,
        donation_id: syncedTransaction?.donation_id || null,
        message: providerData.message || providerData.Message || null,
        provider: providerData,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("PesaFlux status error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
