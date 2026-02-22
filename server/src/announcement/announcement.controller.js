import announcementServices from "./announcement.service.js";

class announcementController {
    static async createAnnouncement(req, res, next) {
        try {
            const result = await announcementServices.createAnnouncement(req.body, req.user);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async getAllAnnouncements(req, res, next) {
        try {
            const result = await announcementServices.getAllAnnouncements();
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async updateAnnouncement(req, res, next) {
        try {
            const result = await announcementServices.updateAnnouncement(req.params.id, req.body, req.user);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async deleteAnnouncement(req, res, next) {
        try {
            const result = await announcementServices.deleteAnnouncement(req.params.id, req.user);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

export default announcementController;
