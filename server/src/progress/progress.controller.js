import progressServices from "./progress.service.js";

class progressController {
    static async getStudentProgress(req, res, next) {
        try {
            const studentId = req.params.id;
            const result = await progressServices.getStudentProgress(studentId, req.user);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

export default progressController;
