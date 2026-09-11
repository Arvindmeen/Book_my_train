const nodemailer = require("nodemailer");
const logger = require("../config/logger");
const { config } = require("../config");
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

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
    },
});

class EmailService {
    constructor() {
        this.from = config.EMAIL_USER || "no-reply@bookmytrain.local";
        this.maxRetries = 3;
    }

    async sendWithRetry(msg, retries = 0) {
        if (!config.EMAIL_USER || !config.EMAIL_PASS) {
            logger.warn(`Email sending simulated (EMAIL_USER or EMAIL_PASS not configured): to=${msg.to}, subject=${msg.subject}`);
            return { success: true, simulated: true };
        }

        try {
            await transporter.sendMail(msg);
            logger.info(`Email sent successfully to ${msg.to}`, {
                subject: msg.subject,
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

    async sendOtpEmail(email, otp, ttlMinutes) {
        return this.sendWithRetry({
            from: this.from,
            to: email,
            subject: "Your Book My Train Verification Code",
            html: getOtpTemplate(otp, ttlMinutes),
            text: getOtpText(otp, ttlMinutes),
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
        return this.sendWithRetry({
            from: this.from,
            to: email,
            subject: `Booking Confirmed - ${bookingData.trainName || "Your Train Ticket"}`,
            html: getBookingConfirmedTemplate(bookingData),
            text: getBookingConfirmedText(bookingData),
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
