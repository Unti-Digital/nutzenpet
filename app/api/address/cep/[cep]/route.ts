type ViaCepResponse = {
  erro?: boolean | string;
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

type RouteParams = {
  params: Promise<{ cep: string }>;
};

function cleanField(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function GET(_request: Request, context: RouteParams) {
  const { cep: rawCep } = await context.params;
  const cep = rawCep.replace(/\D/g, "");

  if (!/^\d{8}$/.test(cep)) {
    return Response.json({ message: "Informe um CEP com 8 números." }, { status: 400 });
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 * 60 * 24 * 30 },
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
      return Response.json({ message: "Não foi possível consultar o CEP agora." }, { status: 502 });
    }

    const address = await response.json() as ViaCepResponse;
    if (address.erro === true || address.erro === "true") {
      return Response.json({ message: "CEP não encontrado. Confira os números digitados." }, { status: 404 });
    }

    return Response.json({
      cep: cleanField(address.cep, 9),
      street: cleanField(address.logradouro, 160),
      neighborhood: cleanField(address.bairro, 100),
      city: cleanField(address.localidade, 100),
      state: cleanField(address.uf, 2).toUpperCase(),
    });
  } catch {
    return Response.json({ message: "A consulta de CEP está indisponível. Preencha o endereço manualmente." }, { status: 502 });
  }
}
