const { minCashFlow } = require('../src/utils/settle');

describe('minCashFlow', () => {
  test('reduces to minimal transactions for a sample case', () => {
    const balances = {
      A: 10.00,
      B: -5.00,
      C: -5.00
    };
    const settlements = minCashFlow(balances);
    // A should receive 10 via two payments or one combined, the minimal is two payments here
    // Check that sum of settlement amounts equals total owed
    const sum = settlements.reduce((s, t) => s + t.amount, 0);
    expect(sum).toBeCloseTo(10.0, 2);
    // number of transactions should be <= number of non-zero balances -1
    const nonZero = Object.values(balances).filter(v => Math.abs(v) > 0.001).length;
    expect(settlements.length).toBeLessThanOrEqual(nonZero - 1);
  });

  test('handles more complex balancing', () => {
    const balances = { A: 7.50, B: -2.50, C: -5.00 };
    const settlements = minCashFlow(balances);
    const sum = settlements.reduce((s, t) => s + t.amount, 0);
    expect(sum).toBeCloseTo(7.5, 2);
    expect(settlements.length).toBeLessThanOrEqual(2);
  });
});
