import { Document } from 'mongoose';

export interface IVisitor extends Document {
    fullname: string;
    id_number: string;
    birthday: Date;
    gender: string;
    region: string;
    expire_date: Date;
    phone: string;
    status: string; // e.g., 'active', 'inactive'
}
