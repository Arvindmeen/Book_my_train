const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "../.env"),
});

console.log("========== ENV CHECK ==========");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded ✅" : "Not Loaded ❌");
console.log("KAFKA_BROKER:", process.env.KAFKA_BROKER);
console.log("===============================");

const emailConsumer = require("./kafka/consumer/email.consumer");
const logger = require("./config/logger");

async function startNotificationService() {
    try {
        logger.info("Starting Notification Service...");

        if (!process.env.KAFKA_BROKER) {
            throw new Error("Missing required environment variable: KAFKA_BROKER");
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            logger.warn("⚠️ EMAIL_USER or EMAIL_PASS not set. Notification service will log simulated emails instead of sending live messages.");
        }

        await emailConsumer.start();

        logger.info("✅ Notification Service started successfully");
        logger.info("Service is ready to process notifications");
    } catch (error) {
        console.error("\n========= FULL ERROR =========");
        console.error(error);
        console.error(error.stack);
        console.error("==============================\n");

        logger.error("Failed to start Notification Service", {
            error: error.message,
            stack: error.stack,
        });

        process.exit(1);
    }
}

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
});

startNotificationService();
