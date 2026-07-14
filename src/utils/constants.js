import {
  LayoutDashboard, Receipt, ShoppingCart, Boxes, Percent, Wallet,
  Users, Truck, History, Package, UserCircle2,
  Settings as SettingsIcon, CalendarDays, Sparkles, Crown,
} from "lucide-react";

export const CATEGORY_COLORS = {
  Billing: "#5FA8E2", Purchase: "#8CA3B8", GST: "#B98CE2",
  Stock: "#E2B34D", Expense: "#E2604D", Drawing: "#E28CC0", Customer: "#5FBE8A",
  AI: "#5FE2C4", System: "#6B7280",
};
export const MODE_COLORS = {
  Cash: "#5FBE8A", UPI: "#5FA8E2", Card: "#B98CE2", Credit: "#E2B34D", Cheque: "#E2604D",
};

export const PAYMENT_MODES = ["Cash", "UPI", "Card", "Credit", "Cheque", "Bank Transfer"];
export const UNIT_OPTIONS = ["kg", "gram", "ton", "feet", "meter", "inch", "pcs", "box", "bundle", "litre", "roll"];
export const EXPENSE_CATEGORIES = ["Rent", "Salary", "Electricity", "Transport", "Petrol", "Repairs", "Internet", "Other"];
export const STAFF_ROLES = ["Owner", "Manager", "Counter Staff", "Accountant", "Delivery"];
export const DRAWING_TYPES = ["Capital Added", "Capital Withdrawn", "Drawing", "Return"];

export const NAV_SECTIONS = [
  { section: "Overview", items: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "analytics", label: "Analytics", icon: CalendarDays },
  ] },
  { section: "Billing", items: [
    { id: "billing", label: "Billing (with GST)", icon: Receipt },
    { id: "purchase", label: "Purchase", icon: ShoppingCart },
  ] },
  { section: "Inventory", items: [
    { id: "stock", label: "Stock", icon: Boxes },
  ] },
  { section: "Finance", items: [
    { id: "gst", label: "GST Report", icon: Percent },
    { id: "expenses", label: "Expenses", icon: Wallet },
    { id: "drawing", label: "Owner & Partner", icon: Wallet },
  ] },
  { section: "People", items: [
    { id: "customers", label: "Customers", icon: Users },
    { id: "suppliers", label: "Suppliers", icon: Truck },
    { id: "staff", label: "Staff", icon: UserCircle2 },
  ] },
  { section: "Insights", items: [
    { id: "timeline", label: "Timeline", icon: History },
    { id: "ai", label: "AI Insights", icon: Sparkles },
  ] },
  { section: "Owner", items: [
    { id: "ownerpanel", label: "Owner Panel", icon: Crown },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ] },
];
