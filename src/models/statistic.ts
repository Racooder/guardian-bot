import { Document, Model, Schema, model } from 'mongoose';
import { BotUser, getOrCreateBotUser } from './botUser';

export type StatisticFilter = {
    global?: boolean;
    userId?: string;
    from?: Date;
    to?: Date;
    keys?: string[];
}

export interface RawStatistic {
    global: boolean;
    key: string;
    userId?: string;
}

export interface Statistic extends RawStatistic, Document {
    createdAt: Date;
    updatedAt: Date;
}

interface StatisticModel extends Model<Statistic> { }

const statisticSchema = new Schema<Statistic, StatisticModel>({
    global: { type: Boolean, required: true },
    key: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'BotUser' },
}, { timestamps: true });

const statisticModel = model<Statistic, StatisticModel>('Statistics', statisticSchema);

export async function insertStatistic(stats: RawStatistic): Promise<Statistic> {
    if (stats.userId === undefined) {
        return await statisticModel.create(stats);
    }

    const botUser = await getOrCreateBotUser(stats.userId);
    return await statisticModel.create({ ...stats, userId: botUser._id });
}

export async function getStatistics(filter?: StatisticFilter): Promise<Statistic[]> {
    const query: {
        global?: boolean;
        user?: BotUser['_id'];
        createdAt?: {
            $gte?: Date;
            $lte?: Date;
        };
        key?: {
            $in?: string[];
        };
    } = { };

    if (filter?.global !== undefined) {
        query['global'] = filter.global;
    }
    if (filter?.userId !== undefined) {
        query['user'] = filter.userId;
    }
    if (filter?.from !== undefined || filter?.to !== undefined) {
        query['createdAt'] = { };
        if (filter?.from !== undefined) {
            query['createdAt']['$gte'] = filter.from;
        }
        if (filter?.to !== undefined) {
            query['createdAt']['$lte'] = filter.to;
        }
    }
    if (filter?.keys !== undefined) {
        query['key'] = { $in: filter.keys };
    }
    if (filter?.userId !== undefined) {
        const botUser = await getOrCreateBotUser(filter.userId);
        query['user'] = botUser._id;
    }

    return await statisticModel.find(query);
}

export async function getGlobalStatistics(filter?: StatisticFilter) {
    return await getStatistics({ ...filter, global: true });
}

export async function getUserStatistics(user: BotUser['_id'], filter?: StatisticFilter) {
    return await getStatistics({ ...filter, userId: user });
}

export default statisticModel;
