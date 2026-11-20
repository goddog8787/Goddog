export const subscriptionTerms = {
  'vip-monthly': { price: 199, durationDays: 30 },
  'vip-quarterly': { price: 549, durationDays: 90 },
  'vip-yearly': { price: 1990, durationDays: 365 },
  'box-maker': { price: 899, durationDays: 30 },
} as const;

export function getSubscriptionTerms(id: unknown) {
  return typeof id === 'string' && Object.hasOwn(subscriptionTerms, id)
    ? subscriptionTerms[id as keyof typeof subscriptionTerms]
    : undefined;
}
