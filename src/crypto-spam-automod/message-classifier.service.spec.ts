import type { Attachment, Message } from "discord.js";
import { MessageClassifier } from "./message-classifier.service";

const classifier = new MessageClassifier();
const attachment = (name: string, contentType: string | null) => ({ name, contentType }) as Attachment;
const message = (content: string, attachments: Attachment[]) =>
  ({ content, attachments: new Map(attachments.map((item, index) => [`${index}`, item])) }) as unknown as Message;

describe("MessageClassifier", () => {
  it("recognizes image MIME types and extension fallbacks", () => {
    expect(classifier.isImageAttachment(attachment("file.bin", "image/png"))).toBe(true);
    expect(classifier.isImageAttachment(attachment("photo.JPEG", null))).toBe(true);
    expect(classifier.isImageAttachment(attachment("notes.txt", "text/plain"))).toBe(false);
  });

  it("requires empty text and at least two images", () => {
    const images = [attachment("one.png", "image/png"), attachment("two.webp", null)];
    expect(classifier.isQualifyingImageMessage(message("", images))).toBe(true);
    expect(classifier.isQualifyingImageMessage(message("caption", images))).toBe(false);
    expect(classifier.isQualifyingImageMessage(message("", images.slice(0, 1)))).toBe(false);
  });
});
