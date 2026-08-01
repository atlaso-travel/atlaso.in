import { destinations } from "./destinations";

/**
 * Site-level FAQs, shared by the homepage accordion and the FAQPage JSON-LD.
 *
 * They were previously inlined in the FAQ component, which meant the schema
 * could not use them and the answers could drift from reality unnoticed — the
 * destinations answer listed "Andaman", which Atlaso does not cover, while
 * omitting Jaisalmer, which it does. The destination list is now generated from
 * the actual catalogue so it cannot go stale again.
 *
 * Answer style is deliberately direct: an answer engine quoting these should be
 * quoting something specific and true.
 */

export interface SiteFaq {
  question: string;
  answer: string;
}

const destinationList = destinations.map((d) => d.name);

function readableList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export const siteFaqs: SiteFaq[] = [
  {
    question: "Why is a package cheaper on Atlaso than booking the operator directly?",
    answer:
      "Tour operators quote a lower rate to wholesale and B2B channels than they advertise to direct customers. Atlaso is given that B2B rate, adds a margin, and publishes a price between the two. You pay less than the operator's own direct price, and the operator still receives the rate they set.",
  },
  {
    question: "Does Atlaso add a booking fee at checkout?",
    answer:
      "No. The price shown is the price you pay. Atlaso's margin is already inside that number — nothing is added at the payment step.",
  },
  {
    question: "How does Atlaso verify tour operators?",
    answer:
      "We check business registration, GST details, tourism licence and liability insurance before marking an operator verified. Operators awaiting checks can still list, but their packages are labelled unverified so you always know which is which.",
  },
  {
    question: "Can I compare multiple operators at once?",
    answer:
      "Yes. You can put up to four operators side by side and compare price against their direct rate, day-by-day itinerary, inclusions and exclusions, group size, cancellation policy and rating in one view.",
  },
  {
    question: "What destinations does Atlaso cover?",
    answer: `Atlaso currently covers ${destinationList.length} destinations across India: ${readableList(
      destinationList
    )}. More are added as operators are onboarded.`,
  },
  {
    question: "Do I have to pay online, or can I speak to someone first?",
    answer:
      "Either. You can book and pay online, or request a callback on any package and someone will call you to talk through options before you commit to anything.",
  },
];
