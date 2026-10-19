export const AUTH_LOGIN_REQUEST_EVENT = "fashion-marketplace:request-login";

export function requestLoginModal() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(AUTH_LOGIN_REQUEST_EVENT));
    }
}
