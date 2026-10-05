const nodemailer = require("nodemailer");
const logger = require("../config/logger");
const { config } = require("../config");
const { createTicketPdf } = require("./ticketPdf.service");
const {
    getOtpTemplate,
    getWelcomeTemplate,
    getBookingConfirmedTemplate,
    getBookingFailedTemplate,
    getBookingCancelledTemplate,
    getOtpText,
    getWelcomeText,
    getBookingConfirmedText,
    getBookingFailedText,
    getBookingCancelledText,
} = require("../templates");

const cleanEmailPass = (config.EMAIL_PASS || "").replace(/\s+/g, "");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.EMAIL_USER,
        pass: cleanEmailPass,
    },
});

class EmailService {
    constructor() {
        const sender = config.EMAIL_USER || "teambookmytrain@gmail.com";
        this.from = `"Book My Train" <${sender}>`;
        this.replyTo = `"Book My Train Support" <${sender}>`;
        this.maxRetries = 3;
    }

    async sendWithRetry(msg, retries = 0) {
        if (!config.EMAIL_USER || !config.EMAIL_PASS) {
            logger.warn(`Email sending simulated (EMAIL_USER or EMAIL_PASS not configured): to=${msg.to}, subject=${msg.subject}`);
            return { success: true, simulated: true };
        }

        const finalMsg = {
            ...msg,
            replyTo: msg.replyTo || this.replyTo,
        };

        try {
            await transporter.sendMail(finalMsg);
            logger.info(`Email sent successfully to ${finalMsg.to}`, {
                subject: finalMsg.subject,
                attempt: retries + 1,
            });
            return { success: true };
        } catch (error) {
            logger.error(`Email sending failed (attempt ${retries + 1}/${this.maxRetries})`, {
                to: msg.to,
                error: error.message,
            });

            if (retries < this.maxRetries - 1) {
                const delay = Math.pow(2, retries) * 1000;
                await new Promise((resolve) => setTimeout(resolve, delay));
                return this.sendWithRetry(msg, retries + 1);
            }

            throw error;
        }
    }

    async sendOtpEmail(email, otp, ttlMinutes = 5) {
        return this.sendWithRetry({
            from: this.from,
            to: email,
            subject: `Your Book My Train verification code: ${otp}`,
            html: getOtpTemplate(otp, ttlMinutes),
            text: getOtpText(otp, ttlMinutes),
            headers: {
                'X-Entity-Ref-ID': `bmt-otp-${Date.now()}`,
            }
        });
    }

    async sendWelcomeEmail(email, firstName) {
        return this.sendWithRetry({
            from: this.from,
            to: email,
            subject: "Welcome to Book My Train",
            html: getWelcomeTemplate(firstName),
            text: getWelcomeText(firstName),
        });
    }

    async sendBookingConfirmedEmail(email, bookingData) {
        const pnrPrefix = bookingData.pnr ? `Ticket Confirmed | PNR: ${bookingData.pnr}` : 'Booking Confirmed';
        const ticketPdf = await createTicketPdf(bookingData);
        return this.sendWithRetry({
            from: this.from,
            to: email,
            subject: `${pnrPrefix} - ${bookingData.trainName || "Your Train Ticket"}`,
            html: getBookingConfirmedTemplate(bookingData),
            text: getBookingConfirmedText(bookingData),
            attachments: [{
                filename: `Book-My-Train-Ticket-${bookingData.pnr || bookingData.bookingId || 'confirmed'}.pdf`,
                content: ticketPdf,
                contentType: 'application/pdf',
            }],
        });
    }

    async sendBookingFailedEmail(email, bookingData) {
        return this.sendWithRetry({
            from: this.from,
            to: email,
            subject: "Booking Failed",
            html: getBookingFailedTemplate(bookingData),
            text: getBookingFailedText(bookingData),
        });
    }

    async sendBookingCancelledEmail(email, bookingData) {
        return this.sendWithRetry({
            from: this.from,
            to: email,
            subject: "Booking Cancelled",
            html: getBookingCancelledTemplate(bookingData),
            text: getBookingCancelledText(bookingData),
        });
    }
}

module.exports = new EmailService();
