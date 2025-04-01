export default interface ICommunity {
  _id: string;  // Mongoose auto-generates this
  imageUrl: string;
  coverImageUrl: string;
  name: string;
  description?: string;
  type: 'public' | 'private';
  ownerId: string;
  roles: string[];
  channels: string[];
  joinRequests: string[];
  members: { userId: string; roleIds: string[] }[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}