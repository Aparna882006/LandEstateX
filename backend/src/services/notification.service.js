const Notification = require("../models/Notification.model");

/**
 * notification.service.js
 * Central place to create in-app notifications. Kept synchronous/DB-only for now;
 * swap the `emit` internals later to also push over sockets/push/email without
 * touching every controller that calls this.
 */

/**
 * @param {Object} params
 * @param {string} params.recipient - User ObjectId to notify
 * @param {string} params.type - one of Notification.type enum
 * @param {string} params.title
 * @param {string} params.message
 * @param {Object} [params.relatedEntity] - { entityType, entityId }
 * @param {string} [params.actionUrl]
 */
const createNotification = async ({ recipient, type, title, message, relatedEntity = null, actionUrl = null }) => {
  return Notification.create({
    recipient,
    type,
    title,
    message,
    relatedEntity,
    actionUrl,
  });
};

/** Convenience wrapper for firing multiple notifications (e.g. broker + admin) without failing the caller if one fails. */
const createNotifications = async (notificationsArray = []) => {
  const results = await Promise.allSettled(notificationsArray.map((n) => createNotification(n)));
  return results;
};

module.exports = {
  createNotification,
  createNotifications,
};
