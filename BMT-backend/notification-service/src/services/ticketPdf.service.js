const PDFDocument = require('pdfkit');

const COLORS = {
     ink: '#17324D',
     muted: '#64748B',
     teal: '#008F73',
     pale: '#F2F8F7',
     border: '#DCE7E8',
     white: '#FFFFFF',
     green: '#147A54',
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function display(value, fallback = 'Not provided') {
     return value === undefined || value === null || String(value).trim() === ''
          ? fallback
          : String(value);
}

function formatDate(value) {
     if (!value) return 'To be confirmed';
     const date = new Date(value);
     if (Number.isNaN(date.getTime())) return String(value);
     return new Intl.DateTimeFormat('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC',
     }).format(date);
}

function formatCurrency(value) {
     const amount = Number(value);
     return Number.isFinite(amount)
          ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)
          : 'To be confirmed';
}

function drawSectionTitle(doc, title, y) {
     doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(11).text(title, MARGIN, y);
     doc.moveTo(MARGIN, y + 19).lineTo(PAGE_WIDTH - MARGIN, y + 19)
          .strokeColor(COLORS.border).lineWidth(1).stroke();
     return y + 30;
}

function drawTicketHeader(doc) {
     doc.rect(0, 0, PAGE_WIDTH, 133).fill(COLORS.ink);
     doc.rect(0, 130, PAGE_WIDTH, 3).fill(COLORS.teal);

     doc.fillColor(COLORS.white).font('Helvetica-Bold').fontSize(21)
          .text('BOOK MY TRAIN', MARGIN, 34);
     doc.fillColor('#D8E7F0').font('Helvetica').fontSize(9)
          .text('YOUR TRAIN JOURNEY, MADE SIMPLE', MARGIN, 62);
     doc.fillColor(COLORS.white).font('Helvetica-Bold').fontSize(10)
          .text('E-TICKET  |  PASSENGER COPY', PAGE_WIDTH - MARGIN - 190, 43, {
               width: 190,
               align: 'right',
          });
}

function drawPassengerTable(doc, passengers, seats, startY) {
     const columns = [
          { title: 'PASSENGER', x: MARGIN + 12, width: 190 },
          { title: 'AGE / GENDER', x: MARGIN + 207, width: 90 },
          { title: 'SEAT', x: MARGIN + 306, width: 70 },
          { title: 'CLASS', x: MARGIN + 383, width: 80 },
     ];
     const tableWidth = CONTENT_WIDTH;
     const rowHeight = 34;
     const rows = passengers.length > 0 ? passengers : [{}];
     let y = startY;

     doc.roundedRect(MARGIN, y, tableWidth, 30, 6).fill(COLORS.pale);
     columns.forEach((column) => {
          doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(7)
               .text(column.title, column.x, y + 11, { width: column.width });
     });
     y += 30;

     rows.forEach((passenger, index) => {
          if (y + rowHeight > PAGE_HEIGHT - 92) {
               doc.addPage({ size: 'A4', margin: MARGIN });
               drawTicketHeader(doc);
               y = 158;
               doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(10)
                    .text('PASSENGERS (CONTINUED)', MARGIN, y);
               y += 22;
          }

          const seat = seats.find((item) => item.seatNumber === passenger.seatNumber)
               || seats[index]
               || {};
          const ageGender = [
               passenger.age !== undefined && passenger.age !== null ? `${passenger.age} yrs` : null,
               passenger.gender,
          ].filter(Boolean).join(' / ') || '—';
          const rowY = y + 10;

          if (index % 2 === 1) {
               doc.rect(MARGIN, y, tableWidth, rowHeight).fill('#FAFCFD');
          }

          doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(9)
               .text(display(passenger.name, 'Passenger'), columns[0].x, rowY, { width: columns[0].width });
          doc.fillColor(COLORS.muted).font('Helvetica').fontSize(8)
               .text(ageGender, columns[1].x, rowY, { width: columns[1].width });
          doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(8)
               .text(display(passenger.seatNumber || seat.seatNumber, '—'), columns[2].x, rowY, { width: columns[2].width });
          doc.fillColor(COLORS.muted).font('Helvetica').fontSize(8)
               .text(display(passenger.seatType || seat.seatType, '—'), columns[3].x, rowY, { width: columns[3].width });
          y += rowHeight;
     });

     return y;
}

