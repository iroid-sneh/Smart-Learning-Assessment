import authServices from "./auth.service.js";

class authController {
    /**
     * @description: Register a new user
     * @param {*} req
     * @param {*} res
     */
    static async register(req, res) {
        const data = await authServices.register(req.body, req, res);
        return data;
    }

    static async verifyOtp(req, res) {
        const data = await authServices.verifyOtp(req.body, req, res);
        return data;
    }

    /**
     * @description: Login a user
     * @param {*} req
     * @param {*} res
     */
    static async login(req, res) {
        const data = await authServices.login(req.body, req, res);
        return data;
    }

    static async forgotPassword(req, res) {
        const data = await authServices.forgotPassword(req.body, req, res);
        return data;
    }

    static async resetPassword(req, res) {
        const data = await authServices.resetPassword(req.body, req, res);
        return data;
    }

    static async changePassword(req, res) {
        const data = await authServices.changePassword(req.body, req, res);
        return data;
    }
}

export default authController;
