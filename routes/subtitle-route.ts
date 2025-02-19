import express, { Request, Response } from "express";
import Subtitle from "../models/subtitle-model";
import Movie from "../models/movie-model";
import { authenticateUser } from "./auth-route";
import path from "path";
import fs from "fs";
import { Config } from "../src/config";

const router = express.Router();

// Get all subtitles
router.get(
	"/subtitles",
	authenticateUser,
	async (req: Request, res: Response) => {
		try {
			const subtitles = await Subtitle.find();
			res.json(subtitles);
		} catch (error: unknown) {
			if (error instanceof Error) {
				res.status(500).json({ message: error.message });
			} else {
				res.status(500).json({ message: "An unknown error occurred" });
			}
		}
	}
);

// Get subtitles for a specific movie
router.get(
	"/subtitles/:movieTitle",
	authenticateUser,
	async (req: Request, res: Response) => {
		try {
			const movieTitle = decodeURIComponent(req.params.movieTitle);
			const subtitles = await Subtitle.find({ movieTitle });

			if (subtitles.length === 0) {
				return res
					.status(404)
					.json({ message: "No subtitles found for this movie" });
			}

			res.json(subtitles);
		} catch (error: unknown) {
			if (error instanceof Error) {
				res.status(500).json({ message: error.message });
			} else {
				res.status(500).json({ message: "An unknown error occurred" });
			}
		}
	}
);

// Get a specific subtitle file
router.get(
	"/subtitles/:movieTitle/:language",
	authenticateUser,
	async (req: Request, res: Response) => {
		try {
			const movieTitle = decodeURIComponent(req.params.movieTitle);
			const language = req.params.language;

			const subtitle = await Subtitle.findOne({ movieTitle, language });

			if (!subtitle) {
				return res.status(404).json({ message: "Subtitle not found" });
			}

			const baseDir = Config.torrentsDir;
			const fullPath = path.join(baseDir, subtitle.path);

			// Check if file exists
			if (fs.existsSync(fullPath)) {
				res.sendFile(fullPath);
			} else {
				res.status(404).json({
					message: "Subtitle file not found on disk",
				});
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				res.status(500).json({ message: error.message });
			} else {
				res.status(500).json({ message: "An unknown error occurred" });
			}
		}
	}
);

// Add a new subtitle
router.post(
	"/subtitles",
	authenticateUser,
	async (req: Request, res: Response) => {
		try {
			// Check if the movie exists
			const movie = await Movie.findOne({ title: req.body.movieTitle });
			if (!movie) {
				return res.status(404).json({ message: "Movie not found" });
			}

			const subtitle = new Subtitle({
				movieTitle: req.body.movieTitle,
				language: req.body.language,
				path: req.body.path,
			});

			const newSubtitle = await subtitle.save();
			res.status(201).json(newSubtitle);
		} catch (error: unknown) {
			if (error instanceof Error) {
				res.status(400).json({ message: error.message });
			} else {
				res.status(400).json({ message: "An unknown error occurred" });
			}
		}
	}
);

// Delete a subtitle
router.delete(
	"/subtitles/:id",
	authenticateUser,
	async (req: Request, res: Response) => {
		try {
			const subtitle = await Subtitle.findById(req.params.id);

			if (!subtitle) {
				return res.status(404).json({ message: "Subtitle not found" });
			}

			await Subtitle.findByIdAndDelete(req.params.id);
			res.json({ message: "Subtitle deleted" });
		} catch (error: unknown) {
			if (error instanceof Error) {
				res.status(500).json({ message: error.message });
			} else {
				res.status(500).json({ message: "An unknown error occurred" });
			}
		}
	}
);

export default router;
