import { Document, Model, Schema, model } from 'mongoose';
import { BotUser } from './botUser';
import { debug } from '../Log';

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
    user?: BotUser;
}

export interface Statistic extends RawStatistic, Document {
    createdAt: Date;
    updatedAt: Date;
}

interface StatisticModel extends Model<Statistic> { }

const statisticSchema = new Schema<Statistic, StatisticModel>({
    global: { type: Boolean, required: true },
    key: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'BotUser' },
}, { timestamps: true });

const statisticModel = model<Statistic, StatisticModel>('Statistics', statisticSchema);

export async function insertStatistic(stats: RawStatistic): Promise<Statistic> {
    debug("Inserting statistic")

    return await statisticModel.create({ ...stats, user: stats.user });
}

export async function getStatistics(filter?: StatisticFilter): Promise<Statistic[]> {
    debug("Getting statistics")

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
        query['user'] = filter.userId;
    }

    return await statisticModel.find(query);
}

export async function getGlobalStatistics(filter?: StatisticFilter) {
    debug("Getting global statistics")

    return await getStatistics({ ...filter, global: true });
}

export async function getUserStatistics(user: BotUser['_id'], filter?: StatisticFilter) {
    debug("Getting user statistics")

    return await getStatistics({ ...filter, userId: user });
}

export default statisticModel;
