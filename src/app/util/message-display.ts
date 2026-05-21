import { IChatMessage, IMessageMetadata, IMessageReplyTo } from '../services/chat.service';

export type { IMessageMetadata, IMessageReplyTo };

export interface IFileMessageContent {
  url: string;
  name: string;
  mime: string;
  size: number;
}

export interface ILocationMessageContent {
  lat: number;
  lng: number;
  label?: string;
  accuracy?: number;
}

export interface IContactMessageContent {
  userId: string;
  userName: string;
  imageUrl?: string;
}

export interface IPollMessageContent {
  question: string;
  options: string[];
  allowMultiple?: boolean;
}

export function isImageMessage(msg: IChatMessage): boolean {
  return msg.type === 'image';
}

export function isGifMessage(msg: IChatMessage): boolean {
  return msg.type === 'gif';
}

export function isStickerMessage(msg: IChatMessage): boolean {
  return msg.type === 'sticker';
}

export function isVideoMessage(msg: IChatMessage): boolean {
  return msg.type === 'video';
}

export function isAudioMessage(msg: IChatMessage): boolean {
  return msg.type === 'audio';
}

export function isFileMessage(msg: IChatMessage): boolean {
  return msg.type === 'file';
}

export function isLocationMessage(msg: IChatMessage): boolean {
  return msg.type === 'location';
}

export function isContactMessage(msg: IChatMessage): boolean {
  return msg.type === 'contact';
}

export function isPollMessage(msg: IChatMessage): boolean {
  return msg.type === 'poll';
}

export function parseFileContent(raw: string): IFileMessageContent | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (
      typeof parsed['url'] === 'string' &&
      typeof parsed['name'] === 'string' &&
      typeof parsed['mime'] === 'string' &&
      typeof parsed['size'] === 'number'
    ) {
      return {
        url: parsed['url'],
        name: parsed['name'],
        mime: parsed['mime'],
        size: parsed['size'],
      };
    }
  } catch {
    /* invalid */
  }
  return null;
}

export function parseLocationContent(raw: string): ILocationMessageContent | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (typeof parsed['lat'] === 'number' && typeof parsed['lng'] === 'number') {
      return {
        lat: parsed['lat'],
        lng: parsed['lng'],
        label: typeof parsed['label'] === 'string' ? parsed['label'] : undefined,
        accuracy: typeof parsed['accuracy'] === 'number' ? parsed['accuracy'] : undefined,
      };
    }
  } catch {
    /* invalid */
  }
  return null;
}

export function parseContactContent(raw: string): IContactMessageContent | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (typeof parsed['userId'] === 'string' && typeof parsed['userName'] === 'string') {
      return {
        userId: parsed['userId'],
        userName: parsed['userName'],
        imageUrl: typeof parsed['imageUrl'] === 'string' ? parsed['imageUrl'] : undefined,
      };
    }
  } catch {
    /* invalid */
  }
  return null;
}

export function parsePollContent(raw: string): IPollMessageContent | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (typeof parsed['question'] === 'string' && Array.isArray(parsed['options'])) {
      const options = parsed['options'].filter((o): o is string => typeof o === 'string');
      if (options.length >= 2) {
        return {
          question: parsed['question'],
          options,
          allowMultiple: parsed['allowMultiple'] === true,
        };
      }
    }
  } catch {
    /* invalid */
  }
  return null;
}

export function hasForwardedLabel(raw: string | undefined): boolean {
  return !!parseMetadata(raw).forwardedFrom;
}

export function parseMetadata(raw: string | undefined): IMessageMetadata {
  if (!raw?.trim()) return {};
  try {
    return JSON.parse(raw) as IMessageMetadata;
  } catch {
    return {};
  }
}

export function locationMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function locationStaticMapUrl(lat: number, lng: number): string {
  const zoom = 15;
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=400x200&markers=${lat},${lng},red`;
}

export function replyPreviewText(msg: IMessageReplyTo): string {
  if (msg.deletedAt) return 'Message deleted';
  if (msg.type === 'text' || msg.type === 'emoji') {
    return msg.content.length > 80 ? msg.content.slice(0, 80) + '…' : msg.content;
  }
  return `[${msg.type}]`;
}

export function senderNameFromRef(
  sender: string | { _id: string; userName: string } | undefined
): string {
  if (!sender) return 'Unknown';
  if (typeof sender === 'string') return 'User';
  return sender.userName || 'Unknown';
}
