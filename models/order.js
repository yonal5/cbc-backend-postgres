import db from "../lib/db.js";

const Order = {
    async create({
        orderID,
        items,
        customerName,
        email,
        phone,
        address,
        total,
        status = "Pending"
    }) {
        const client = await db.connect();

        try {
            await client.query("BEGIN");

            const orderResult = await client.query(
                `INSERT INTO orders
                (order_id, customer_name, email, phone, address, total, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
                [
                    orderID,
                    customerName,
                    email,
                    phone,
                    address,
                    total,
                    status
                ]
            );

            const order = orderResult.rows[0];

            for (const item of items) {
                await client.query(
                    `INSERT INTO order_items
                    (order_id, product_id, name, price, quantity, image)
                    VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        order.id,
                        item.productID,
                        item.name,
                        item.price,
                        item.quantity,
                        item.image
                    ]
                );
            }

            await client.query("COMMIT");

            return await this.findById(order.id);

        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    },

    async findById(id) {
        const orderResult = await db.query(
            `SELECT
                id,
                order_id AS "orderID",
                customer_name AS "customerName",
                email,
                phone,
                address,
                total,
                status,
                created_at AS "createdAt",
                created_at AS "updatedAt"
             FROM orders
             WHERE id = $1`,
            [id]
        );

        if (!orderResult.rows[0]) {
            return null;
        }

        const order = orderResult.rows[0];

        const itemsResult = await db.query(
            `SELECT
                product_id AS "productID",
                name,
                price,
                quantity,
                image
             FROM order_items
             WHERE order_id = $1
             ORDER BY id`,
            [id]
        );

        order.items = itemsResult.rows;

        return order;
    },

    async findByOrderID(orderID) {
        const result = await db.query(
            `SELECT
                id,
                order_id AS "orderID",
                customer_name AS "customerName",
                email,
                phone,
                address,
                total,
                status,
                created_at AS "createdAt",
                created_at AS "updatedAt"
             FROM orders
             WHERE order_id = $1
             LIMIT 1`,
            [orderID]
        );

        if (!result.rows[0]) {
            return null;
        }

        const order = result.rows[0];

        const items = await db.query(
            `SELECT
                product_id AS "productID",
                name,
                price,
                quantity,
                image
             FROM order_items
             WHERE order_id = $1
             ORDER BY id`,
            [order.id]
        );

        order.items = items.rows;

        return order;
    },

    async findAll() {
        const result = await db.query(
            `SELECT
                id,
                order_id AS "orderID",
                customer_name AS "customerName",
                email,
                phone,
                address,
                total,
                status,
                created_at AS "createdAt",
                created_at AS "updatedAt"
             FROM orders
             ORDER BY created_at DESC`
        );

        for (const order of result.rows) {
            const items = await db.query(
                `SELECT
                    product_id AS "productID",
                    name,
                    price,
                    quantity,
                    image
                 FROM order_items
                 WHERE order_id = $1
                 ORDER BY id`,
                [order.id]
            );

            order.items = items.rows;
        }

        return result.rows;
    },

    async updateStatus(orderID, status) {
        const result = await db.query(
            `UPDATE orders
             SET status = $1
             WHERE order_id = $2
             RETURNING
                id,
                order_id AS "orderID",
                customer_name AS "customerName",
                email,
                phone,
                address,
                total,
                status,
                created_at AS "createdAt",
                created_at AS "updatedAt"`,
            [status, orderID]
        );

        return result.rows[0] || null;
    }
};

export default Order;
