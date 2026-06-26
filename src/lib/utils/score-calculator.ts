import type { ChecklistItemCondition, ChecklistItemData } from '@/lib/types';
import { CONDITION_CONFIG, CATEGORY_WEIGHTS } from '@/lib/utils/constants';

/**
 * Calculate the score for a single checklist item.
 * Returns -1 for N/A items (excluded from scoring).
 */
export function getItemScore(condition: ChecklistItemCondition): number {
  return CONDITION_CONFIG[condition]?.score ?? 0;
}

/**
 * Calculate the average score for a single category.
 * Excludes items marked as 'not_applicable'.
 */
export function calculateCategoryScore(
  items: Record<string, ChecklistItemData>
): number {
  const scores: number[] = [];

  for (const item of Object.values(items)) {
    const score = getItemScore(item.condition);
    if (score >= 0) {
      scores.push(score);
    }
  }

  if (scores.length === 0) return 0;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

/**
 * Calculate the overall weighted inspection score.
 * Uses CATEGORY_WEIGHTS for weighted average.
 * Returns a score from 0 to 100.
 */
export function calculateOverallScore(
  checklistData: Record<string, Record<string, ChecklistItemData>>
): {
  overallScore: number;
  categoryScores: Record<string, number>;
  criticalIssues: Array<{ category: string; item: string; severity: 'high' | 'critical'; description: string }>;
} {
  const categoryScores: Record<string, number> = {};
  const criticalIssues: Array<{ category: string; item: string; severity: 'high' | 'critical'; description: string }> = [];

  let weightedSum = 0;
  let totalWeight = 0;

  for (const [category, items] of Object.entries(checklistData)) {
    const categoryScore = calculateCategoryScore(items);
    categoryScores[category] = Math.round(categoryScore * 100) / 100;

    // Get weight for this category (default 0.1 if not defined)
    const weight = CATEGORY_WEIGHTS[category] ?? 0.1;
    weightedSum += categoryScore * weight;
    totalWeight += weight;

    // Collect critical issues
    for (const [itemLabel, itemData] of Object.entries(items)) {
      if (itemData.condition === 'critical') {
        criticalIssues.push({
          category,
          item: itemLabel,
          severity: 'critical',
          description: itemData.notes || `${itemLabel} is in critical condition`,
        });
      } else if (itemData.condition === 'poor') {
        criticalIssues.push({
          category,
          item: itemLabel,
          severity: 'high',
          description: itemData.notes || `${itemLabel} is in poor condition`,
        });
      }
    }
  }

  const overallScore = totalWeight > 0
    ? Math.round((weightedSum / totalWeight) * 100) / 100
    : 0;

  return { overallScore, categoryScores, criticalIssues };
}

/**
 * Generate recommendations based on inspection data.
 */
export function generateRecommendations(
  checklistData: Record<string, Record<string, ChecklistItemData>>
): string[] {
  const recommendations: string[] = [];

  for (const [category, items] of Object.entries(checklistData)) {
    for (const [itemLabel, itemData] of Object.entries(items)) {
      switch (itemData.condition) {
        case 'critical':
          recommendations.push(
            `URGENT: ${itemLabel} (${category}) requires immediate attention. ` +
            (itemData.notes || 'Professional repair/replacement recommended before purchase.')
          );
          break;
        case 'poor':
          recommendations.push(
            `${itemLabel} (${category}) is in poor condition. ` +
            (itemData.notes || 'Repair or replacement should be negotiated with the seller.')
          );
          break;
        case 'fair':
          recommendations.push(
            `${itemLabel} (${category}) shows moderate wear. ` +
            (itemData.notes || 'Monitor and plan for maintenance in the near future.')
          );
          break;
      }
    }
  }

  // Sort: critical first, then poor, then fair
  return recommendations.sort((a, b) => {
    const priorityA = a.startsWith('URGENT') ? 0 : a.includes('poor condition') ? 1 : 2;
    const priorityB = b.startsWith('URGENT') ? 0 : b.includes('poor condition') ? 1 : 2;
    return priorityA - priorityB;
  });
}

/**
 * Get a summary sentence based on the overall score.
 */
export function getScoreSummary(score: number): string {
  if (score >= 90) {
    return 'This vehicle is in excellent condition with minimal wear. It is highly recommended for purchase.';
  }
  if (score >= 75) {
    return 'This vehicle is in good condition with some minor issues. It is recommended for purchase with noted considerations.';
  }
  if (score >= 60) {
    return 'This vehicle is in fair condition with several areas needing attention. Purchase is acceptable if repairs are addressed.';
  }
  if (score >= 40) {
    return 'This vehicle has significant issues that require attention. Purchase should be carefully considered and repairs negotiated.';
  }
  return 'This vehicle has critical issues affecting safety and reliability. Purchase is not recommended without major repairs.';
}
