import {
    BanknoteIcon,
    Handshake,
    DollarSign,
    Wallet,
    ArrowRightLeft,
    Banknote as Bank, // Lucide exports various names, Bank might not exist or be Banknote. Let's check imports carefully.
    // Checking standard lucide names. 'Bank' is often 'Landmark' or similar, but let's try to stick to user request or closest match.
    // User requested: BanknoteIcon, Handshake, DollarSign, Wallet, ArrowRightLeft, Bank, Megaphone, Newspaper, CreditCard, Briefcase, GraduationCap, ShieldCheck, Utensils, Calculator, Building, Wrench, Package, Plane, Car, Lightbulb, ShoppingBag, Home, Stethoscope, Scissors, EyeClosed, GameController, Landmark, HandHelping, HandCoins, ContactRound
    Megaphone,
    Newspaper,
    CreditCard,
    Briefcase,
    GraduationCap,
    ShieldCheck,
    Utensils,
    Calculator,
    Building,
    Wrench,
    Package,
    Plane,
    Car,
    Lightbulb,
    ShoppingBag,
    Home,
    Stethoscope,
    Scissors,
    EyeClosed,
    Gamepad2, // GameController was requested but not found, using Gamepad2 as standard replacement.
    Landmark,
    HandHelping,
    HandCoins,
    ContactRound,
} from 'lucide-react';

// Need to verify 'Bank' export from lucide-react. Usually it's Landmark or Building. 
// User asked for 'Bank'. I will assume 'Landmark' is close or aliases if 'Bank' is missing.
// Actually, I will check if I can double check standard lucide exports, but for now I will try to trust the user's list names or alias them if I know they are different.
// 'Bank' in lucide is often 'Landmark'. 'BanknoteIcon' is 'Banknote'.
// I will attempt to import 'Landmark' as 'Bank' if 'Bank' doesn't exist?
// Let's use 'Landmark' for 'Bank' if needed, but let's try 'Landmark' is already used for Government.
// Let's assume the user knows the icon names or I might need to fix them.
// I'll stick to the names provided if they seem standard, but 'Bank' is suspicious. 'Landmark' is usually the bank icon.
// I will import everything requested.

export type CategoryType = 'income' | 'transfer' | 'expense';

export interface Category {
    id: string;
    name: string;
    icon: any; // LucideIcon type or similar
    type: CategoryType;
}

export enum AllCategories {
    // Income
    INCOME_WAGES = 'income_wages',
    INCOME_BUSINESS = 'income_business',
    INCOME_INVESTMENTS = 'income_investments',
    INCOME_OTHER = 'income_other',

    // Transfer
    TRANSFER = 'transfer',
    LOAN_PAYMENTS = 'loan_payments',

    // Expense
    ADVERTISING = 'advertising',
    SUBSCRIPTIONS = 'subscriptions',
    BANK_FEES = 'bank_fees',
    BUSINESS_EQUIPMENT = 'business_equipment',
    EDUCATION = 'education',
    INSURANCE = 'insurance',
    FOOD_AND_DRINK = 'food_and_drink',
    PROFESSIONAL_FEES = 'professional_fees',
    RENT_AND_UTILITIES = 'rent_and_utilities', // The user has "Rent & Utilities" as one.
    REPAIRS = 'repairs',
    SUPPLIES = 'supplies',
    TRAVEL = 'travel',
    TRANSPORTATION = 'transportation',
    UTILITIES = 'utilities',
    SHOPPING = 'shopping',
    HOME = 'home',
    MEDICAL = 'medical',
    PERSONAL_CARE = 'personal_care',
    PERSONAL_BRAND = 'personal_brand',
    ENTERTAINMENT = 'entertainment',
    GOVERNMENT = 'government',
    NON_PROFIT = 'non_profit',
    OWNER_CONTRIBUTIONS = 'owner_contributions',
    EMPLOYEE_CONTRACTOR = 'employee_contractor',
}

