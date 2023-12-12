import { Document, Model, Schema, model } from 'mongoose';
import { BotUser } from './botUser';

export type StatisticFilter = {
    global?: boolean;
    user?: BotUser['_id'];
    from?: Date;
    to?: Date;
    keys?: string[];
}

export interface RawStatistic {
    global: boolean;
    key: string;
    user?: BotUser['_id'];
}

export interface Statistic extends RawStatistic, Document {
    createdAt: Date;
    updatedAt: Date;
}

interface StatisticModel extends Model<Statistic> { }

const statisticSchema = new Schema<Statistic, StatisticModel>({
    global: { type: Boolean, required: true },
    key: { type: String, required: true },
    user: { type: String, ref: 'BotUser' },
}, { timestamps: true });

const statisticModel = model<Statistic, StatisticModel>('Statistics', statisticSchema);

export function insertStatistic(stats: RawStatistic) {
    statisticModel.create(stats);
}

export function getStatistics(filter?: StatisticFilter) {
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
    if (filter?.user !== undefined) {
        query['user'] = filter.user;
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

    console.log(query);

    return statisticModel.find(query);
}

export function getGlobalStatistics(filter?: StatisticFilter) {
    return getStatistics({ ...filter, global: true });
}

export function getUserStatistics(user: BotUser['_id'], filter?: StatisticFilter) {
    return getStatistics({ ...filter, user: user });
}

export default statisticModel;
