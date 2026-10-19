const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env"), quiet: true });
const mongoose = require("mongoose");

async function migrate() {
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured.");
    await mongoose.connect(process.env.MONGODB_URI);
    if (mongoose.connection.name !== "Fashion_website") {
        throw new Error(`Connected to database "${mongoose.connection.name}"; expected "Fashion_website". No products were changed.`);
    }

    const products = mongoose.connection.collection("products");
    const result = await products.updateMany(
        { department: { $exists: true } },
        [
            {
                $set: {
                    headCategory: {
                        $cond: [
                            { $in: [{ $ifNull: ["$headCategory", ""] }, [""]] },
                            "$department",
                            "$headCategory",
                        ],
                    },
                },
            },
            { $unset: "department" },
        ],
    );
    console.log(`Migrated ${result.modifiedCount} product document(s).`);
}

migrate()
    .catch((error) => {
        console.error(`Migration failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
