import { convertMoney, parseMinor, type Currency, type FxQuote, type Money } from './money.js';

export interface Goal {
  readonly id: string;
  readonly name: string;
  readonly target: Money;
}
/** A source ID must identify ONE asset value, never both broker account and holdings therein. */
export interface AssetValue {
  readonly sourceId: string;
  readonly currentValue: Money;
}
export type GoalAllocation =
  | { readonly sourceId: string; readonly goalId: string; readonly mode: 'fixed'; readonly minor: string }
  | { readonly sourceId: string; readonly goalId: string; readonly mode: 'percent'; readonly basisPoints: number };

export interface GoalProgress {
  readonly goalId: string;
  readonly funded: Money;
  readonly target: Money;
  readonly remaining: Money;
}

function allocatedMinor(allocation: GoalAllocation, assetMinor: bigint): bigint {
  if (allocation.mode === 'fixed') {
    const fixed = parseMinor(allocation.minor);
    if (fixed < 0n) throw new Error('Cannot reserve a negative amount');
    return fixed;
  }
  const bps = allocation.basisPoints;
  if (!Number.isInteger(bps) || bps < 0 || bps > 10000) {
    throw new Error('Percentage must be integer basis points between 0 and 10000');
  }
  // Values are nonnegative and percentages round to the nearest minor unit.
  return (assetMinor * BigInt(bps) + 5000n) / 10000n;
}

/** Validate that two goals never claim more than an underlying asset actually holds. */
export function calculateGoalProgress(
  goals: readonly Goal[],
  assets: readonly AssetValue[],
  allocations: readonly GoalAllocation[],
  fxQuotes: readonly FxQuote[] = [],
): GoalProgress[] {
  const goalById = new Map(goals.map(g => [g.id, g]));
  const assetById = new Map(assets.map(a => [a.sourceId, a]));
  if (goalById.size !== goals.length || assetById.size !== assets.length) {
    throw new Error('Duplicate goal or asset IDs');
  }
  for (const goal of goals) {
    if (parseMinor(goal.target.minor) <= 0n) throw new Error('Goal target must be positive');
  }
  const reservedBySource = new Map<string, bigint>();
  const fundedByGoal = new Map<string, bigint>(goals.map(g => [g.id, 0n]));
  const seenPairs = new Set<string>();
  for (const allocation of allocations) {
    const goal = goalById.get(allocation.goalId);
    const asset = assetById.get(allocation.sourceId);
    if (!goal || !asset) throw new Error('Allocation references unknown goal or asset');
    const key = JSON.stringify([allocation.sourceId, allocation.goalId]);
    if (seenPairs.has(key)) throw new Error('Duplicate allocation for source and goal');
    seenPairs.add(key);
    const value = parseMinor(asset.currentValue.minor);
    if (value < 0n) throw new Error('Cannot allocate an asset with negative value');
    const allocated = allocatedMinor(allocation, value);
    const reserved = (reservedBySource.get(asset.sourceId) ?? 0n) + allocated;
    if (reserved > value) throw new Error(`Over-allocated asset: ${asset.sourceId}`);
    reservedBySource.set(asset.sourceId, reserved);
    const quote = fxQuotes.find(q => q.base === asset.currentValue.currency && q.quote === goal.target.currency);
    const converted = convertMoney(
      { currency: asset.currentValue.currency, minor: allocated.toString() },
      goal.target.currency,
      quote,
    );
    fundedByGoal.set(goal.id, fundedByGoal.get(goal.id)! + parseMinor(converted.minor));
  }
  return goals.map(goal => {
    const funded = fundedByGoal.get(goal.id)!;
    const target = parseMinor(goal.target.minor);
    return {
      goalId: goal.id,
      funded: { currency: goal.target.currency, minor: funded.toString() },
      target: goal.target,
      remaining: { currency: goal.target.currency, minor: (target > funded ? target - funded : 0n).toString() },
    };
  });
}

export function unassignedValue(asset: AssetValue, allocations: readonly GoalAllocation[]): Money {
  const current = parseMinor(asset.currentValue.minor);
  if (current < 0n) throw new Error('Asset value cannot be negative');
  let reserved = 0n;
  const seenGoals = new Set<string>();
  for (const allocation of allocations.filter(a => a.sourceId === asset.sourceId)) {
    if (seenGoals.has(allocation.goalId)) throw new Error('Duplicate source-goal allocation');
    seenGoals.add(allocation.goalId);
    reserved += allocatedMinor(allocation, current);
  }
  if (reserved > current) throw new Error(`Over-allocated asset: ${asset.sourceId}`);
  return { currency: asset.currentValue.currency, minor: (current - reserved).toString() };
}
