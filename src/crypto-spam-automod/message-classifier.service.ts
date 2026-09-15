import path from "node:path";
import { Injectable } from "@nestjs/common";
import type { Attachment, Message } from "discord.js";
import { AUTOMOD } from "./automod.constants";

const IMAGE_EXTENSIONS = new Set([
  ".avif",
  ".bmp",
  ".gif",
  ".heic",
  ".heif",
  ".jpeg",
  ".jpg",
  ".png",
  ".tif",
  ".tiff",
  ".webp",
]);

@Injectable()
export class MessageClassifier {
  isImageAttachment(attachment: Pick<Attachment, "contentType" | "name">) {
    if (attachment.contentType?.toLowerCase().startsWith("image/")) return true;
    return IMAGE_EXTENSIONS.has(path.extname(attachment.name || "").toLowerCase());
  }

  isQualifyingImageMessage(message: Pick<Message, "attachments" | "content">) {
    if (message.content.trim() !== "") return false;
    const imageCount = [...message.attachments.values()].filter((attachment) =>
      this.isImageAttachment(attachment),
    ).length;
    return imageCount >= AUTOMOD.minimumImagesPerMessage;
  }
}
