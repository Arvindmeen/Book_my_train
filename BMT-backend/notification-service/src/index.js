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

        // Required environment variables
        const requiredEnvVars = [
            "EMAIL_USER",
            "EMAIL_PASS",
            "KAFKA_BROKER",
        ];

        const missing = requiredEnvVars.filter(
            (varName) => !process.env[varName]
        );

        if (missing.length > 0) {
            throw new Error(
                `Missing required environment variables: ${missing.join(", ")}`
            );
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
    console.error(reason);
});

process.on("uncaughtException", (error) => {
    console.error(error);
    process.exit(1);
});

startNotificationService();
// Nodemon restart trigger at 2026-09-10T13:47:00.000Z
