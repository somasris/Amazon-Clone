function buildOrderPlacedMessage(orderId) {
  return `Order #${orderId} placed and waiting for admin review.`;
}

function buildOrderStatusChangedMessage({
  orderId,
  fromStatus,
  toStatus,
  delayReason = null,
  etaDays = null,
}) {
  const reasonPart = delayReason ? ` Reason: ${delayReason}` : "";
  const etaPart = Number.isInteger(Number(etaDays)) && Number(etaDays) > 0 ? ` ETA: ${etaDays} day(s).` : "";
  return `Order #${orderId} status changed from ${fromStatus} to ${toStatus}.${etaPart}${reasonPart}`;
}

function buildAdminOrderEmail({
  orderId,
  userName,
  userEmail,
  productName,
  quantity,
}) {
  return {
    subject: `New order request #${orderId}`,
    text: [
      `A new order requires admin review.`,
      `Order ID: ${orderId}`,
      `Customer: ${userName || "N/A"} (${userEmail})`,
      `Product: ${productName}`,
      `Quantity: ${quantity}`,
      `Current status: pending`,
    ].join("\n"),
  };
}

module.exports = {
  buildOrderPlacedMessage,
  buildOrderStatusChangedMessage,
  buildAdminOrderEmail,
};
