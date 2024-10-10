import express, { Application } from "express";
import cors from "cors";
import router from "./app/routes";
import notFoundRouteHandler from "./app/middlewares/notFoundRouteHandler";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";

const app: Application = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL,
    credentials: true,
  }),
);

app.use("/api", router);

app.get("/", (req, res) => {
  res.status(200).json({
    success: "true",
    message: "Welcome to API",
  });
});

app.use(notFoundRouteHandler);
app.use(globalErrorHandler);

export default app;
