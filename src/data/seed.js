import { uid, mulberry32 } from "../utils/format.js";

const STAFF_NAMES = ["Ravi Chandavarkar", "Suresh Patil", "Meena Gaonkar"];
const PRODUCTS = [
  { name: "MS Angle", size: "40x40x5", unit: "kg", rate: 62, gstPercent: 18 },
  { name: "SS Pipe 304 Grade", size: '2"', unit: "kg", rate: 245, gstPercent: 18 },
  { name: "GI Sheet", size: "18G", unit: "kg", rate: 78, gstPercent: 18 },
  { name: "MS Round Bar", size: "12mm", unit: "kg", rate: 58, gstPercent: 18 },
  { name: "SS Flat", size: "25x5", unit: "kg", rate: 210, gstPercent: 18 },
];
const CUSTOMERS = ["Walk-in Customer", "Deepak Hardware", "Konkan Steel Works", "ABC Traders", "Sagar Enterprises", "Patil Constructions"];
const MODES = ["Cash", "Cash", "UPI", "UPI", "Card", "Credit", "Cheque"];
const SUPPLIERS = ["Jindal Distributors", "Konkan Metal Suppliers", "Shree Steel Corp"];

export const seedStaff = [
  { id: uid(), name: "Ravi Chandavarkar", role: "Owner" },
  { id: uid(), name: "Suresh Patil", role: "Counter Staff" },
  { id: uid(), name: "Meena Gaonkar", role: "Accountant" },
];

export const seedStock = PRODUCTS.map((p, i) => ({
  id: uid(),
  name: p.name,
  size: p.size,
  unit: p.unit,
  qty: [4200, 210, 1850, 3100, 95][i],
  min: [500, 250, 300, 400, 150][i],
  rate: p.rate,
  gstPercent: p.gstPercent,
  category: "Steel",
}));

export const seedSuppliersDirectory = [
  { id: uid(), name: "Jindal Distributors", phone: "9820011223", notes: "SS pipes, 15-day credit" },
];

function makeItem(rand, pick) {
  const p = pick(PRODUCTS);
  const qty = Math.round(20 + rand() * 150);
  return {
    id: uid(),
    name: p.name,
    size: p.size,
    unit: p.unit,
    qty,
    rate: p.rate,
    amount: qty * p.rate,
  };
}

export function generateHistory() {
  const rand = mulberry32(7);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];

  const billings = [];
  const purchases = [];
  const expenses = [];
  const drawings = [];
  const DAYS = 45;
  const today = new Date();
  today.setHours(9, 0, 0, 0);

  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const isMonday = d.getDay() === 1; // shop closed Mondays
    const dayOfMonth = d.getDate();

    if (!isMonday) {
      const nBills = 1 + Math.floor(rand() * 4);
      for (let b = 0; b < nBills; b++) {
        const t = new Date(d);
        t.setHours(9 + Math.floor(rand() * 10), Math.floor(rand() * 60));
        const nItems = rand() < 0.35 ? 2 : 1; // sometimes multiple product categories in one bill
        const items = Array.from({ length: nItems }, () => makeItem(rand, pick));
        const discount = rand() < 0.25 ? Math.round(rand() * 800) : 0;
        const gstEnabled = rand() < 0.55;
        const gstPercent = 18;
        billings.push({
          id: uid(),
          billNo: `BILL-${5000 + billings.length}`,
          time: t.getTime(),
          customer: pick(CUSTOMERS),
          staff: pick(STAFF_NAMES),
          mode: pick(MODES),
          status: rand() < 0.9 ? "Paid" : "Pending",
          note: "",
          items,
          discount,
          gstEnabled,
          gstPercent,
          cgstPercent: gstEnabled ? gstPercent / 2 : 0,
          sgstPercent: gstEnabled ? gstPercent / 2 : 0,
        });
      }
      if (rand() < 0.12) {
        const t = new Date(d);
        t.setHours(10, 0);
        const p = pick(PRODUCTS);
        const qty = Math.round(300 + rand() * 1000);
        purchases.push({
          id: uid(),
          invoice: `PUR-${300 + purchases.length}`,
          time: t.getTime(),
          supplier: pick(SUPPLIERS),
          gstin: "24JIND8765L1Z9",
          product: p.name,
          size: p.size,
          unit: p.unit,
          qty,
          rate: Math.round(p.rate * 0.82),
          gstPercent: p.gstPercent,
          status: rand() < 0.5 ? "Pending" : "Paid",
        });
      }
    }

    if (dayOfMonth === 1) expenses.push({ id: uid(), category: "Rent", itemName: "", qty: "", unitPrice: "", amount: 15000, note: "Monthly shop rent", time: new Date(d).setHours(9, 0) });
    if (dayOfMonth === 5 || dayOfMonth === 20) expenses.push({ id: uid(), category: "Salary", itemName: "", qty: "", unitPrice: "", amount: 8000 + Math.floor(rand() * 4000), note: "Staff salary", time: new Date(d).setHours(9, 0) });
    if (i % 8 === 0) {
      const [name, price] = pick([["Tube light", 180], ["LED Bulb", 150], ["Cutting wheel", 90], ["Welding rod pack", 650], ["Cleaning supplies", 300]]);
      const qty = 1 + Math.floor(rand() * 3);
      expenses.push({ id: uid(), category: "Repairs", itemName: name, qty, unitPrice: price, amount: qty * price, note: "", time: new Date(d).setHours(14, 0) });
    }
    if (i % 6 === 0) expenses.push({ id: uid(), category: "Transport", itemName: "", qty: "", unitPrice: "", amount: Math.round(400 + rand() * 1200), note: "Local delivery", time: new Date(d).setHours(16, 0) });
    if (i % 10 === 3) expenses.push({ id: uid(), category: "Electricity", itemName: "", qty: "", unitPrice: "", amount: Math.round(2000 + rand() * 3000), note: "", time: new Date(d).setHours(9, 30) });
  }

  drawings.push({ id: uid(), type: "Capital Added", person: "Owner", amount: 300000, note: "Initial working capital", time: today.getTime() - DAYS * 86400000 });
  drawings.push({ id: uid(), type: "Capital Added", person: "Partner", amount: 200000, note: "Initial working capital", time: today.getTime() - DAYS * 86400000 + 3600000 });
  for (let i = 0; i < 6; i++) {
    const t = today.getTime() - Math.floor(rand() * DAYS) * 86400000;
    const person = rand() < 0.55 ? "Owner" : "Partner";
    const type = rand() < 0.8 ? "Drawing" : "Return";
    drawings.push({ id: uid(), type, person, amount: Math.round(2000 + rand() * 8000), note: type === "Drawing" ? "Personal withdrawal" : "Returned to business", time: t });
  }

  return { billings, purchases, expenses, drawings };
}
