import { Document, Types } from 'mongoose';

// Define the IUser interface (representing a User document in MongoDB)
export interface IUser extends Document {
    _id: Types.ObjectId;
    fullname: string;
    email: string;
    password: string;
    phone: string;
    phoneConfirmed: boolean;
    date: Date;
    status: 'active' | 'inactive';
    role: 'user' | 'doorman' | 'admin';
    emailConfirmed: boolean; 
    confirmationCode?: string;
    confirmationCodeExpires?: Date;
    idNumber: string;
    city?: string;
    address?: string;
    registrar?: Types.ObjectId | IUser;
}

export interface IUserWithRegistrar extends Omit<IUser, 'registrar'> {
    registrar: IUser;
}
