export interface WhatsAppMessagePayload {
  toPhone: string;
  businessName: string;
  loginUrl: string;
  loginId: string;
  tempPassword?: string;
  type: "WELCOME_OWNER" | "WELCOME_STAFF" | "PASSWORD_RESET" | "RECEIPT_SUMMARY";
  receiptData?: {
    invoiceNumber: string;
    totalAmount: string;
    itemsCount: number;
  };
}

export class WhatsAppService {
  /**
   * Cleans and formats Sri Lankan and international phone numbers into E.164 without '+' for wa.me links
   * e.g., "0771234567" -> "94771234567", "+94 77 123 4567" -> "94771234567"
   */
  static formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) {
      return "94" + cleaned.substring(1);
    }
    if (cleaned.startsWith("94")) {
      return cleaned;
    }
    return cleaned;
  }

  /**
   * Generates a direct WhatsApp Web link with pre-filled message text (skips intermediate wa.me landing pages)
   */
  static generateDirectLink(payload: WhatsAppMessagePayload): string {
    const message = this.buildMessageText(payload);
    const phone = this.formatPhoneNumber(payload.toPhone);
    return `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
  }

  /**
   * Generates native Windows/Mac/Mobile app protocol URI
   */
  static generateAppUri(payload: WhatsAppMessagePayload): string {
    const message = this.buildMessageText(payload);
    const phone = this.formatPhoneNumber(payload.toPhone);
    return `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
  }

  /**
   * Builds localized, professional Sri Lankan business message templates
   */
  static buildMessageText(payload: WhatsAppMessagePayload): string {
    switch (payload.type) {
      case "WELCOME_OWNER":
        return (
          `🌟 *Welcome to Ticket2Grow Cloud!* 🚀\n\n` +
          `Your business account for *${payload.businessName}* has been successfully created.\n\n` +
          `🌐 *Login URL:* ${payload.loginUrl}\n` +
          `👤 *Login ID:* ${payload.loginId}\n` +
          `🔑 *Temporary Password:* ${payload.tempPassword}\n\n` +
          `⚠️ *Important:* You will be asked to set your own permanent password on your first login.\n\n` +
          `If you need any setup assistance or staff training, reply directly to this WhatsApp message.\n\n` +
          `_Empowering High-Growth Modern Businesses._`
        );

      case "WELCOME_STAFF":
        return (
          `👋 *Welcome to ${payload.businessName}!* 🏬\n\n` +
          `Your staff account has been created.\n\n` +
          `🌐 *Login URL:* ${payload.loginUrl}\n` +
          `👤 *Login ID:* ${payload.loginId}\n` +
          `🔑 *Temporary Password:* ${payload.tempPassword}\n\n` +
          `⚠️ Please change your password upon your first login.\n\n` +
          `_Ticket2Grow Cloud System_`
        );

      case "PASSWORD_RESET":
        return (
          `🔐 *Password Reset Notification - ${payload.businessName}*\n\n` +
          `A new temporary password has been generated for your account:\n\n` +
          `👤 *Login ID:* ${payload.loginId}\n` +
          `🔑 *New Temporary Password:* ${payload.tempPassword}\n` +
          `🌐 *Login URL:* ${payload.loginUrl}\n\n` +
          `Please log in and choose a new secure password.`
        );

      case "RECEIPT_SUMMARY":
        return (
          `🧾 *Receipt from ${payload.businessName}*\n\n` +
          `Invoice Number: *${payload.receiptData?.invoiceNumber}*\n` +
          `Items: ${payload.receiptData?.itemsCount}\n` +
          `Total Paid: *${payload.receiptData?.totalAmount}*\n\n` +
          `Thank you for shopping with us! Please come again. 🙏`
        );

      default:
        return `Hello from ${payload.businessName}! Login ID: ${payload.loginId}`;
    }
  }

  /**
   * Future Integration: Direct WhatsApp Cloud API dispatcher
   */
  static async sendViaCloudApi(payload: WhatsAppMessagePayload): Promise<{ success: boolean; error?: string }> {
    const apiUrl = process.env.WHATSAPP_API_URL;
    const apiToken = process.env.WHATSAPP_API_TOKEN;

    if (!apiUrl || !apiToken) {
      // Cloud API not configured - fallback to wa.me links
      return { success: false, error: "WhatsApp Cloud API not configured. Use direct wa.me link." };
    }

    try {
      // Clean interface ready for official Meta/WhatsApp Cloud API
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: this.formatPhoneNumber(payload.toPhone),
          type: "text",
          text: { body: this.buildMessageText(payload) },
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        return { success: false, error: err };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || "Failed to send WhatsApp message" };
    }
  }
}
