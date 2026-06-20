import { UserRole } from "../user/schemas/user.schema";

export type AuthUser = {
    userId: string;
    email: string;
    role: UserRole;
};