import db from "../lib/db.js";

const Product = {
    async create({
        productID,
        name,
        altNames = [],
        description,
        images = [],
        price,
        labelledPrice,
        category,
        stock = 0
    }) {
        const result = await db.query(
            `INSERT INTO products
            (
                product_id,
                name,
                alt_names,
                description,
                images,
                price,
                labelled_price,
                category,
                stock
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING
                id,
                product_id AS "productID",
                name,
                alt_names AS "altNames",
                description,
                images,
                price,
                labelled_price AS "labelledPrice",
                category,
                stock`,
            [
                productID,
                name,
                altNames,
                description,
                images,
                price,
                labelledPrice,
                category,
                stock
            ]
        );

        return result.rows[0];
    },

    async findAll() {
        const result = await db.query(
            `SELECT
                id,
                product_id AS "productID",
                name,
                alt_names AS "altNames",
                description,
                images,
                price,
                labelled_price AS "labelledPrice",
                category,
                stock
             FROM products
             ORDER BY id DESC`
        );

        return result.rows;
    },

    async findOne(productID) {
        const result = await db.query(
            `SELECT
                id,
                product_id AS "productID",
                name,
                alt_names AS "altNames",
                description,
                images,
                price,
                labelled_price AS "labelledPrice",
                category,
                stock
             FROM products
             WHERE product_id = $1
             LIMIT 1`,
            [productID]
        );

        return result.rows[0] || null;
    },

    async update(productID, data) {
        const allowedFields = {
            name: "name",
            altNames: "alt_names",
            description: "description",
            images: "images",
            price: "price",
            labelledPrice: "labelled_price",
            category: "category",
            stock: "stock"
        };

        const updates = [];
        const values = [];
        let index = 1;

        for (const [key, value] of Object.entries(data)) {
            if (allowedFields[key]) {
                updates.push(`${allowedFields[key]} = $${index}`);
                values.push(value);
                index++;
            }
        }

        if (updates.length === 0) {
            return await this.findOne(productID);
        }

        values.push(productID);

        const result = await db.query(
            `UPDATE products
             SET ${updates.join(", ")}
             WHERE product_id = $${index}
             RETURNING
                id,
                product_id AS "productID",
                name,
                alt_names AS "altNames",
                description,
                images,
                price,
                labelled_price AS "labelledPrice",
                category,
                stock`,
            values
        );

        return result.rows[0] || null;
    },

    async delete(productID) {
        const result = await db.query(
            `DELETE FROM products
             WHERE product_id = $1
             RETURNING product_id AS "productID"`,
            [productID]
        );

        return result.rows[0] || null;
    },

    async updateOne(filter, data) {
        const productID = typeof filter === "object"
            ? filter.productID
            : filter;

        return await this.update(productID, data);
    },

    async deleteOne(filter) {
        const productID = typeof filter === "object"
            ? filter.productID
            : filter;

        return await this.delete(productID);
    }
};

export default Product;
