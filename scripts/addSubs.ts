import mongoose from "mongoose";
import Subtitle from "../models/subtitle-model"; // Adjust the path if needed
import connectDB from "../config/database"; // Adjust the path if needed

async function populateSubtitles() {
	try {
		await connectDB(); // Connect to the database

		// Example subtitle entries
		const subtitles = [
			{
				movieTitle: "Dune.Part.Two.2024.1080p.WEBRip.x264.AAC-[YTS.MX]",
				path: "Dune Part Two (2024) [1080p] [WEBRip] [YTS.MX]\\Dune.Part.Two.2024.1080p.WEBRip.x264.AAC-[YTS.MX].srt",
				language: "en",
			},
			{
				movieTitle: "test",
				path: "test.srt",
				language: "en",
			},
		];

		// Insert the subtitles into the database
		await Subtitle.insertMany(subtitles);

		console.log("Subtitles populated successfully!");
	} catch (err) {
		console.error("Error populating subtitles:", err);
	} finally {
		mongoose.disconnect(); // Disconnect from the database
	}
}

populateSubtitles();