import http from "node:http";

const PORT = 4002;

const TRANSACTIONS = {
  123456: [
    { id: "tx-1001", amount: -42.5, desc: "خرید قهوه" },
    { id: "tx-1002", amount: 1200, desc: "واریز حقوق" },
    { id: "tx-1003", amount: -18.9, desc: "اشتراک ماهانه" },
    { id: "tx-1004", amount: -210, desc: "قبض برق" },
  ],
};

const server = http.createServer((req, res) => {
  const receivedAt = new Date().toISOString();
  const accountId = (req.url ?? "/").split("/").filter(Boolean).pop() ?? "";

  console.log(
    `[transactions :${PORT}] ${receivedAt}  ${req.method} ${req.url}  (delay 400ms)`,
  );

  setTimeout(() => {
    const list = TRANSACTIONS[accountId] ?? [];
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(list));
  }, 400);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `[transactions] fake Transactions Service listening on http://127.0.0.1:${PORT}`,
  );
});
