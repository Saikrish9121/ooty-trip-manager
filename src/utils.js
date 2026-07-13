export const KEYS = {
  APP: "ooty:app-data",
  LOG: "ooty:expense-log",
  USERS: "ooty:users",
  PLAN: "ooty:plan-data",
  PACK_REQS: "ooty:packing-requests",
  CONTACT_REQS: "ooty:contact-requests",
  PHOTOS: "ooty:photos",
  APPROVALS: "ooty:approvals",
};

export const PLAN_SCHEMA = "2026-07-ooty-guide-v5";

export const TRAIN_LEGS = [
  { key: "hydMysore", label: "Hyderabad \u2192 Mysore" },
  { key: "blrMysore", label: "Bangalore \u2192 Mysore" },
  { key: "mysoreBlr", label: "Mysore \u2192 Bangalore" },
  { key: "mysoreHyd", label: "Mysore \u2192 Hyderabad" },
];

export const CATEGORIES = ["Transport", "Stay", "Food", "Sightseeing", "Shopping", "Other"];

export function uid(prefix) {
  return (prefix || "id") + "_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function formatMoney(n, symbol) {
  const val = Number(n) || 0;
  const rounded = Math.round(val);
  return (symbol || "\u20B9") + rounded.toLocaleString("en-IN");
}

export async function hashPassword(pw) {
  const payload = "ooty-trip-salt::" + pw;
  try {
    const enc = new TextEncoder().encode(payload);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch (e) {
    let h = 0;
    for (let i = 0; i < payload.length; i++) {
      h = (h << 5) - h + payload.charCodeAt(i);
      h |= 0;
    }
    return "fb" + Math.abs(h).toString(16);
  }
}

export function computeMember(member, commonExpenses, logEntries, memberCount) {
  const trainShare = commonExpenses
    .filter((e) => e.type === "train" && member.legs && member.legs[e.legKey])
    .reduce((sum, e) => sum + (Number(e.totalCost) || 0) / (Number(e.splitAmong) || 1), 0);
  const sharedShare = commonExpenses
    .filter((e) => e.type === "shared")
    .reduce((sum, e) => sum + (Number(e.totalCost) || 0) / (memberCount || 1), 0);
  const shareOfCommon = trainShare + sharedShare;
  const myLog = logEntries.filter((e) => e.memberId === member.id);
  const groupCredit = myLog.filter((e) => e.type === "Group").reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const personal = myLog.filter((e) => e.type === "Personal").reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalPaid = (Number(member.advancePaid) || 0) + groupCredit;
  const totalExpenditure = shareOfCommon;
  const balance = shareOfCommon - totalPaid;
  const status = balance > 0.5 ? "To Pay" : balance < -0.5 ? "To Receive" : "Settled";
  return { ...member, trainShare, sharedShare, shareOfCommon, groupCredit, personal, totalPaid, totalExpenditure, balance, status, logCount: myLog.length };
}

export function computeSettlements(computedMembers) {
  const debtors = [];
  const creditors = [];
  for (const m of computedMembers) {
    if (m.balance > 0.5) debtors.push({ id: m.id, name: m.name, balance: m.balance });
    else if (m.balance < -0.5) creditors.push({ id: m.id, name: m.name, balance: -m.balance });
  }
  debtors.sort((a, b) => b.balance - a.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  const transactions = [];
  let d = 0, c = 0;
  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];
    const amount = Math.min(debtor.balance, creditor.balance);
    if (amount > 0.5) {
      transactions.push({ from: debtor.name, to: creditor.name, amount });
    }
    debtor.balance -= amount;
    creditor.balance -= amount;
    if (debtor.balance < 0.5) d++;
    if (creditor.balance < 0.5) c++;
  }
  return transactions;
}
