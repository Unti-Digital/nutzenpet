const GOOGLE_ADS_ID = "AW-17741473987";

export function GoogleTag() {
  return (
    <>
      <script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        async
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');`,
        }}
      />
    </>
  );
}
