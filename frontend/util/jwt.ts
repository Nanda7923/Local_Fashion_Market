export function hasUnexpiredToken(token: string) {
    try {
        const encodedPayload = token.split(".")[1];
        if (!encodedPayload) return false;
        const normalized = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(normalized)) as { exp?: unknown };
        return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}
