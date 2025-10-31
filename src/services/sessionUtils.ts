import { Member } from "@/lib/types";

export const saveSessionMember = (member: Member) => {
    sessionStorage.setItem("selectedProfile", JSON.stringify(member));
}

export function getSessionStorageMember(): Member | null {
    const memberStr = sessionStorage.getItem("selectedProfile");
    if (!memberStr) return null;
    return JSON.parse(memberStr);
    
}

export function removeSessionStorageMember() {
    sessionStorage.removeItem("selectedProfile");
}