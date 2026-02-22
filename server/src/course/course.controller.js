import courseServices from "./course.service.js";

class courseController {
    static async createCourse(req, res, next) {
        try {
            const result = await courseServices.createCourse(req.body, req.user);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async getAllCourses(req, res, next) {
        try {
            const result = await courseServices.getAllCourses(req.user);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async getCourseById(req, res, next) {
        try {
            const result = await courseServices.getCourseById(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async updateCourse(req, res, next) {
        try {
            const result = await courseServices.updateCourse(req.params.id, req.body, req.user);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async deleteCourse(req, res, next) {
        try {
            const result = await courseServices.deleteCourse(req.params.id, req.user);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

export default courseController;
