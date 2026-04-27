export function money(value) {
  return Number(value) === 0 ? "Besplatno" : `${Number(value).toFixed(2)} €`;
}

export function hasDiscount(game) {
  return (
    Number(game?.discountPercent || 0) > 0 &&
    Number(game?.originalPrice || 0) > Number(game?.price || 0)
  );
}

export function dateText(value) {
  return new Intl.DateTimeFormat("sr-RS", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