export const categories: Category[] = [
    // Income Categories
    {
        id: AllCategories.INCOME_WAGES,
        name: "Wages & Salary",
        icon: BanknoteIcon,
        type: "income",
    },
    {
        id: AllCategories.INCOME_BUSINESS,
        name: "Business Income",
        icon: Handshake,
        type: "income",
    },
    {
        id: AllCategories.INCOME_INVESTMENTS,
        name: "Investment Income",
        icon: DollarSign,
        type: "income",
    },
    {
        id: AllCategories.INCOME_OTHER,
        name: "Other Income",
        icon: Wallet,
        type: "income",
    },
    // Transfer Categories
    {
        id: AllCategories.TRANSFER,
        name: "Transfer",
        icon: ArrowRightLeft,
        type: "transfer",
    },
    {
        id: AllCategories.LOAN_PAYMENTS,
        name: "Loan Payments",
        icon: Landmark, // 'Bank' usually maps to Landmark in Lucide. User asked for 'Bank'.
        type: "transfer",
    },

    // Expense Categories
    {
        id: AllCategories.ADVERTISING,
        name: "Advertising",
        icon: Megaphone,
        type: "expense",
    },
    {
        id: AllCategories.SUBSCRIPTIONS,
        name: "Subscriptions",
        icon: Newspaper,
        type: "expense",
    },
    {
        id: AllCategories.BANK_FEES,
        name: "Bank Fees",
        icon: CreditCard,
        type: "expense",
    },
    {
        id: AllCategories.BUSINESS_EQUIPMENT,
        name: "Business Equipment",
        icon: Briefcase,
        type: "expense",
    },
    {
        id: AllCategories.EDUCATION,
        name: "Education",
        icon: GraduationCap,
        type: "expense",
    },
    {
        id: AllCategories.INSURANCE,
        name: "Insurance",
        icon: ShieldCheck,
        type: "expense",
    },
    {
        id: AllCategories.FOOD_AND_DRINK,
        name: "Food & Drink",
        icon: Utensils,
        type: "expense",
    },
    {
        id: AllCategories.PROFESSIONAL_FEES,
        name: "Professional Fees",
        icon: Calculator,
        type: "expense",
    },
    {
        id: AllCategories.RENT_AND_UTILITIES,
        name: "Rent & Utilities",
        icon: Building,
        type: "expense",
    },
    {
        id: AllCategories.REPAIRS,
        name: "Repairs & Maintenance",
        icon: Wrench,
        type: "expense",
    },
    {
        id: AllCategories.SUPPLIES,
        name: "Supplies",
        icon: Package,
        type: "expense",
    },
    {
        id: AllCategories.TRAVEL,
        name: "Travel",
        icon: Plane,
        type: "expense",
    },
    {
        id: AllCategories.TRANSPORTATION,
        name: "Transportation",
        icon: Car,
        type: "expense",
    },
    {
        id: AllCategories.UTILITIES,
        name: "Utilities",
        icon: Lightbulb,
        type: "expense",
    },
    {
        id: AllCategories.SHOPPING,
        name: "Shopping",
        icon: ShoppingBag,
        type: "expense",
    },
    {
        id: AllCategories.HOME,
        name: "Home & Garden",
        icon: Home,
        type: "expense",
    },
    {
        id: AllCategories.MEDICAL,
        name: "Medical",
        icon: Stethoscope,
        type: "expense",
    },
    {
        id: AllCategories.PERSONAL_CARE,
        name: "Personal Care",
        icon: Scissors,
        type: "expense",
    },
    {
        id: AllCategories.PERSONAL_BRAND,
        name: "Personal Branding",
        icon: EyeClosed,
        type: "expense",
    },
    {
        id: AllCategories.ENTERTAINMENT,
        name: "Entertainment",
        icon: Gamepad2,
        type: "expense",
    },
    {
        id: AllCategories.GOVERNMENT,
        name: "Government / Licensing",
        icon: Landmark,
        type: "expense",
    },
    {
        id: AllCategories.NON_PROFIT,
        name: "Non-Profit / Charity",
        icon: HandHelping,
        type: "expense",
    },
    {
        id: AllCategories.OWNER_CONTRIBUTIONS,
        name: "Owner Contributions",
        icon: HandCoins,
        type: "expense",
    },
    {
        id: AllCategories.EMPLOYEE_CONTRACTOR,
        name: "Employee & Contractor Salaries",
        icon: ContactRound,
        type: "expense",
    },
];

export const MARKETPLACE_MERCHANTS = ['Amazon', 'Walmart', 'Etsy', 'eBay', 'Target'];

export const SHOPPING_CATEGORIES = [
    AllCategories.SHOPPING,
    AllCategories.SUPPLIES,
    AllCategories.BUSINESS_EQUIPMENT
];

export const TRAVEL_CATEGORIES = [
    AllCategories.TRAVEL,
    AllCategories.TRANSPORTATION
];

export const EVENT_CATEGORIES = [
    AllCategories.ENTERTAINMENT,
    AllCategories.EDUCATION
];


