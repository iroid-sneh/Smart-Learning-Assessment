import userManagementServices from "./user.service.js";

class userManagementController {
    static async getAllUsers(req, res, next) {
        try {
            const result = await userManagementServices.getAllUsers(req.user);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async updateUser(req, res, next) {
        try {
            const result = await userManagementServices.updateUser(req.params.id, req.body, req.user);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async deleteUser(req, res, next) {
        try {
            const result = await userManagementServices.deleteUser(req.params.id, req.user);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

export default userManagementController;
