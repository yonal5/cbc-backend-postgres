import db from "../lib/db.js";

const User = {
    async create({
        email,
        firstName,
        lastName,
        password,
        role = "user",
        isBlock = false,
        isEmailVerified = false,
        image = "/user.png",
    }) {
        const result = await db.query(
            `INSERT INTO users
                (
                    email,
                    first_name,
                    last_name,
                    password,
                    role,
                    is_block,
                    is_email_verified,
                    image
                )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING
                id,
                email,
                first_name AS "firstName",
                last_name AS "lastName",
                password,
                role,
                is_block AS "isBlock",
                is_email_verified AS "isEmailVerified",
                image`,
            [
                email,
                firstName,
                lastName,
                password,
                role,
                isBlock,
                isEmailVerified,
                image,
            ]
        );

        return result.rows[0];
    },

    async findByEmail(email) {
        const result = await db.query(
            `SELECT
                id,
                email,
                first_name AS "firstName",
                last_name AS "lastName",
                password,
                role,
                is_block AS "isBlock",
                is_email_verified AS "isEmailVerified",
                image
             FROM users
             WHERE email = $1
             LIMIT 1`,
            [email]
        );

        return result.rows[0] || null;
    },

    async findById(id) {
        const result = await db.query(
            `SELECT
                id,
                email,
                first_name AS "firstName",
                last_name AS "lastName",
                password,
                role,
                is_block AS "isBlock",
                is_email_verified AS "isEmailVerified",
                image
             FROM users
             WHERE id = $1
             LIMIT 1`,
            [id]
        );

        return result.rows[0] || null;
    },

    async findAll() {
        const result = await db.query(
            `SELECT
                id,
                email,
                first_name AS "firstName",
                last_name AS "lastName",
                role,
                is_block AS "isBlock",
                is_email_verified AS "isEmailVerified",
                image
             FROM users
             ORDER BY id DESC`
        );

        return result.rows;
    },

    async countAll() {
        const result = await db.query(
            `SELECT COUNT(*)::int AS count
             FROM users`
        );

        return result.rows[0]?.count ?? 0;
    },

    async updateById(id, fields) {
        const allowedFields = {
            email: "email",
            firstName: "first_name",
            lastName: "last_name",
            password: "password",
            role: "role",
            isBlock: "is_block",
            isEmailVerified: "is_email_verified",
            image: "image",
        };

        const updates = [];
        const values = [];
        let index = 1;

        for (const [key, value] of Object.entries(fields)) {
            if (allowedFields[key] !== undefined) {
                updates.push(`${allowedFields[key]} = $${index}`);
                values.push(value);
                index++;
            }
        }

        if (updates.length === 0) {
            return await this.findById(id);
        }

        values.push(id);

        const result = await db.query(
            `UPDATE users
             SET ${updates.join(", ")}
             WHERE id = $${index}
             RETURNING
                id,
                email,
                first_name AS "firstName",
                last_name AS "lastName",
                role,
                is_block AS "isBlock",
                is_email_verified AS "isEmailVerified",
                image`,
            values
        );

        return result.rows[0] || null;
    },

    async updateByEmail(email, fields) {
        const allowedFields = {
            email: "email",
            firstName: "first_name",
            lastName: "last_name",
            password: "password",
            role: "role",
            isBlock: "is_block",
            isEmailVerified: "is_email_verified",
            image: "image",
        };

        const updates = [];
        const values = [];
        let index = 1;

        for (const [key, value] of Object.entries(fields)) {
            if (allowedFields[key] !== undefined) {
                updates.push(`${allowedFields[key]} = $${index}`);
                values.push(value);
                index++;
            }
        }

        if (updates.length === 0) {
            return await this.findByEmail(email);
        }

        values.push(email);

        const result = await db.query(
            `UPDATE users
             SET ${updates.join(", ")}
             WHERE email = $${index}
             RETURNING
                id,
                email,
                first_name AS "firstName",
                last_name AS "lastName",
                role,
                is_block AS "isBlock",
                is_email_verified AS "isEmailVerified",
                image`,
            values
        );

        return result.rows[0] || null;
    },

    async deleteById(id) {
        const result = await db.query(
            `DELETE FROM users
             WHERE id = $1
             RETURNING id, email`,
            [id]
        );

        return result.rows[0] || null;
    },
};

export default User;
