import { User } from "../db";

export const generateOTP = () => {
    return (Math.floor(1000 + Math.random() * 9000)).toString();
};

export const checkCanSendFriendReq = (user: User, username: string): boolean => {
    return !(user.friendList.includes(username.toLowerCase().trim()) || user.friendRequestRecieved.includes(username.toLowerCase().trim()) || user.friendRequestSend.includes(username.toLowerCase().trim()));
};