import bcrypt from "bcryptjs";

export const hashPassword = async (password: string): Promise<string | null> => {
    try {
        const salt = await bcrypt.genSalt(12);
        password = await bcrypt.hash(password, salt);
        return password;
    } catch (error) {
        return null;
    }
};

export const comparePassword = async (password: string, newPassword: string): Promise<boolean | null> => {
    try {
        return await bcrypt.compare(newPassword, password);
    } catch (error) {
        return null;
    }
};
