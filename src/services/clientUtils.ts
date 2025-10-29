export function getLastValidationSubscriptionDate() {
    return localStorage.lastValidation;
}
export function saveValidationSubscriptionDate(success: boolean) {
    localStorage.lastValidation = JSON.stringify({
        date: Date.now(),
        success: success
    });
}