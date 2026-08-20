import db from "../lib/db.js";

const OTP = {
    async create(data) {
        const { email, otp } = data;

        const result = await db.query(
            `INSERT INTO otps (email, otp)
             VALUES ($1, $2)
             RETURNING *`,
            [email, otp]
        );

        return result.rows[0];
    },

    async findOne(data) {
        const { email, otp } = data;

        let query = "SELECT * FROM otps WHERE email = $1";
        let values = [email];

        if (otp !== undefined) {
            query += " AND otp = $2";
            values.push(otp);
        }

        const result = await db.query(query, values);

        return result.rows[0] || null;
    },

    async deleteMany(data) {
        const { email } = data;

        await db.query(
            "DELETE FROM otps WHERE email = $1",
            [email]
        );
    }
};

export default OTP;