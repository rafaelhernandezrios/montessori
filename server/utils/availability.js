import Appointment from "../models/Appointment.js";
import Availability from "../models/Availability.js";

export async function getOrCreateAvailability() {
  let availability = await Availability.findOne();
  if (!availability) {
    availability = await Availability.create({});
  }
  return availability;
}

export function parseDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function combineDateAndTime(dateKey, time) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

export async function getBookedSlotsForMonth(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const appointments = await Appointment.find({
    scheduledAt: { $gte: start, $lte: end },
    status: { $in: ["solicitada", "confirmada", "completada", "reprogramada"] },
  });
  const booked = {};
  for (const apt of appointments) {
    const key = parseDateKey(apt.scheduledAt);
    const time = `${String(apt.scheduledAt.getHours()).padStart(2, "0")}:${String(apt.scheduledAt.getMinutes()).padStart(2, "0")}`;
    if (!booked[key]) booked[key] = [];
    booked[key].push(time);
  }
  return booked;
}

function getWeeklyDaySlots(weeklySlots, dayOfWeek) {
  const dayKey = String(dayOfWeek);
  return (typeof weeklySlots.get === "function" ? weeklySlots.get(dayKey) : weeklySlots[dayKey]) || [];
}

function slotsForDateKey(dateKey, availability, booked) {
  if (availability.blockedDates.includes(dateKey)) return [];

  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return [];

  const daySlots = getWeeklyDaySlots(availability.weeklySlots, dayOfWeek);
  const taken = booked[dateKey] || [];
  return daySlots.filter((slot) => !taken.includes(slot));
}

/** Una sola lectura de agenda + citas del mes (evita N consultas por día). */
export async function getAvailableDaysForMonth(year, month) {
  const availability = await getOrCreateAvailability();
  const booked = await getBookedSlotsForMonth(year, month);
  const daysInMonth = new Date(year, month, 0).getDate();
  const availableDays = {};

  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const slots = slotsForDateKey(dateKey, availability, booked);
    if (slots.length) availableDays[dateKey] = slots;
  }

  return { availableDays, booked, blockedDates: availability.blockedDates };
}

export async function getAvailableSlotsForDate(dateKey) {
  const availability = await getOrCreateAvailability();
  const [y, m] = dateKey.split("-").map(Number);
  const booked = await getBookedSlotsForMonth(y, m);
  return slotsForDateKey(dateKey, availability, booked);
}

export function formatAppointmentDate(date) {
  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  const d = new Date(date);
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()} a las ${time}`;
}
