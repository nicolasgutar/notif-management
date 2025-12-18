export enum IncorporationType {
    LLC = "llc",
    S_CORP = "s_corp",
    C_CORP = "c_corp",
    NONE = "none",
    OTHER = "other",
}

export const incorporationOptions = [
    {
        id: IncorporationType.LLC,
        label: "Limited Liability (LLC)",
        icon: "🏢",
    },
    {
        id: IncorporationType.S_CORP,
        label: "S Corp",
        icon: "💼",
    },
    {
        id: IncorporationType.C_CORP,
        label: "C Corp",
        icon: "🏛️",
    },
    {
        id: IncorporationType.NONE,
        label: "None",
        icon: "🚫",
    },
    {
        id: IncorporationType.OTHER,
        label: "Other",
        icon: "❓",
    },
];

export const isValidIncorporationType = (type: any): type is IncorporationType => {
    return Object.values(IncorporationType).includes(type);
};
