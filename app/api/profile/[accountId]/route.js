const ACCOUNTS_URL = process.env.ACCOUNTS_URL ?? "http://127.0.0.1:4001";
const TRANSACTIONS_URL = process.env.TRANSACTIONS_URL ?? "http://127.0.0.1:4002";

export async function GET(_request, context) {
  const { accountId } = await context.params;
  const started = Date.now();

  console.log(`[gateway] start  accountId=${accountId}  ${new Date().toISOString()}`);

  const [account, recentTransactions] = await Promise.all([
    fetch(`${ACCOUNTS_URL}/${accountId}`).then((res) => {
      if (!res.ok) throw new Error(`accounts service ${res.status}`);
      return res.json();
    }),
    fetch(`${TRANSACTIONS_URL}/${accountId}`).then((res) => {
      if (!res.ok) throw new Error(`transactions service ${res.status}`);
      return res.json();
    }),
  ]);

  const elapsedMs = Date.now() - started;
  console.log(
    `[gateway] done   accountId=${accountId}  elapsed=${elapsedMs}ms (parallel; expect ~400ms not ~600ms)`,
  );

  return Response.json({
    accountHolder: account.holderName,
    balance: account.balance,
    recentTransactions,
    elapsedMs,
  });
}
