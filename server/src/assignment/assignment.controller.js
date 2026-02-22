import assignmentServices from "./assignment.service.js";

class assignmentController {
    static async createAssignment(req, res, next) {
        try {
            const courseId = req.params.courseId || req.body.course;
            const result = await assignmentServices.createAssignment(courseId, req.body, req.user);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async getAllAssignments(req, res, next) {
        try {
            const result = await assignmentServices.getAllAssignments(req.user);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async getCourseAssignments(req, res, next) {
        try {
            const result = await assignmentServices.getCourseAssignments(req.params.courseId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async updateAssignment(req, res, next) {
        try {
            const result = await assignmentServices.updateAssignment(req.params.id, req.body, req.user);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async deleteAssignment(req, res, next) {
        try {
            const result = await assignmentServices.deleteAssignment(req.params.id, req.user);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

export default assignmentController;
