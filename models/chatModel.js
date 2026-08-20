import db from "../lib/db.js";

const selectChatColumns = `
    id,
    id AS "_id",
    guest_id AS "guestId",
    guest_id AS "userId",
    customer_name AS "customerName",
    sender,
    message,
    image_url AS "imageUrl",
    type,
    is_read AS "isRead",
    created_at AS "createdAt",
    created_at AS "updatedAt"
`;

const Chat = {
    async create({
        guestId,
        customerName,
        sender,
        message,
        imageUrl,
        type,
        isRead = false
    }) {
        const result = await db.query(
            `INSERT INTO chats
            (guest_id, customer_name, sender, message, image_url, type, is_read)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING ${selectChatColumns}`,
            [
                guestId,
                customerName,
                sender,
                message,
                imageUrl,
                type,
                isRead
            ]
        );

        return result.rows[0];
    },

    async findById(id) {
        const result = await db.query(
            `SELECT ${selectChatColumns}
             FROM chats
             WHERE id = $1`,
            [id]
        );

        return result.rows[0] || null;
    },

    async findByGuestId(guestId) {
        const result = await db.query(
            `SELECT ${selectChatColumns}
             FROM chats
             WHERE guest_id = $1
             ORDER BY created_at ASC`,
            [guestId]
        );

        return result.rows;
    },

    async markCustomerMessagesRead(guestId) {
        await db.query(
            `UPDATE chats
             SET is_read = true
             WHERE guest_id = $1
             AND sender = 'customer'
             AND is_read = false`,
            [guestId]
        );
    },

    async deleteById(id) {
        const result = await db.query(
            `DELETE FROM chats
             WHERE id = $1
             RETURNING id`,
            [id]
        );

        return result.rows[0] || null;
    },

    async listCustomers() {
        const result = await db.query(
            `SELECT
                guest_id AS "userId",
                guest_id AS "guestId",
                MAX(customer_name) AS "customerName",
                COUNT(*) FILTER (
                    WHERE sender = 'customer'
                    AND is_read = false
                ) AS "unreadCount",
                COUNT(*) FILTER (
                    WHERE sender = 'customer'
                    AND is_read = false
                ) AS "count"
             FROM chats
             GROUP BY guest_id
             ORDER BY MAX(created_at) DESC`
        );

        return result.rows.map(customer => ({
            userId: customer.userId,
            guestId: customer.guestId,
            customerName: customer.customerName || customer.userId,
            unreadCount: Number(customer.unreadCount),
            count: Number(customer.count)
        }));
    },

    async countAll() {
        const result = await db.query(
            `SELECT COUNT(*)::int AS count
             FROM chats`
        );

        return result.rows[0]?.count ?? 0;
    }
};

export default Chat;
