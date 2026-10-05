const { config } = require('../config');

const BRAND = 'Book My Train';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'arvindmeena8171@gmail.com';
const APP_URL = (config.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const formatDate = (value) => {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : (value || 'To be confirmed');
};
const formatCurrency = (value) => Number.isFinite(Number(value)) ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value)) : 'Amount to be confirmed';

function layout(title, preheader, content) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head><body style="margin:0;padding:0;background:#f1f5f9;color:#334155;-webkit-font-smoothing:antialiased;"><div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f1f5f9;"><tr><td align="center" style="padding:28px 12px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;border-collapse:separate;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);"><tr><td style="padding:22px 28px;background:#047857;border-bottom:4px solid #065f46;"><p style="margin:0;color:#ffffff;font:700 20px Arial,sans-serif;letter-spacing:-0.2px;">${BRAND}</p><p style="margin:3px 0 0;color:#d1fae5;font:500 12px Arial,sans-serif;">Your train journey, made simple</p></td></tr><tr><td style="padding:28px 28px 24px;font-family:Arial,sans-serif;"><h1 style="margin:0 0 16px;color:#0f172a;font-size:22px;line-height:28px;">${escapeHtml(title)}</h1>${content}</td></tr><tr><td style="padding:18px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;"><p style="margin:0;color:#64748b;font:12px/18px Arial,sans-serif;">This is an automated message from ${BRAND}. For questions, contact <a href="mailto:${escapeHtml(SUPPORT_EMAIL)}" style="color:#047857;text-decoration:none;font-weight:600;">${escapeHtml(SUPPORT_EMAIL)}</a>.</p><p style="margin:6px 0 0;color:#94a3b8;font:11px Arial,sans-serif;">© ${new Date().getFullYear()} ${BRAND} &bull; Moradabad, Uttar Pradesh, India &bull; All rights reserved.</p></td></tr></table></td></tr></table></body></html>`;
}

function details(rows) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;border-collapse:separate;">${rows.filter(([, value]) => value !== undefined && value !== null && value !== '').map(([label, value, isHtml], i) => `<tr><td style="padding:12px 16px;color:#64748b;font:13px Arial,sans-serif;vertical-align:top;${i ? 'border-top:1px solid #e2e8f0;' : ''}">${escapeHtml(label)}</td><td align="right" style="padding:12px 16px;color:#0f172a;font:600 13px Arial,sans-serif;vertical-align:top;${i ? 'border-top:1px solid #e2e8f0;' : ''}">${isHtml ? value : escapeHtml(value)}</td></tr>`).join('')}</table>`;
}

function passengerTable(items = []) {
  if (!items || items.length === 0) return 'Passenger details on e-ticket';
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-left:auto;">${items.map((p) => `<tr><td style="text-align:right;color:#0f172a;font:600 13px Arial,sans-serif;padding:2px 0;">${escapeHtml(p.name || 'Passenger')}${p.age ? ` <span style="color:#64748b;font-weight:normal;">(${escapeHtml(p.age)}y${p.gender ? `, ${escapeHtml(p.gender)}` : ''})</span>` : ''}${p.seatNumber || p.seat ? ` &bull; <strong style="color:#047857;">${escapeHtml(p.seatNumber || p.seat)}</strong>` : ''}</td></tr>`).join('')}</table>`;
}

function getOtpTemplate(otp, ttlMinutes = 5) {
  return layout('Verify your email address', `Your verification code expires in ${ttlMinutes} minutes.`, `<p style="margin:0;font:15px/24px Arial,sans-serif;">Use this verification code to complete your Book My Train registration.</p><div style="margin:24px 0;padding:20px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;text-align:center;"><span style="color:#065f46;font:700 30px/36px 'Courier New',monospace;letter-spacing:8px;">${escapeHtml(otp)}</span></div><p style="margin:0;color:#475569;font:14px/22px Arial,sans-serif;">This code expires in <strong>${escapeHtml(ttlMinutes)} minutes</strong>. Do not share it with anyone. We will never ask for this code by phone or email.</p>`);
}

function getWelcomeTemplate(firstName = 'Passenger') {
  return layout('Your account is ready', 'Your Book My Train account is ready to use.', `<p style="margin:0 0 16px;font:15px/24px Arial,sans-serif;">Hello ${escapeHtml(firstName)},</p><p style="margin:0 0 24px;font:15px/24px Arial,sans-serif;">Your email address has been verified. You can now search trains, manage passengers, and track bookings in one place.</p><a href="${escapeHtml(`${APP_URL}/login`)}" style="display:inline-block;padding:12px 20px;background:#047857;border-radius:6px;color:#fff;font:700 14px Arial,sans-serif;text-decoration:none;">Sign in to your account</a><p style="margin:24px 0 0;color:#64748b;font:13px/20px Arial,sans-serif;">If you did not create this account, please contact us immediately.</p>`);
}

