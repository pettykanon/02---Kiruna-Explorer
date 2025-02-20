// --- Imports ---
import express from "express";
import morgan from "morgan";
import cors from "cors";

import passport from "passport";
import session from "express-session";

import authRoutes from "./auth/authRoutes.mjs";
import DocumentRoutes from "./routes/DocumentRoutes.mjs";
import AreaRoutes from "./routes/AreaRoutes.mjs";
import DocumentTypeRoutes from "./routes/DocumentTypeRoutes.mjs";
import DocumentStakeholderRoutes from "./routes/DocumentStakeholderRoutes.mjs";

// --- Middlewares ---
const app = express();
app.use(morgan("dev"));
app.use(express.json());

// --- Session Configuration ---
app.use(
  session({
    secret: "Sic.Parvis.Magna", // Famous quote from Uncharted video game
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.authenticate("session"));

// --- CORS ---
const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

// --- Routes ---
app.use(authRoutes);
app.use('/api/documents', DocumentRoutes);
app.use('/api/areas', AreaRoutes);
app.use('/api/document-types', DocumentTypeRoutes);
app.use('/api/document-stakeholders', DocumentStakeholderRoutes);


// --- Server Activation ---
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}/`)
);

export { app };
