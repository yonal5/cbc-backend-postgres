import Chat from "../models/chatModel.js";

export const deleteMessage = async (req, res) => {
    try {
        const deleted = await Chat.deleteById(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                message: "Message not found"
            });
        }

        res.json({
            success: true
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Delete failed"
        });
    }
};


export const getCustomersForAdmin = async (req, res) => {
    try {
        const customers = await Chat.listCustomers();

        res.json(customers);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Failed to load customers"
        });
    }
};


export const getAdminMessages = async (req, res) => {
    const { guestId } = req.query;

    if (!guestId) {
        return res.status(400).json({
            message: "guestId missing"
        });
    }

    try {
        await Chat.markCustomerMessagesRead(guestId);

        const messages = await Chat.findByGuestId(guestId);

        res.json(messages);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Failed to load messages"
        });
    }
};


export const sendMessage = async (req, res) => {
    try {
        const {
            guestId,
            customerName,
            message,
            imageUrl,
            type
        } = req.body;

        const msg = await Chat.create({
            guestId,
            customerName,
            sender: "customer",
            message,
            imageUrl,
            type,
            isRead: false
        });

        res.status(201).json(msg);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Send failed"
        });
    }
};


export const getMessages = async (req, res) => {
    try {
        const { guestId } = req.query;

        if (!guestId) {
            return res.status(400).json({
                error: "guestId missing"
            });
        }

        const messages = await Chat.findByGuestId(guestId);

        res.json(messages);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Load failed"
        });
    }
};


export const listCustomers = async (req, res) => {
    try {
        const customers = await Chat.listCustomers();

        res.json(customers);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Failed to load customers"
        });
    }
};


export const getUnreadCustomers = async (req, res) => {
    try {
        const customers = await Chat.listCustomers();

        res.json(
            customers.map((customer) => ({
                guestId: customer.guestId || customer.userId,
                count: Number(customer.count ?? customer.unreadCount ?? 0),
            }))
        );

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Failed to load unread counts"
        });
    }
};


export const markMessagesSeen = async (req, res) => {
    try {
        const guestId = req.body?.guestId || req.query?.guestId;

        if (!guestId) {
            return res.status(400).json({
                message: "guestId missing"
            });
        }

        await Chat.markCustomerMessagesRead(guestId);

        res.json({
            message: "Messages marked as seen"
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Seen update failed"
        });
    }
};


export const adminGetMessages = async (req, res) => {
    try {
        const { guestId } = req.query;

        if (!guestId) {
            return res.status(400).json({
                message: "guestId missing"
            });
        }

        await Chat.markCustomerMessagesRead(guestId);

        const messages = await Chat.findByGuestId(guestId);

        res.json(messages);

    } catch (err) {
        console.error(err);

        res.status(500).json([]);
    }
};


export const adminSend = async (req, res) => {
    try {
        const {
            guestId,
            message,
            imageUrl,
            type,
            customerName
        } = req.body;

        const msg = await Chat.create({
            guestId,
            customerName: customerName || "Admin",
            sender: "admin",
            message,
            imageUrl,
            type,
            isRead: true
        });

        res.json(msg);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Admin send failed"
        });
    }
};
