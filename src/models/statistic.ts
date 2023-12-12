import { Document, Model, Schema, model } from 'mongoose';
import { BotUser } from './botUser';

export type StatisticKey = 'ready';

export interface Statistic extends Document {
    global: boolean;
    keys: StatisticKey[];
    user?: BotUser['_id'];
}

interface StatisticModel extends Model<Statistic> { }

const statisticSchema = new Schema<Statistic, StatisticModel>({
    global: { type: Boolean, required: true },
    keys: [{ type: String, required: true }],
    user: { type: String, ref: 'BotUser' },
});

const statisticModel = model<Statistic, StatisticModel>('Codename', statisticSchema);

export default statisticModel;
