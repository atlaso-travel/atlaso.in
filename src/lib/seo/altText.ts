interface AltTextContext {
  destination: string;
  region: string;
  subject: string;
  season?: string;
}

export function generateDestinationAlt(ctx: AltTextContext): string {
  const parts = [
    ctx.subject,
    `in ${ctx.destination}`,
    `${ctx.region}, India`,
    ctx.season ? `during ${ctx.season}` : null,
  ].filter(Boolean);
  return parts.join(", ");
}

export function generateOperatorAlt(name: string, destination: string): string {
  return `${name} — verified tour operator for ${destination} packages`;
}
