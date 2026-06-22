import Payment from "../models/Payment.js";

function monthStart(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function monthEnd(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export async function getRevenueStats() {
  const now = new Date();
  const thisStart = monthStart(now);
  const thisEnd = monthEnd(now);
  const prevStart = monthStart(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const prevEnd = monthEnd(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const [monthTotal, prevTotal, pending, subscriptionCount, chartData] = await Promise.all([
    Payment.aggregate([
      { $match: { status: "completed", paidAt: { $gte: thisStart, $lte: thisEnd } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate([
      { $match: { status: "completed", paidAt: { $gte: prevStart, $lte: prevEnd } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate([
      { $match: { status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Payment.distinct("userId", {
      type: "subscription",
      status: "completed",
      paidAt: { $gte: thisStart, $lte: thisEnd },
    }),
    buildChart(6),
  ]);

  const monthRevenue = monthTotal[0]?.total || 0;
  const prevRevenue = prevTotal[0]?.total || 0;
  const growth = prevRevenue
    ? Math.round(((monthRevenue - prevRevenue) / prevRevenue) * 100)
    : monthRevenue > 0 ? 100 : 0;

  const oneTimeMonth = await Payment.aggregate([
    {
      $match: {
        status: "completed",
        type: "one_time",
        paidAt: { $gte: thisStart, $lte: thisEnd },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const recurringMonth = await Payment.aggregate([
    {
      $match: {
        status: "completed",
        type: "subscription",
        paidAt: { $gte: thisStart, $lte: thisEnd },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return {
    monthRevenue,
    monthGrowth: growth,
    mrr: recurringMonth[0]?.total || 0,
    oneTimeMonth: oneTimeMonth[0]?.total || 0,
    pendingAmount: pending[0]?.total || 0,
    pendingCount: pending[0]?.count || 0,
    subscriptionCount: subscriptionCount.length,
    chart: chartData,
  };
}

async function buildChart(months) {
  const labels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const now = new Date();
  const result = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = monthStart(d);
    const end = monthEnd(d);
    const rows = await Payment.aggregate([
      { $match: { status: "completed", paidAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);
    let recurring = 0;
    let oneTime = 0;
    for (const r of rows) {
      if (r._id === "subscription") recurring = r.total;
      else oneTime += r.total;
    }
    result.push({
      label: labels[d.getMonth()],
      year: d.getFullYear(),
      recurring,
      oneTime,
      total: recurring + oneTime,
    });
  }
  return result;
}

export function formatMxn(cents) {
  const pesos = (cents || 0) / 100;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(pesos);
}

export function childAgeLabel(birthDate) {
  if (!birthDate) return "";
  const birth = new Date(birthDate);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 24) return `${months}m`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem ? `${years}a ${rem}m` : `${years}a`;
}

export function daysSince(date) {
  if (!date) return null;
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
