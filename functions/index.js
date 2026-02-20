export async function onRequest(context) {
    const req = context.request;
    const url = new URL(req.url);

    // Only handle the root path "/"
    if (url.pathname !== "/") {
        return context.next();
    }

    const cookieHeader = req.headers.get("Cookie") || "";
    const cookies = parseCookies(cookieHeader);

    let variant = cookies.exp_hero;

    // If cookie missing or invalid, assign randomly
    if (variant !== "A" && variant !== "B") {
        variant = Math.random() < 0.5 ? "A" : "B";
    }

    const location = variant === "A" ? "/a.html" : "/b.html";

    const res = new Response(null, {
        status: 302,
        headers: {
            "Location": location,
            // 30 days, cookie scoped to site
            "Set-Cookie": `exp_hero=${variant}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`,
            // Helpful for debugging
            "Cache-Control": "no-store",
        },
    });

    return res;
}

function parseCookies(cookieHeader) {
    const out = {};
    cookieHeader.split(";").forEach(part => {
        const [k, ...rest] = part.trim().split("=");
        if (!k) return;
        out[k] = decodeURIComponent(rest.join("=") || "");
    });
    return out;
}
