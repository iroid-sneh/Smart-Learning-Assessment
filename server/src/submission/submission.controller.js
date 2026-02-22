import submissionServices from "./submission.service.js";

class submissionController {
    static async createSubmission(req, res, next) {
        try {
            const assignmentId = req.params.assignmentId;
            const result = await submissionServices.createSubmission(assignmentId, req.body, req.user, req.file);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async getAssignmentSubmissions(req, res, next) {
        try {
            const result = await submissionServices.getAssignmentSubmissions(
                req.params.assignmentId,
                req.user
            );
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async getMySubmissions(req, res, next) {
        try {
            const result = await submissionServices.getMySubmissions(req.user);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async evaluateSubmission(req, res, next) {
        try {
            const result = await submissionServices.evaluateSubmission(req.params.id, req.body, req.user);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

export default submissionController;
