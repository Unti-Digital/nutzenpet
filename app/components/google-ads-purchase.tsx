import Script from "next/script";

const GOOGLE_ADS_CONVERSION = "AW-17741473987/UBSsCOOdqp0dEMPR5YtC";

type GoogleAdsPurchaseProps = {
  orderId: string;
  value: string;
  currency?: string;
};

export function GoogleAdsPurchase({ orderId, value, currency = "BRL" }: GoogleAdsPurchaseProps) {
  const amount = Number(value);
  if (!/^\d+$/.test(orderId) || !Number.isFinite(amount) || amount <= 0) return null;

  return (
    <Script id={`google-ads-purchase-${orderId}`} strategy="afterInteractive">
      {`gtag('event', 'conversion', {
  'send_to': '${GOOGLE_ADS_CONVERSION}',
  'value': ${amount},
  'currency': ${JSON.stringify(currency)},
  'transaction_id': ${JSON.stringify(orderId)}
});`}
    </Script>
  );
}
