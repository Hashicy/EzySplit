// min-cash-flow algorithm implementation
// Input: balances object: { person: netAmount } where positive = owed to person, negative = they owe
// Output: array of settlements [{ from, to, amount }]

function minCashFlow(balances) {
  // convert to arrays
  const persons = Object.keys(balances);
  const amounts = persons.map(p => Number(balances[p] || 0));

  const settlements = [];

  const EPS = 0.005;

  function getMaxIndex(arr) {
    let maxI = 0;
    for (let i = 1; i < arr.length; i++) if (arr[i] > arr[maxI]) maxI = i;
    return maxI;
  }
  function getMinIndex(arr) {
    let minI = 0;
    for (let i = 1; i < arr.length; i++) if (arr[i] < arr[minI]) minI = i;
    return minI;
  }

  // recursive helper
  function settleRec(arr) {
    const mx = getMaxIndex(arr);
    const mn = getMinIndex(arr);
    if (Math.abs(arr[mx]) < EPS && Math.abs(arr[mn]) < EPS) return;

    const minVal = Math.min(arr[mx], -arr[mn]);
    if (minVal <= EPS) return;

    arr[mx] = Number((arr[mx] - minVal).toFixed(2));
    arr[mn] = Number((arr[mn] + minVal).toFixed(2));

    settlements.push({ from: persons[mn], to: persons[mx], amount: Number(minVal.toFixed(2)) });

    settleRec(arr);
  }

  settleRec(amounts);
  return settlements;
}

module.exports = { minCashFlow };
