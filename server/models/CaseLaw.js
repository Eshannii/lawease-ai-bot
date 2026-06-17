import mongoose from "mongoose";

const caseLawSchema = new mongoose.Schema({
  source_file: String,
  case_no: String,
  court: String,
  date_of_judgment: Date,
  full_text: String,
  judges: [String],
  reported_as: [String],
  result: String,
  title: String,
  year: Number,
  created_at: Date,
});

// Text index for keyword search. Title ko zyada weight diya hai
// taake title match full_text match se zyada relevant maana jaye.
caseLawSchema.index(
  { title: "text", full_text: "text" },
  { weights: { title: 5, full_text: 1 } },
);

export default mongoose.model("CaseLaw", caseLawSchema, "cases");
