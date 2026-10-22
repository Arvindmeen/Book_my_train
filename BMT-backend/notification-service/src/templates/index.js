const { config } = require('../config');

const BRAND = 'Book My Train';
const SUPPORT_EMAIL = config.SUPPORT_EMAIL || process.env.SUPPORT_EMAIL || config.EMAIL_USER || 'teambookmytrain@gmail.com';
const APP_URL = (config.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

// Anti-leak whitespace filler so email clients (like Gmail) show ONLY our custom preheader in inbox previews
const PREHEADER_FILLER = '&#847;&zwnj;&nbsp;'.repeat(30);

const escapeHtml = (value = '') =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));

const formatDate = (value) => {
  if (!value) return 'To be confirmed';
  const date = new Date(value);
  return !Number.isNaN(date.getTime())
    ? date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : String(value);
};

const formatCurrency = (value) => {
  const num = Number(value);
  return Number.isFinite(num)
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(num)
    : 'Amount to be confirmed';
};

/**
 * Base layout with pure white background, crisp black typography,
 * Gmail & Gemini Schema.org JSON-LD support, and high-readability layout.
 */
function layout(title, preheader, content, schemaJson = null) {
  const schemaTag = schemaJson
    ? `\n  <script type="application/ld+json">\n${JSON.stringify(schemaJson, null, 2)}\n  </script>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(title)}</title>${schemaTag}
</head>
<body style="margin: 0; padding: 0; background: #ffffff; color: #111827; -webkit-font-smoothing: antialiased; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  
  <!-- Gmail Inbox Preview & Gemini Snippet -->
  <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #ffffff; opacity: 0; mso-hide: all;">
    ${escapeHtml(preheader)} ${PREHEADER_FILLER}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background: #ffffff; width: 100%;">
    <tr>
      <td align="center" style="padding: 24px 12px; background: #ffffff;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; border-collapse: separate; text-align: left;">
          
          <!-- Brand Header (White background, black typography, clean divider) -->
          <tr>
            <td style="padding: 24px 28px 18px; border-bottom: 2px solid #111827;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <tr>
                  <td>
                    <div style="font-size: 20px; font-weight: 800; color: #111827; letter-spacing: 0.5px; text-transform: uppercase;">
                      ${BRAND}
                    </div>
                    <div style="font-size: 12px; color: #4b5563; margin-top: 3px; font-weight: 500;">
                      Official Railway Reservation &amp; Ticketing Service
                    </div>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; padding: 4px 10px; border: 1px solid #111827; border-radius: 3px; font-size: 10px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 1px;">
                      E-SERVICE
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 22px; color: #1f2937;">
              <h1 style="margin: 0 0 18px; color: #111827; font-size: 20px; font-weight: 700; line-height: 26px;">
                ${escapeHtml(title)}
              </h1>
              ${content}
            </td>
          </tr>

          <!-- Footer (White background, light divider, clean black/gray links) -->
          <tr>
            <td style="padding: 20px 28px; background: #ffffff; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #4b5563; font-size: 12px; line-height: 18px;">
                This is an automated notification from <strong>${BRAND}</strong>. For assistance or queries, please reach out to our support desk at <a href="mailto:${escapeHtml(SUPPORT_EMAIL)}" style="color: #111827; text-decoration: underline; font-weight: 600;">${escapeHtml(SUPPORT_EMAIL)}</a> or call our 24x7 railway helpline.
              </p>
              <p style="margin: 8px 0 0; color: #6b7280; font-size: 11px; line-height: 16px;">
                &copy; ${new Date().getFullYear()} ${BRAND} &bull; Moradabad, Uttar Pradesh, India &bull; All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Key-Value Details table with clean white background and subtle borders
 */
function details(rows) {
  const filtered = rows.filter(([, value]) => value !== undefined && value !== null && value !== '');
  if (filtered.length === 0) return '';
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 14px 0 20px; border: 1px solid #e5e7eb; border-collapse: collapse; background: #ffffff;">
    ${filtered.map(([label, value, isHtml]) => `<tr>
      <td style="padding: 10px 14px; color: #4b5563; font-size: 13px; font-weight: 500; border-bottom: 1px solid #e5e7eb; width: 38%; vertical-align: top;">${escapeHtml(label)}</td>
      <td style="padding: 10px 14px; color: #111827; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e5e7eb; vertical-align: top;">${isHtml ? value : escapeHtml(value)}</td>
    </tr>`).join('')}
  </table>`;
}

/**
 * Clean, structured Passenger Details Table
 */
