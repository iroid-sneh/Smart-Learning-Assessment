import materialServices from "./material.service.js";

class materialController {
    static async createMaterial(req, res, next) {
        try {
            const courseId = req.params.courseId;
            const result = await materialServices.createMaterial(courseId, req.body, req.user, req.file);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async getCourseMaterials(req, res, next) {
        try {
            const result = await materialServices.getCourseMaterials(req.params.courseId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async updateMaterial(req, res, next) {
        try {
            const result = await materialServices.updateMaterial(req.params.id, req.body, req.user);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async deleteMaterial(req, res, next) {
        try {
            const result = await materialServices.deleteMaterial(req.params.id, req.user);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

export default materialController;
