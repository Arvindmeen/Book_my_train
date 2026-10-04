import { format, parseISO } from 'date-fns';
import { SEAT_TYPE_LABELS } from './constants';

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(d, 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(d, 'dd MMM yyyy, hh:mm a');
  } catch {
    return dateStr;
  }
}

export function formatCurrency(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatSeatType(type) {
  return SEAT_TYPE_LABELS[type] || type;
}

export function formatTime(timeStr) {
  if (!timeStr) return '—';
  try {
    const [hourStr, minuteStr] = String(timeStr).split(':');
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr ? minuteStr.padStart(2, '0') : '00';
    if (isNaN(hour)) return timeStr;
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${String(hour).padStart(2, '0')}:${minute} ${period}`;
  } catch {
    return timeStr;
  }
}

/**
 * Calculate human-readable duration between two HH:mm time strings.
 * Handles overnight journeys (arrival < departure = next day).
 */
export function calculateDuration(departureTime, arrivalTime) {
  if (!departureTime || !arrivalTime) return null;
  try {
    const [dh, dm] = departureTime.split(':').map(Number);
    const [ah, am] = arrivalTime.split(':').map(Number);
    let depMins = dh * 60 + dm;
    let arrMins = ah * 60 + am;
    if (arrMins <= depMins) arrMins += 24 * 60; // overnight
    const diff = arrMins - depMins;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  } catch {
    return null;
  }
}

/**
 * Calculate realistic travel duration from distance in km.
 * Uses Indian express train average speed of ~45 km/h.
 * Examples:
 *   45 km  →  ~1h
 *   440 km →  ~9h 45m
 *   760 km →  ~16h 55m
 *   1450km →  ~32h 15m  (capped logic for realism)
 *
 * Speed tiers (realistic Indian Railways):
 *   0–100 km   : 40 km/h  (local / suburban sections)
 *   101–400 km : 50 km/h  (semi-express)
 *   401–800 km : 55 km/h  (superfast express)
 *   >800 km    : 60 km/h  (rajdhani / shatabdi premium)
 */
export function calculateDurationFromDistance(km) {
  if (!km || km <= 0) return null;
  let totalMins;
  if (km <= 100) {
    totalMins = (km / 40) * 60;
  } else if (km <= 400) {
    totalMins = (100 / 40) * 60 + ((km - 100) / 50) * 60;
  } else if (km <= 800) {
    totalMins = (100 / 40) * 60 + (300 / 50) * 60 + ((km - 400) / 55) * 60;
  } else {
    totalMins = (100 / 40) * 60 + (300 / 50) * 60 + (400 / 55) * 60 + ((km - 800) / 60) * 60;
  }
  // Round to nearest 5 minutes for realism
  totalMins = Math.round(totalMins / 5) * 5;
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatTrainName(name) {
  if (!name) return 'Train';
  return String(name)
    .replace(/\s*\(Return(?:\s+via\s+[^)]+)?\)/gi, '')
    .replace(/\s*\((?:Return|RETURN)\)/gi, '')
    .trim();
}
