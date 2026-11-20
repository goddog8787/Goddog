import type { BlogAnimationEntry } from './blogAnimationsPart1';
export type { BlogAnimationEntry } from './blogAnimationsPart1';

// Each source module contains six consecutive article simulations.
const groups = [
  () => import('./blogAnimationsPart1').then(module => module.BLOG_ANIMATIONS_PART1),
  () => import('./blogAnimationsPart2').then(module => module.BLOG_ANIMATIONS_PART2),
  () => import('./blogAnimationsPart3').then(module => module.BLOG_ANIMATIONS_PART3),
];

export function hasBlogArticleAnimation(id: number): boolean {
  return Number.isInteger(id) && id >= 1 && id <= groups.length * 6;
}

export async function loadBlogArticleAnimation(id: number): Promise<BlogAnimationEntry | null> {
  if (!hasBlogArticleAnimation(id)) return null;
  const entries = await groups[Math.floor((id - 1) / 6)]();
  return entries[id] ?? null;
}