function createTicketPdf(data = {}) {
     return new Promise((resolve, reject) => {
          const doc = new PDFDocument({
               size: 'A4',
               margins: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
               info: {
                    Title: `Book My Train e-ticket ${display(data.pnr || data.bookingId, '')}`,
                    Author: 'Book My Train',
                    Subject: 'Train journey booking confirmation',
               },
          });
          const chunks = [];

          doc.on('data', (chunk) => chunks.push(chunk));
          doc.on('error', reject);
          doc.on('end', () => resolve(Buffer.concat(chunks)));

          drawTicketHeader(doc);

          let y = 153;
          doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 83, 9)
               .fillAndStroke(COLORS.white, COLORS.border);
          doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(7)
               .text('BOOK MY TRAIN REFERENCE', MARGIN + 16, y + 14);
          doc.fillColor(COLORS.teal).font('Helvetica-Bold').fontSize(22)
               .text(display(data.pnr, 'Pending'), MARGIN + 16, y + 31, { width: 300 });
          doc.roundedRect(PAGE_WIDTH - MARGIN - 116, y + 26, 100, 25, 12)
               .fill('#E8F5EF');
          doc.fillColor(COLORS.green).font('Helvetica-Bold').fontSize(8)
               .text(display(data.status, 'CONFIRMED'), PAGE_WIDTH - MARGIN - 112, y + 34, {
                    width: 92,
                    align: 'center',
               });
          y += 105;

          y = drawSectionTitle(doc, 'JOURNEY DETAILS', y);
          const gap = 22;
          const columnWidth = (CONTENT_WIDTH - gap) / 2;
          const rightX = MARGIN + columnWidth + gap;
          const from = display(data.fromStationName, 'Boarding station to be confirmed');
          const to = display(data.toStationName, 'Destination to be confirmed');

          doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(7)
               .text('FROM', MARGIN, y);
          doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(7)
               .text('TO', rightX, y);
          doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(10)
               .text(from, MARGIN, y + 13, { width: columnWidth, height: 30, ellipsis: true });
          doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(10)
               .text(to, rightX, y + 13, { width: columnWidth, height: 30, ellipsis: true });
          y += 53;

          doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(7)
               .text('TRAIN', MARGIN, y);
          doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(7)
               .text('JOURNEY DATE', rightX, y);
          doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(9)
               .text(`${display(data.trainNumber, '—')}  ${display(data.trainName, 'Train details to be confirmed')}`, MARGIN, y + 13, {
                    width: columnWidth,
                    height: 30,
                    ellipsis: true,
               });
          doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(9)
               .text(formatDate(data.departureDate), rightX, y + 13, { width: columnWidth });
          y += 53;

          y = drawSectionTitle(doc, 'PASSENGER DETAILS', y);
          y = drawPassengerTable(doc, data.passengers || [], data.seats || [], y);
          y += 12;

          if (y + 96 > PAGE_HEIGHT - MARGIN) {
               doc.addPage({ size: 'A4', margin: MARGIN });
               drawTicketHeader(doc);
               y = 158;
          }

          doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 58, 8).fill(COLORS.pale);
          doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(8)
               .text('TOTAL PAID', MARGIN + 14, y + 14);
          doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(16)
               .text(formatCurrency(data.totalAmount), MARGIN + 14, y + 29);
          doc.fillColor(COLORS.muted).font('Helvetica').fontSize(8)
               .text(`Booking reference: ${display(data.bookingId, '—')}`, MARGIN + 245, y + 23, {
                    width: CONTENT_WIDTH - 260,
                    align: 'right',
                    ellipsis: true,
               });
          y += 76;

          doc.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y)
               .strokeColor(COLORS.border).lineWidth(1).stroke();
          doc.fillColor(COLORS.muted).font('Helvetica').fontSize(8)
               .text('This passenger copy contains your Book My Train booking details. Carry valid photo identification for your journey.', MARGIN, y + 12, {
                    width: CONTENT_WIDTH,
                    align: 'left',
               });
          doc.fillColor(COLORS.teal).font('Helvetica-Bold').fontSize(8)
               .text('Thank you for booking with Book My Train.', MARGIN, y + 34, {
                    width: CONTENT_WIDTH,
                    align: 'center',
               });

          doc.end();
     });
}

module.exports = { createTicketPdf };
