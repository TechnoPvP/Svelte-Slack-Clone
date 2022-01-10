export interface Channel {
	id: number;
	users: User[];
	type: ChannelType;
	notifcations?: number;
	section: string | null;
	name?: string;
}

/* TODO: Fix return value */
export interface PrivateChannel {
	id: number;
	users: User
}

export interface ChannelStore {
	privateChannels: PrivateChannel[];
	publicChannels: Channel[];
}

export interface User {
	id: number;
	username: string;
}

export interface Message {
	message: string;
	sender: User;
	channelId: number;
}

export interface Notifcation extends Message {
	id: number;
}

/* TYPES */
export type ChannelType = 'user' | 'group';
