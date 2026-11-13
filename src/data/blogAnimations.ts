import { BLOG_ANIMATIONS_PART1, BlogAnimationEntry } from './blogAnimationsPart1';
import { BLOG_ANIMATIONS_PART2 } from './blogAnimationsPart2';
import { BLOG_ANIMATIONS_PART3 } from './blogAnimationsPart3';

export type { BlogAnimationEntry };

export const BLOG_ANIMATIONS: Record<number, BlogAnimationEntry> = {
  ...BLOG_ANIMATIONS_PART1,
  ...BLOG_ANIMATIONS_PART2,
  ...BLOG_ANIMATIONS_PART3,
};

export function getBlogArticleAnimation(articleId: number): BlogAnimationEntry | null {
  return BLOG_ANIMATIONS[articleId] ?? null;
}