function passengerTable(passengers = [], seats = [], travelClass = '') {
  const list = Array.isArray(passengers) && passengers.length > 0
    ? passengers
    : (Array.isArray(seats) && seats.length > 0 ? seats.map((s, idx) => ({ name: `Passenger ${idx + 1}`, seatNumber: s.seatNumber, seatType: s.seatType })) : []);

  if (list.length === 0) {
    return `<p style="margin: 0; color: #4b5563; font-size: 13px; font-style: italic;">Passenger and seat allocation details are available on your attached e-ticket.</p>`;
  }

  const rowsHtml = list.map((p, idx) => {
    const seatObj = (seats && seats[idx]) || {};
    const seatNum = p.seatNumber || p.seat || seatObj.seatNumber || 'Allocated on Chart';
    const seatType = p.seatType || p.berth || seatObj.seatType || travelClass || 'Confirmed';
    const ageGender = [
      p.age ? `${p.age} yrs` : null,
      p.gender ? (p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : p.gender) : null,
    ].filter(Boolean).join(', ') || '—';

    return `<tr>
      <td style="padding: 10px 12px; font-size: 13px; color: #111827; border-bottom: 1px solid #e5e7eb; vertical-align: middle;">${idx + 1}</td>
      <td style="padding: 10px 12px; font-size: 13px; font-weight: 600; color: #111827; border-bottom: 1px solid #e5e7eb; vertical-align: middle;">${escapeHtml(p.name || 'Passenger')}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #374151; border-bottom: 1px solid #e5e7eb; vertical-align: middle;">${escapeHtml(ageGender)}</td>
      <td style="padding: 10px 12px; font-size: 13px; font-weight: 700; color: #111827; border-bottom: 1px solid #e5e7eb; vertical-align: middle;">${escapeHtml(seatNum)}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #374151; border-bottom: 1px solid #e5e7eb; vertical-align: middle;">${escapeHtml(seatType)}</td>
    </tr>`;
  }).join('');

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-top: 8px; border: 1px solid #e5e7eb; background: #ffffff;">
    <thead>
      <tr style="background: #f9fafb; border-bottom: 2px solid #111827;">
        <th align="left" style="padding: 8px 12px; font-size: 11px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">#</th>
        <th align="left" style="padding: 8px 12px; font-size: 11px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">Passenger Name</th>
        <th align="left" style="padding: 8px 12px; font-size: 11px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">Age / Gender</th>
        <th align="left" style="padding: 8px 12px; font-size: 11px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">Seat / Berth</th>
        <th align="left" style="padding: 8px 12px; font-size: 11px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">Class / Berth Type</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>`;
}

/**
 * 1. OTP Verification Email Template
 * Includes Gemini-friendly Preheader, Quick Summary, and prominent OTP
 */
function getOtpTemplate(otp, ttlMinutes = 5) {
  const preheader = `OTP: ${otp} • Valid for ${ttlMinutes} minutes • Book My Train email verification code. Do not share.`;

  const schemaJson = {
    '@context': 'http://schema.org',
    '@type': 'EmailMessage',
    'description': `Book My Train OTP: ${otp} (Expires in ${ttlMinutes} mins)`,
  };

  return layout(
    'Verify your email address',
    preheader,
    `<p style="margin: 0 0 14px; font-size: 15px; line-height: 24px; color: #111827;">Dear User,</p>
<p style="margin: 0 0 16px; font-size: 15px; line-height: 24px; color: #374151;">Greetings from <strong>Book My Train</strong>!</p>

<!-- Quick Summary / Gemini Overview -->
<div style="margin: 16px 0 20px; padding: 14px 18px; background: #ffffff; border: 1px solid #111827; border-radius: 6px;">
  <div style="font-size: 11px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
    Quick Summary:
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; font-size: 13px; line-height: 20px;">
    <tr>
      <td style="padding: 3px 0; color: #4b5563; width: 34%;">Verification OTP:</td>
      <td style="padding: 3px 0; color: #111827; font-weight: 800; font-family: monospace; font-size: 15px; letter-spacing: 2px;">${escapeHtml(otp)}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; color: #4b5563;">Purpose:</td>
      <td style="padding: 3px 0; color: #111827; font-weight: 600;">Account &amp; Email Verification</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; color: #4b5563;">Validity:</td>
      <td style="padding: 3px 0; color: #111827; font-weight: 600;">Expires in ${escapeHtml(ttlMinutes)} minutes (Single-use)</td>
    </tr>
  </table>
</div>

<p style="margin: 0 0 20px; font-size: 14px; line-height: 22px; color: #374151;">
  Please enter the One-Time Password (OTP) below to complete your verification on Book My Train:
</p>

<!-- Prominent Verification Code Box -->
<div style="margin: 22px 0; padding: 22px 20px; background: #ffffff; border: 2px solid #111827; border-radius: 6px; text-align: center;">
  <div style="margin: 0 0 6px; font-size: 11px; font-weight: 700; color: #4b5563; text-transform: uppercase; letter-spacing: 2px;">
    ONE-TIME VERIFICATION CODE
  </div>
  <div style="font-size: 36px; font-weight: 900; line-height: 44px; letter-spacing: 10px; color: #111827; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; margin: 8px 0;">
    ${escapeHtml(otp)}
  </div>
  <div style="margin: 6px 0 0; font-size: 12px; font-weight: 500; color: #4b5563;">
    Valid for <strong>${escapeHtml(ttlMinutes)} minutes</strong> &bull; Do not share with anyone
  </div>
</div>

<p style="margin: 20px 0 10px; font-size: 14px; font-weight: 700; color: #111827;">
  Security Notice:
</p>
<ul style="margin: 0 0 22px 20px; padding: 0; font-size: 13px; line-height: 22px; color: #4b5563;">
  <li>This code expires in <strong>${escapeHtml(ttlMinutes)} minutes</strong> and is valid for single use only.</li>
  <li>Book My Train staff will never ask for your verification code or account password.</li>
  <li>If you did not request this OTP, please ignore this email or reach out to our support team immediately.</li>
</ul>

<p style="margin: 0 0 4px; font-size: 14px; color: #111827;">Best Regards,</p>
<p style="margin: 0; font-size: 14px; font-weight: 700; color: #111827;">Support &amp; Verification Team</p>
<p style="margin: 2px 0 0; font-size: 13px; color: #4b5563;">Book My Train</p>`,
    schemaJson
  );
}

/**
 * 2. Welcome Email Template
 */
function getWelcomeTemplate(firstName = 'Passenger') {
  const preheader = `Welcome ${firstName}! Your Book My Train account is active. Search trains and manage bookings.`;

  const schemaJson = {
    '@context': 'http://schema.org',
    '@type': 'EmailMessage',
    'description': `Welcome ${firstName} to Book My Train`,
  };

  return layout(
    'Your account is ready',
    preheader,
    `<p style="margin: 0 0 14px; font-size: 15px; line-height: 24px; color: #111827;">Dear ${escapeHtml(firstName)},</p>
<p style="margin: 0 0 16px; font-size: 15px; line-height: 24px; color: #374151;">Greetings from <strong>Book My Train</strong>!</p>

<!-- Quick Summary / Gemini Overview -->
<div style="margin: 16px 0 20px; padding: 14px 18px; background: #ffffff; border: 1px solid #111827; border-radius: 6px;">
  <div style="font-size: 11px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
    Quick Summary:
  </div>
  <p style="margin: 0; font-size: 13px; line-height: 20px; color: #374151;">
    • <strong>Account Status:</strong> Verified &amp; Active<br>
    • <strong>User:</strong> ${escapeHtml(firstName)}<br>
    • <strong>Services Available:</strong> Railway Seat Availability, Instant PNR Booking, E-Tickets
  </p>
</div>

<p style="margin: 0 0 18px; font-size: 14px; line-height: 22px; color: #374151;">
  Welcome aboard! Your email address has been verified, and your Book My Train account is now fully active. You can now search train schedules, book tickets, manage passengers, and track reservations in one convenient dashboard.
</p>

<h3 style="margin: 20px 0 10px; font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">Account Features &amp; Benefits:</h3>
<ul style="margin: 0 0 24px 20px; padding: 0; font-size: 13px; line-height: 22px; color: #4b5563;">
  <li><strong>Instant Reservations:</strong> Real-time seat availability across Indian Railways with instant PNR generation.</li>
  <li><strong>Live PNR Tracking:</strong> Check booking status, confirmation updates, and platform details anytime.</li>
  <li><strong>Saved Travelers:</strong> Pre-save passenger details for faster, 1-click checkout.</li>
  <li><strong>Digital E-Tickets:</strong> Download official PDF tickets anytime directly from your account.</li>
</ul>

<div style="margin: 24px 0;">
  <a href="${escapeHtml(`${APP_URL}/login`)}" style="display: inline-block; padding: 12px 24px; background: #111827; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 4px; letter-spacing: 0.5px;">Sign In to Your Account &rarr;</a>
</div>

<p style="margin: 24px 0 6px; font-size: 13px; color: #6b7280;">
  If you did not create this account, please notify our support team at <a href="mailto:${escapeHtml(SUPPORT_EMAIL)}" style="color: #111827; text-decoration: underline;">${escapeHtml(SUPPORT_EMAIL)}</a>.
</p>

<p style="margin: 20px 0 4px; font-size: 14px; color: #111827;">Best Regards,</p>
<p style="margin: 0; font-size: 14px; font-weight: 700; color: #111827;">Customer Experience Team</p>
<p style="margin: 2px 0 0; font-size: 13px; color: #4b5563;">Book My Train</p>`,
    schemaJson
  );
}

/**
 * 3. Booking Confirmed Email Template
 * Includes Gemini-friendly Preheader, Quick Summary, Schema.org TrainReservation, and prominent PNR
 */
function getBookingConfirmedTemplate(data = {}) {
  const train = [data.trainNumber, data.trainName].filter(Boolean).join(' — ') || 'Train Details on Ticket';
  const fromStation = data.fromStationName || data.from || 'Departure Station';
  const toStation = data.toStationName || data.to || 'Destination Station';
  const route = `${fromStation} → ${toStation}`;
  const travelDate = formatDate(data.departureDate || data.date);

  const passengerNames = Array.isArray(data.passengers) && data.passengers.length > 0
    ? data.passengers.map((p) => p.name || 'Passenger').join(', ')
    : (data.firstName || '1 Passenger');

  const seatList = [];
  if (Array.isArray(data.passengers)) {
    data.passengers.forEach((p, idx) => {
      const s = p.seatNumber || p.seat || (data.seats && data.seats[idx] && data.seats[idx].seatNumber);
      if (s) seatList.push(s);
    });
  } else if (Array.isArray(data.seats)) {
    data.seats.forEach((s) => {
      if (s && s.seatNumber) seatList.push(s.seatNumber);
    });
  }
  const seatSummary = seatList.length > 0 ? seatList.join(', ') : 'Allocated on Chart';

  // Gmail & Gemini Snippet (Shows immediately in Gmail preview)
  const preheader = `PNR: ${data.pnr || data.bookingId || 'Confirmed'} • ${train} • ${route} • Date: ${travelDate} • Passenger(s): ${passengerNames} • Seat(s): ${seatSummary} • E-Ticket Attached.`;

  // Schema.org TrainReservation for Google / Gmail & Gemini
  const schemaJson = {
    '@context': 'http://schema.org',
    '@type': 'TrainReservation',
    'reservationNumber': data.pnr || data.bookingId || '',
    'reservationStatus': 'http://schema.org/Confirmed',
    'underName': {
      '@type': 'Person',
      'name': (data.passengers && data.passengers[0] && data.passengers[0].name) || data.firstName || 'Passenger',
    },
    'reservationFor': {
      '@type': 'TrainTrip',
      'trainNumber': String(data.trainNumber || ''),
      'trainName': String(data.trainName || ''),
      'departureStation': {
        '@type': 'TrainStation',
        'name': fromStation,
      },
      'arrivalStation': {
        '@type': 'TrainStation',
        'name': toStation,
      },
      'departureDay': data.departureDate || data.date || '',
    },
  };

  const pnrBox = data.pnr ? `
<!-- Prominent PNR Box -->
<div style="margin: 20px 0; padding: 18px 20px; background: #ffffff; border: 2px solid #111827; border-radius: 6px; text-align: center;">
  <div style="font-size: 11px; font-weight: 700; color: #4b5563; text-transform: uppercase; letter-spacing: 2px;">
    PASSENGER NAME RECORD (PNR)
  </div>
  <div style="font-size: 34px; font-weight: 900; line-height: 40px; letter-spacing: 6px; color: #111827; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; margin: 8px 0;">
    ${escapeHtml(data.pnr)}
  </div>
  <div style="font-size: 12px; font-weight: 600; color: #111827;">
    Booking ID: <span style="font-family: monospace;">${escapeHtml(data.bookingId || 'N/A')}</span> &bull; Status: <span style="font-weight: 800;">CONFIRMED</span>
  </div>
</div>` : '';

  return layout(
    'Your train booking is confirmed',
    preheader,
    `<p style="margin: 0 0 14px; font-size: 15px; line-height: 24px; color: #111827;">Dear ${escapeHtml(data.firstName || 'Passenger')},</p>
<p style="margin: 0 0 16px; font-size: 15px; line-height: 24px; color: #374151;">Greetings from <strong>Book My Train</strong>!</p>

<!-- Quick Summary / Gemini Overview -->
<div style="margin: 16px 0 20px; padding: 16px 18px; background: #ffffff; border: 1px solid #111827; border-radius: 6px;">
  <div style="font-size: 11px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
    Quick Summary:
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; font-size: 13px; line-height: 20px;">
    <tr>
      <td style="padding: 3px 0; color: #4b5563; width: 32%;">PNR Number:</td>
      <td style="padding: 3px 0; color: #111827; font-weight: 800; font-family: monospace; font-size: 15px; letter-spacing: 1px;">${escapeHtml(data.pnr || 'Issued on ticket')}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; color: #4b5563;">Status:</td>
      <td style="padding: 3px 0; color: #111827; font-weight: 700;">CONFIRMED</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; color: #4b5563;">Train:</td>
      <td style="padding: 3px 0; color: #111827; font-weight: 600;">${escapeHtml(train)}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; color: #4b5563;">Route:</td>
      <td style="padding: 3px 0; color: #111827; font-weight: 600;">${escapeHtml(route)}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; color: #4b5563;">Journey Date:</td>
      <td style="padding: 3px 0; color: #111827; font-weight: 600;">${escapeHtml(travelDate)}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; color: #4b5563;">Passenger(s):</td>
      <td style="padding: 3px 0; color: #111827; font-weight: 600;">${escapeHtml(passengerNames)}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; color: #4b5563;">Seat / Berth:</td>
      <td style="padding: 3px 0; color: #111827; font-weight: 700;">${escapeHtml(seatSummary)}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; color: #4b5563;">E-Ticket:</td>
      <td style="padding: 3px 0; color: #111827; font-weight: 600;">Official PDF attached to this email</td>
    </tr>
  </table>
</div>

<p style="margin: 0 0 18px; font-size: 14px; line-height: 22px; color: #374151;">
  We are pleased to inform you that your train reservation has been successfully confirmed. Below are your journey details, PNR number, and passenger seat allocation. Your official e-ticket is also attached to this email as a PDF document.
</p>

${pnrBox}

<!-- Journey Details Section -->
<h3 style="margin: 22px 0 8px; font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">
  Journey Details:
</h3>
${details([
  ['PNR Number', data.pnr || 'Issued on ticket'],
  ['Booking Reference', data.bookingId],
  ['Train', train],
  ['Route', route],
  ['Departure Date', travelDate],
  ['Travel Class', data.travelClass || (data.seats && data.seats[0] && data.seats[0].seatType) || 'Standard'],
  ['Total Amount Paid', `${formatCurrency(data.totalAmount || data.amount)} (All taxes included)`],
])}

<!-- Passenger Details Section -->
<h3 style="margin: 24px 0 8px; font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">
  Passenger &amp; Seat Allocation:
</h3>
${passengerTable(data.passengers, data.seats, data.travelClass)}

<!-- Important Travel Guidelines -->
<h3 style="margin: 26px 0 10px; font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">
  Important Travel Guidelines:
</h3>
<ul style="margin: 0 0 22px 20px; padding: 0; font-size: 13px; line-height: 22px; color: #4b5563;">
  <li><strong>Photo ID Requirement:</strong> At least one passenger must carry an original government-issued photo identity proof (Aadhaar Card, Voter ID, Passport, Driving License) during the journey.</li>
  <li><strong>E-Ticket PDF:</strong> An official e-ticket is attached to this email. You may present this digital copy or printout to the Ticket Examiner (TTE).</li>
  <li><strong>Station Arrival:</strong> Please arrive at the boarding station at least 30 to 45 minutes prior to the scheduled departure time.</li>
  <li><strong>Platform &amp; Coach Guidance:</strong> Please check station display boards and audio announcements for platform and coach position information.</li>
</ul>

<!-- Support & Helpdesk Contacts -->
<h3 style="margin: 22px 0 8px; font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">
  Support &amp; Helpline:
</h3>
<p style="margin: 0 0 4px; font-size: 13px; line-height: 20px; color: #374151;">
  Customer Support: <a href="mailto:${escapeHtml(SUPPORT_EMAIL)}" style="color: #111827; font-weight: 600; text-decoration: underline;">${escapeHtml(SUPPORT_EMAIL)}</a>
</p>
<p style="margin: 0 0 4px; font-size: 13px; line-height: 20px; color: #374151;">
  Railway 24x7 Helpline: <strong>139</strong>
</p>
<p style="margin: 0 0 20px; font-size: 13px; line-height: 20px; color: #374151;">
  Online Portal: <a href="${escapeHtml(APP_URL)}" style="color: #111827; font-weight: 600; text-decoration: underline;">${escapeHtml(APP_URL)}</a>
</p>

<p style="margin: 0 0 14px; font-size: 14px; line-height: 22px; color: #111827;">We wish you a safe, pleasant, and comfortable journey!</p>

<p style="margin: 0 0 4px; font-size: 14px; color: #111827;">Best Regards,</p>
<p style="margin: 0; font-size: 14px; font-weight: 700; color: #111827;">Reservation Desk</p>
<p style="margin: 2px 0 0; font-size: 13px; color: #4b5563;">Book My Train</p>
<p style="margin: 2px 0 0; font-size: 12px; color: #6b7280;">Moradabad, Uttar Pradesh, India</p>`,
    schemaJson
  );
}

function getTicketConfirmationTemplate(data = {}) {
  return getBookingConfirmedTemplate({
    bookingId: data.bookingId,
    pnr: data.pnr,
    firstName: data.firstName,
    trainName: data.trainName,
    trainNumber: data.trainNumber,
    fromStationName: data.from || data.fromStationName,
    toStationName: data.to || data.toStationName,
    departureDate: data.date || data.departureDate,
    passengers: data.passengers,
    seats: data.seats,
    travelClass: data.travelClass || data.seatClass,
    totalAmount: data.amount || data.totalAmount,
  });
}

/**
 * 4. Booking Failed Email Template
 */
function getBookingFailedTemplate(data = {}) {
  const reasons = {
    payment_failed: 'Payment transaction could not be processed by your bank or payment provider.',
    confirm_seats_failed: 'The requested seats could not be confirmed due to high demand.',
    booking_timeout: 'The booking session expired before payment authorization completed.',
  };
  const reasonText = reasons[data.reason] || 'The booking request could not be completed at this time.';
  const preheader = `Booking ${data.bookingId || ''} not completed. ${reasonText} Any debited amount will be refunded.`;

  const schemaJson = {
    '@context': 'http://schema.org',
    '@type': 'EmailMessage',
    'description': `Booking ${data.bookingId || ''} not completed`,
  };

  return layout(
    'Your booking was not completed',
    preheader,
    `<p style="margin: 0 0 14px; font-size: 15px; line-height: 24px; color: #111827;">Dear ${escapeHtml(data.firstName || 'Passenger')},</p>
<p style="margin: 0 0 16px; font-size: 15px; line-height: 24px; color: #374151;">Greetings from <strong>Book My Train</strong>.</p>

<!-- Quick Summary / Gemini Overview -->
<div style="margin: 16px 0 20px; padding: 14px 18px; background: #ffffff; border: 1px solid #111827; border-radius: 6px;">
  <div style="font-size: 11px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
    Quick Summary:
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; font-size: 13px; line-height: 20px;">
    <tr>
      <td style="padding: 3px 0; color: #4b5563; width: 32%;">Booking ID:</td>
      <td style="padding: 3px 0; color: #111827; font-weight: 700; font-family: monospace;">${escapeHtml(data.bookingId || 'N/A')}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; color: #4b5563;">Status:</td>
      <td style="padding: 3px 0; color: #111827; font-weight: 700;">NOT COMPLETED</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; color: #4b5563;">Refund:</td>
      <td style="padding: 3px 0; color: #111827; font-weight: 600;">Full refund to original source in 3-5 days</td>
    </tr>
  </table>
</div>

<p style="margin: 0 0 18px; font-size: 14px; line-height: 22px; color: #374151;">
  We regret to inform you that your train ticket booking request could not be completed.
</p>

<!-- Failure Summary Box -->
<div style="margin: 18px 0; padding: 18px 20px; background: #ffffff; border: 1px solid #111827; border-radius: 6px;">
  <div style="font-size: 11px; font-weight: 700; color: #4b5563; text-transform: uppercase; letter-spacing: 1px;">TRANSACTION DETAILS</div>
  <div style="font-size: 18px; font-weight: 800; color: #111827; font-family: monospace; margin: 4px 0 8px;">${escapeHtml(data.bookingId || 'N/A')}</div>
  <div style="font-size: 13px; color: #111827;"><strong>Status:</strong> Not Completed</div>
  <div style="font-size: 13px; color: #374151; margin-top: 4px;"><strong>Reason:</strong> ${escapeHtml(reasonText)}</div>
</div>

<h3 style="margin: 20px 0 10px; font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">
  Refund &amp; Next Steps:
</h3>
<ul style="margin: 0 0 22px 20px; padding: 0; font-size: 13px; line-height: 22px; color: #4b5563;">
  <li>If any amount was deducted from your bank account or card, it will be automatically refunded in full to your original payment source.</li>
  <li>Refund processing normally completes within <strong>3 to 5 business days</strong>, subject to your card issuer or banking institution.</li>
  <li>You can attempt your booking again at any time by visiting <a href="${escapeHtml(APP_URL)}" style="color: #111827; text-decoration: underline; font-weight: 600;">${escapeHtml(APP_URL)}</a>.</li>
</ul>

<p style="margin: 0 0 4px; font-size: 14px; color: #111827;">Best Regards,</p>
<p style="margin: 0; font-size: 14px; font-weight: 700; color: #111827;">Reservation Support</p>
<p style="margin: 2px 0 0; font-size: 13px; color: #4b5563;">Book My Train</p>`,
    schemaJson
  );
}

/**
 * 5. Booking Cancelled Email Template
 */
function getBookingCancelledTemplate(data = {}) {
  const reasons = {
    user_cancelled: 'Cancellation was requested by the user.',
    schedule_cancelled: 'The train schedule was cancelled by railway authorities.',
  };
  const refundAmount = Number(data.refundAmount);
  const refundText = refundAmount > 0
    ? `${formatCurrency(refundAmount)} (Refund Initiated)`
    : 'No refund applicable as per cancellation policy';

  const preheader = `Booking ${data.bookingId || ''}${data.pnr ? ` (PNR: ${data.pnr})` : ''} cancelled. Refund: ${refundText}.`;

  const schemaJson = {
    '@context': 'http://schema.org',
    '@type': 'Reservation',
    'reservationNumber': data.pnr || data.bookingId || '',
    'reservationStatus': 'http://schema.org/Cancelled',
  };

  return layout(
    'Your booking has been cancelled',
    preheader,
    `<p style="margin: 0 0 14px; font-size: 15px; line-height: 24px; color: #111827;">Dear ${escapeHtml(data.firstName || 'Passenger')},</p>
<p style="margin: 0 0 16px; font-size: 15px; line-height: 24px; color: #374151;">Greetings from <strong>Book My Train</strong>.</p>

<!-- Quick Summary / Gemini Overview -->
<div style="margin: 16px 0 20px; padding: 14px 18px; background: #ffffff; border: 1px solid #111827; border-radius: 6px;">
  <div style="font-size: 11px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
    Quick Summary:
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; font-size: 13px; line-height: 20px;">
    <tr>
      <td style="padding: 3px 0; color: #4b5563; width: 32%;">Booking ID:</td>
      <td style="padding: 3px 0; color: #111827; font-weight: 700; font-family: monospace;">${escapeHtml(data.bookingId || 'N/A')}</td>
    </tr>
    ${data.pnr ? `<tr>
      <td style="padding: 3px 0; color: #4b5563;">PNR Number:</td>
      <td style="padding: 3px 0; color: #111827; font-weight: 700; font-family: monospace;">${escapeHtml(data.pnr)}</td>
    </tr>` : ''}
    <tr>
      <td style="padding: 3px 0; color: #4b5563;">Status:</td>
      <td style="padding: 3px 0; color: #111827; font-weight: 700;">CANCELLED</td>
    </tr>
    <tr>
      <td style="padding: 3px 0; color: #4b5563;">Refund:</td>
      <td style="padding: 3px 0; color: #111827; font-weight: 700;">${refundText}</td>
    </tr>
  </table>
</div>

<p style="margin: 0 0 18px; font-size: 14px; line-height: 22px; color: #374151;">
  This is to confirm that your train reservation has been successfully cancelled as per your request.
</p>

<!-- Cancellation Summary Box -->
<div style="margin: 18px 0; padding: 18px 20px; background: #ffffff; border: 1px solid #111827; border-radius: 6px;">
  <div style="font-size: 11px; font-weight: 700; color: #4b5563; text-transform: uppercase; letter-spacing: 1px;">CANCELLATION SUMMARY</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 10px; border-collapse: collapse;">
    <tr>
      <td style="padding: 6px 0; font-size: 13px; color: #4b5563;">Booking ID:</td>
      <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #111827; font-family: monospace;">${escapeHtml(data.bookingId || 'N/A')}</td>
    </tr>
    ${data.pnr ? `<tr>
      <td style="padding: 6px 0; font-size: 13px; color: #4b5563;">PNR Number:</td>
      <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #111827; font-family: monospace;">${escapeHtml(data.pnr)}</td>
    </tr>` : ''}
    <tr>
      <td style="padding: 6px 0; font-size: 13px; color: #4b5563;">Cancellation Reason:</td>
      <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${escapeHtml(reasons[data.reason] || 'User requested cancellation')}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 13px; color: #4b5563;">Refund Amount:</td>
      <td align="right" style="padding: 6px 0; font-size: 14px; font-weight: 800; color: #111827;">${refundText}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 13px; color: #4b5563;">Status:</td>
      <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #111827;">CANCELLED</td>
    </tr>
  </table>
</div>

<h3 style="margin: 20px 0 10px; font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">
  Refund Processing:
</h3>
<p style="margin: 0 0 20px; font-size: 13px; line-height: 22px; color: #4b5563;">
  ${refundAmount > 0
    ? `The refund of <strong>${formatCurrency(refundAmount)}</strong> has been initiated and will be credited to your original payment method within <strong>3 to 7 working days</strong>.`
    : 'As per railway cancellation guidelines, no refund is applicable for this booking cancellation.'}
</p>

<p style="margin: 0 0 4px; font-size: 14px; color: #111827;">Best Regards,</p>
<p style="margin: 0; font-size: 14px; font-weight: 700; color: #111827;">Customer Support Desk</p>
<p style="margin: 2px 0 0; font-size: 13px; color: #4b5563;">Book My Train</p>`,
    schemaJson
  );
}

/**
 * Plain Text Fallbacks
 */
const getOtpText = (otp, ttl = 5) => `Dear User,

Greetings from ${BRAND}!

[QUICK SUMMARY]
• Verification OTP: ${otp}
• Purpose: Book My Train Account & Email Verification
• Validity: Expires in ${ttl} minutes (Single-use)

Your One-Time Password (OTP) for verification is: ${otp}

This code is valid for ${ttl} minutes. Do not share this code with anyone.

Security Notice:
• Book My Train staff will never ask for your verification code or password.
• If you did not request this OTP, please ignore this email.

Best Regards,
Support & Verification Team
${BRAND}
Support: ${SUPPORT_EMAIL}`;

const getWelcomeText = (name = 'Passenger') => `Dear ${name},

Greetings from ${BRAND}!

[QUICK SUMMARY]
• Account Status: Verified & Active
• User: ${name}
• Services Available: Railway Seat Availability, Instant PNR Booking, E-Tickets

Your email address has been verified and your Book My Train account is active.
Sign in at: ${APP_URL}/login

Best Regards,
Customer Experience Team
${BRAND}
Support: ${SUPPORT_EMAIL}`;

const getBookingConfirmedText = (data = {}) => `Dear ${data.firstName || 'Passenger'},

Greetings from ${BRAND}!

[QUICK SUMMARY]
• PNR Number: ${data.pnr || 'N/A'}
• Status: CONFIRMED
• Train: ${[data.trainNumber, data.trainName].filter(Boolean).join(' — ') || 'N/A'}
• Route: ${[data.fromStationName || data.from, data.toStationName || data.to].filter(Boolean).join(' to ') || 'N/A'}
• Journey Date: ${formatDate(data.departureDate || data.date)}
• Total Fare Paid: ${formatCurrency(data.totalAmount || data.amount)}
• E-Ticket: PDF attached

Your train booking has been confirmed.

PNR NUMBER: ${data.pnr || 'N/A'}
Booking Reference: ${data.bookingId || 'N/A'}
Train: ${[data.trainNumber, data.trainName].filter(Boolean).join(' — ') || 'N/A'}
Route: ${[data.fromStationName || data.from, data.toStationName || data.to].filter(Boolean).join(' to ') || 'N/A'}
Departure Date: ${formatDate(data.departureDate || data.date)}
Total Fare Paid: ${formatCurrency(data.totalAmount || data.amount)}

Important Travel Guidelines:
• Please carry an original government-issued photo ID during travel.
• Your official e-ticket PDF is attached to this email.
• Arrive at the station 30-45 minutes before departure.

Best Regards,
Reservation Desk
${BRAND}
Support: ${SUPPORT_EMAIL}`;

const getBookingFailedText = (data = {}) => `Dear ${data.firstName || 'Passenger'},

Greetings from ${BRAND}.

[QUICK SUMMARY]
• Booking ID: ${data.bookingId || 'N/A'}
• Status: NOT COMPLETED
• Refund: Full refund initiated to original payment source (3-5 business days)

Your booking (Reference: ${data.bookingId || 'N/A'}) was not completed.
If an amount was debited, it will be automatically refunded to your original payment method within 3 to 5 business days.

Best Regards,
Reservation Support
${BRAND}
Support: ${SUPPORT_EMAIL}`;

const getBookingCancelledText = (data = {}) => `Dear ${data.firstName || 'Passenger'},

Greetings from ${BRAND}.

[QUICK SUMMARY]
• Booking ID: ${data.bookingId || 'N/A'}
${data.pnr ? `• PNR Number: ${data.pnr}\n` : ''}• Status: CANCELLED
• Refund: ${Number(data.refundAmount) > 0 ? `${formatCurrency(data.refundAmount)} initiated` : 'No refund applicable'}

Your booking (Reference: ${data.bookingId || 'N/A'}${data.pnr ? `, PNR: ${data.pnr}` : ''}) has been cancelled.
Refund: ${Number(data.refundAmount) > 0 ? `${formatCurrency(data.refundAmount)} initiated.` : 'No refund applicable.'}

Best Regards,
Customer Support Desk
${BRAND}
Support: ${SUPPORT_EMAIL}`;

module.exports = {
  getOtpTemplate,
  getWelcomeTemplate,
  getTicketConfirmationTemplate,
  getBookingConfirmedTemplate,
  getBookingFailedTemplate,
  getBookingCancelledTemplate,
  getOtpText,
  getWelcomeText,
  getBookingConfirmedText,
  getBookingFailedText,
  getBookingCancelledText,
};
