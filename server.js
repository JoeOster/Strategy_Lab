import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
// server.js
import dotenv from "dotenv";
import express from "express";
dotenv.config();
// --- START: NEW API ROUTER IMPORT ---
import apiRouter from "./api/index.js";
import { getDb, initializeDatabase } from "./services/database.js";
// --- END: NEW API ROUTER IMPORT ---

const app = express();
// New logging middleware
app.use((req, res, next) => {
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
	next();
});
const PORT = process.env.PORT || 8080;
// In your main server file (e.g., server.js or index.js)

// ... after const app = express();

// Middleware to disable caching for all API routes
app.use("/api", (req, res, next) => {
	res.set("Cache-Control", "no-store");
	next();
});

// ... rest of your routes and app.listen()

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to log requests
app.use((req, res, next) => {
	// Check for .gemini/tmp directory and create it if it doesn't exist
	const logDir = path.join(__dirname, ".gemini", "tmp");
	if (!fs.existsSync(logDir)) {
		fs.mkdirSync(logDir, { recursive: true });
	}
	fs.appendFileSync(
		path.join(logDir, "request_log.txt"),
		`Request URL: ${req.url}\n`,
	);
	next();
});

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
// ADDED: Explicitly list extensions to help Express's static middleware correctly serve modules.
app.use(
	express.static(path.join(__dirname, "public"), {
		extensions: ["html", "htm", "js", "css"],
	}),
);

// --- START: MOUNT API ROUTER ---
// All API routes are now handled by the apiRouter
app.use("/api", apiRouter);
// --- END: MOUNT API ROUTER ---

// --- ALL app.get('/api...'), app.post('/api...') routes are now REMOVED ---

// Catch-all for HTML5 pushState routing
app.get("*", (req, res, next) => {
	if (req.method === "GET" && !req.path.includes(".")) {
		const indexPath = path.join(__dirname, "public", "index.html");
		fs.readFile(indexPath, "utf8", (err, html) => {
			if (err) {
				console.error("Error reading index.html:", err);
				return res.status(500).send("Error loading the application.");
			}

			const isDevMode = process.env.NODE_ENV === "development";
			const scriptToInject = `<script>window.IS_DEV_MODE = ${isDevMode};</script>`;
			const modifiedHtml = html.replace(
				"<body>",
				`<body>\n  ${scriptToInject}`,
			);
			res.send(modifiedHtml);
		});
	} else {
		next();
	}
});

const startServer = async () => {
	try {
		// Wait for the database to be fully initialized and migrated before starting the server
		await initializeDatabase();
		console.log("Database connection and migrations successful.");

		app.listen(PORT, () => {
			console.log(`Server is running on http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error("Failed to initialize database:", error);
		process.exit(1);
	}
};

const gracefulShutdown = async () => {
	console.log("\nReceived shutdown signal.");
	const db = await getDb();
	if (db) {
		await db.close();
		console.log("Database connection closed.");
	}
	process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

startServer();
