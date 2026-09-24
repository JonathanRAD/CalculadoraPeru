export class RequestBodyError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export async function readJsonBody(req: Request, maxBytes: number): Promise<unknown> {
  const declaredLength = Number(req.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new RequestBodyError('La solicitud es demasiado grande.', 413);
  }

  const reader = req.body?.getReader();
  if (!reader) throw new RequestBodyError('Faltan datos en la solicitud.', 400);

  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new RequestBodyError('La solicitud es demasiado grande.', 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  try {
    const body = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(body));
  } catch {
    throw new RequestBodyError('El cuerpo JSON no es válido.', 400);
  }
}
