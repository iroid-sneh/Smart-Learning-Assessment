import Admin from "../../../models/admin.js";
import AuthHelper from "../../common/authHelper.js";
import {
    BadRequestException,
    NotFoundException,
} from "../../common/utils/errorException.js";

class adminAuthServices {
    /**
     * @description: admin login
     * @param {*} data
     * @param {*} req
     * @param {*} res
     */
    static async login(data, req, res) {
        try {
            const { email, password } = data;
            if (!email || !password) {
                throw new BadRequestException(
                    "email and password are required."
                );
            }

            const findAdmin = await Admin.findOne({
                email: email,
            });

            if (!email) {
                throw new NotFoundException(
                    "Admin not found with following email."
                );
            }

            const matchPassword = await AuthHelper.matchHashedPassword(
                password,
                findAdmin.password
            );

            if (!matchPassword) {
                throw new BadRequestException("Wrong Credentials");
            }

            const payload = {
                id: findAdmin._id,
            };

            const adminToken = await AuthHelper.generateToken(payload);

            return res.status(200).json({
                success: true,
                message: "Login Successfull.",
                token: adminToken,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send("Internal Server Error");
        }
    }
}

export default adminAuthServices;
