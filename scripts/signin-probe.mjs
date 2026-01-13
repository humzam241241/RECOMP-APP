const base = "http://localhost:3000";

async function main() {
  const csrfRes = await fetch(`${base}/api/auth/csrf`, { redirect: "manual" });
  const csrfJson = await csrfRes.json();
  const setCookie = csrfRes.headers.get("set-cookie") || "";

  console.log("csrf.status", csrfRes.status);
  console.log("csrf.token", (csrfJson.csrfToken || "").slice(0, 12) + "...");
  console.log("csrf.set-cookie.first", setCookie.split(";")[0]);

  // naive cookie jar: first cookie only (enough for csrf flow)
  const cookieHeader = setCookie ? setCookie.split(",")[0].split(";")[0] : "";

  const body = new URLSearchParams({
    csrfToken: csrfJson.csrfToken,
    callbackUrl: `${base}/`,
    json: "true",
  });

  const candidates = [
    "/api/auth/signin/google",
    "/api/auth/signin",
  ];

  for (const path of candidates) {
    const res = await fetch(base + path, {
      method: "POST",
      redirect: "manual",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "X-Auth-Return-Redirect": "1",
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
      },
      body,
    });

    console.log("\nPOST", path, "=>", res.status);
    console.log("location", res.headers.get("location"));
    const txt = await res.text();
    console.log("body.snip", txt.slice(0, 160).replace(/\s+/g, " "));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

