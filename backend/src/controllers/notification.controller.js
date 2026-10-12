const Notification = require('../models/Notification');

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.error('getMyNotifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findOneAndUpdate({ _id: id, userId: req.user.id }, { isRead: true });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('markAsRead error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('markAllAsRead error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};
