export const formatPrice = (n: number) =>
  "₹" + n.toLocaleString("en-IN");

export const cn = (...classes: (string | undefined | false | null)[]) =>
  classes.filter(Boolean).join(" ");

export const getStars = (rating: number) =>
  Array(5)
    .fill(0)
    .map((_, i) => i < Math.floor(rating));
