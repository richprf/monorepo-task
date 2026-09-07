import http from "node:http";

const PORT = 4001;

const ACCOUNTS = {
  123456: {
    accountId: "123456",
    holderName: "سارا محمدی",
    balance: 15420.75,
  },
};

const server = http.createServer((req, res) => {
  const receivedAt = new Date().toISOString();
  const accountId = (req.url ?? "/").split("/").filter(Boolean).pop() ?? "";

  console.log(
    `[accounts :${PORT}] ${receivedAt}  ${req.method} ${req.url}  (delay 200ms)`,
  );

  setTimeout(() => {
    const account = ACCOUNTS[accountId] ?? {
      accountId: accountId || "unknown",
      holderName: "Unknown Holder",
      balance: 0,
    };

    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(account));
  }, 200);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[accounts] fake Accounts Service listening on http://127.0.0.1:${PORT}`);
});
