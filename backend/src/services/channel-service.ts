import prisma from '@controllers/db-controller';
import { DatabaseError } from '@errors/DatabaseError';
import { Channel, User } from '@prisma/client';
import type { PrismaError } from '@errors/DatabaseError';

export const findAllChannels = async () => {
	try {
		const sectionChannels = await prisma.section.findMany({
			include: {
				channel: true
			}
		});

		return sectionChannels;
	} catch (error) {
		throw new DatabaseError(error as PrismaError);
	}
};

const findAllPublic = async (users = true) => {
	try {
		const channelData = await prisma.channel.findMany({
			where: {
				type: 'PUBLIC'
			},
			select: {
				id: true,
				name: true,
				type: true,
				section: true,
				users: !users
					? false
					: {
							select: {
								username: true,
								id: true
							}
					  }
			}
		});

		const sanitizedChannel = channelData.map(val => ({ ...val, section: val.section.name }));

		return sanitizedChannel;
	} catch (error) {
		throw new DatabaseError(error as PrismaError);
	}
};

const findById = async (channelId: number, users = true) => {
	try {
		const channelData = await prisma.channel.findUnique({
			where: {
				id: channelId
			},
			select: {
				id: true,
				name: true,
				type: true,
				users: !users
					? false
					: {
							select: {
								username: true,
								id: true
							}
					  }
			}
		});

		return channelData;
	} catch (error) {
		throw new DatabaseError(error as PrismaError);
	}
};

export const findAllByUser = async (userId: number): Promise<unknown> => {
	const userData = await prisma.user.findUnique({
		where: {
			id: userId
		},
		select: {
			channels: {
				where: {
					type: 'PRIVATE'
				},
				select: {
					id: true,
					name: true,
					users: {
						select: {
							id: true,
							username: true
						}
					}
				}
			}
		}
	});

	return userData.channels;
};

const findAllPrivate = async (userId: number): Promise<unknown> => {
	const userData = await prisma.user.findUnique({
		where: {
			id: userId
		},
		include: {
			channels: {
				where: {
					type: 'PRIVATE'
				},
				include: {
					users: {
						select: {
							username: true,
							id: true
						}
					}
				}
			}
		}
	});

	/* TODO: Self channel returns no user */
	const sanitizedChannel = (data: Channel & { users: User[] }) => ({ ...data, users: data.users.filter(user => user.id !== userId)[0] });
	const data = userData.channels.map(sanitizedChannel);

	return data;
};

export const checkPrivateExists = async (user1Id: number, user2Id: number) => {
	try {
		const result = await prisma.channel.findFirst({
			where: {
				AND: {
					type: 'PRIVATE',
					users: {
						every: {
							id: { in: [user1Id, user2Id] }
						}
					}
				}
			}
		});

		return result;
	} catch (error) {
		throw new DatabaseError(error as PrismaError);
	}
};

const createPrivate = async (senderId: number, receiverId: number): Promise<Channel> => {
	try {
		const result = await prisma.channel.create({
			data: {
				type: 'PRIVATE',
				name: `dm--${Math.max(senderId, receiverId)}_${Math.min(senderId, receiverId)}`,
				users: {
					connect: [{ id: senderId }, { id: receiverId }]
				}
			}
		});

		return result;
	} catch (error) {
		throw new DatabaseError(error as PrismaError);
	}
};

const createPublic = async (name: string, section = 'channel') => {
	try {
		const result = await prisma.channel.create({
			data: {
				type: 'PUBLIC',
				section: {
					connectOrCreate: {
						where: {
							name: section
						},
						create: {
							name: section
						}
					}
				},
				name
			}
		});

		return result;
	} catch (error) {
		throw new DatabaseError(error as PrismaError);
	}
};

export const updateChannel = async (id: number, data: Partial<Channel>): Promise<Channel> => {
	const channel = await prisma.channel.update({
		where: {
			id
		},
		data
	});

	return channel;
};

export { findById, createPrivate, createPublic, findAllPublic, findAllPrivate };