function getBookingConfirmedTemplate(data = {}) {
  const train = [data.trainNumber, data.trainName].filter(Boolean).join(' — ') || 'To be confirmed';
  const pnrBlock = data.pnr ? `<div style="margin:20px 0;padding:16px;background:#ecfdf5;border:2px dashed #059669;border-radius:10px;text-align:center;"><p style="margin:0;font-size:12px;font-weight:bold;color:#047857;text-transform:uppercase;letter-spacing:1px;">BOOK MY TRAIN BOOKING REFERENCE</p><p style="margin:6px 0 0;font-size:28px;font-weight:900;letter-spacing:6px;color:#065f46;font-family:monospace;">${escapeHtml(data.pnr)}</p></div>` : '';
  return layout(
    'Your booking is confirmed',
    `PNR: ${data.pnr || data.bookingId || ''} - Booking Confirmed.`,
    `<p style="margin:0;font:15px/24px Arial,sans-serif;">Hello ${escapeHtml(data.firstName || 'Passenger')}, your train booking has been confirmed. Keep this email and your PNR for your journey.</p>${pnrBlock}${details([
      ['PNR Number', data.pnr || 'Issued on ticket'],
      ['Booking reference', data.bookingId],
      ['Train', train],
      ['From', data.fromStationName],
      ['To', data.toStationName],
      ['Journey date', formatDate(data.departureDate)],
      ['Passenger details', passengerTable(data.passengers), true],
      ['Amount paid', formatCurrency(data.totalAmount)]
    ])}<p style="margin:24px 0 0;color:#64748b;font:13px/20px Arial,sans-serif;">Please carry a valid government-issued photo ID during your journey.</p>`
  );
}

function getTicketConfirmationTemplate(data = {}) {
  return getBookingConfirmedTemplate({ bookingId: data.bookingId, pnr: data.pnr, firstName: data.firstName, trainName: data.trainName, trainNumber: data.trainNumber, fromStationName: data.from, toStationName: data.to, departureDate: data.date, passengers: data.passengers, totalAmount: data.amount });
}

function getBookingFailedTemplate(data = {}) {
  const reasons = { payment_failed: 'Your payment could not be processed.', confirm_seats_failed: 'The selected seats could not be confirmed.', booking_timeout: 'The booking expired before payment was completed.' };
  return layout('Your booking was not completed', `Booking ${data.bookingId || ''} was not completed.`, `<p style="margin:0;font:15px/24px Arial,sans-serif;">Hello ${escapeHtml(data.firstName || 'Passenger')}, ${escapeHtml(reasons[data.reason] || 'your booking could not be completed.')}</p>${details([['Booking reference', data.bookingId], ['Status', 'Not completed']])}<p style="margin:0;color:#475569;font:14px/22px Arial,sans-serif;">If an amount was debited, it will be returned to your original payment method according to your payment provider’s processing timeline.</p>`);
}

function getBookingCancelledTemplate(data = {}) {
  const reasons = { user_cancelled: 'You requested this cancellation.', schedule_cancelled: 'The train schedule was cancelled.' };
  const refund = Number(data.refundAmount) > 0 ? `${formatCurrency(data.refundAmount)} has been initiated.` : 'No refund is applicable.';
  return layout('Your booking has been cancelled', `Booking ${data.bookingId || ''} has been cancelled.`, `<p style="margin:0;font:15px/24px Arial,sans-serif;">Hello ${escapeHtml(data.firstName || 'Passenger')}, your booking has been cancelled.</p>${details([['Booking reference', data.bookingId], ['Reason', reasons[data.reason] || 'Booking cancelled'], ['Refund', refund]])}<p style="margin:0;color:#475569;font:14px/22px Arial,sans-serif;">Refund processing times vary by payment provider. Please check your original payment method for updates.</p>`);
}

const getOtpText = (otp, ttl = 5) => `${BRAND}\n\nVerification code: ${otp}\nThis code expires in ${ttl} minutes. Do not share it with anyone.\n\nSupport: ${SUPPORT_EMAIL}`;
const getWelcomeText = (name = 'Passenger') => `Hello ${name},\n\nYour ${BRAND} account is ready. Sign in at ${APP_URL}/login.\n\nSupport: ${SUPPORT_EMAIL}`;
const getBookingConfirmedText = (data = {}) => `Hello ${data.firstName || 'Passenger'},\n\nYour booking is confirmed.\nPNR Number: ${data.pnr || 'N/A'}\nBooking reference: ${data.bookingId || 'N/A'}\nTrain: ${[data.trainNumber, data.trainName].filter(Boolean).join(' — ') || 'N/A'}\nJourney date: ${formatDate(data.departureDate)}\nAmount paid: ${formatCurrency(data.totalAmount)}\n\nSupport: ${SUPPORT_EMAIL}`;
const getBookingFailedText = (data = {}) => `Hello ${data.firstName || 'Passenger'},\n\nYour booking ${data.bookingId || ''} was not completed. If an amount was debited, it will be returned according to your payment provider's processing timeline.\n\nSupport: ${SUPPORT_EMAIL}`;
const getBookingCancelledText = (data = {}) => `Hello ${data.firstName || 'Passenger'},\n\nYour booking ${data.bookingId || ''} has been cancelled.\nRefund: ${Number(data.refundAmount) > 0 ? `${formatCurrency(data.refundAmount)} has been initiated.` : 'No refund is applicable.'}\n\nSupport: ${SUPPORT_EMAIL}`;

module.exports = { getOtpTemplate, getWelcomeTemplate, getTicketConfirmationTemplate, getBookingConfirmedTemplate, getBookingFailedTemplate, getBookingCancelledTemplate, getOtpText, getWelcomeText, getBookingConfirmedText, getBookingFailedText, getBookingCancelledText };
